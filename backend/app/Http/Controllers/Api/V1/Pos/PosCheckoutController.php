<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosCheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variation_id' => ['required', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:100'],
        ]);

        $customer = isset($validated['customer_id'])
            ? Customer::find($validated['customer_id'])
            : null;

        try {
            $order = $this->orders->checkout(
                items: $validated['items'],
                channel: 'POS (หน้าร้าน)',
                discount: $validated['discount'] ?? 0,
                paymentMethod: $validated['payment_method'] ?? 'เงินสด',
                customer: $customer,
                staff: $request->user(),
            );
        } catch (InsufficientStockException $e) {
            return response()->json([
                'message' => 'สินค้าไม่เพียงพอในคลัง',
                'errors' => [
                    'stock' => [$e->getMessage()],
                ],
            ], 422);
        }

        return response()->json(['data' => $order], 201);
    }
}
