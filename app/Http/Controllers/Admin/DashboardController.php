<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Escalation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Enums\UserRole;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Revenue
        $total_revenue = WalletTransaction::where('type', 'credit_purchase')->sum('amount');
        $revCurrent = WalletTransaction::where('type', 'credit_purchase')->where('created_at', '>=', $thirtyDaysAgo)->sum('amount');
        $revPrev = WalletTransaction::where('type', 'credit_purchase')->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->sum('amount');
        $revenue_trend = $this->getTrend($revCurrent, $revPrev);

        // Orders
        $total_orders = Order::count();
        $ordersCurrent = Order::where('created_at', '>=', $thirtyDaysAgo)->count();
        $ordersPrev = Order::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $orders_trend = $this->getTrend($ordersCurrent, $ordersPrev);

        // Active Clients
        $active_clients = User::where('role', UserRole::Client->value)->where('status', 'active')->count();
        $clientsCurrent = User::where('role', UserRole::Client->value)->where('status', 'active')->where('created_at', '>=', $thirtyDaysAgo)->count();
        $clientsPrev = User::where('role', UserRole::Client->value)->where('status', 'active')->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $clients_trend = $this->getTrend($clientsCurrent, $clientsPrev);

        // Active Workers
        $active_workers = User::where('role', UserRole::Worker->value)->where('status', 'active')->count();
        $workersCurrent = User::where('role', UserRole::Worker->value)->where('status', 'active')->where('created_at', '>=', $thirtyDaysAgo)->count();
        $workersPrev = User::where('role', UserRole::Worker->value)->where('status', 'active')->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $workers_trend = $this->getTrend($workersCurrent, $workersPrev);

        // Pending Orders
        $pending_orders = Order::where('status', 'pending')->count();
        $pendingCurrent = Order::where('status', 'pending')->where('created_at', '>=', $thirtyDaysAgo)->count();
        $pendingPrev = Order::where('status', 'pending')->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $pending_trend = $this->getTrend($pendingCurrent, $pendingPrev);

        // Open Escalations
        $open_escalations = Escalation::where('status', 'open')->count();
        $escCurrent = Escalation::where('status', 'open')->where('created_at', '>=', $thirtyDaysAgo)->count();
        $escPrev = Escalation::where('status', 'open')->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $esc_trend = $this->getTrend($escCurrent, $escPrev);

        // Charts data
        $monthly_revenue = WalletTransaction::where('type', 'credit_purchase')
            ->where('created_at', '>=', $now->copy()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("SUM(credits) as credits"),
                DB::raw("SUM(amount) as amount")
            )
            ->groupBy('month')->orderBy('month')->get();

        $orders_by_status = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')->get();

        $orders_per_day = Order::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw("DATE(created_at) as date"), DB::raw("count(*) as count"))
            ->groupBy('date')->orderBy('date')->get();

        $top_services = Order::join('services', 'orders.service_id', '=', 'services.id')
            ->select('services.name', DB::raw('count(orders.id) as count'))
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('count')
            ->limit(5)->get();

        // Tables data
        $recent_orders = Order::with(['client:id,name', 'worker:id,name', 'service:id,name'])
            ->latest()->limit(10)->get();

        $recent_transactions = WalletTransaction::with('user:id,name,email')
            ->latest()->limit(10)->get();

        $top_workers = User::where('role', UserRole::Worker->value)
            ->withCount(['workerOrders as completed' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->with(['workerOrders' => function ($query) {
                $query->where('status', 'completed')->with('review');
            }])
            ->get()
            ->map(function ($worker) {
                $reviews = $worker->workerOrders->pluck('review')->filter();
                $avgRating = $reviews->count() > 0 ? $reviews->avg('rating') : 0;
                return [
                    'id' => $worker->id,
                    'name' => $worker->name,
                    'completed' => $worker->completed,
                    'avg_rating' => round($avgRating, 1)
                ];
            })
            ->sortByDesc('completed')
            ->take(5)
            ->values();

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => [
                'total_revenue' => ['value' => $total_revenue, 'trend' => $revenue_trend],
                'total_orders' => ['value' => $total_orders, 'trend' => $orders_trend],
                'active_clients' => ['value' => $active_clients, 'trend' => $clients_trend],
                'active_workers' => ['value' => $active_workers, 'trend' => $workers_trend],
                'pending_orders' => ['value' => $pending_orders, 'trend' => $pending_trend],
                'open_escalations' => ['value' => $open_escalations, 'trend' => $esc_trend],
            ],
            'charts' => [
                'monthly_revenue' => $monthly_revenue,
                'orders_by_status' => $orders_by_status,
                'orders_per_day' => $orders_per_day,
                'top_services' => $top_services,
            ],
            'tables' => [
                'recent_orders' => $recent_orders,
                'recent_transactions' => $recent_transactions,
                'top_workers' => $top_workers,
            ]
        ]);
    }

    private function getTrend($current, $previous) {
        if ($previous == 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
