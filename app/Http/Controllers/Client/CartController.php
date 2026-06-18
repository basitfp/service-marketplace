<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    // ── Cart page ────────────────────────────────────────────────────

    public function index(): Response
    {
        return Inertia::render('Client/Cart/Index', [
            'cartItems'     => session('cart', []),
            'walletBalance' => auth()->user()->wallet?->balance ?? 0,
        ]);
    }

    // ── Add item ─────────────────────────────────────────────────────

    public function add(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'service_id'    => ['required', 'integer', 'exists:services,id'],
            'selections'    => ['nullable', 'array'],
            'selections.*.step_id'      => ['required', 'integer'],
            'selections.*.step_name'    => ['required', 'string'],
            'selections.*.option_id'    => ['required', 'integer'],
            'selections.*.option_label' => ['required', 'string'],
            'selections.*.credit_cost'  => ['required', 'integer', 'min:0'],
            'notes'         => ['nullable', 'string', 'max:2000'],
            'total_credits' => ['nullable', 'integer', 'min:0'],
        ]);

        $service = Service::findOrFail($validated['service_id']);

        abort_unless($service->is_active, 422, 'This service is no longer available.');

        $selections   = $validated['selections'] ?? [];
        $addOnCredits = collect($selections)->sum('credit_cost');
        $totalCredits = $service->credit_cost + $addOnCredits;

        $cartItem = [
            'cart_item_id'    => Str::uuid()->toString(),
            'service_id'      => $service->id,
            'service_name'    => $service->name,
            'service_slug'    => $service->slug,
            'service_image'   => $service->image,
            'base_credits'    => $service->credit_cost,
            'selections'      => $selections,
            'total_credits'   => $totalCredits,
            'notes'           => $validated['notes'] ?? null,
            'reference_files' => [],
        ];

        $cart = session('cart', []);

        // Replace existing item for the same service, otherwise append
        $existingIndex = collect($cart)->search(fn ($item) => $item['service_id'] === $service->id);

        if ($existingIndex !== false) {
            // Preserve cart_item_id so the client side can track it
            $cartItem['cart_item_id'] = $cart[$existingIndex]['cart_item_id'];
            $cartItem['reference_files'] = $cart[$existingIndex]['reference_files'] ?? [];
            $cart[$existingIndex] = $cartItem;
        } else {
            $cart[] = $cartItem;
        }

        session(['cart' => array_values($cart)]);

        return redirect()->back()->with('success', 'Added to cart');
    }

    // ── Update item ──────────────────────────────────────────────────

    public function update(Request $request, string $cartItemId): RedirectResponse
    {
        $validated = $request->validate([
            'selections'    => ['nullable', 'array'],
            'selections.*.step_id'      => ['required', 'integer'],
            'selections.*.step_name'    => ['required', 'string'],
            'selections.*.option_id'    => ['required', 'integer'],
            'selections.*.option_label' => ['required', 'string'],
            'selections.*.credit_cost'  => ['required', 'integer', 'min:0'],
            'notes'         => ['nullable', 'string', 'max:2000'],
            'total_credits' => ['nullable', 'integer', 'min:0'],
        ]);

        $cart  = session('cart', []);
        $index = collect($cart)->search(fn ($item) => $item['cart_item_id'] === $cartItemId);

        if ($index === false) {
            return redirect()->back()->with('error', 'Cart item not found.');
        }

        $selections   = $validated['selections'] ?? [];
        $addOnCredits = collect($selections)->sum('credit_cost');

        $cart[$index]['selections']    = $selections;
        $cart[$index]['notes']         = $validated['notes'] ?? null;
        $cart[$index]['total_credits'] = $cart[$index]['base_credits'] + $addOnCredits;

        session(['cart' => array_values($cart)]);

        return redirect()->back()->with('success', 'Cart updated');
    }

    // ── Remove single item ───────────────────────────────────────────

    public function remove(string $cartItemId): RedirectResponse
    {
        $cart = session('cart', []);

        $cart = array_values(
            array_filter($cart, fn ($item) => $item['cart_item_id'] !== $cartItemId)
        );

        session(['cart' => $cart]);

        return redirect()->back()->with('success', 'Item removed from cart');
    }

    // ── Clear entire cart ────────────────────────────────────────────

    public function clear(): RedirectResponse
    {
        session()->forget('cart');

        return redirect()->route('client.services.index')->with('success', 'Cart cleared');
    }
}
