<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceStepOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_step_id', 'label', 'description', 'credit_cost', 'is_default', 'sort_order'
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function step()
    {
        return $this->belongsTo(ServiceStep::class, 'service_step_id');
    }
}
