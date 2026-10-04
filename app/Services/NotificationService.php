<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\User;

class NotificationService
{
    /** In-app notification. Email / SMS / WhatsApp channels can be added here later. */
    public static function send(iterable|int $userIds, string $title, ?string $body = null, string $type = 'info', ?string $link = null): void
    {
        $ids = collect(is_iterable($userIds) ? $userIds : [$userIds])->unique()->values();

        if ($ids->isEmpty()) {
            return;
        }

        $now = now();

        AppNotification::insert($ids->map(fn ($id) => [
            'user_id' => $id,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'link' => $link,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());
    }

    public static function toRoles(array $roles, string $title, ?string $body = null, string $type = 'info', ?string $link = null): void
    {
        self::send(
            User::whereIn('role', $roles)->where('status', '!=', 'suspended')->pluck('id'),
            $title, $body, $type, $link
        );
    }
}
