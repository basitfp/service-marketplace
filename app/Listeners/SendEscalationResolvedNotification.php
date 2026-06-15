<?php

namespace App\Listeners;

use App\Events\EscalationResolved;
use App\Notifications\EscalationResolvedNotification;

class SendEscalationResolvedNotification
{
    public function handle(EscalationResolved $event): void
    {
        $escalation = $event->escalation->loadMissing('client');

        $escalation->client?->notify(new EscalationResolvedNotification($escalation));
    }
}
