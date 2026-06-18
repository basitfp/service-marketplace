<?php

namespace App\Providers;

use App\Events\CommentPosted;
use App\Events\EscalationResolved;
use App\Events\OrderAssigned;
use App\Events\OrderCancelled;
use App\Events\OrderCompleted;
use App\Events\OrderSubmitted;
use App\Events\RevisionRequested;
use App\Listeners\SendCommentNotification;
use App\Listeners\SendEscalationResolvedNotification;
use App\Listeners\SendOrderAssignedNotification;
use App\Listeners\SendOrderCancelledNotification;
use App\Listeners\SendOrderCompletedNotification;
use App\Listeners\SendOrderSubmittedNotification;
use App\Listeners\SendRevisionRequestedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderAssigned::class => [
            SendOrderAssignedNotification::class,
        ],
        OrderCancelled::class => [
            SendOrderCancelledNotification::class,
        ],
        OrderSubmitted::class => [
            SendOrderSubmittedNotification::class,
        ],
        OrderCompleted::class => [
            SendOrderCompletedNotification::class,
        ],
        RevisionRequested::class => [
            SendRevisionRequestedNotification::class,
        ],
        CommentPosted::class => [
            SendCommentNotification::class,
        ],
        EscalationResolved::class => [
            SendEscalationResolvedNotification::class,
        ],
    ];
}
