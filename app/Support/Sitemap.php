<?php

namespace App\Support;

use App\Models\Course;
use App\Models\Post;

class Sitemap
{
    public function entries(): \Generator
    {
        foreach (array_keys(SeoMetadata::PAGES) as $path) {
            yield ['loc' => SeoMetadata::url($path), 'lastmod' => null];
        }

        $publishedTypes = Post::where('is_published', true)->whereIn('type', array_keys(SeoMetadata::POST_TYPES))
            ->distinct()->pluck('type')->all();
        foreach (SeoMetadata::LISTINGS as $path => $type) {
            if (in_array($type, $publishedTypes, true)) {
                yield ['loc' => SeoMetadata::url('/'.$path), 'lastmod' => null];
            }
        }

        foreach (Course::where('is_published', true)->orderBy('id')->cursor() as $course) {
            yield ['loc' => SeoMetadata::url('/courses/'.rawurlencode($course->slug)), 'lastmod' => $course->updated_at?->toAtomString()];
        }

        foreach (Post::where('is_published', true)->whereIn('type', array_keys(SeoMetadata::POST_TYPES))->orderBy('id')->cursor() as $post) {
            yield ['loc' => SeoMetadata::url('/posts/'.rawurlencode($post->slug)), 'lastmod' => $post->updated_at?->toAtomString()];
        }
    }

    public function xml(bool $includeLastModified = true): string
    {
        return view('sitemap', ['entries' => $this->entries(), 'includeLastModified' => $includeLastModified])->render();
    }
}
