<?php

namespace App\Support;

use App\Models\Course;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SeoMetadata
{
    public const POST_TYPES = ['news' => 'News', 'event' => 'Events', 'research' => 'Research', 'media' => 'Media'];

    public const LISTINGS = ['news' => 'news', 'events' => 'event', 'research' => 'research', 'media' => 'media'];

    // Descriptions reuse existing public copy; no visible content is changed.
    public const PAGES = [
        '/' => ['Institute of Media Development and Research', 'Media, digital and ICT education, research and community development in Sri Lanka.'],
        '/about' => ['About IMDR', 'Structured academic qualifications from Certificate levels to Diplomas and Higher Diplomas. Practical media, technology and IT skills suited for modern industries.'],
        '/courses' => ['Courses', 'Hands-on development in content creation, cinematography, photography, graphic design, AI tools and digital media.'],
        '/contact' => ['Contact', 'Have questions about our 18 specialized courses, G.C.E. A/L programs, or workshop schedules? Reach our administrative team, or message us directly on WhatsApp.'],
        '/apply' => ['Apply', 'Apply to IMDR. Choose your course. Tell us about you. Our office calls or messages you on WhatsApp to confirm.'],
        '/verify' => ['Verify a certificate', 'Enter the number printed on the certificate, for example IMDR-CERT-000123.'],
    ];

    public static function url(string $path): string
    {
        return rtrim(config('seo.url'), '/').($path === '/' ? '/' : '/'.ltrim($path, '/'));
    }

    public static function description(?string $text): string
    {
        $text = html_entity_decode(strip_tags($text ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return Str::limit(Str::squish($text), 165);
    }

    public static function excluded(): array
    {
        return ['title' => 'IMDR | Institute of Media Development and Research', 'description' => self::PAGES['/'][1],
            'canonical' => null, 'robots' => 'noindex, follow', 'type' => 'website'];
    }

    public static function forRequest(Request $request): array
    {
        if ($request->attributes->has('seo')) {
            return $request->attributes->get('seo');
        }

        $path = '/'.trim($request->getPathInfo(), '/');
        $seo = self::excluded();
        $title = $description = null;

        if (isset(self::PAGES[$path]) && ! ($path === '/verify' && trim((string) $request->query('number', '')) !== '')) {
            [$title, $description] = self::PAGES[$path];
        } elseif (isset(self::LISTINGS[ltrim($path, '/')])) {
            $type = self::LISTINGS[ltrim($path, '/')];
            if (Post::where('type', $type)->where('is_published', true)->exists()) {
                $title = self::POST_TYPES[$type];
                $description = match ($type) {
                    'news' => 'What is happening at IMDR.',
                    'event' => 'Workshops, open days and seminars.',
                    'research' => 'Studies and reports from the IMDR Research Centre.',
                    'media' => 'Student work and educational media from IMDR.',
                };
            }
        } elseif (preg_match('~^/courses/([^/]+)$~', $path, $match)) {
            $course = Course::where('slug', rawurldecode($match[1]))->where('is_published', true)->first();
            if ($course) {
                $title = $course->name;
                $description = $course->summary ?: $course->description ?: $course->name;
                $path = '/courses/'.rawurlencode($course->slug);
            }
        } elseif (preg_match('~^/posts/([^/]+)$~', $path, $match)) {
            $post = Post::where('slug', rawurldecode($match[1]))->where('is_published', true)->whereIn('type', array_keys(self::POST_TYPES))->first();
            if ($post) {
                $title = $post->title;
                $description = $post->excerpt ?: $post->body ?: $post->title;
                $path = '/posts/'.rawurlencode($post->slug);
                $seo['type'] = 'article';
            }
        }

        if ($title !== null) {
            $seo = [...$seo, 'title' => $title.' | IMDR', 'description' => self::description($description),
                'canonical' => self::url($path), 'robots' => config('seo.indexing_enabled') ? 'index, follow' : 'noindex, follow'];
        }

        $request->attributes->set('seo', $seo);

        return $seo;
    }
}
