<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryField;
use App\Services\CategoryFieldService;
use App\Enums\FieldType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CategoryFieldController extends Controller
{
    use AuthorizesRequests;

    protected $categoryFieldService;

    public function __construct(CategoryFieldService $categoryFieldService)
    {
        $this->categoryFieldService = $categoryFieldService;
    }

    public function index(Category $category)
    {
        $this->authorize('update', $category);

        $fields = $category->fields()->orderBy('sort_order')->get();

        return Inertia::render('Admin/Categories/Fields', [
            'category' => $category,
            'fields' => $fields,
        ]);
    }

    public function store(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'field_key' => 'required|string|max:100|regex:/^[a-z0-9_]+$/|unique:category_fields,field_key,NULL,id,category_id,' . $category->id,
            'field_type' => ['required', new Enum(FieldType::class)],
            'placeholder' => 'nullable|string|max:255',
            'help_text' => 'nullable|string',
            'default_value' => 'nullable|string',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'is_visible' => 'boolean',
            'min_value' => 'nullable|string|max:50',
            'max_value' => 'nullable|string|max:50',
            'min_length' => 'nullable|integer|min:0',
            'max_length' => 'nullable|integer|min:0',
            'allowed_extensions' => 'nullable|string|max:255',
            'max_file_size_mb' => 'nullable|integer|min:1',
        ]);

        $this->categoryFieldService->store($category, $validated);

        return redirect()->back()->with('success', 'Field created successfully.');
    }

    public function update(Request $request, Category $category, CategoryField $field)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'field_key' => 'required|string|max:100|regex:/^[a-z0-9_]+$/|unique:category_fields,field_key,' . $field->id . ',id,category_id,' . $category->id,
            'field_type' => ['required', new Enum(FieldType::class)],
            'placeholder' => 'nullable|string|max:255',
            'help_text' => 'nullable|string',
            'default_value' => 'nullable|string',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'is_visible' => 'boolean',
            'min_value' => 'nullable|string|max:50',
            'max_value' => 'nullable|string|max:50',
            'min_length' => 'nullable|integer|min:0',
            'max_length' => 'nullable|integer|min:0',
            'allowed_extensions' => 'nullable|string|max:255',
            'max_file_size_mb' => 'nullable|integer|min:1',
        ]);

        $this->categoryFieldService->update($field, $validated);

        return redirect()->back()->with('success', 'Field updated successfully.');
    }

    public function destroy(Category $category, CategoryField $field)
    {
        $this->authorize('update', $category);

        if (method_exists($field, 'values') && $field->values()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete field because it has existing values.');
        }

        $this->categoryFieldService->delete($field);

        return redirect()->back()->with('success', 'Field deleted successfully.');
    }

    public function reorder(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate([
            'orderedIds' => 'required|array',
            'orderedIds.*' => 'exists:category_fields,id'
        ]);

        $this->categoryFieldService->reorder($category, $request->orderedIds);

        return redirect()->back()->with('success', 'Fields reordered successfully.');
    }

    public function forForm(Category $category)
    {
        $fields = $this->categoryFieldService->forForm($category);
        return response()->json($fields);
    }
}
