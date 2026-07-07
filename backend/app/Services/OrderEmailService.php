<?php

namespace App\Services;

use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderEmailService
{
    public function sendConfirmation(Order $order): void
    {
        $order->loadMissing(['items', 'customer']);

        if ($order->channel !== 'Online Store') {
            return;
        }

        $email = $order->customer?->email ?? $order->guest_email;
        $name = $order->customer?->name ?? $order->guest_name;

        if (! $email || ! $name) {
            return;
        }

        try {
            Mail::to($email)->send(new OrderConfirmationMail($order, $name));
        } catch (\Throwable $exception) {
            Log::warning('Order confirmation email failed', [
                'order_id' => $order->id,
                'email' => $email,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}