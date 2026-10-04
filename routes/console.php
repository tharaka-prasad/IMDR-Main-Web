<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('imdr:about', function () {
    $this->info('IMDR Integrated Institute Management System');
})->purpose('Show application name');
