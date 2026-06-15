<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderSelection extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'step_id', 'option_id', 'step_name', 'option_label', 'credit_cost'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function step()
    {
        return $this->belongsTo(ServiceStep::class, 'step_id');
    }

    public function option()
    {
        return $this->belongsTo(ServiceStepOption::class, 'option_id');
    }
}
