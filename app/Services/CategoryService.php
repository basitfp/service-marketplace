<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Exception;

class CategoryService
{
    public function store(array $data): Category
    {
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image'] = $data['image']->store('categories', 'public');
        }

        // is_active might not be in the payload if checkbox is unchecked, default appropriately
        if (!isset($data['is_active'])) {
            $data['is_active'] = false;
        }

        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $data['image']->store('categories', 'public');
        }

        if (!isset($data['is_active'])) {
            $data['is_active'] = false; // in case of form data unchecked
        }

        $category->update($data);
        return $category;
    }

    public function delete(Category $category): void
    {
        if (method_exists($category, 'services') && $category->services()->exists()) {
            throw new Exception('Cannot delete category with active services.');
        }

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();
    }

    public function toggleStatus(Category $category): Category
    {
        $category->is_active = !$category->is_active;
        $category->save();
        return $category;
    }
}
