<?php

namespace App\Http\Controllers\Client;

use App\Exceptions\InsufficientCreditsException;
use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    // ── Review page ──────────────────────────────────────────────────

    public function index(): Response|RedirectResponse
    {
        $cartItems = session('cart', []);

        if (empty($cartItems)) {
            return redirect()->route('client.cart.index')
                ->with('error', 'Your cart is empty. Add a service before checking out.');
        }

        $total = collect($cartItems)->sum('total_credits');

        return Inertia::render('Client/Cart/Checkout', [
            'cartItems'     => $cartItems,
            'walletBalance' => auth()->user()->wallet?->balance ?? 0,
            'total'         => $total,
        ]);
    }

    // ── Place orders ─────────────────────────────────────────────────

    public function store(): RedirectResponse
    {
        $cartItems = session('cart', []);

        if (empty($cartItems)) {
            return redirect()->route('client.cart.index');
        }

        try {
            $this->orderService->checkout(auth()->user(), $cartItems);

            return redirect()->route('client.orders.index')
                ->with('success', 'Orders placed successfully!');

        } catch (InsufficientCreditsException $e) {
            return redirect()->back()
                ->with('error', 'Insufficient wallet balance. Please top up your wallet and try again.');
        }
    }
}
