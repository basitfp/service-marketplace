<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = WalletTransaction::query()->with('user:id,name,email');

        if ($request->filled('type')) {
            $query->where('type', (string) $request->string('type'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to'));
        }

        if ($request->filled('user_search')) {
            $search = trim((string) $request->string('user_search'));
            $query->whereHas('user', function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['type', 'date_from', 'date_to', 'user_search']),
            'types' => WalletTransaction::query()
                ->select('type')
                ->distinct()
                ->orderBy('type')
                ->pluck('type')
                ->values(),
        ]);
    }
}
