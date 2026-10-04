<?php

return [
    'name' => env('IMDR_NAME', 'Institute of Media Development and Research'),
    'short_name' => 'IMDR',
    'currency' => env('IMDR_CURRENCY', 'LKR'),

    'payments' => [
        // "sandbox" = built-in test gateway (no real money). "payhere" = PayHere (payhere.lk).
        'gateway' => env('PAYMENT_GATEWAY', 'sandbox'),
        'payhere' => [
            'merchant_id' => env('PAYHERE_MERCHANT_ID'),
            'merchant_secret' => env('PAYHERE_MERCHANT_SECRET'),
            'sandbox' => env('PAYHERE_SANDBOX', true),
            // PayHere must be able to reach this URL from the internet (use ngrok/Cloudflare tunnel in local dev).
            'notify_url' => env('PAYHERE_NOTIFY_URL'),
        ],
    ],

    // Payment receipts are sent to the student on WhatsApp.
    // driver: "log" (default - records the message and gives a click-to-chat link), "cloud" (Meta WhatsApp Cloud API) or "twilio".
    'whatsapp' => [
        'driver' => env('WHATSAPP_DRIVER', 'log'),
        'country_code' => env('WHATSAPP_DEFAULT_COUNTRY_CODE', '94'),
        'cloud' => [
            'token' => env('WHATSAPP_CLOUD_TOKEN'),
            'phone_number_id' => env('WHATSAPP_CLOUD_PHONE_NUMBER_ID'),
            'api_version' => env('WHATSAPP_CLOUD_API_VERSION', 'v21.0'),
            // Business-initiated messages need an approved template. Leave empty to send plain text (only works inside the 24h window).
            'template' => env('WHATSAPP_TEMPLATE'),
            'template_language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'en'),
        ],
        'twilio' => [
            'sid' => env('TWILIO_SID'),
            'token' => env('TWILIO_TOKEN'),
            'from' => env('TWILIO_WHATSAPP_FROM'), // e.g. +14155238886
        ],
    ],
];
