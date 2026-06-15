<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Category;
use App\Services\ServiceService;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    protected $serviceService;

    public function __construct(ServiceService $serviceService)
    {
        $this->serviceService = $serviceService;
    }

    public function index(Request $request)
    {
        $query = Service::with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $services = $query->latest()->paginate(15)->withQueryString();
        $categories = Category::active()->get(['id', 'name']);

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'is_active']),
        ]);
    }

    public function create()
    {
        $categories = Category::active()->get(['id', 'name']);
        $workers = \App\Models\User::where('role', \App\Enums\UserRole::Worker->value)->get(['id', 'name']);
        return Inertia::render('Admin/Services/Create', [
            'categories' => $categories,
            'workers' => $workers
        ]);
    }

    public function store(StoreServiceRequest $request)
    {
        $this->serviceService->store($request->validated());
        return redirect()->route('admin.services.index')->with('success', 'Service created successfully.');
    }

    public function edit(Service $service)
    {
        $service->load('fieldValues.categoryField', 'eligibleWorkers');
        $categories = Category::active()->get(['id', 'name']);
        $workers = \App\Models\User::where('role', \App\Enums\UserRole::Worker->value)->get(['id', 'name']);
        
        return Inertia::render('Admin/Services/Edit', [
            'service' => $service,
            'categories' => $categories,
            'workers' => $workers
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $this->serviceService->update($service, $request->validated());
        return redirect()->route('admin.services.index')->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service)
    {
        try {
            $this->serviceService->delete($service);
            return redirect()->back()->with('success', 'Service deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function toggleStatus(Service $service)
    {
        $this->serviceService->toggleStatus($service);
        return redirect()->back()->with('success', 'Status toggled successfully.');
    }

    public function steps(Service $service)
    {
        $service->load(['steps.options']);
        return Inertia::render('Admin/Services/Steps', [
            'service' => $service,
            'steps' => $service->steps
        ]);
    }

    public function storeStep(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'input_type' => 'required|in:single_select,multi_select',
            'is_required' => 'boolean',
            'sort_order' => 'integer'
        ]);
        
        $service->steps()->create($validated);
        return redirect()->back()->with('success', 'Step created successfully.');
    }

    public function updateStep(Request $request, Service $service, \App\Models\ServiceStep $step)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'input_type' => 'required|in:single_select,multi_select',
            'is_required' => 'boolean',
            'sort_order' => 'integer'
        ]);
        
        $step->update($validated);
        return redirect()->back()->with('success', 'Step updated successfully.');
    }

    public function destroyStep(Service $service, \App\Models\ServiceStep $step)
    {
        $step->delete();
        return redirect()->back()->with('success', 'Step deleted successfully.');
    }

    public function reorderSteps(Request $request, Service $service)
    {
        $request->validate([
            'orderedIds' => 'required|array',
            'orderedIds.*' => 'exists:service_steps,id'
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($service, $request) {
            foreach ($request->orderedIds as $index => $id) {
                $service->steps()->where('id', $id)->update(['sort_order' => $index]);
            }
        });

        return redirect()->back()->with('success', 'Steps reordered successfully.');
    }

    public function storeOption(Request $request, \App\Models\ServiceStep $step)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'credit_cost' => 'required|integer|min:0',
            'is_default' => 'boolean',
            'sort_order' => 'integer'
        ]);
        
        $step->options()->create($validated);
        return redirect()->back()->with('success', 'Option created successfully.');
    }

    public function updateOption(Request $request, \App\Models\ServiceStep $step, \App\Models\ServiceStepOption $option)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'credit_cost' => 'required|integer|min:0',
            'is_default' => 'boolean',
            'sort_order' => 'integer'
        ]);
        
        $option->update($validated);
        return redirect()->back()->with('success', 'Option updated successfully.');
    }

    public function destroyOption(\App\Models\ServiceStep $step, \App\Models\ServiceStepOption $option)
    {
        $option->delete();
        return redirect()->back()->with('success', 'Option deleted successfully.');
    }
}
