<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Models\PaymentTransaction;

/**
 * PayHere (payhere.lk) Checkout API adapter.
 * Check the current field list and hash rules in the PayHere developer docs before going live.
 */
class PayHereGateway implements GatewayInterface
{
    public function __construct(private array $config)
    {
    }

    public function name(): string
    {
        return 'payhere';
    }

    public function checkout(PaymentTransaction $tx, Invoice $invoice): array
    {
        $user = $invoice->student->user;
        $amount = number_format((float) $tx->amount, 2, '.', '');
        $parts = preg_split('/\s+/', trim($user->name), 2);

        $fields = [
            'merchant_id' => $this->config['merchant_id'],
            'return_url' => url('/portal/payment/return?order_id='.$tx->order_id),
            'cancel_url' => url('/portal/payment/return?order_id='.$tx->order_id.'&cancelled=1'),
            'notify_url' => $this->config['notify_url'] ?: url('/api/payments/payhere/notify'),
            'order_id' => $tx->order_id,
            'items' => $invoice->description,
            'currency' => $tx->currency,
            'amount' => $amount,
            'first_name' => $parts[0] ?? $user->name,
            'last_name' => $parts[1] ?? '-',
            'email' => $user->email,
            'phone' => $user->phone ?: '0000000000',
            'address' => $invoice->student->address ?: 'Sri Lanka',
            'city' => 'Colombo',
            'country' => 'Sri Lanka',
            'custom_1' => $invoice->invoice_no,
            'hash' => $this->checkoutHash($tx->order_id, $amount, $tx->currency),
        ];

        return [
            'method' => 'POST',
            'action' => $this->config['sandbox']
                ? 'https://sandbox.payhere.lk/pay/checkout'
                : 'https://www.payhere.lk/pay/checkout',
            'fields' => $fields,
        ];
    }

    public function checkoutHash(string $orderId, string $formattedAmount, string $currency): string
    {
        return strtoupper(md5(
            $this->config['merchant_id'].$orderId.$formattedAmount.$currency.strtoupper(md5((string) $this->config['merchant_secret']))
        ));
    }

    public function parseNotification(array $p): ?array
    {
        foreach (['merchant_id', 'order_id', 'payhere_amount', 'payhere_currency', 'status_code', 'md5sig'] as $key) {
            if (! isset($p[$key])) {
                return null;
            }
        }

        if ((string) $p['merchant_id'] !== (string) $this->config['merchant_id']) {
            return null;
        }

        $local = strtoupper(md5(
            $p['merchant_id'].$p['order_id'].$p['payhere_amount'].$p['payhere_currency'].$p['status_code']
            .strtoupper(md5((string) $this->config['merchant_secret']))
        ));

        if (! hash_equals($local, strtoupper((string) $p['md5sig']))) {
            return null;
        }

        $status = match ((int) $p['status_code']) {
            2 => 'success',
            0 => 'pending',
            -1 => 'cancelled',
            default => 'failed', // -2 failed, -3 chargeback
        };

        return [
            'order_id' => (string) $p['order_id'],
            'status' => $status,
            'amount' => (float) $p['payhere_amount'],
            'currency' => (string) $p['payhere_currency'],
            'reference' => $p['payment_id'] ?? null,
            'method' => $p['method'] ?? null,
        ];
    }
}
