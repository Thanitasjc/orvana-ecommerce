<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class OrderPaymentService
{
    public function findPublicOrder(string $orderNumber, ?string $email, ?Customer $member): Order
    {
        $order = Order::query()
            ->with(['items', 'paymentMethod', 'customer'])
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'order' => ['ไม่พบออเดอร์'],
            ]);
        }

        if ($member instanceof Customer) {
            if ((int) $order->customer_id !== (int) $member->id) {
                throw ValidationException::withMessages([
                    'order' => ['ไม่มีสิทธิ์เข้าถึงออเดอร์นี้'],
                ]);
            }

            return $order;
        }

        $orderEmail = $order->guest_email ?? $order->customer?->email;

        if (! $email || ! $orderEmail || strcasecmp($email, $orderEmail) !== 0) {
            throw ValidationException::withMessages([
                'email' => ['อีเมลไม่ตรงกับออเดอร์'],
            ]);
        }

        return $order;
    }

    public function findPosOrder(string $orderNumber): Order
    {
        $order = Order::query()
            ->with(['items', 'customer', 'paymentMethod'])
            ->where('order_number', $orderNumber)
            ->where('channel', 'POS (หน้าร้าน)')
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'order' => ['ไม่พบออเดอร์ POS'],
            ]);
        }

        return $order;
    }

    /**
     * @return array<string, mixed>
     */
    public function formatPosOrder(Order $order): array
    {
        $base = $this->formatPublicOrder($order);

        return array_merge($base, [
            'channel' => $order->channel,
            'discount' => (int) $order->discount,
            'points_discount' => (int) $order->points_discount,
            'points_redeemed' => (int) $order->points_redeemed,
            'points_earned' => (int) $order->points_earned,
            'customer' => $order->customer ? [
                'id' => $order->customer->id,
                'name' => $order->customer->name,
                'phone' => $order->customer->phone,
                'email' => $order->customer->email,
                'points' => (int) $order->customer->points,
                'tier' => $order->customer->tier,
            ] : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function formatPublicOrder(Order $order): array
    {
        $paymentMethod = $order->paymentMethod;

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'total' => (int) $order->total,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'payment_method_id' => $order->payment_method_id,
            'payment_method_type' => $paymentMethod?->type,
            'payment_instructions' => $paymentMethod?->instructions,
            'payment_config' => $paymentMethod?->config,
            'requires_slip' => $paymentMethod?->requiresSlip() ?? false,
            'is_gateway' => $paymentMethod?->isGateway() ?? false,
            'payment_slip_url' => $order->payment_slip_path
                ? Storage::disk(config('filesystems.uploads'))->url($order->payment_slip_path)
                : null,
            'omise_charge_id' => $order->omise_charge_id,
            'payment_metadata' => $order->payment_metadata,
            'created_at' => $order->created_at?->toIso8601String(),
            'items' => $order->items?->map(fn ($item) => [
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => (int) $item->price,
            ]),
        ];
    }
}
