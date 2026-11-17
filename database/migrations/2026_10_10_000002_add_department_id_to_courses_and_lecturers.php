<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Intentionally does nothing.
 * The department_id columns on courses and lecturers are created in 2026_10_26_114622_create_departments_table,
 * right after the departments table exists. This file is kept so the migration history stays the same.
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
