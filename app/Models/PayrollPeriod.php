<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollPeriod extends Model
{
    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(PayrollItem::class);
    }
}
