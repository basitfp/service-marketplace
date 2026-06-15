<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use App\Models\Service;
use App\Enums\UserRole;
use App\Services\WorkerService;
use App\Http\Requests\Admin\StoreWorkerRequest;
use App\Http\Requests\Admin\UpdateWorkerRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkerController extends Controller
{
    protected $workerService;

    public function __construct(WorkerService $workerService)
    {
        $this->workerService = $workerService;
    }

    public function index(Request $request)
    {
        $query = User::where('role', UserRole::Worker->value)->with('workerProfile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $workers = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Workers/Index', [
            'workers' => $workers,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        $skills = Skill::orderBy('name')->get(['id', 'name']);
        $services = Service::active()->get(['id', 'name']);

        return Inertia::render('Admin/Workers/Create', [
            'skills' => $skills,
            'services' => $services
        ]);
    }

    public function store(StoreWorkerRequest $request)
    {
        $this->workerService->create($request->validated());
        return redirect()->route('admin.workers.index')->with('success', 'Worker created successfully.');
    }

    public function show(User $worker)
    {
        if ($worker->role !== UserRole::Worker) {
            abort(404);
        }

        $worker->load(['workerProfile', 'skills', 'services']);
        
        $activeOrdersCount = 0;
        $completedOrdersCount = 0;

        return Inertia::render('Admin/Workers/Show', [
            'worker' => $worker,
            'activeOrdersCount' => $activeOrdersCount,
            'completedOrdersCount' => $completedOrdersCount,
        ]);
    }

    public function edit(User $worker)
    {
        if ($worker->role !== UserRole::Worker) {
            abort(404);
        }

        $worker->load(['workerProfile', 'skills', 'services']);
        $skills = Skill::orderBy('name')->get(['id', 'name']);
        $services = Service::active()->get(['id', 'name']);

        return Inertia::render('Admin/Workers/Edit', [
            'worker' => $worker,
            'skills' => $skills,
            'services' => $services
        ]);
    }

    public function update(UpdateWorkerRequest $request, User $worker)
    {
        $this->workerService->update($worker, $request->validated());
        return redirect()->route('admin.workers.index')->with('success', 'Worker updated successfully.');
    }

    public function destroy(User $worker)
    {
        if ($worker->role !== UserRole::Worker) {
            abort(404);
        }

        $worker->delete();
        return redirect()->back()->with('success', 'Worker deleted successfully.');
    }

    public function toggleStatus(User $worker)
    {
        if ($worker->role !== UserRole::Worker) {
            abort(404);
        }

        $this->workerService->toggleStatus($worker);
        return redirect()->back()->with('success', 'Worker status toggled successfully.');
    }
}
