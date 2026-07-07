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
            ->with(['items', 'paymentMethod'])
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'order' => ['ไม่พบออเดอร์'],
            ]);
        }

        if ($member) {
            if ((int) $order->customer_id !== (int) $member->id) {
                throw ValidationException::withMessages([
                    'order' => ['ไม่มีสิทธิ์เข้าถึงออเดอร์นี้'],
                ]);
            }

            return $order;
        }

        if (! $email || strcasecmp($email, (string) $order->guest_email) !== 0) {
            throw ValidationException::withMessages([
                'email' => ['อีเมลไม่ตรงกับออเดอร์'],
            ]);
        }

        return $order;
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
                ? Storage::disk('public')->url($order->payment_slip_path)
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
