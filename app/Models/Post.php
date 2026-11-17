<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $guarded = [];

    /** `image` = the uploaded picture, or the old picture link when there is no upload. */
    protected $appends = ['image'];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'event_date' => 'datetime',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'show_as_ad' => 'boolean',
        ];
    }

    public function getImageAttribute(): ?string
    {
        return $this->image_path ? '/'.ltrim($this->image_path, '/') : ($this->image_url ?: null);
    }

    /** Published and inside its start/end window (an empty start or end means "no limit", like older posts). */
    public function scopeLive(Builder $query): Builder
    {
        $now = now();

        return $query->where('is_published', true)
            ->where(fn ($w) => $w->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn ($w) => $w->whereNull('ends_at')->orWhere('ends_at', '>=', $now));
    }
}