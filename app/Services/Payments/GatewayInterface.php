<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Models\PaymentTransaction;

interface GatewayInterface
{
    public function name(): string;

    /**
     * Build what the browser needs to send the student to the gateway.
     * Returns ['method' => 'POST'|'GET', 'action' => url, 'fields' => array].
     */
    public function checkout(PaymentTransaction $tx, Invoice $invoice): array;

    /**
     * Verify the signature of a server-to-server notification and normalise it.
     * Returns null when the payload is malformed or the signature is invalid.
     *
     * @return null|array{order_id:string,status:string,amount:float,currency:string,reference:?string,method:?string}
     */
    public function parseNotification(array $payload): ?array;
}
