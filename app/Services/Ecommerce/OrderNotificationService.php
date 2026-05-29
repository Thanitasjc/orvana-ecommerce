<?php

namespace App\Services\Ecommerce;

use App\Models\Order;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\OrderStatusUpdatedNotification;
use Illuminate\Support\Facades\Notification;

class OrderNotificationService
{
    public function notifyPlaced(Order $order): void
    {
        $order->loadMissing('user');

        if ($order->user) {
            $order->user->notify(new OrderPlacedNotification($order));
        } else {
            Notification::route('mail', $order->customer_email)
                ->notify(new OrderPlacedNotification($order));
        }

        $adminEmail = config('ecommerce.admin_notification_email');
        if ($adminEmail) {
            Notification::route('mail', $adminEmail)
                ->notify(new OrderPlacedNotification($order));
        }
    }

    public function notifyStatusChanged(Order $order, string $oldStatus): void
    {
        $order->loadMissing('user');

        if ($order->user) {
            $order->user->notify(new OrderStatusUpdatedNotification($order, $oldStatus));
        } else {
            Notification::route('mail', $order->customer_email)
                ->notify(new OrderStatusUpdatedNotification($order, $oldStatus));
        }
    }
}

