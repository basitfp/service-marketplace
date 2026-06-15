<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 'worker_id', 'service_id', 'status',
        'credits_used', 'notes', 'cancellation_reason'
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
        ];
    }

    // ── Relationships ─────────────────────────

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function assets()
    {
        return $this->hasMany(OrderAsset::class);
    }

    public function selections()
    {
        return $this->hasMany(OrderSelection::class);
    }

    public function revisions()
    {
        return $this->hasMany(Revision::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function escalations()
    {
        return $this->hasMany(Escalation::class);
    }

    public function comments()
    {
        return $this->hasMany(OrderComment::class);
    }

    // ── Helpers ────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::Completed;
    }

    public function isCancelled(): bool
    {
        return $this->status === OrderStatus::Cancelled;
    }

    public function canBeAssigned(): bool
    {
        return $this->status === OrderStatus::Pending;
    }

    public function canBeReassigned(): bool
    {
        return in_array($this->status, [
            OrderStatus::Pending,
            OrderStatus::Assigned,
        ]);
    }

    public function revisionCount(): int
    {
        return $this->revisions()->count();
    }
}
