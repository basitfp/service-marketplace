<?php

namespace App\Events;

use App\Models\Order;
use App\Models\Revision;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RevisionRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public Revision $revision;

    public function __construct(Order $order, Revision $revision)
    {
        $this->order = $order;
        $this->revision = $revision;
    }
}
