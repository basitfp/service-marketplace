<?php

namespace App\Events;

use App\Models\OrderComment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentPosted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public OrderComment $comment;

    public function __construct(OrderComment $comment)
    {
        $this->comment = $comment;
    }
}
