<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Services\Payments\SandboxGateway;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnlinePaymentController extends Controller
{
    /** PayHere server-to-server notification. Public URL, protected by the md5sig signature check. */
    public function payhereNotify(Request $request, PaymentService $service)
    {
        $service->handleNotification('payhere', $request->all());

        // Always answer 200 so the gateway stops retrying. The outcome is stored in payment_callbacks.
        return response('OK', 200);
    }

    /** The page the gateway sends the student back to. Only the verified notification changes the status; this page just watches it. */
    public function return(Request $request)
    {
        $tx = PaymentTransaction::with('invoice:id,invoice_no,description,status,total,paid_amount')
            ->where('order_id', (string) $request->query('order_id'))->firstOrFail();
        $this->authorizeTransaction($request, $tx);

        return Inertia::render('Payment/Return', [
            'transaction' => [
                'order_id' => $tx->order_id, 'status' => $tx->status, 'amount' => $tx->amount, 'currency' => $tx->currency,
                'gateway' => $tx->gateway, 'invoice' => $tx->invoice,
            ],
            'cancelled' => $request->boolean('cancelled'),
        ]);
    }

    /** Fake payment page for development and demos (gateway = sandbox, never in production). */
    public function sandboxShow(Request $request, string $order)
    {
        $tx = $this->sandboxTransaction($request, $order);

        return Inertia::render('Payment/Sandbox', [
            'transaction' => ['order_id' => $tx->order_id, 'amount' => $tx->amount, 'currency' => $tx->currency, 'status' => $tx->status, 'invoice' => $tx->invoice->only(['invoice_no', 'description'])],
        ]);
    }

    public function sandboxComplete(Request $request, string $order, PaymentService $service)
    {
        $tx = $this->sandboxTransaction($request, $order);
        $data = $request->validate(['result' => 'required|in:success,failed,cancelled']);

        // Same verified path as a real gateway notification.
        $service->handleNotification('sandbox', SandboxGateway::payloadFor($tx, $data['result']));

        return redirect('/portal/payment/return?order_id='.$tx->order_id);
    }

    private function sandboxTransaction(Request $request, string $order): PaymentTransaction
    {
        abort_if(app()->isProduction() || config('imdr.payments.gateway') !== 'sandbox', 404);

        $tx = PaymentTransaction::with('invoice')->where('order_id', $order)->firstOrFail();
        abort_unless($tx->gateway === 'sandbox', 404);
        $this->authorizeTransaction($request, $tx);

        return $tx;
    }

    private function authorizeTransaction(Request $request, PaymentTransaction $tx): void
    {
        $user = $request->user();

        if ($user->role === 'student') {
            abort_unless($user->student && $tx->student_id === $user->student->id, 403, 'This payment belongs to another student.');
        }
    }
}
