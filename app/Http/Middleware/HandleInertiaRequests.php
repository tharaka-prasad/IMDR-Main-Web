<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use App\Services\AccessService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();

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
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'credentials' => fn () => $request->session()->get('credentials'),
            ],
            'unread' => fn () => $user ? AppNotification::where('user_id', $user->id)->whereNull('read_at')->count() : 0,
            // Students see a payment-delay banner on every portal page when the LMS is paused.
            'access' => fn () => $user && $user->role === 'student' && $user->student ? AccessService::forStudent($user->student) : null,
        ];
    }
}
