<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly LoyaltyService $loyalty,
    ) {}

    /**
     * @param  array<int, array{variation_id: int, quantity: int}>  $items
     * @return array{order: Order, items: array<int, array<string, mixed>>}
     */
    public function buildLineItems(array $items): array
    {
        $lineItems = [];
        $total = 0;
        $profit = 0;

        foreach ($items as $item) {
            $variation = \App\Models\ProductVariation::with('product')->findOrFail($item['variation_id']);
            $product = $variation->product;
            $subtotal = $product->price * $item['quantity'];

            $lineItems[] = [
                'variation' => $variation,
                'product' => $product,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'subtotal' => $subtotal,
                'cost' => $product->cost * $item['quantity'],
            ];

            $total += $subtotal;
            $profit += $subtotal - ($product->cost * $item['quantity']);
        }

        return compact('lineItems', 'total', 'profit');
    }

    /**
     * @param  array<int, array{variation_id: int, quantity: int}>  $items
     */
    public function checkout(
        array $items,
        string $channel,
        int $discount = 0,
        ?string $paymentMethod = null,
        ?Customer $customer = null,
        ?User $staff = null,
        ?Coupon $coupon = null,
        int $shippingFee = 0,
        int $shippingDiscount = 0,
        ?string $posSessionId = null,
    ): Order {
        return DB::transaction(function () use ($items, $channel, $discount, $paymentMethod, $customer, $staff, $coupon, $shippingFee, $shippingDiscount, $posSessionId) {
            $built = $this->buildLineItems($items);
            $payableShipping = max(0, $shippingFee - $shippingDiscount);
            $finalTotal = max(0, $built['total'] - $discount + $payableShipping);
            $finalProfit = max(0, $built['profit'] - $discount);

            $this->inventory->deduct($items);

            $order = Order::create([
                'order_number' => $this->generateOrderNumber($channel),
                'channel' => $channel,
                'customer_id' => $customer?->id,
                'staff_id' => $staff?->id,
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
                'discount' => $discount,
                'shipping_fee' => $shippingFee,
                'shipping_discount' => $shippingDiscount,
                'total' => $finalTotal,
                'profit' => $finalProfit,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'payment_status' => 'paid',
            ]);

            foreach ($built['lineItems'] as $line) {
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'product_variation_id' => $line['variation']->id,
                    'product_name' => $line['product']->name,
                    'color' => $line['variation']->color,
                    'size' => $line['variation']->size,
                    'price' => $line['price'],
                    'quantity' => $line['quantity'],
                ]);
            }

            $this->loyalty->earnPoints($customer, $order);

            if ($coupon) {
                $coupon->increment('used_count');
                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'order_id' => $order->id,
                    'customer_id' => $customer?->id,
                    'channel' => $channel,
                    'discount_amount' => $discount,
                    'shipping_discount' => $shippingDiscount,
                    'order_subtotal' => $built['total'],
                    'metadata' => array_filter([
                        'type' => $coupon->type,
                        'apply_to' => $coupon->apply_to,
                        'pos_session_id' => $customer ? null : $posSessionId,
                    ]),
                ]);
            }

            return $order->load(['items', 'customer']);
        });
    }

    private function generateOrderNumber(string $channel): string
    {
        $prefix = str_contains($channel, 'Online') ? 'ORD-OL' : 'ORD';

        return $prefix.'-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
    }
}
