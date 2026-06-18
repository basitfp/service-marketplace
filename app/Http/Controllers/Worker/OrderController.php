<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function index(Request $request)
    {
        $workerId = auth()->id();

        $query = Order::with(['service.category', 'client:id,name'])
            ->where('worker_id', $workerId);

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()
            ->paginate(15)
            ->through(fn($order) => [
                'id' => $order->id,
                'client_name' => $order->client?->name ? explode(' ', $order->client->name)[0] : 'N/A',
                'service_name' => $order->service->name,
                'category' => $order->service->category->name,
                'status' => $order->status->value,
                'date_assigned' => $order->created_at->format('Y-m-d'),
                'deadline' => $order->created_at->addDays($order->service->delivery_days)->format('Y-m-d'),
                'is_overdue' => $order->created_at->addDays($order->service->delivery_days)->isPast() 
                    && !in_array($order->status->value, ['completed', 'cancelled']),
                'credits' => $order->credits_used,
            ]);

        return Inertia::render('Worker/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status']),
        ]);
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        $order->load([
            'service.category',
            'service.steps.options',
            'service.fieldValues.categoryField',
            'client:id,name',
            'assets',
            'selections.step',
            'selections.option',
            'revisions' => fn($q) => $q->latest(),
            'comments.user' => fn($q) => $q->latest()->paginate(20),
        ]);

        // Separate assets by type
        $referenceFiles = $order->assets->where('type', 'reference');
        $deliverableFiles = $order->assets->where('type', 'deliverable');

        // Calculate deadline
        $deadline = $order->created_at->addDays($order->service->delivery_days);
        $isOverdue = $deadline->isPast() && !in_array($order->status->value, ['completed', 'cancelled']);

        return Inertia::render('Worker/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'status' => $order->status->value,
                'credits_used' => $order->credits_used,
                'notes' => $order->notes,
                'date_assigned' => $order->created_at->format('Y-m-d H:i'),
                'deadline' => $deadline->format('Y-m-d'),
                'is_overdue' => $isOverdue,
                'client_name' => $order->client?->name ? explode(' ', $order->client->name)[0] : 'N/A',
                'service' => [
                    'name' => $order->service->name,
                    'category' => $order->service->category->name,
                    'delivery_days' => $order->service->delivery_days,
                    'field_values' => $order->service->fieldValues->map(fn($fv) => [
                        'label' => $fv->categoryField->label,
                        'value' => $fv->value,
                    ]),
                ],
                'selections' => $order->selections->map(fn($sel) => [
                    'step_name' => $sel->step_name,
                    'option_label' => $sel->option_label,
                    'credit_cost' => $sel->credit_cost,
                ]),
                'reference_files' => $referenceFiles->map(fn($asset) => [
                    'id' => $asset->id,
                    'original_name' => $asset->original_name,
                    'file_path' => $asset->file_path,
                    'mime_type' => $asset->mime_type,
                    'size' => $asset->file_size,
                ]),
                'deliverable_files' => $deliverableFiles->map(fn($asset) => [
                    'id' => $asset->id,
                    'original_name' => $asset->original_name,
                    'file_path' => $asset->file_path,
                    'mime_type' => $asset->mime_type,
                    'uploaded_at' => $asset->created_at->format('Y-m-d H:i'),
                ]),
                'revisions' => $order->revisions->map(fn($rev) => [
                    'id' => $rev->id,
                    'reason' => $rev->reason,
                    'is_resolved' => $rev->is_resolved,
                    'created_at' => $rev->created_at->format('Y-m-d H:i'),
                    'resolved_at' => $rev->resolved_at?->format('Y-m-d H:i'),
                ]),
                'comments' => $order->comments,
            ],
        ]);
    }

    public function submitDelivery(Request $request, Order $order)
    {
        $this->authorize('submitDelivery', $order);

        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'file|max:51200', // 50MB
        ]);

        $this->orderService->submitDelivery($order, $request->file('files'), auth()->user());

        return redirect()->route('worker.orders.show', $order->id)
            ->with('success', 'Delivery submitted! Awaiting client review.');
    }
}
