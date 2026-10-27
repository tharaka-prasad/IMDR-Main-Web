<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Intentionally does nothing.
 * Learning-access rules (payment delay, admin override) are handled by App\Services\AccessService and the
 * students.lms_access_override_until column, so no extra enrollment columns are needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        //
    }

    public function down(): void
    {
        //
    }
};
