<?php

namespace App\Listeners;

use App\Events\CommentPosted;
use App\Notifications\CommentPostedNotification;

class SendCommentNotification
{
    public function handle(CommentPosted $event): void
    {
        $comment = $event->comment->loadMissing('order.client', 'order.worker');
        $order = $comment->order;

        if (! $order) {
            return;
        }

        $recipient = match ($comment->user_id) {
            $order->client_id => $order->worker,
            $order->worker_id => $order->client,
            default => null,
        };

        $recipient?->notify(new CommentPostedNotification($comment));
    }
}
