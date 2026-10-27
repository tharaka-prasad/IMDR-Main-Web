<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 150);
            $table->text('body');
            $table->string('audience', 20); // students | batch | delayed | all
            $table->foreignId('batch_id')->nullable()->constrained('batches')->nullOnDelete();
            $table->boolean('in_app')->default(true);
            $table->boolean('whatsapp')->default(false);
            $table->unsignedInteger('recipient_count')->default(0);
            $table->unsignedInteger('whatsapp_sent')->default(0);
            $table->unsignedInteger('whatsapp_prepared')->default(0);
            $table->unsignedInteger('whatsapp_failed')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_messages');
    }
};
