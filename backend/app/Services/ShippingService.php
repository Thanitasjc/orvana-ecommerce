<?php

namespace App\Services;

use App\Models\ShippingMethod;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ShippingService
{
    public function calculateFee(ShippingMethod $method, int $subtotal): int
    {
        if ($subtotal < $method->min_order) {
            return 0;
        }

        if ($method->free_shipping_min !== null && $subtotal >= $method->free_shipping_min) {
            return 0;
        }

        return $method->price;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listForCheckout(int $subtotal): Collection
    {
        return ShippingMethod::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(fn (ShippingMethod $method) => $subtotal >= $method->min_order)
            ->map(fn (ShippingMethod $method) => $this->formatMethod($method, $subtotal))
            ->values();
    }

    public function resolveForCheckout(int $shippingMethodId, int $subtotal): array
    {
        $method = ShippingMethod::query()
            ->where('is_active', true)
            ->find($shippingMethodId);

        if (! $method) {
            throw ValidationException::withMessages([
                'shipping_method_id' => ['วิธีจัดส่งไม่ถูกต้องหรือปิดใช้งานแล้ว'],
            ]);
        }

        if ($subtotal < $method->min_order) {
            throw ValidationException::withMessages([
                'shipping_method_id' => ["ยอดสั่งซื้อขั้นต่ำ ฿".number_format($method->min_order).' สำหรับวิธีจัดส่งนี้'],
            ]);
        }

        return [
            'method' => $method,
            'fee' => $this->calculateFee($method, $subtotal),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function formatMethod(ShippingMethod $method, int $subtotal): array
    {
        $fee = $this->calculateFee($method, $subtotal);

        return [
            'id' => $method->id,
            'name' => $method->name,
            'description' => $method->description,
            'price' => $method->price,
            'min_order' => $method->min_order,
            'free_shipping_min' => $method->free_shipping_min,
            'sort_order' => $method->sort_order,
            'is_active' => $method->is_active,
            'fee' => $fee,
            'is_free' => $fee === 0,
        ];
    }
}
