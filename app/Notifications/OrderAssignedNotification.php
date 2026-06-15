<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderAssignedNotification extends Notification
{
    use Queueable;

    public Order $order;
    public string $recipientRole;

    public function __construct(Order $order, string $recipientRole)
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
        $serviceName = $this->order->service?->name ?? 'your service';

        $message = $this->recipientRole === 'worker'
            ? "New order assigned: {$serviceName}"
            : 'Your order has been assigned to a worker';

        return (new MailMessage)
                    ->subject($message)
                    ->line($message)
                    ->action('View Order', url('/'))
                    ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        $serviceName = $this->order->service?->name ?? 'your service';
        $message = $this->recipientRole === 'worker'
            ? "New order assigned: {$serviceName}"
            : 'Your order has been assigned to a worker';

        return [
            'order_id' => $this->order->id,
            'recipient_role' => $this->recipientRole,
            'message' => $message,
            'type' => 'order_assigned',
        ];
    }
}
