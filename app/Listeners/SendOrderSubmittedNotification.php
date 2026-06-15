<?php

namespace App\Listeners;

use App\Events\OrderSubmitted;
use App\Notifications\OrderSubmittedNotification;

class SendOrderSubmittedNotification
{
    public function handle(OrderSubmitted $event): void
    {
        $order = $event->order->loadMissing('client');

        $order->client?->notify(new OrderSubmittedNotification($order));
    }
}
