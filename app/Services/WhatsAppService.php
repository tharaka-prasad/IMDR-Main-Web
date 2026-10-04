<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Setting;
use App\Models\WhatsAppMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;

/**
 * Sends payment receipts to the student on WhatsApp.
 * Every attempt is stored in whatsapp_messages. A failure here never affects the payment itself.
 */
class WhatsAppService
{
    /** 0771234567 -> 94771234567 (digits only, international format). */
    public static function normalizePhone(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);

        if ($digits === '') {
            return null;
        }

        $cc = (string) config('imdr.whatsapp.country_code', '94');

        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        } elseif (str_starts_with($digits, '0')) {
            $digits = $cc.substr($digits, 1);
        } elseif (! str_starts_with($digits, $cc) && strlen($digits) <= 9) {
            $digits = $cc.$digits;
        }

        return strlen($digits) >= 10 ? $digits : null;
    }

    public static function receiptLink(Payment $payment): string
    {
        return URL::temporarySignedRoute('receipt.public', now()->addDays(90), ['payment' => $payment->id]);
    }

    public static function receiptBody(Payment $payment): string
    {
        $payment->loadMissing('student.user', 'invoice');
        $invoice = $payment->invoice;
        $student = $payment->student;

        $outstanding = \App\Models\Invoice::where('student_id', $student->id)
            ->whereIn('status', ['unpaid', 'partial'])->get()->sum('balance');

        return implode("\n", [
            '*IMDR - Payment receipt*',
            'Receipt no: '.$payment->receipt_no,
            'Student: '.$student->user->name.' ('.$student->student_no.')',
            'For: '.$invoice->description.' ('.$invoice->invoice_no.')',
            'Amount paid: Rs. '.number_format($payment->amount, 2),
            'Method: '.ucfirst($payment->method),
            'Date: '.$payment->paid_at->format('d M Y, h:i A'),
            'Invoice balance: Rs. '.number_format($invoice->balance, 2),
            'Total outstanding: Rs. '.number_format($outstanding, 2),
            '',
            'Open or print your receipt: '.self::receiptLink($payment),
            '',
            'Thank you.',
        ]);
    }

    public static function sendReceipt(Payment $payment): ?WhatsAppMessage
    {
        try {
            if (! Setting::bool('whatsapp_receipts_enabled')) {
                return null;
            }

            $payment->loadMissing('student.user', 'invoice');
            $student = $payment->student;
            $phone = self::normalizePhone($student->whatsapp_number ?: $student->user->phone);

            $templateParams = [
                $student->user->name,
                $payment->receipt_no,
                'Rs. '.number_format($payment->amount, 2),
                $payment->invoice->invoice_no,
                self::receiptLink($payment),
            ];

            return self::deliver($phone, self::receiptBody($payment), ['payment_id' => $payment->id, 'student_id' => $student->id], $templateParams);
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /** Try again with the same text (used from the WhatsApp log screen). */
    public static function resend(WhatsAppMessage $message): WhatsAppMessage
    {
        $payment = $message->payment;
        $params = $payment ? [
            $payment->student->user->name, $payment->receipt_no, 'Rs. '.number_format($payment->amount, 2),
            $payment->invoice->invoice_no, self::receiptLink($payment),
        ] : [];

        return self::deliver($message->to_phone, $message->body, ['payment_id' => $message->payment_id, 'student_id' => $message->student_id], $params);
    }

    public static function manualLink(?string $phone, string $body): ?string
    {
        $phone = self::normalizePhone($phone);

        return $phone ? 'https://wa.me/'.$phone.'?text='.rawurlencode($body) : null;
    }

    public static function deliver(?string $phone, string $body, array $meta, array $templateParams = []): WhatsAppMessage
    {
        $driver = (string) config('imdr.whatsapp.driver', 'log');
        $row = ['to_phone' => $phone, 'body' => $body, 'driver' => $driver] + $meta;

        if (! $phone) {
            return WhatsAppMessage::create($row + ['status' => 'failed', 'error' => 'No valid WhatsApp or phone number on file for this student.']);
        }

        try {
            if ($driver === 'cloud') {
                [$ok, $id, $error] = self::viaCloud($phone, $body, $templateParams);
            } elseif ($driver === 'twilio') {
                [$ok, $id, $error] = self::viaTwilio($phone, $body);
            } else {
                return WhatsAppMessage::create($row + ['status' => 'simulated', 'error' => 'Driver is "log": nothing was sent. Use the click-to-chat link or configure a real driver.']);
            }
        } catch (\Throwable $e) {
            report($e);

            return WhatsAppMessage::create($row + ['status' => 'failed', 'error' => $e->getMessage()]);
        }

        return WhatsAppMessage::create($row + ['status' => $ok ? 'sent' : 'failed', 'provider_id' => $id, 'error' => $ok ? null : $error]);
    }

    private static function viaCloud(string $phone, string $body, array $templateParams): array
    {
        $cfg = config('imdr.whatsapp.cloud');

        if (! $cfg['token'] || ! $cfg['phone_number_id']) {
            return [false, null, 'WHATSAPP_CLOUD_TOKEN / WHATSAPP_CLOUD_PHONE_NUMBER_ID are not set.'];
        }

        $payload = ['messaging_product' => 'whatsapp', 'to' => $phone];

        if ($cfg['template']) {
            $payload += [
                'type' => 'template',
                'template' => [
                    'name' => $cfg['template'],
                    'language' => ['code' => $cfg['template_language']],
                    'components' => [[
                        'type' => 'body',
                        'parameters' => array_map(fn ($t) => ['type' => 'text', 'text' => (string) $t], $templateParams),
                    ]],
                ],
            ];
        } else {
            $payload += ['type' => 'text', 'text' => ['preview_url' => true, 'body' => $body]];
        }

        $res = Http::withToken($cfg['token'])->timeout(15)
            ->post("https://graph.facebook.com/{$cfg['api_version']}/{$cfg['phone_number_id']}/messages", $payload);

        return [$res->successful(), data_get($res->json(), 'messages.0.id'), data_get($res->json(), 'error.message') ?: $res->body()];
    }

    private static function viaTwilio(string $phone, string $body): array
    {
        $cfg = config('imdr.whatsapp.twilio');

        if (! $cfg['sid'] || ! $cfg['token'] || ! $cfg['from']) {
            return [false, null, 'TWILIO_SID / TWILIO_TOKEN / TWILIO_WHATSAPP_FROM are not set.'];
        }

        $res = Http::asForm()->withBasicAuth($cfg['sid'], $cfg['token'])->timeout(15)
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$cfg['sid']}/Messages.json", [
                'From' => 'whatsapp:+'.ltrim($cfg['from'], '+'),
                'To' => 'whatsapp:+'.$phone,
                'Body' => $body,
            ]);

        return [$res->successful(), data_get($res->json(), 'sid'), data_get($res->json(), 'message') ?: $res->body()];
    }
}
