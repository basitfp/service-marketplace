<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceFieldValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id', 'category_field_id', 'value'
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function categoryField()
    {
        return $this->belongsTo(CategoryField::class);
    }
}
