<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $tz = env('APP_TIMEZONE', 'Asia/Colombo');
        config(['app.timezone' => $tz]);
        date_default_timezone_set($tz);
    }

    public function boot(): void
    {
        //
    }
}
