<?php

namespace App\Listeners;

use App\Events\RevisionRequested;
use App\Notifications\RevisionRequestedNotification;

class SendRevisionRequestedNotification
{
    public function handle(RevisionRequested $event): void
    {
        $order = $event->order->loadMissing('worker');

        $order->worker?->notify(new RevisionRequestedNotification($order, $event->revision));
    }
}
