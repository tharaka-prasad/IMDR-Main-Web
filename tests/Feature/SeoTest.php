<?php

namespace Tests\Feature;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['seo.indexing_enabled' => true, 'seo.redirect_canonical_host' => false, 'inertia.ssr.enabled' => false]);
    }

    public function test_initial_html_contains_one_canonical_and_metadata_without_the_ssr_worker(): void
    {
        $response = $this->get('/about?utm_source=test')->assertOk()
            ->assertSee('<title inertia>About IMDR | IMDR</title>', false)
            ->assertSee('rel="canonical" href="https://imdr.lk/about"', false)
            ->assertSee('name="robots" content="index, follow"', false)
            ->assertSee('name="google-site-verification" content="QJh4dzZ3EW5RTigicgxmN58NdwAf9i8os-aufCzSGMw"', false)
            ->assertHeaderMissing('X-Robots-Tag');
        $this->assertSame(1, substr_count($response->getContent(), 'rel="canonical"'));
        $this->assertSame(1, substr_count($response->getContent(), 'name="description"'));
        $this->assertSame(1, substr_count($response->getContent(), '<title'));
    }

    public function test_filters_keep_working_with_an_unfiltered_canonical(): void
    {
        $batch = $this->makeBatch();
        $this->get('/courses?q=Media&type='.$batch->course->course_type_id)->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Courses/Index')
                ->where('filters.q', 'Media')->has('courses', 1)
                ->where('seo.canonical', 'https://imdr.lk/courses'));
        $this->get('/apply?batch='.$batch->id)->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('preselected', $batch->id)
                ->where('seo.canonical', 'https://imdr.lk/apply'));
    }

    public function test_published_detail_metadata_is_escaped_and_drafts_stay_404(): void
    {
        $course = $this->makeBatch()->course;
        $course->update(['name' => 'Media & Film', 'summary' => '<b>Media</b> & practical storytelling.']);
        $this->get('/courses/'.$course->slug)->assertOk()
            ->assertSee('<title inertia>Media &amp; Film | IMDR</title>', false)
            ->assertSee('content="Media &amp; practical storytelling."', false);
        $course->update(['is_published' => false]);
        $this->get('/courses/'.$course->slug)->assertNotFound()
            ->assertHeader('X-Robots-Tag', 'noindex, follow')->assertDontSee('rel="canonical"', false);
    }

    public function test_empty_listings_become_indexable_when_content_is_published(): void
    {
        $this->get('/news')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow');
        $post = Post::create(['type' => 'news', 'title' => 'Media workshop', 'slug' => 'media-workshop', 'excerpt' => 'Workshop at IMDR.', 'is_published' => true]);
        $this->get('/news')->assertOk()->assertHeaderMissing('X-Robots-Tag')
            ->assertSee('rel="canonical" href="https://imdr.lk/news"', false);
        $this->get('/posts/'.$post->slug)->assertOk()
            ->assertSee('property="og:type" content="article"', false);
        $post->update(['is_published' => false]);
        $this->get('/posts/'.$post->slug)->assertNotFound()->assertHeader('X-Robots-Tag', 'noindex, follow');
    }

    public function test_sitemap_is_valid_xml_and_includes_older_public_posts_beyond_the_ui_limit(): void
    {
        $course = $this->makeBatch()->course;
        foreach (range(1, 65) as $i) {
            Post::create(['type' => 'news', 'title' => 'News '.$i, 'slug' => 'news-'.$i, 'is_published' => true]);
        }
        Post::create(['type' => 'announcement', 'title' => 'Internal announcement', 'slug' => 'internal-announcement', 'is_published' => true]);
        Post::create(['type' => 'news', 'title' => 'Draft', 'slug' => 'draft-post', 'is_published' => false]);
        $response = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $xml = simplexml_load_string($response->getContent());
        $this->assertNotFalse($xml);
        $this->assertSame('http://www.sitemaps.org/schemas/sitemap/0.9', $xml->getDocNamespaces()['']);
        $locations = array_map(fn ($url) => (string) $url->loc, iterator_to_array($xml->url, false));
        $this->assertCount(73, $locations); // Six landing pages, one listing, one course, 65 posts.
        $this->assertContains('https://imdr.lk/posts/news-1', $locations);
        $this->assertContains('https://imdr.lk/posts/news-65', $locations);
        $this->assertContains('https://imdr.lk/courses/'.$course->slug, $locations);
        foreach (['/login', '/portal', '/events', '/posts/draft-post', '/posts/internal-announcement'] as $path) {
            $this->assertNotContains('https://imdr.lk'.$path, $locations);
        }
        $course->update(['is_published' => false]);
        $this->get('/sitemap.xml')->assertDontSee('https://imdr.lk/courses/'.$course->slug);
    }

    public function test_utility_pages_and_certificate_results_are_noindex(): void
    {
        $this->get('/login')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow');
        $this->get('/portal')->assertRedirect('/login')->assertHeader('X-Robots-Tag', 'noindex, follow');
        $this->get('/verify')->assertOk()->assertHeaderMissing('X-Robots-Tag');
        foreach (['/verify?number=UNKNOWN', '/verify/UNKNOWN'] as $path) {
            $this->get($path)->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow')
                ->assertDontSee('rel="canonical"', false);
        }
        $this->get('/missing-page')->assertNotFound()->assertHeader('X-Robots-Tag', 'noindex, follow');
    }

    public function test_public_redirects_preserve_query_strings_and_do_not_redirect_sensitive_routes(): void
    {
        config(['seo.redirect_canonical_host' => true]);
        $this->get('http://www.imdr.lk/about/?utm_source=x%2By&ref=a')->assertStatus(301)
            ->assertRedirect('https://imdr.lk/about?utm_source=x%2By&ref=a');
        $this->get('https://imdr.lk/index.php')->assertStatus(301)->assertRedirect('https://imdr.lk/');
        $this->get('https://imdr.lk/index.php/courses/')->assertStatus(301)->assertRedirect('https://imdr.lk/courses');
        $this->head('https://www.imdr.lk/contact/')->assertStatus(301)->assertRedirect('https://imdr.lk/contact');
        $this->get('https://imdr.lk/about')->assertOk()->assertHeaderMissing('Location');
        $this->get('http://www.imdr.lk/login')->assertOk();
        // Route-model binding still rejects nonexistent receipts, without a host redirect.
        $this->get('http://www.imdr.lk/r/999?signature=invalid')->assertNotFound();
        $this->get('http://www.imdr.lk/verify?number=UNKNOWN')->assertOk();
        $this->post('http://www.imdr.lk/contact', [])->assertStatus(302)->assertSessionHasErrors('name');
    }

    public function test_local_environment_can_disable_indexing_without_changing_content(): void
    {
        config(['seo.indexing_enabled' => false]);
        $this->get('/about')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow')
            ->assertSee('name="robots" content="noindex, follow"', false);
    }

    public function test_signed_receipts_remain_valid_and_are_excluded_from_indexing(): void
    {
        config(['seo.redirect_canonical_host' => true]);
        [$student] = $this->makeStudent($this->makeBatch());
        $invoice = $this->registrationInvoice($student);
        $payment = \App\Models\Payment::create(['student_id' => $student->id, 'invoice_id' => $invoice->id,
            'receipt_no' => 'TEST-RECEIPT', 'amount' => 5000, 'method' => 'cash', 'paid_at' => now(), 'status' => 'paid']);
        \Illuminate\Support\Facades\URL::forceRootUrl('http://www.imdr.lk');
        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute('receipt.public', now()->addHour(), ['payment' => $payment->id]);
        $this->get($url)->assertOk()->assertHeader('X-Robots-Tag', 'noindex, follow')
            ->assertDontSee('rel="canonical"', false);
        $this->get(str_replace('signature=', 'signature=invalid', $url))->assertForbidden();
    }

    public function test_metadata_is_present_even_on_partial_inertia_reloads(): void
    {
        $this->makeBatch();
        $version = app(\App\Http\Middleware\HandleInertiaRequests::class)->version(request());
        $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => $version,
            'X-Inertia-Partial-Component' => 'Courses/Index', 'X-Inertia-Partial-Data' => 'courses'])
            ->get('/courses?q=Media')->assertOk()->assertJsonPath('props.seo.canonical', 'https://imdr.lk/courses');
    }

    public function test_sitemap_export_can_omit_development_timestamps(): void
    {
        $this->makeBatch();
        $xml = app(\App\Support\Sitemap::class)->xml(false);
        $this->assertStringNotContainsString('<lastmod>', $xml);
        $this->assertStringContainsString('https://imdr.lk/courses/diploma-in-media', $xml);
        $this->assertNotFalse(simplexml_load_string($xml));
    }
}
