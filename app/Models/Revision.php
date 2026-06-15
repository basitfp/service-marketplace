<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Revision extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'message', 'status'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
