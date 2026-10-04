<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LmsContent extends Model
{
    protected $guarded = [];
    protected $hidden = ['file_path'];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
