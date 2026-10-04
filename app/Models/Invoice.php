<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $guarded = [];

    protected $appends = ['balance'];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'discount' => 'float',
            'total' => 'float',
            'paid_amount' => 'float',
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function getBalanceAttribute(): float
    {
        return round(max(0, (float) $this->total - (float) $this->paid_amount), 2);
    }

    /** Re-derive unpaid / partial / paid from the amounts. Cancelled invoices stay cancelled. */
    public function refreshStatus(): void
    {
        if ($this->status === 'cancelled') {
            return;
        }

        if ($this->paid_amount >= $this->total - 0.005) {
            $this->status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->status = 'partial';
        } else {
            $this->status = 'unpaid';
        }
    }

    public function applyPayment(float $amount): void
    {
        $this->paid_amount = round($this->paid_amount + $amount, 2);
        $this->refreshStatus();
        $this->save();
    }

    public function isOverdue(): bool
    {
        return in_array($this->status, ['unpaid', 'partial'], true)
            && $this->due_date
            && $this->due_date->isPast();
    }
}
