<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\PaymentCallback;
use App\Models\PaymentTransaction;
use App\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        config([
            'imdr.payments.gateway' => 'payhere',
            'imdr.payments.payhere.merchant_id' => '12345',
            'imdr.payments.payhere.merchant_secret' => 'topsecret',
            'imdr.whatsapp.driver' => 'log',
        ]);
    }

    private function pendingTransaction(float $amount = 5000): array
    {
        $batch = $this->makeBatch();
        [$student] = $this->makeStudent($batch);
        $invoice = $this->registrationInvoice($student);

        $tx = PaymentTransaction::create([
            'invoice_id' => $invoice->id, 'student_id' => $student->id, 'gateway' => 'payhere', 'order_id' => 'TXNTEST0001',
            'amount' => $amount, 'currency' => 'LKR', 'status' => 'pending', 'initiated_at' => now(),
        ]);

        return [$tx, $invoice, $student];
    }

    private function payload(PaymentTransaction $tx, int $status = 2, ?float $amount = null, string $secret = 'topsecret'): array
    {
        $amt = number_format($amount ?? $tx->amount, 2, '.', '');
        $sig = strtoupper(md5('12345'.$tx->order_id.$amt.'LKR'.$status.strtoupper(md5($secret))));

        return [
            'merchant_id' => '12345', 'order_id' => $tx->order_id, 'payment_id' => '320032', 'payhere_amount' => $amt,
            'payhere_currency' => 'LKR', 'status_code' => $status, 'md5sig' => $sig, 'method' => 'VISA',
        ];
    }

    public function test_verified_success_credits_the_invoice_exactly_once(): void
    {
        [$tx, $invoice] = $this->pendingTransaction();

        $this->post('/payments/payhere/notify', $this->payload($tx))->assertOk();
        $this->post('/payments/payhere/notify', $this->payload($tx))->assertOk(); // duplicate delivery

        $this->assertSame(1, Payment::count());
        $this->assertEquals(5000.0, $invoice->fresh()->paid_amount);
        $this->assertSame('paid', $invoice->fresh()->status);
        $this->assertSame('success', $tx->fresh()->status);
        $this->assertSame(2, PaymentCallback::count()); // both callbacks are kept for audit
    }

    public function test_invalid_signature_is_ignored(): void
    {
        [$tx, $invoice] = $this->pendingTransaction();

        $this->post('/payments/payhere/notify', $this->payload($tx, 2, null, 'wrong-secret'))->assertOk();

        $this->assertSame(0, Payment::count());
        $this->assertSame('pending', $tx->fresh()->status);
        $this->assertSame('unpaid', $invoice->fresh()->status);
    }

    public function test_wrong_amount_is_rejected_for_review(): void
    {
        [$tx, $invoice] = $this->pendingTransaction();

        $this->post('/payments/payhere/notify', $this->payload($tx, 2, 100.0))->assertOk();

        $this->assertSame(0, Payment::count());
        $this->assertSame('failed', $tx->fresh()->status);
        $this->assertSame('unpaid', $invoice->fresh()->status);
    }

    public function test_a_late_failed_message_never_undoes_a_success(): void
    {
        [$tx, $invoice] = $this->pendingTransaction();

        $this->post('/payments/payhere/notify', $this->payload($tx, 2));
        $this->post('/payments/payhere/notify', $this->payload($tx, -2));

        $this->assertSame('success', $tx->fresh()->status);
        $this->assertSame('paid', $invoice->fresh()->status);
        $this->assertSame(1, Payment::count());
    }

    public function test_a_failed_payment_leaves_the_invoice_unpaid(): void
    {
        [$tx, $invoice] = $this->pendingTransaction();

        $this->post('/payments/payhere/notify', $this->payload($tx, -2));

        $this->assertSame('failed', $tx->fresh()->status);
        $this->assertSame('unpaid', $invoice->fresh()->status);
        $this->assertSame(0, Payment::count());
    }

    public function test_successful_payment_queues_a_whatsapp_receipt_to_the_students_number(): void
    {
        [$tx] = $this->pendingTransaction();

        $this->post('/payments/payhere/notify', $this->payload($tx));

        $message = WhatsAppMessage::first();
        $this->assertNotNull($message);
        $this->assertSame('94771234567', $message->to_phone);
        $this->assertSame('simulated', $message->status); // driver "log": nothing leaves the server
        $this->assertStringContainsString('RCT-', $message->body);
        $this->assertStringContainsString('Rs. 5,000.00', $message->body);
    }

    public function test_cloud_driver_sends_the_receipt_through_the_whatsapp_api(): void
    {
        config([
            'imdr.whatsapp.driver' => 'cloud',
            'imdr.whatsapp.cloud.token' => 'tok', 'imdr.whatsapp.cloud.phone_number_id' => '999',
        ]);
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.123']]], 200)]);

        [$tx] = $this->pendingTransaction();
        $this->post('/payments/payhere/notify', $this->payload($tx));

        Http::assertSent(fn ($request) => str_contains($request->url(), '/999/messages') && $request['to'] === '94771234567');
        $this->assertSame('sent', WhatsAppMessage::first()->status);
        $this->assertSame('wamid.123', WhatsAppMessage::first()->provider_id);
    }

    public function test_a_whatsapp_failure_does_not_break_the_payment(): void
    {
        config(['imdr.whatsapp.driver' => 'cloud', 'imdr.whatsapp.cloud.token' => 'tok', 'imdr.whatsapp.cloud.phone_number_id' => '999']);
        Http::fake(['graph.facebook.com/*' => Http::response(['error' => ['message' => 'Recipient not allowed']], 400)]);

        [$tx, $invoice] = $this->pendingTransaction();
        $this->post('/payments/payhere/notify', $this->payload($tx))->assertOk();

        $this->assertSame('paid', $invoice->fresh()->status);
        $this->assertSame('failed', WhatsAppMessage::first()->status);
    }

    public function test_accountant_can_record_a_cash_payment_and_refund_part_of_it(): void
    {
        $batch = $this->makeBatch();
        [$student] = $this->makeStudent($batch);
        $invoice = $this->registrationInvoice($student);
        $accountant = $this->makeStaff('accountant', 'accounts');

        $this->actingAs($accountant)->post('/portal/payments', [
            'invoice_id' => $invoice->id, 'amount' => 5000, 'method' => 'cash',
        ])->assertRedirect();

        $payment = Payment::firstOrFail();
        $this->assertSame('paid', $invoice->fresh()->status);

        $this->actingAs($accountant)->post("/portal/payments/{$payment->id}/refund", ['amount' => 2000, 'reason' => 'Overpaid'])->assertRedirect();

        $this->assertSame('partial', $invoice->fresh()->status);
        $this->assertEquals(3000.0, $invoice->fresh()->paid_amount);
        $this->assertSame('partially_refunded', $payment->fresh()->status);
    }

    public function test_refund_cannot_exceed_the_payment(): void
    {
        $batch = $this->makeBatch();
        [$student] = $this->makeStudent($batch);
        $invoice = $this->registrationInvoice($student);
        $accountant = $this->makeStaff('accountant', 'accounts');

        $this->actingAs($accountant)->post('/portal/payments', ['invoice_id' => $invoice->id, 'amount' => 5000, 'method' => 'bank']);
        $payment = Payment::firstOrFail();

        $this->actingAs($accountant)->post("/portal/payments/{$payment->id}/refund", ['amount' => 9000, 'reason' => 'x'])
            ->assertSessionHas('error');

        $this->assertEquals(0.0, $payment->fresh()->refunded_amount);
    }
}
