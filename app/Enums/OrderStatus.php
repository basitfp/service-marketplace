<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case RevisionRequested = 'revision_requested';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
