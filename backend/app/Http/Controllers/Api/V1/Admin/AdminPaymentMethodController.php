<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Services\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminPaymentMethodController extends Controller
{
    public function __construct(private readonly PaymentMethodService $payments) {}

    public function index(): JsonResponse
    {
        $methods = PaymentMethod::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (PaymentMethod $method) => $this->payments->formatMethod($method));

        return response()->json(['data' => $methods]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);
        $method = PaymentMethod::create($validated);

        return response()->json([
            'data' => $this->payments->formatMethod($method),
        ], 201);
    }

    public function update(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        $validated = $this->validatePayload($request, true);
        $paymentMethod->update($validated);

        return response()->json([
            'data' => $this->payments->formatMethod($paymentMethod->fresh()),
        ]);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        if ($paymentMethod->orders()->exists()) {
            return response()->json([
                'message' => 'ไม่สามารถลบวิธีชำระที่ถูกใช้ในออเดอร์แล้วได้',
            ], 422);
        }

        $paymentMethod->delete();

        return response()->json(['message' => 'ลบวิธีชำระแล้ว']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request, bool $partial = false): array
    {
        $rules = [
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:120'],
            'type' => [$partial ? 'sometimes' : 'required', Rule::in(['bank_transfer', 'cod', 'omise_card', 'omise_promptpay', 'pos_cash', 'pos_card'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'config' => ['nullable', 'array'],
            'channel' => [$partial ? 'sometimes' : 'required', Rule::in(['online', 'pos', 'both'])],
            'sort_order' => [$partial ? 'sometimes' : 'required', 'integer', 'min:0'],
            'is_active' => [$partial ? 'sometimes' : 'required', 'boolean'],
        ];

        return $request->validate($rules);
    }
}
