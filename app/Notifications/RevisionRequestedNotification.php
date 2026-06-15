<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Revision;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RevisionRequestedNotification extends Notification
{
    use Queueable;

    public Order $order;
    public Revision $revision;

    public function __construct(Order $order, Revision $revision)
    {
        $this->order = $order;
        $this->revision = $revision;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = "Revision requested for order #{$this->order->id}";

        return (new MailMessage)
                    ->subject('Revision Requested')
                    ->line($message)
                    ->action('View Revision', url('/'))
                    ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'revision_id' => $this->revision->id,
            'message' => "Revision requested for order #{$this->order->id}",
            'type' => 'revision_requested',
        ];
    }
}
