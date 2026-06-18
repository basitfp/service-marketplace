<?php

namespace App\Listeners;

use App\Events\OrderCancelled;
use App\Notifications\OrderCancelledNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderCancelledNotification implements ShouldQueue
{
    public function handle(OrderCancelled $event): void
    {
        $order = $event->order->loadMissing(['client', 'worker']);

        if ($order->client) {
            $order->client->notify(new OrderCancelledNotification($order, 'client'));
        }

        if ($order->worker) {
            $order->worker->notify(new OrderCancelledNotification($order, 'worker'));
        }
    }
}
