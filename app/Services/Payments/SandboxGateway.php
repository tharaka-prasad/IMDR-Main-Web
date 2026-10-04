<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Models\PaymentTransaction;

/**
 * Built-in fake gateway for development and demos. No money moves.
 * It sends the browser to /payment/sandbox/{order} where you choose success / failure / cancel.
 * The result then travels through the SAME verified-notification path as a real gateway.
 */
class SandboxGateway implements GatewayInterface
{
    public function name(): string
    {
        return 'sandbox';
    }

    public function checkout(PaymentTransaction $tx, Invoice $invoice): array
    {
        return [
            'method' => 'GET',
            'action' => '/payment/sandbox/'.$tx->order_id,
            'fields' => [],
        ];
    }

    public static function sign(string $orderId, float $amount, string $currency, string $status): string
    {
        return hash_hmac(
            'sha256',
            $orderId.'|'.number_format($amount, 2, '.', '').'|'.$currency.'|'.$status,
            (string) config('app.key')
        );
    }

    public static function payloadFor(PaymentTransaction $tx, string $status): array
    {
        return [
            'order_id' => $tx->order_id,
            'amount' => number_format((float) $tx->amount, 2, '.', ''),
            'currency' => $tx->currency,
            'status' => $status,
            'reference' => 'SBX-'.strtoupper(substr(md5($tx->order_id), 0, 10)),
            'signature' => self::sign($tx->order_id, (float) $tx->amount, $tx->currency, $status),
        ];
    }

    public function parseNotification(array $p): ?array
    {
        foreach (['order_id', 'amount', 'currency', 'status', 'signature'] as $key) {
            if (! isset($p[$key])) {
                return null;
            }
        }

        $local = self::sign($p['order_id'], (float) $p['amount'], $p['currency'], $p['status']);

        if (! hash_equals($local, (string) $p['signature'])) {
            return null;
        }

        return [
            'order_id' => (string) $p['order_id'],
            'status' => in_array($p['status'], ['success', 'failed', 'cancelled'], true) ? $p['status'] : 'pending',
            'amount' => (float) $p['amount'],
            'currency' => (string) $p['currency'],
            'reference' => $p['reference'] ?? null,
            'method' => 'sandbox',
        ];
    }
}
