<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Notifications\OrderCompletedNotification;

class SendOrderCompletedNotification
{
    public function handle(OrderCompleted $event): void
    {
        $order = $event->order->loadMissing('worker');

        $order->worker?->notify(new OrderCompletedNotification($order));
    }
}
