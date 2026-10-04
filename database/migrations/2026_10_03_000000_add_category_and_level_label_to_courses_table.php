<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (! Schema::hasColumn('courses', 'category')) {
                // Subject area used for the website filter, e.g. "Media & Journalism".
                $table->string('category')->nullable()->index();
            }

            if (! Schema::hasColumn('courses', 'level_label')) {
                // Levels the course is offered at, e.g. "Certificate / Advanced Certificate".
                $table->string('level_label')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'category')) {
                $table->dropIndex(['category']);
                $table->dropColumn('category');
            }

            if (Schema::hasColumn('courses', 'level_label')) {
                $table->dropColumn('level_label');
            }
        });
    }
};
