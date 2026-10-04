<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryRule extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'basic_salary' => 'float',
            'hourly_rate' => 'float',
            'session_rate' => 'float',
            'allowances' => 'float',
            'deductions' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
