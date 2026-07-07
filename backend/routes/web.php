<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'ok' => true,
        'service' => 'Aesthete API',
        'health' => url('/api/v1/health'),
        'docs' => 'Use /api/v1/* endpoints',
    ]);
});
