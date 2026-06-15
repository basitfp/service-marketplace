<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'credit_cost' => 'required|integer|min:0',
            'delivery_days' => 'required|integer|min:0',
            'revisions' => 'required|integer|min:0',
            'extra_revision_cost' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_deliverable' => 'boolean',
            'dynamic_fields' => 'nullable|array',
            'worker_ids' => 'nullable|array',
            'worker_ids.*' => 'exists:users,id',
        ];
    }
}
