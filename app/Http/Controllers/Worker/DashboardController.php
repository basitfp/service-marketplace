<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $workerId = auth()->id();

        // Stats - all filtered by worker_id
        $stats = [
            'assigned' => Order::where('worker_id', $workerId)
                ->where('status', OrderStatus::Assigned)
                ->count(),
            'in_progress' => Order::where('worker_id', $workerId)
                ->where('status', OrderStatus::InProgress)
                ->count(),
            'submitted' => Order::where('worker_id', $workerId)
                ->where('status', OrderStatus::Submitted)
                ->count(),
            'revision_requested' => Order::where('worker_id', $workerId)
                ->where('status', OrderStatus::RevisionRequested)
                ->count(),
            'completed' => Order::where('worker_id', $workerId)
                ->where('status', OrderStatus::Completed)
                ->count(),
        ];

        // Performance metrics
        $totalAssigned = Order::where('worker_id', $workerId)
            ->whereNotIn('status', [OrderStatus::Pending])
            ->count();

        $completionRate = $totalAssigned > 0
            ? round(($stats['completed'] / $totalAssigned) * 100)
            : 0;

        $avgRating = DB::table('reviews')
            ->join('orders', 'reviews.order_id', '=', 'orders.id')
            ->where('orders.worker_id', $workerId)
            ->avg('reviews.rating');

        $totalCreditsEarned = Order::where('worker_id', $workerId)
            ->where('status', OrderStatus::Completed)
            ->sum('credits_used');

        $performance = [
            'completion_rate' => $completionRate,
            'avg_rating' => $avgRating ? round($avgRating, 1) : null,
            'total_credits_earned' => $totalCreditsEarned,
        ];

        // Orders by status chart
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->where('worker_id', $workerId)
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => $item->status->value,
                'count' => $item->count,
            ]);

        // Monthly completed orders (last 6 months)
        $monthlyCompleted = Order::select(
                DB::raw('DATE_FORMAT(updated_at, "%Y-%m") as month'),
                DB::raw('count(*) as count')
            )
            ->where('worker_id', $workerId)
            ->where('status', OrderStatus::Completed)
            ->where('updated_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'count' => $item->count,
            ]);

        // Recent orders
        $recentOrders = Order::with('service:id,name')
            ->where('worker_id', $workerId)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'service_name' => $order->service->name,
                'status' => $order->status->value,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Worker/Dashboard/Index', [
            'stats' => $stats,
            'performance' => $performance,
            'charts' => [
                'orders_by_status' => $ordersByStatus,
                'monthly_completed' => $monthlyCompleted,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
