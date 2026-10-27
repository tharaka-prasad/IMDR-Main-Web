<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use App\Models\ContactMessage;
use App\Models\Enrollment;
use App\Models\PaymentTransaction;
use App\Services\AccessService;
use App\Support\Panels;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        $panel = Panels::forRole($user?->role);

        return [
            ...parent::share($request),
            'seo' => \Inertia\Inertia::always(fn () => \App\Support\SeoMetadata::forRequest($request)),
            'app' => [
                'name' => config('imdr.short_name'),
                'currency' => config('imdr.currency'),
                'gateway' => config('imdr.payments.gateway'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'status' => $user->status,
                ] : null,
            ],
            // Which panel (layout + menu) this user works in: admin | accountant | lecturer | student
            'panel' => $user ? ['key' => $panel, 'label' => Panels::label($panel)] : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'credentials' => fn () => $request->session()->get('credentials'),
            ],
            'unread' => fn () => $user ? AppNotification::where('user_id', $user->id)->whereNull('read_at')->count() : 0,
            // Small red numbers on menu items (only the counts each panel needs).
            'badges' => fn () => match (true) {
                $user && in_array($user->role, ['super_admin', 'admin'], true) => [
                    'registrations' => Enrollment::where('status', 'pending')->count(),
                    'website_messages' => ContactMessage::where('is_read', false)->count(),
                ],
                $user && $user->role === 'accountant' => [
                    'transactions' => PaymentTransaction::where('status', 'pending')->count(),
                ],
                default => [],
            },
            // Students see a payment-delay banner on every portal page when the LMS is paused.
            'access' => fn () => $user && $user->role === 'student' && $user->student ? AccessService::forStudent($user->student) : null,
        ];
    }
}