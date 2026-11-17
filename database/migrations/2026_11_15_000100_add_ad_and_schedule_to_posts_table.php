<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Picture uploaded by the admin (path inside /public, e.g. uploads/news/abc.jpg)
            if (! Schema::hasColumn('posts', 'image_path')) {
                $table->string('image_path')->nullable();
            }
            // The news is shown on the website from starts_at until ends_at (both empty = always, like older posts)
            if (! Schema::hasColumn('posts', 'starts_at')) {
                $table->dateTime('starts_at')->nullable();
            }
            if (! Schema::hasColumn('posts', 'ends_at')) {
                $table->dateTime('ends_at')->nullable();
            }
            // Also open as a pop-up ad every time somebody visits the home page
            if (! Schema::hasColumn('posts', 'show_as_ad')) {
                $table->boolean('show_as_ad')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            foreach (['image_path', 'starts_at', 'ends_at', 'show_as_ad'] as $column) {
                if (Schema::hasColumn('posts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};