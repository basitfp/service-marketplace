<?php

namespace App\Services;

use App\Models\Category;
use App\Models\CategoryField;
use Illuminate\Support\Facades\DB;

class CategoryFieldService
{
    public function store(Category $category, array $data): CategoryField
    {
        return $category->fields()->create($data);
    }

    public function update(CategoryField $field, array $data): CategoryField
    {
        $field->update($data);
        return $field;
    }

    public function delete(CategoryField $field): void
    {
        $field->delete();
    }

    public function reorder(Category $category, array $orderedIds): void
    {
        DB::transaction(function () use ($category, $orderedIds) {
            foreach ($orderedIds as $index => $id) {
                $category->fields()->where('id', $id)->update(['sort_order' => $index]);
            }
        });
    }

    public function forForm(Category $category): array
    {
        return $category->fields()
            ->visible()
            ->get()
            ->map(function ($field) {
                return [
                    'id' => $field->id,
                    'label' => $field->label,
                    'field_key' => $field->field_key,
                    'field_type' => $field->field_type,
                    'options' => $field->options,
                    'is_required' => $field->is_required,
                    'placeholder' => $field->placeholder,
                    'help_text' => $field->help_text,
                    'default_value' => $field->default_value,
                    'min_value' => $field->min_value,
                    'max_value' => $field->max_value,
                    'min_length' => $field->min_length,
                    'max_length' => $field->max_length,
                    'allowed_extensions' => $field->allowed_extensions,
                    'max_file_size_mb' => $field->max_file_size_mb,
                ];
            })
            ->toArray();
    }
}
