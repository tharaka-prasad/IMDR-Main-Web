<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'registration_fee' => 'float',
            'course_fee' => 'float',
            'installments' => 'array',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
