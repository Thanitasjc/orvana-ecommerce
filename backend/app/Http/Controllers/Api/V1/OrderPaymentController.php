<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Services\OmiseService;
use App\Services\OrderPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderPaymentController extends Controller
{
    public function __construct(
        private readonly OrderPaymentService $orderPayments,
        private readonly OmiseService $omise,
    ) {}

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->orderPayments->findPublicOrder(
            $orderNumber,
            $request->string('email')->toString() ?: null,
            $this->resolveMember($request),
        );

        return response()->json([
            'data' => $this->orderPayments->formatPublicOrder($order),
        ]);
    }

    public function uploadSlip(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email', 'max:255'],
            'slip' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $order = $this->orderPayments->findPublicOrder(
            $orderNumber,
            $validated['email'] ?? null,
            $this->resolveMember($request),
        );

        if ($order->paymentMethod?->type !== 'bank_transfer') {
            throw ValidationException::withMessages([
                'slip' => ['ออเดอร์นี้ไม่รองรับการอัปโหลดสลิป'],
            ]);
        }

        if ($order->payment_status === 'paid') {
            throw ValidationException::withMessages([
                'slip' => ['ออเดอร์นี้ชำระเงินแล้ว'],
            ]);
        }

        $path = $request->file('slip')->store("payment-slips/{$order->id}", 'public');

        $order->update([
            'payment_slip_path' => $path,
            'payment_metadata' => array_merge($order->payment_metadata ?? [], [
                'slip_uploaded_at' => now()->toIso8601String(),
            ]),
        ]);

        return response()->json([
            'data' => $this->orderPayments->formatPublicOrder($order->fresh()->load('paymentMethod')),
            'message' => 'อัปโหลดสลิปแล้ว — รอเจ้าหน้าที่ตรวจสอบ',
        ]);
    }

    public function chargeOmise(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email', 'max:255'],
            'omise_token' => ['nullable', 'string', 'max:255'],
            'promptpay' => ['nullable', 'boolean'],
        ]);

        $order = $this->orderPayments->findPublicOrder(
            $orderNumber,
            $validated['email'] ?? null,
            $this->resolveMember($request),
        );

        if ($order->payment_status === 'paid') {
            return response()->json([
                'data' => $this->orderPayments->formatPublicOrder($order),
                'message' => 'ชำระเงินแล้ว',
            ]);
        }

        $type = $order->paymentMethod?->type;

        if ($type === 'omise_card') {
            if (empty($validated['omise_token'])) {
                throw ValidationException::withMessages([
                    'omise_token' => ['กรุณากรอกข้อมูลบัตร'],
                ]);
            }

            $charge = $this->omise->chargeCard($order, $validated['omise_token']);
        } elseif ($type === 'omise_promptpay') {
            $charge = $this->omise->createPromptPaySource($order);
        } else {
            throw ValidationException::withMessages([
                'payment' => ['วิธีชำระนี้ไม่รองรับ Omise'],
            ]);
        }

        $order = $this->omise->applyChargeToOrder($order, $charge);

        return response()->json([
            'data' => $this->orderPayments->formatPublicOrder($order),
            'charge' => $charge,
        ]);
    }

    public function refreshOmise(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->orderPayments->findPublicOrder(
            $orderNumber,
            $request->string('email')->toString() ?: null,
            $this->resolveMember($request),
        );

        if (! $order->omise_charge_id) {
            throw ValidationException::withMessages([
                'payment' => ['ยังไม่มีรายการชำระเงิน'],
            ]);
        }

        $charge = $this->omise->retrieveCharge($order->omise_charge_id);
        $order = $this->omise->applyChargeToOrder($order, $charge);

        return response()->json([
            'data' => $this->orderPayments->formatPublicOrder($order),
            'charge' => $charge,
        ]);
    }

    private function resolveMember(Request $request): ?Customer
    {
        $user = $request->user('sanctum') ?? $request->user();

        return $user instanceof Customer ? $user : null;
    }
}
