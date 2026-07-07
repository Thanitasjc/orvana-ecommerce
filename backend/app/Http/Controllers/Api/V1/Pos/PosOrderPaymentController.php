<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Http\Controllers\Controller;
use App\Services\OmiseService;
use App\Services\OrderPaymentService;
use App\Services\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PosOrderPaymentController extends Controller
{
    public function __construct(
        private readonly OrderPaymentService $orderPayments,
        private readonly PaymentMethodService $payments,
        private readonly OmiseService $omise,
    ) {}

    public function paymentMethods(): JsonResponse
    {
        return response()->json([
            'data' => $this->payments->listForCheckout('pos'),
            'omise_public_key' => $this->omise->publicKey(),
            'omise_configured' => $this->omise->isConfigured(),
        ]);
    }

    public function show(string $orderNumber): JsonResponse
    {
        $order = $this->orderPayments->findPosOrder($orderNumber);

        return response()->json([
            'data' => $this->orderPayments->formatPosOrder($order),
        ]);
    }

    public function chargeOmise(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->orderPayments->findPosOrder($orderNumber);

        if ($order->payment_status === 'paid') {
            return response()->json([
                'data' => $this->orderPayments->formatPosOrder($order),
                'message' => 'ชำระเงินแล้ว',
            ]);
        }

        if ($order->paymentMethod?->type !== 'omise_promptpay') {
            throw ValidationException::withMessages([
                'payment' => ['ออเดอร์นี้ไม่รองรับ PromptPay'],
            ]);
        }

        $charge = $this->omise->createPromptPaySource($order);
        $order = $this->omise->applyChargeToOrder($order, $charge);

        return response()->json([
            'data' => $this->orderPayments->formatPosOrder($order),
            'charge' => $charge,
        ]);
    }

    public function refreshOmise(string $orderNumber): JsonResponse
    {
        $order = $this->orderPayments->findPosOrder($orderNumber);

        if (! $order->omise_charge_id) {
            throw ValidationException::withMessages([
                'payment' => ['ยังไม่มีรายการชำระเงิน'],
            ]);
        }

        $charge = $this->omise->retrieveCharge($order->omise_charge_id);
        $order = $this->omise->applyChargeToOrder($order, $charge);

        return response()->json([
            'data' => $this->orderPayments->formatPosOrder($order),
            'charge' => $charge,
        ]);
    }
}
