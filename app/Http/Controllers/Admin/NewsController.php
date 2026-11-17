<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * News for the website, managed by the admin:
 *  - a picture can be uploaded,
 *  - it has a start date and an end date (shown on the News page only between the two),
 *  - it can also be switched on as a pop-up ad that opens every time somebody visits the home page.
 * Only admins and the super admin reach these routes (role middleware in routes/web.php).
 */
class NewsController extends Controller
{
    /** Uploaded pictures are kept inside /public so no "storage:link" is needed. */
    private const DIR = 'uploads/news';

    public function index(Request $request): Response
    {
        $q = Post::where('type', 'news');

        if ($s = trim((string) $request->query('search', ''))) {
            $q->where('title', 'like', "%{$s}%");
        }

        match ($request->query('status')) {
            'live' => $q->live(),
            'scheduled' => $q->where('is_published', true)->where('starts_at', '>', now()),
            'ended' => $q->where('is_published', true)->where('ends_at', '<', now()),
            'hidden' => $q->where('is_published', false),
            default => null,
        };

        return Inertia::render('Admin/News/Index', [
            'posts' => $q->orderByDesc('id')->paginate(12)->withQueryString()->through(fn (Post $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'image' => $p->image,
                'starts_at' => $p->starts_at,
                'ends_at' => $p->ends_at,
                'show_as_ad' => (bool) $p->show_as_ad,
                'status' => $this->statusOf($p),
            ]),
            'filters' => ['search' => $request->query('search', ''), 'status' => $request->query('status', '')],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/News/Form', ['post' => null]);
    }

    public function edit(Post $post): Response
    {
        abort_unless($post->type === 'news', 404);

        return Inertia::render('Admin/News/Form', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'image' => $post->image,
                'starts_at' => $post->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $post->ends_at?->format('Y-m-d\TH:i'),
                'show_as_ad' => (bool) $post->show_as_ad,
                'is_published' => (bool) $post->is_published,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $post = Post::create([
            'type' => 'news',
            'title' => $data['title'],
            'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(4)),
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'] ?? null,
            'image_path' => $request->hasFile('image') ? $this->storeImage($request->file('image')) : null,
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'show_as_ad' => $request->boolean('show_as_ad'),
            'is_published' => $request->boolean('is_published', true),
            'published_at' => $data['starts_at'],
        ]);

        AuditLog::record('created', $post, "Created news {$post->title}");

        return redirect('/portal/news')->with('success', 'News added.');
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        abort_unless($post->type === 'news', 404);
        $data = $this->validated($request);

        $imagePath = $post->image_path;

        if ($request->hasFile('image')) {
            $this->deleteImage($post->image_path);
            $imagePath = $this->storeImage($request->file('image'));
        } elseif ($request->boolean('remove_image')) {
            $this->deleteImage($post->image_path);
            $imagePath = null;
        }

        $post->update([
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'] ?? null,
            'image_path' => $imagePath,
            // A picture saved by link in the old "Website content" screen is dropped when the admin removes the picture.
            'image_url' => $request->boolean('remove_image') || $request->hasFile('image') ? null : $post->image_url,
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'show_as_ad' => $request->boolean('show_as_ad'),
            'is_published' => $request->boolean('is_published', true),
            'published_at' => $data['starts_at'],
        ]);

        AuditLog::record('updated', $post, "Updated news {$post->title}");

        return redirect('/portal/news')->with('success', 'News saved.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        abort_unless($post->type === 'news', 404);

        $this->deleteImage($post->image_path);
        $post->delete();
        AuditLog::record('deleted', $post, "Deleted news {$post->title}");

        return back()->with('success', 'News deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:200',
            'excerpt' => 'nullable|string|max:500',
            'body' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'remove_image' => 'boolean',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'show_as_ad' => 'boolean',
            'is_published' => 'boolean',
        ], [
            'image.max' => 'The picture must be 4 MB or smaller.',
            'image.image' => 'Please choose a JPG, PNG or WebP picture.',
            'image.mimes' => 'Please choose a JPG, PNG or WebP picture.',
            'ends_at.after' => 'The end date must be after the start date.',
        ]);
    }

    private function statusOf(Post $post): string
    {
        if (! $post->is_published) {
            return 'hidden';
        }

        if ($post->starts_at && $post->starts_at->isFuture()) {
            return 'scheduled';
        }

        if ($post->ends_at && $post->ends_at->isPast()) {
            return 'ended';
        }

        return 'live';
    }

    private function storeImage(UploadedFile $file): string
    {
        // The extension comes from the real file content, never from the name the visitor sent.
        $name = Str::uuid().'.'.$file->guessExtension();
        $file->move(public_path(self::DIR), $name);

        return self::DIR.'/'.$name;
    }

    private function deleteImage(?string $path): void
    {
        if ($path && str_starts_with($path, self::DIR.'/')) {
            $full = public_path($path);

            if (is_file($full)) {
                @unlink($full);
            }
        }
    }
}