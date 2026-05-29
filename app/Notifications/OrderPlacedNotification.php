<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Order placed: {$this->order->order_number}")
            ->line("Your order {$this->order->order_number} has been placed successfully.")
            ->line('Order total: ฿'.number_format((float) $this->order->total_amount, 2))
            ->action('View order', route('frontend.account.orders.show', $this->order))
            ->line('Thank you for shopping with us.');
    }
}

