<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no', 30)->nullable()->unique();
            $table->foreignId('student_id')->constrained();
            $table->foreignId('enrollment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20)->default('other'); // registration | installment | other
            $table->string('description');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('unpaid'); // unpaid | partial | paid | cancelled
            $table->timestamps();
            $table->index('status');
        });

        // One row per attempt at the payment gateway. Never treated as income by itself.
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained();
            $table->foreignId('student_id')->constrained();
            $table->string('gateway', 30);
            $table->string('order_id', 60)->unique(); // our transaction id, sent to the gateway
            $table->string('gateway_reference', 100)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 8);
            $table->string('status', 20)->default('pending'); // pending | success | failed | cancelled | refunded
            $table->string('payment_method', 50)->nullable();
            $table->dateTime('initiated_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // The internal ledger (accounting record of money received).
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_no', 30)->nullable()->unique();
            $table->foreignId('invoice_id')->constrained();
            $table->foreignId('student_id')->constrained();
            // Unique => a gateway transaction can only ever be credited once (idempotency guard).
            $table->foreignId('payment_transaction_id')->nullable()->unique()->constrained('payment_transactions');
            $table->decimal('amount', 12, 2);
            $table->decimal('refunded_amount', 12, 2)->default(0);
            $table->string('method', 20); // online | cash | bank
            $table->string('reference')->nullable();
            $table->dateTime('paid_at');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('completed'); // completed | partially_refunded | refunded
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Every WhatsApp message the system tries to send (receipts) - so nothing is silently lost.
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->string('to_phone', 30)->nullable();
            $table->text('body');
            $table->string('driver', 20);
            $table->string('status', 20); // sent | failed | simulated
            $table->string('provider_id')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_callbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_transaction_id')->nullable()->constrained('payment_transactions')->nullOnDelete();
            $table->string('gateway', 30);
            $table->json('payload');
            $table->string('signature')->nullable();
            $table->boolean('verified')->default(false);
            $table->dateTime('processed_at')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained();
            $table->decimal('amount', 12, 2);
            $table->text('reason');
            $table->string('status', 20)->default('processed');
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date')->index();
            $table->foreignId('expense_category_id')->constrained();
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 20)->default('cash');
            $table->string('reference')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('salary_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('pay_type', 20)->default('monthly'); // monthly | hourly | session
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('hourly_rate', 12, 2)->default(0);
            $table->decimal('session_rate', 12, 2)->default(0);
            $table->decimal('allowances', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->string('status', 20)->default('draft'); // draft | approved | paid
            $table->timestamps();
            $table->unique(['year', 'month']);
        });

        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->string('pay_type', 20);
            $table->decimal('hours', 8, 2)->default(0);
            $table->unsignedInteger('sessions')->default(0);
            $table->decimal('basic', 12, 2)->default(0);
            $table->decimal('allowances', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0);
            $table->decimal('net', 12, 2)->default(0);
            $table->string('status', 20)->default('pending'); // pending | paid
            $table->dateTime('paid_at')->nullable();
            $table->string('payment_method', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_no', 40)->nullable()->unique();
            $table->foreignId('student_id')->constrained();
            $table->foreignId('enrollment_id')->constrained();
            $table->dateTime('issued_at');
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('valid'); // valid | revoked
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['whatsapp_messages', 'certificates', 'payroll_items', 'payroll_periods', 'salary_rules', 'expenses', 'expense_categories', 'refunds', 'payment_callbacks', 'payments', 'payment_transactions', 'invoices'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
