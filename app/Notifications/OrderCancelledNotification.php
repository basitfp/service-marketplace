<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancelledNotification extends Notification
{
    use Queueable;

    public Order $order;
    public string $recipientRole;

    public function __construct(Order $order, string $recipientRole = 'client')
    {
        $this->order = $order;
        $this->recipientRole = $recipientRole;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = $this->recipientRole === 'worker'
            ? "Order #{$this->order->id} has been cancelled by admin."
            : "Order #{$this->order->id} has been cancelled.";

        return (new MailMessage)
                    ->subject('Order Cancelled')
                    ->line($message)
                    ->action('View Order', url('/'))
                    ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'recipient_role' => $this->recipientRole,
            'message' => "Order #{$this->order->id} has been cancelled.",
            'type' => 'order_cancelled',
        ];
    }
}
