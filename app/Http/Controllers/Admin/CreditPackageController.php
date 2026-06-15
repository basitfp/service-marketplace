<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreditPackageController extends Controller
{
    public function index(Request $request)
    {
        $query = CreditPackage::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return Inertia::render('Admin/CreditPackages/Index', [
            'packages' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function store(Request $request)
    {
        CreditPackage::create($this->validated($request));

        return redirect()->back()->with('success', 'Credit package created successfully.');
    }

    public function update(Request $request, CreditPackage $creditPackage)
    {
        $creditPackage->update($this->validated($request));

        return redirect()->back()->with('success', 'Credit package updated successfully.');
    }

    public function destroy(CreditPackage $creditPackage)
    {
        $creditPackage->delete();

        return redirect()->back()->with('success', 'Credit package deleted successfully.');
    }

    public function toggle(CreditPackage $creditPackage)
    {
        $creditPackage->update(['is_active' => ! $creditPackage->is_active]);

        return redirect()->back()->with('success', 'Credit package status updated successfully.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'credits' => ['required', 'integer', 'min:1'],
            'bonus_credits' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
