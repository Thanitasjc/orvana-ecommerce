<?php

return [
    'payment_webhook_secret' => env('PAYMENT_WEBHOOK_SECRET', ''),
    'payment_signature_header' => env('PAYMENT_SIGNATURE_HEADER', 'X-Payment-Signature'),
    'admin_notification_email' => env('ECOMMERCE_ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')),
];

