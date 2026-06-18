<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        
        // Get or create wallet
        $wallet = $user->wallet()->firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        // Get last 5 transactions
        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->with('order:id')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Client/Wallet/Index', [
            'wallet' => $wallet,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function transactions(Request $request): Response
    {
        $user = auth()->user();

        $query = WalletTransaction::where('user_id', $user->id)
            ->with('order:id,reference');

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->latest()->paginate(15);

        return Inertia::render('Client/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'type' => $request->type,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }

    public function topup(): Response
    {
        $user = auth()->user();
        
        // Get or create wallet
        $wallet = $user->wallet()->firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        $packages = CreditPackage::where('is_active', true)
            ->orderBy('credits')
            ->get();

        return Inertia::render('Client/Wallet/Topup', [
            'wallet' => $wallet,
            'packages' => $packages,
        ]);
    }

    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:credit_packages,id',
        ]);

        $package = CreditPackage::findOrFail($request->package_id);

        if (!$package->is_active) {
            return back()->withErrors(['package' => 'This package is not available.']);
        }

        $totalCredits = $package->credits + ($package->bonus_credits ?? 0);

        // Use Stripe Checkout
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $package->name . ' — ' . number_format($totalCredits) . ' Credits',
                    ],
                    'unit_amount' => (int)($package->price * 100), // Convert to cents
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('client.wallet.topup.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('client.wallet.topup.cancel'),
            'metadata' => [
                'user_id' => auth()->id(),
                'package_id' => $package->id,
                'credits' => $totalCredits,
            ],
        ]);

        return redirect($session->url, 303);
    }

    public function topupSuccess(Request $request): Response
    {
        return Inertia::render('Client/Wallet/TopupSuccess', [
            'session_id' => $request->query('session_id'),
        ]);
    }

    public function topupCancel(): Response
    {
        return Inertia::render('Client/Wallet/TopupCancel');
    }
}
