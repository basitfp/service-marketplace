<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('category'));
    }

    public function rules(): array
    {
        $category = $this->route('category');
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($category->id)],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
