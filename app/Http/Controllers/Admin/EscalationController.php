<?php

namespace App\Http\Controllers\Admin;

use App\Events\EscalationResolved;
use App\Http\Controllers\Controller;
use App\Models\Escalation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EscalationController extends Controller
{
    public function index(Request $request)
    {
        $query = Escalation::query()
            ->with(['client:id,name,email', 'order.service:id,name']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function ($builder) use ($search) {
                if (is_numeric(ltrim($search, '#'))) {
                    $builder->orWhere('order_id', (int) ltrim($search, '#'));
                }

                $builder->orWhereHas('client', function ($clientQuery) use ($search) {
                    $clientQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        return Inertia::render('Admin/Escalations/Index', [
            'escalations' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Escalation $escalation)
    {
        $escalation->load([
            'client:id,name,email,phone',
            'order.client:id,name,email',
            'order.worker:id,name,email',
            'order.service.category:id,name',
        ]);

        return Inertia::render('Admin/Escalations/Show', [
            'escalation' => $escalation,
        ]);
    }

    public function resolve(Request $request, Escalation $escalation)
    {
        $validated = $request->validate([
            'resolution_notes' => ['required', 'string', 'max:5000'],
        ]);

        $escalation->update([
            'status' => 'resolved',
            'resolution_notes' => $validated['resolution_notes'],
            'resolved_at' => now(),
        ]);

        event(new EscalationResolved($escalation));

        return redirect()->back()->with('success', 'Escalation resolved successfully.');
    }
}
