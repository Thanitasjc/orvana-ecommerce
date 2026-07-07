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

        $customer = $order->customer;
        if (! $customer?->email || $order->channel !== 'Online Store') {
            return;
        }

        try {
            Mail::to($customer->email)->send(new OrderConfirmationMail($order, $customer->fresh()));
        } catch (\Throwable $exception) {
            Log::warning('Order confirmation email failed', [
                'order_id' => $order->id,
                'email' => $customer->email,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
