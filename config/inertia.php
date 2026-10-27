<?php

return [
    'ssr' => [
        'enabled' => (bool) env('INERTIA_SSR_ENABLED', env('APP_ENV') !== 'testing'),
        'url' => env('INERTIA_SSR_URL', 'http://127.0.0.1:13714'),
        'bundle' => base_path('bootstrap/ssr/ssr.js'),
        'ensure_bundle_exists' => true,
    ],
];
