<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Services\CategoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        $query = Category::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            $query->where('is_active', $status === 'active');
        }

        $categories = $query->orderBy('sort_order')
                            ->orderBy('name')
                            ->paginate(15)
                            ->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        $this->categoryService->store($request->validated());
        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully.');
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $this->categoryService->update($category, $request->validated());
        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);
        
        try {
            $this->categoryService->delete($category);
            return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.categories.index')->with('error', $e->getMessage());
        }
    }

    public function toggleStatus(Category $category)
    {
        $this->authorize('update', $category);
        $this->categoryService->toggleStatus($category);
        
        return redirect()->back()->with('success', 'Category status updated successfully.');
    }

    public function bulkEnable(Request $request)
    {
        $this->authorize('create', Category::class);
        $request->validate(['ids' => 'required|array']);
        Category::whereIn('id', $request->ids)->update(['is_active' => true]);
        return redirect()->back()->with('success', 'Selected categories enabled successfully.');
    }

    public function bulkDisable(Request $request)
    {
        $this->authorize('create', Category::class);
        $request->validate(['ids' => 'required|array']);
        Category::whereIn('id', $request->ids)->update(['is_active' => false]);
        return redirect()->back()->with('success', 'Selected categories disabled successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $this->authorize('create', Category::class);
        $request->validate(['ids' => 'required|array']);
        
        $categories = Category::whereIn('id', $request->ids)->get();
        $deleted = 0;
        $failed = 0;
        
        foreach ($categories as $category) {
            if (method_exists($category, 'services') && $category->services()->exists()) {
                $failed++;
                continue;
            }
            if ($category->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($category->image);
            }
            $category->delete();
            $deleted++;
        }
        
        if ($failed > 0) {
            if ($deleted === 0) {
                return redirect()->back()->with('error', 'Cannot delete selected categories as they have active services.');
            }
            return redirect()->back()->with('error', "Deleted {$deleted} categories. {$failed} categories skipped due to active services.");
        }
        
        return redirect()->back()->with('success', 'Selected categories deleted successfully.');
    }
}
