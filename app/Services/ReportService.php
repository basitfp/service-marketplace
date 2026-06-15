<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function revenueByMonth(int $months = 12): array
    {
        $transactions = WalletTransaction::query()
            ->where('type', 'credit_purchase')
            ->where('created_at', '>=', now()->subMonths($months))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("SUM(credits) as credits"),
                DB::raw("SUM(amount) as amount")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $transactions->toArray();
    }

    public function ordersByStatus(): array
    {
        $orders = Order::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return $orders->toArray();
    }

    public function ordersPerDay(int $days = 30): array
    {
        $orders = Order::query()
            ->where('created_at', '>=', now()->subDays($days))
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("count(*) as count")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $orders->toArray();
    }

    public function topServices(int $limit = 5): array
    {
        $services = Order::query()
            ->join('services', 'orders.service_id', '=', 'services.id')
            ->select('services.name', DB::raw('count(orders.id) as order_count'))
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('order_count')
            ->limit($limit)
            ->get();

        return $services->toArray();
    }

    public function workerPerformance(): array
    {
        $workers = User::query()
            ->where('role', UserRole::Worker->value)
            ->withCount(['workerOrders as completed' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->with(['workerOrders' => function ($query) {
                $query->where('status', 'completed')->with('review');
            }])
            ->get();

        return $workers->map(function ($worker) {
            $reviews = $worker->workerOrders->pluck('review')->filter();
            $avgRating = $reviews->count() > 0 ? $reviews->avg('rating') : 0;

            return [
                'name' => $worker->name,
                'completed' => $worker->completed,
                'avg_rating' => round($avgRating, 1),
            ];
        })->sortByDesc('completed')->values()->toArray();
    }
}
