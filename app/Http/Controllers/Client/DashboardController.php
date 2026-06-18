<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $clientId = auth()->id();

        return Inertia::render('Client/Dashboard/Index', [
            'stats' => [
                'totalOrders'     => Order::where('client_id', $clientId)->count(),
                'activeOrders'    => Order::where('client_id', $clientId)
                                        ->whereNotIn('status', ['completed', 'cancelled'])
                                        ->count(),
                'completedOrders' => Order::where('client_id', $clientId)
                                        ->where('status', 'completed')
                                        ->count(),
                'walletBalance'   => auth()->user()->wallet?->balance ?? 0,
            ],
            'recentOrders'   => Order::where('client_id', $clientId)
                                    ->with(['service:id,name', 'worker:id,name'])
                                    ->latest()
                                    ->take(5)
                                    ->get(),
            'ordersByStatus' => Order::where('client_id', $clientId)
                                    ->selectRaw('status, count(*) as count')
                                    ->groupBy('status')
                                    ->pluck('count', 'status'),
        ]);
    }
}
