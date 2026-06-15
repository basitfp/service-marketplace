<?php

namespace App\Notifications;

use App\Models\OrderComment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommentPostedNotification extends Notification
{
    use Queueable;

    public OrderComment $comment;

    public function __construct(OrderComment $comment)
    {
        $this->comment = $comment;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderId = $this->comment->order_id;
        $message = "New comment on order #{$orderId}";

        return (new MailMessage)
                    ->subject('New Order Comment')
                    ->line($message)
                    ->action('View Comment', url('/'))
                    ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->comment->order_id,
            'comment_id' => $this->comment->id,
            'posted_by_user_id' => $this->comment->user_id,
            'message' => "New comment on order #{$this->comment->order_id}",
            'type' => 'comment_posted',
        ];
    }
}
