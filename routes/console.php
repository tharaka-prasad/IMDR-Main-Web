<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('imdr:about', function () {
    $this->info('IMDR Integrated Institute Management System');
})->purpose('Show application name');

Artisan::command('seo:export-sitemap {path : Absolute or relative output filename} {--no-lastmod : Omit timestamps when exporting from a development database}', function () {
    $path = $this->argument('path');
    if (is_file($path)) {
        $this->error('Output already exists. Choose a new filename to avoid overwriting a published sitemap.');
        return 1;
    }
    if (file_put_contents($path, app(\App\Support\Sitemap::class)->xml(! $this->option('no-lastmod'))) === false) {
        $this->error('Unable to write sitemap.');
        return 1;
    }
    $this->info('Sitemap exported to '.$path);
})->purpose('Export the current published public URLs as a Google-compatible XML sitemap');
