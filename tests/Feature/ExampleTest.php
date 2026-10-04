<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_loads(): void
    {
        $this->withoutVite();

        $this->get('/')->assertOk();
    }

    public function test_portal_requires_login(): void
    {
        $this->get('/portal')->assertRedirect('/login');
    }
}
