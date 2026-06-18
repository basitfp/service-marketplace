<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'short_description', 'description', 
        'image', 'credit_cost', 'delivery_days', 'revisions', 'extra_revision_cost',
        'is_active', 'is_featured', 'is_deliverable'
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_deliverable' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($service) {
            if (empty($service->slug)) {
                $service->slug = Str::slug($service->name);
            }
        });

        static::updating(function ($service) {
            if ($service->isDirty('name') && !$service->isDirty('slug')) {
                $service->slug = Str::slug($service->name);
            }
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function fieldValues()
    {
        return $this->hasMany(ServiceFieldValue::class);
    }

    public function steps()
    {
        return $this->hasMany(ServiceStep::class)->orderBy('sort_order');
    }

    public function eligibleWorkers()
    {
        return $this->belongsToMany(User::class, 'service_worker');
    }

    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Order::class);
    }
}
