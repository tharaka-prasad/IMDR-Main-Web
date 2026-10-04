<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function courseType()
    {
        return $this->belongsTo(CourseType::class);
    }

    public function feeStructure()
    {
        return $this->hasOne(FeeStructure::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }
}
