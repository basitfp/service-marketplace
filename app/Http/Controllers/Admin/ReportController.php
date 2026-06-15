<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function revenue(Request $request, ReportService $reportService)
    {
        $months = $request->input('months', 12);
        
        $revenueByMonth = $reportService->revenueByMonth($months);
        $ordersByStatus = $reportService->ordersByStatus();
        $ordersPerDay = $reportService->ordersPerDay(30);
        $topServices = $reportService->topServices(5);
        $workerPerformance = $reportService->workerPerformance();

        // StatCards
        $totalRevenue = array_sum(array_column($revenueByMonth, 'amount'));
        $totalOrders = Order::where('created_at', '>=', now()->subMonths($months))->count();
        $newClients = User::where('role', 'client')->where('created_at', '>=', now()->subMonths($months))->count();
        $newWorkers = User::where('role', 'worker')->where('created_at', '>=', now()->subMonths($months))->count();

        if ($request->input('export') === 'csv') {
            $headers = [
                'Content-type'        => 'text/csv',
                'Content-Disposition' => 'attachment; filename=revenue_report.csv',
                'Pragma'              => 'no-cache',
                'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
                'Expires'             => '0'
            ];

            $callback = function() use ($revenueByMonth) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['Month', 'Credits Purchased', 'Amount ($)']);

                foreach ($revenueByMonth as $row) {
                    fputcsv($file, [$row['month'], $row['credits'], $row['amount']]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return Inertia::render('Admin/Reports/Revenue', [
            'revenueByMonth' => $revenueByMonth,
            'ordersByStatus' => $ordersByStatus,
            'ordersPerDay' => $ordersPerDay,
            'topServices' => $topServices,
            'workerPerformance' => $workerPerformance,
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'newClients' => $newClients,
                'newWorkers' => $newWorkers,
            ],
            'filters' => [
                'months' => $months,
            ]
        ]);
    }
}
