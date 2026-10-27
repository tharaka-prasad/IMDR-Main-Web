<?php

namespace App\Support;

/**
 * Which panel (its own layout and its own menu) every role works in.
 * Super admins and admins share the Admin panel; the super admin simply sees more menu items.
 */
class Panels
{
    public const ROLE_PANEL = [
        'super_admin' => 'admin',
        'admin' => 'admin',
        'accountant' => 'accountant',
        'lecturer' => 'lecturer',
        'student' => 'student',
    ];

    public const LABELS = [
        'admin' => 'Admin Panel',
        'accountant' => 'Accountant Panel',
        'lecturer' => 'Lecturer Panel',
        'student' => 'Student Panel',
    ];

    public static function forRole(?string $role): ?string
    {
        return self::ROLE_PANEL[$role ?? ''] ?? null;
    }

    public static function label(?string $panel): string
    {
        return self::LABELS[$panel ?? ''] ?? 'Portal';
    }

    /** @return array<int, string> */
    public static function keys(): array
    {
        return array_keys(self::LABELS);
    }
}
