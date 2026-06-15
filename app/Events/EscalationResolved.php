<?php

namespace App\Events;

use App\Models\Escalation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EscalationResolved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Escalation $escalation;

    public function __construct(Escalation $escalation)
    {
        $this->escalation = $escalation;
    }
}
