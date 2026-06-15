<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'bio', 'experience', 'status', 'notes', 'joined_date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
