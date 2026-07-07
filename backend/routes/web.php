<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'ok' => true,
        'service' => 'Aesthete API',
        'health' => '/api/v1/health',
        'payment_methods' => '/api/v1/payment/methods',
    ]);
});
