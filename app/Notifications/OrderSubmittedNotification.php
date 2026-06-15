<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderSubmittedNotification extends Notification
{
    use Queueable;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = 'Your order deliverable is ready for review';

        return (new MailMessage)
                    ->subject('Order Ready for Review')
                    ->line($message)
                    ->action('Review Order', url('/'))
                    ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'message' => 'Your order deliverable is ready for review',
            'type' => 'order_submitted',
        ];
    }
}
