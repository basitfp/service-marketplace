<?php

namespace App\Notifications;

use App\Models\Escalation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EscalationResolvedNotification extends Notification
{
    use Queueable;

    public Escalation $escalation;

    public function __construct(Escalation $escalation)
    {
        $this->escalation = $escalation;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = 'Your escalation has been resolved';

        return (new MailMessage)
                    ->subject('Escalation Resolved')
                    ->line($message)
                    ->action('View Resolution', url('/'))
                    ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->escalation->order_id,
            'escalation_id' => $this->escalation->id,
            'message' => 'Your escalation has been resolved',
            'type' => 'escalation_resolved',
        ];
    }
}
