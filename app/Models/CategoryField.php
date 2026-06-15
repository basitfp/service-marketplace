<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryField extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'label',
        'field_key',
        'field_type',
        'placeholder',
        'help_text',
        'default_value',
        'options',
        'is_required',
        'is_visible',
        'min_value',
        'max_value',
        'min_length',
        'max_length',
        'allowed_extensions',
        'max_file_size_mb',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
            'is_visible' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true)->orderBy('sort_order');
    }
}
