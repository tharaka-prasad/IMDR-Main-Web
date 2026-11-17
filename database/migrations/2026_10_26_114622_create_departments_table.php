<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('departments')) {
            Schema::create('departments', function (Blueprint $table) {
                $table->id();
                $table->string('name', 120);
                $table->string('code', 20)->unique();
                $table->string('description', 500)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Created here (after the departments table exists) so the order of the migrations never matters.
        foreach (['courses', 'lecturers'] as $name) {
            if (Schema::hasTable($name) && ! Schema::hasColumn($name, 'department_id')) {
                Schema::table($name, function (Blueprint $table) {
                    $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['courses', 'lecturers'] as $name) {
            if (Schema::hasTable($name) && Schema::hasColumn($name, 'department_id')) {
                Schema::table($name, function (Blueprint $table) {
                    $table->dropConstrainedForeignId('department_id');
                });
            }
        }

        Schema::dropIfExists('departments');
    }
};
