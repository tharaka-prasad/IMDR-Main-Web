<?php

namespace App\Http\Middleware;

use App\Services\AccessService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Students with an overdue payment (or no approved registration) do not get into the LMS. Staff always pass. */
class EnsureLmsAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->role === 'student') {
            $access = $user->student
                ? AccessService::forStudent($user->student)
                : ['allowed' => false, 'reason' => 'no_enrollment', 'overdue_total' => 0, 'overdue' => [], 'override_until' => null];

            if (! $access['allowed']) {
                return Inertia::render('Student/Blocked', ['access' => $access])->toResponse($request);
            }
        }

        return $next($request);
    }
}
