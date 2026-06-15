<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Escalation extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'client_id', 'message', 'status', 'resolution_notes', 'resolved_at'
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
