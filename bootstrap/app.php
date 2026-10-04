<?php

use App\Exceptions\BusinessException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'active' => \App\Http\Middleware\EnsureActiveUser::class,
            'lms' => \App\Http\Middleware\EnsureLmsAccess::class,
        ]);

        // The payment gateway calls this URL itself (it cannot send a CSRF token). It is protected by the signature check.
        $middleware->validateCsrfTokens(except: ['payments/payhere/notify']);

        $middleware->redirectGuestsTo('/login');
        $middleware->redirectUsersTo('/portal');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Institute rules (batch full, refund too large ...) come back to the same page as a red message.
        $exceptions->render(function (BusinessException $e, Request $request) {
            return back()->with('error', $e->getMessage());
        });

        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            $status = $response->getStatusCode();

            if ($request->is('payments/payhere/notify')) {
                return $response;
            }

            if (in_array($status, [403, 404], true) || (! app()->environment(['local', 'testing']) && in_array($status, [500, 503], true))) {
                return Inertia::render('Error', [
                    'status' => $status,
                    'message' => $e instanceof HttpExceptionInterface ? $e->getMessage() : null,
                ])->toResponse($request)->setStatusCode($status);
            }

            if ($status === 419) {
                return back()->with('error', 'Your session expired. Please try again.');
            }

            return $response;
        });
    })->create();
