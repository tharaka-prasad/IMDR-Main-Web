<?php

return [
    // Keep this aligned with the production host redirect and Search Console property.
    'url' => env('SEO_SITE_URL', 'https://imdr.lk'),
    'redirect_hosts' => ['imdr.lk', 'www.imdr.lk'],
    'redirect_canonical_host' => env('SEO_REDIRECT_CANONICAL_HOST', env('APP_ENV', 'production') === 'production'),
    'indexing_enabled' => env('SEO_INDEXING_ENABLED', env('APP_ENV', 'production') === 'production'),
];
