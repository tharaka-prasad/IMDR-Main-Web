<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $guarded = [];

    /** Keys that can be edited from the Settings screen, with their defaults. */
    public const DEFAULTS = [
        'institute_name' => 'Institute of Media Development and Research',
        'institute_phone' => '',
        'institute_email' => 'info@imdr.lk',
        'institute_address' => '',
        'registration_fee_mandatory' => '1',   // require the registration fee to be paid before approval
        'certificate_requires_clearance' => '1', // no certificate while fees are outstanding
        'min_attendance_percent' => '75',
        'payment_grace_days' => '0',           // days after the due date before LMS access is paused
        'whatsapp_receipts_enabled' => '1',
    ];

    public static function get(string $key, $default = null)
    {
        $row = static::where('key', $key)->first();

        if ($row) {
            return $row->value;
        }

        return $default ?? (self::DEFAULTS[$key] ?? null);
    }

    public static function bool(string $key): bool
    {
        return in_array((string) static::get($key), ['1', 'true', 'yes', 'on'], true);
    }

    public static function put(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => (string) $value]);
    }

    public static function allWithDefaults(): array
    {
        $stored = static::pluck('value', 'key')->all();

        return array_merge(self::DEFAULTS, array_intersect_key($stored, self::DEFAULTS));
    }
}
