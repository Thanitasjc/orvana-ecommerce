<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly string $oldStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Order update: {$this->order->order_number}")
            ->line("Order {$this->order->order_number} status changed from {$this->oldStatus} to {$this->order->status}.");

        if ($this->order->tracking_number) {
            $mail->line("Tracking: {$this->order->shipping_carrier} {$this->order->tracking_number}");
        }

        return $mail
            ->action('View order', route('frontend.account.orders.show', $this->order))
            ->line('Thank you for your patience.');
    }
}

