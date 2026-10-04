<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollItem extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'hours' => 'float',
            'basic' => 'float',
            'allowances' => 'float',
            'deductions' => 'float',
            'net' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function period()
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
