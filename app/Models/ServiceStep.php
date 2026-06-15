<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id', 'name', 'description', 'input_type', 'is_required', 'sort_order'
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
        ];
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function options()
    {
        return $this->hasMany(ServiceStepOption::class)->orderBy('sort_order');
    }
}
