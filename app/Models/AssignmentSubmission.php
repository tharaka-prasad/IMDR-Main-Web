<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    protected $guarded = [];
    protected $hidden = ['file_path'];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'marked_at' => 'datetime',
            'marks' => 'float',
        ];
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
