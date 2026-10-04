<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    protected $guarded = [];

    protected $hidden = ['file_path'];

    public const TYPES = [
        'birth_certificate' => 'Birth certificate',
        'result_sheet' => 'Result sheet',
        'nic' => 'NIC copy',
        'ol_certificate' => 'O/L certificate',
        'al_certificate' => 'A/L certificate',
        'photo' => 'Photo',
        'other' => 'Other document',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
