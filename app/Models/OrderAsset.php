<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'type', 'file_path', 'original_name', 'mime_type'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
