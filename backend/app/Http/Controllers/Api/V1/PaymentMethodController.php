<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function __construct(
        private readonly PaymentMethodService $payments,
        private readonly \App\Services\OmiseService $omise,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $channel = $request->string('channel', 'online')->toString();

        return response()->json([
            'data' => $this->payments->listForCheckout($channel),
            'omise_public_key' => $this->omise->publicKey(),
            'omise_configured' => $this->omise->isConfigured(),
        ]);
    }
}
