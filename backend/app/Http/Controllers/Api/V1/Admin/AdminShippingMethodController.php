<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminShippingMethodController extends Controller
{
    public function __construct(private readonly ShippingService $shipping) {}

    public function index(): JsonResponse
    {
        $methods = ShippingMethod::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (ShippingMethod $method) => $this->shipping->formatMethod($method, 0));

        return response()->json(['data' => $methods]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);
        $method = ShippingMethod::create($validated);

        return response()->json([
            'data' => $this->shipping->formatMethod($method, 0),
        ], 201);
    }

    public function update(Request $request, ShippingMethod $shippingMethod): JsonResponse
    {
        $validated = $this->validatePayload($request, true);
        $shippingMethod->update($validated);

        return response()->json([
            'data' => $this->shipping->formatMethod($shippingMethod->fresh(), 0),
        ]);
    }

    public function destroy(ShippingMethod $shippingMethod): JsonResponse
    {
        if ($shippingMethod->orders()->exists()) {
            return response()->json([
                'message' => 'ไม่สามารถลบวิธีจัดส่งที่ถูกใช้ในออเดอร์แล้วได้',
            ], 422);
        }

        $shippingMethod->delete();

        return response()->json(['message' => 'ลบวิธีจัดส่งแล้ว']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request, bool $partial = false): array
    {
        $rules = [
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => [$partial ? 'sometimes' : 'required', 'integer', 'min:0'],
            'min_order' => [$partial ? 'sometimes' : 'required', 'integer', 'min:0'],
            'free_shipping_min' => ['nullable', 'integer', 'min:0'],
            'sort_order' => [$partial ? 'sometimes' : 'required', 'integer', 'min:0'],
            'is_active' => [$partial ? 'sometimes' : 'required', 'boolean'],
        ];

        return $request->validate($rules);
    }
}
