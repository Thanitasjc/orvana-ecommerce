<?php

namespace App\Services\Ecommerce;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CheckoutService
{
    public function __construct(
        private readonly OrderNotificationService $notificationService,
        private readonly OrderInventoryService $inventoryService,
    ) {}

    /**
     * @param array<string, mixed> $data
     */
    public function placeOrder(Cart $cart, array $data): Order
    {
        if ($cart->items->isEmpty()) {
            throw new RuntimeException('Cart is empty.');
        }

        return DB::transaction(function () use ($cart, $data): Order {
            $cart->load(['items.product']);

            $subtotal = (float) $cart->items->sum(fn ($item): float => $item->line_total);
            $shipping = $this->shippingAmount((string) $data['shipping_method'], $subtotal);
            $discount = 0.0;
            $total = max(0, $subtotal + $shipping - $discount);

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $cart->user_id,
                'status' => 'pending',
                'currency' => 'THB',
                'shipping_method' => $data['shipping_method'],
                'shipping_amount' => $shipping,
                'discount_amount' => $discount,
                'subtotal_amount' => $subtotal,
                'total_amount' => $total,
                'customer_name' => trim($data['first_name'].' '.$data['last_name']),
                'customer_email' => $data['email'],
                'customer_phone' => $data['phone'],
                'shipping_country' => $data['country'],
                'shipping_state' => $data['state'] ?: null,
                'shipping_city' => $data['city'],
                'shipping_address_line1' => $data['address_line1'],
                'shipping_address_line2' => $data['address_line2'] ?: null,
                'shipping_postal_code' => $data['postal_code'],
                'note' => $data['note'] ?: null,
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                /** @var Product $product */
                $product = Product::query()->lockForUpdate()->findOrFail($item->product_id);

                if ($product->stock_quantity < $item->quantity) {
                    throw new RuntimeException("Insufficient stock for {$product->getTranslation('name', config('locales.default', 'th'))}.");
                }

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->getTranslation('name', config('locales.default', 'th')),
                    'product_sku' => $product->sku,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'line_total' => $item->line_total,
                ]);
            }

            $paymentStatus = $data['payment_method'] === 'cod' ? 'pending' : 'paid';

            Payment::query()->create([
                'order_id' => $order->id,
                'method' => $data['payment_method'],
                'status' => $paymentStatus,
                'amount' => $total,
                'provider' => 'manual',
                'reference' => $order->order_number,
                'meta' => [
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ],
                'paid_at' => $paymentStatus === 'paid' ? now() : null,
            ]);

            $order->status = $paymentStatus === 'paid' ? 'paid' : 'pending';
            $order->save();

            $order = $order->fresh(['items']);

            if ($order->status === 'paid') {
                $this->inventoryService->allocate($order);
            }

            $cart->items()->delete();

            $order = $order->fresh(['items', 'payments']);
            $this->notificationService->notifyPlaced($order);

            return $order;
        });
    }

    public function shippingAmount(string $method, float $subtotal): float
    {
        if ($method === 'express') {
            return $subtotal >= 1500 ? 0.0 : 80.0;
        }

        return $subtotal >= 1000 ? 0.0 : 50.0;
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-'.now()->format('YmdHis').'-'.strtoupper(substr((string) str()->uuid(), 0, 6));
    }
}

