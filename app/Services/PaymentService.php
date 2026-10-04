<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentCallback;
use App\Models\PaymentTransaction;
use App\Models\Refund;
use App\Models\User;
use App\Services\Payments\GatewayManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * All money movement goes through here.
 *
 * Rules:
 *  - The browser saying "success" is never trusted. Only a verified gateway notification credits an invoice.
 *  - A gateway transaction can be credited exactly once (row lock + unique payment_transaction_id).
 *  - Nothing is deleted. Corrections are refunds / reversals.
 */
class PaymentService
{
    private ?Payment $lastCredited = null;

    public function __construct(private GatewayManager $gateways)
    {
    }

    /** Create a pending gateway transaction and return checkout details for the browser. */
    public function initiate(Invoice $invoice, User $user, ?float $amount = null): array
    {
        throw_if(in_array($invoice->status, ['paid', 'cancelled'], true), BusinessException::class, 'This invoice is already settled.');

        $balance = $invoice->balance;
        $amount = round($amount ?? $balance, 2);
        throw_if($amount < 1 || $amount > $balance + 0.001, BusinessException::class, 'Enter an amount between 1 and the outstanding balance.');

        $gateway = $this->gateways->driver();
        $invoice->loadMissing('student.user');

        $tx = PaymentTransaction::create([
            'invoice_id' => $invoice->id,
            'student_id' => $invoice->student_id,
            'gateway' => $gateway->name(),
            'order_id' => 'TXN'.now()->format('ymd').strtoupper(Str::random(8)),
            'amount' => $amount,
            'currency' => config('imdr.currency'),
            'status' => 'pending',
            'initiated_at' => now(),
            'metadata' => ['initiated_by' => $user->id],
        ]);

        AuditLog::record('payment.initiated', $tx, "Online payment started for {$invoice->invoice_no}", ['amount' => $amount]);

        return [
            'order_id' => $tx->order_id,
            'checkout' => $gateway->checkout($tx, $invoice),
        ];
    }

    /**
     * Entry point for every gateway notification (webhook or sandbox).
     * Returns: credited | duplicate | rejected | failed | pending | ignored
     */
    public function handleNotification(string $gatewayName, array $payload): string
    {
        $this->lastCredited = null;
        $gateway = $this->gateways->driver($gatewayName);
        $parsed = $gateway->parseNotification($payload);
        $orderId = $payload['order_id'] ?? null;
        $tx = $orderId ? PaymentTransaction::where('order_id', $orderId)->first() : null;

        $callback = PaymentCallback::create([
            'payment_transaction_id' => $tx?->id,
            'gateway' => $gatewayName,
            'payload' => $payload,
            'signature' => $payload['md5sig'] ?? $payload['signature'] ?? null,
            'verified' => $parsed !== null,
        ]);

        if (! $parsed || ! $tx || $tx->gateway !== $gatewayName) {
            $callback->update(['note' => $parsed ? 'unknown transaction' : 'invalid signature or payload']);
            AuditLog::record('payment.callback_ignored', $tx, 'Gateway notification ignored', ['gateway' => $gatewayName]);

            return 'ignored';
        }

        $result = match ($parsed['status']) {
            'success' => $this->creditTransaction($tx, $parsed),
            'failed', 'cancelled' => $this->closeTransaction($tx, $parsed['status']),
            default => 'pending',
        };

        $callback->update(['processed_at' => now(), 'note' => $result]);

        // Sent only after the database transaction has committed. Never allowed to break the payment itself.
        if ($result === 'credited' && $this->lastCredited) {
            WhatsAppService::sendReceipt($this->lastCredited);
        }

        return $result;
    }

    private function creditTransaction(PaymentTransaction $tx, array $info): string
    {
        return DB::transaction(function () use ($tx, $info) {
            $tx = PaymentTransaction::whereKey($tx->id)->lockForUpdate()->first();

            // Duplicate notification: already credited, do nothing.
            if ($tx->status === 'success') {
                return 'duplicate';
            }

            $mismatch = abs($info['amount'] - (float) $tx->amount) > 0.009
                || strtoupper($info['currency']) !== strtoupper($tx->currency);

            $invoice = Invoice::whereKey($tx->invoice_id)->lockForUpdate()->first();

            if ($mismatch || $invoice->status === 'cancelled') {
                $tx->update([
                    'status' => 'failed',
                    'metadata' => array_merge($tx->metadata ?? [], [
                        'rejected' => $mismatch ? 'amount_or_currency_mismatch' : 'invoice_cancelled',
                        'received' => $info,
                    ]),
                ]);
                AuditLog::record('payment.rejected', $tx, 'Gateway payment rejected - needs manual review', $info);
                NotificationService::toRoles(['accountant', 'super_admin'], 'Payment needs review',
                    "Transaction {$tx->order_id} was rejected (amount mismatch or cancelled invoice).", 'warning', '/portal/payments');

                return 'rejected';
            }

            $tx->update([
                'status' => 'success',
                'completed_at' => now(),
                'gateway_reference' => $info['reference'] ?? null,
                'payment_method' => $info['method'] ?? null,
            ]);

            $payment = $this->createPayment($invoice, (float) $tx->amount, 'online', $info['reference'] ?? $tx->order_id, null, $tx->id);
            $invoice->applyPayment((float) $tx->amount);

            AuditLog::record('payment.credited', $payment, "Online payment credited to {$invoice->invoice_no}", ['order_id' => $tx->order_id], null);

            $this->lastCredited = $payment;
            $userId = $invoice->student->user_id;
            NotificationService::send($userId, 'Payment received',
                'We received Rs. '.number_format($tx->amount, 2)." for {$invoice->invoice_no}. Receipt {$payment->receipt_no}.", 'payment', '/portal/finance');

            return 'credited';
        });
    }

