<?php

namespace App\Services\Payments;

use InvalidArgumentException;

/** Resolves the active payment gateway adapter. Add a new provider = add a class + one line here. */
class GatewayManager
{
    public function driver(?string $name = null): GatewayInterface
    {
        $name ??= config('imdr.payments.gateway');

        return match ($name) {
            'payhere' => new PayHereGateway(config('imdr.payments.payhere')),
            'sandbox' => new SandboxGateway(),
            default => throw new InvalidArgumentException("Unknown payment gateway [{$name}]."),
        };
    }
}
