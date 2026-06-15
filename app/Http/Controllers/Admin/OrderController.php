<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderAssignRequest;
use App\Models\Category;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request)
    {
        $query = Order::query()
            ->with([
                'client:id,name,email,phone',
                'worker:id,name,email,profile_photo',
                'service:id,category_id,name,credit_cost,delivery_days',
                'service.category:id,name',
            ]);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->integer('service_id'));
        }

        if ($request->filled('category_id')) {
            $query->whereHas('service', function (Builder $serviceQuery) use ($request) {
                $serviceQuery->where('category_id', $request->integer('category_id'));
            });
        }

        if ($request->filled('worker_id')) {
            $query->where('worker_id', $request->integer('worker_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $orderId = ltrim($search, '#');

            $query->where(function (Builder $searchQuery) use ($search, $orderId) {
                if (is_numeric($orderId)) {
                    $searchQuery->orWhere('id', (int) $orderId);
                }

                $searchQuery->orWhereHas('client', function (Builder $clientQuery) use ($search) {
                    $clientQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        $orders = $query->latest()->paginate(15)->withQueryString();
        $orders->getCollection()->transform(function (Order $order) {
            $order->setAttribute('eligible_workers', $this->eligibleWorkersForService($order->service_id));

            return $order;
        });

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only([
                'status',
                'service_id',
                'category_id',
                'worker_id',
                'date_from',
                'date_to',
                'search',
            ]),
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $status) => [
                'label' => str($status->value)->replace('_', ' ')->title()->toString(),
                'value' => $status->value,
            ])->values(),
            'services' => Service::orderBy('name')->get(['id', 'name', 'category_id']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'workers' => $this->workersWithActiveCounts(),
        ]);
    }

    public function show(Order $order)
    {
        $order->load([
            'client:id,name,email,phone,profile_photo',
            'worker:id,name,email,phone,profile_photo',
            'worker.workerProfile',
            'service:id,category_id,name,credit_cost,delivery_days,revisions,extra_revision_cost',
            'service.category:id,name',
            'service.fieldValues.categoryField',
            'selections.step',
            'selections.option',
            'assets',
            'revisions',
            'review',
            'escalations.client:id,name,email',
            'comments.user:id,name,email,profile_photo',
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'eligibleWorkers' => $this->eligibleWorkersForService($order->service_id),
            'clientTotalOrdersCount' => Order::where('client_id', $order->client_id)->count(),
            'workerActiveOrdersCount' => $order->worker_id
                ? $this->activeOrdersQuery()->where('worker_id', $order->worker_id)->count()
                : 0,
            'timeline' => $this->timelineFor($order),
        ]);
    }

    public function assign(StoreOrderAssignRequest $request, Order $order)
    {
        $this->orderService->assign($order, (int) $request->validated('worker_id'), $request->user());

        return redirect()->back()->with('success', 'Worker assigned successfully.');
    }

    public function cancel(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $this->orderService->cancel($order, $validated['reason'], $request->user());

        return redirect()->back()->with('success', 'Order cancelled successfully.');
    }

    private function eligibleWorkersForService(int $serviceId)
    {
        return User::query()
            ->where('role', UserRole::Worker->value)
            ->where('status', 'active')
            ->whereHas('services', fn (Builder $query) => $query->where('services.id', $serviceId))
            ->with('workerProfile')
            ->withCount([
                'workerOrders as active_orders_count' => fn (Builder $query) => $query->whereIn('status', $this->activeStatuses()),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'profile_photo']);
    }

    private function workersWithActiveCounts()
    {
        return User::query()
            ->where('role', UserRole::Worker->value)
            ->withCount([
                'workerOrders as active_orders_count' => fn (Builder $query) => $query->whereIn('status', $this->activeStatuses()),
            ])
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function activeOrdersQuery()
    {
        return Order::whereIn('status', $this->activeStatuses());
    }

    private function activeStatuses(): array
    {
        return [
            OrderStatus::Assigned->value,
            OrderStatus::InProgress->value,
            OrderStatus::RevisionRequested->value,
        ];
    }

    private function timelineFor(Order $order): array
    {
        $timeline = collect([
            [
                'label' => 'Order placed',
                'status' => OrderStatus::Pending->value,
                'timestamp' => $order->created_at?->toISOString(),
            ],
        ]);

        if ($order->worker_id) {
            $timeline->push([
                'label' => 'Worker assigned',
                'status' => OrderStatus::Assigned->value,
                'timestamp' => $order->updated_at?->toISOString(),
            ]);
        }

        $order->revisions->each(function ($revision) use ($timeline) {
            $timeline->push([
                'label' => 'Revision requested',
                'status' => OrderStatus::RevisionRequested->value,
                'timestamp' => $revision->created_at?->toISOString(),
            ]);
        });

        $order->assets
            ->where('type', 'deliverable')
            ->sortBy('created_at')
            ->take(1)
            ->each(function ($asset) use ($timeline) {
                $timeline->push([
                    'label' => 'Deliverable submitted',
                    'status' => OrderStatus::Submitted->value,
                    'timestamp' => $asset->created_at?->toISOString(),
                ]);
            });

        if ($order->review) {
            $timeline->push([
                'label' => 'Order completed',
                'status' => OrderStatus::Completed->value,
                'timestamp' => $order->review->created_at?->toISOString(),
            ]);
        }

        if ($order->status === OrderStatus::Cancelled) {
            $timeline->push([
                'label' => 'Order cancelled',
                'status' => OrderStatus::Cancelled->value,
                'timestamp' => $order->updated_at?->toISOString(),
            ]);
        }

        return $timeline
            ->filter(fn (array $item) => $item['timestamp'])
            ->sortBy(fn (array $item) => Carbon::parse($item['timestamp'])->timestamp)
            ->values()
            ->all();
    }
}
