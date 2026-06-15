<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->where('role', UserRole::Client->value)
            ->with('wallet')
            ->withCount('clientOrders');

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status'));
        }

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(User $customer)
    {
        abort_unless($customer->role === UserRole::Client, 404);

        $customer->load('wallet');

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
            'orders' => $customer->clientOrders()
                ->with(['service:id,name', 'worker:id,name'])
                ->latest()
                ->paginate(10, ['*'], 'orders_page'),
            'transactions' => WalletTransaction::query()
                ->where('user_id', $customer->id)
                ->latest()
                ->paginate(10, ['*'], 'transactions_page'),
        ]);
    }
}