    private function closeTransaction(PaymentTransaction $tx, string $status): string
    {
        $tx = PaymentTransaction::whereKey($tx->id)->first();

        // A late "failed" message must never undo a credited payment.
        if ($tx->status === 'pending') {
            $tx->update(['status' => $status, 'completed_at' => now()]);
            NotificationService::send($tx->student->user_id, 'Payment '.$status,
                'Your online payment was not completed. The invoice is still unpaid - you can try again.', 'warning', '/portal/finance');
        }

        return 'failed';
    }

    /** Cash / bank payment recorded by the accounts office. */
    public function recordManual(Invoice $invoice, float $amount, string $method, ?string $reference, ?string $paidAt, ?string $notes, User $by): Payment
    {
        $payment = DB::transaction(function () use ($invoice, $amount, $method, $reference, $paidAt, $notes, $by) {
            $invoice = Invoice::whereKey($invoice->id)->lockForUpdate()->first();

            throw_if($invoice->status === 'cancelled', BusinessException::class, 'This invoice is cancelled.');
            throw_if($amount <= 0 || $amount > $invoice->balance + 0.001, BusinessException::class, 'The amount is more than the outstanding balance.');

            $payment = $this->createPayment($invoice, $amount, $method, $reference, $by->id, null, $paidAt, $notes);
            $invoice->applyPayment($amount);

            AuditLog::record('payment.recorded', $payment, "{$method} payment recorded for {$invoice->invoice_no}", ['amount' => $amount]);
            NotificationService::send($invoice->student->user_id, 'Payment received',
                'We recorded Rs. '.number_format($amount, 2)." for {$invoice->invoice_no}. Receipt {$payment->receipt_no}.", 'payment', '/portal/finance');

            return $payment;
        });

        WhatsAppService::sendReceipt($payment);

        return $payment;
    }

    private function createPayment(Invoice $invoice, float $amount, string $method, ?string $reference, ?int $recordedBy, ?int $transactionId, ?string $paidAt = null, ?string $notes = null): Payment
    {
        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'student_id' => $invoice->student_id,
            'payment_transaction_id' => $transactionId,
            'amount' => $amount,
            'method' => $method,
            'reference' => $reference,
            'paid_at' => $paidAt ?: now(),
            'recorded_by' => $recordedBy,
            'status' => 'completed',
            'notes' => $notes,
        ]);

        $payment->update(['receipt_no' => 'RCT-'.str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT)]);

        return $payment;
    }

    /** Full or partial refund. Reverses the invoice balance; the payment row is kept. */
    public function refund(Payment $payment, float $amount, string $reason, User $by): Refund
    {
        return DB::transaction(function () use ($payment, $amount, $reason, $by) {
            $payment = Payment::whereKey($payment->id)->lockForUpdate()->first();
            $available = round($payment->amount - $payment->refunded_amount, 2);

            throw_if($amount <= 0 || $amount > $available + 0.001, BusinessException::class, 'The refund is more than the amount still refundable on this payment.');

            $refund = Refund::create([
                'payment_id' => $payment->id,
                'amount' => $amount,
                'reason' => $reason,
                'status' => 'processed',
                'processed_by' => $by->id,
                'processed_at' => now(),
            ]);

            $payment->refunded_amount = round($payment->refunded_amount + $amount, 2);
            $payment->status = $payment->refunded_amount >= $payment->amount - 0.005 ? 'refunded' : 'partially_refunded';
            $payment->save();

            $invoice = Invoice::whereKey($payment->invoice_id)->lockForUpdate()->first();
            $invoice->paid_amount = max(0, round($invoice->paid_amount - $amount, 2));
            $invoice->refreshStatus();
            $invoice->save();

            if ($payment->status === 'refunded' && $payment->payment_transaction_id) {
                PaymentTransaction::whereKey($payment->payment_transaction_id)->update(['status' => 'refunded']);
            }

            AuditLog::record('payment.refunded', $payment, "Refund of {$amount} for {$invoice->invoice_no}", ['reason' => $reason]);
            NotificationService::send($invoice->student->user_id, 'Refund processed',
                'Rs. '.number_format($amount, 2)." was refunded on {$invoice->invoice_no}.", 'payment', '/portal/finance');

            return $refund;
        });
    }
}
