<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A message the office sent to one or many students (kept as history). */
class StudentMessage extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'in_app' => 'boolean',
            'whatsapp' => 'boolean',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
