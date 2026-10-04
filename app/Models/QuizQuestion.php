<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'marks' => 'float',
        ];
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
