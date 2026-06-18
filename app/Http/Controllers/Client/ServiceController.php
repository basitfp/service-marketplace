<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Public service catalog with filters.
     */
    public function index(Request $request)
    {
        $query = Service::where('is_active', true)->with('category');

        // Filter: category IDs (array of checkboxes)
        if ($request->filled('category_ids') && is_array($request->category_ids)) {
            $query->whereIn('category_id', $request->category_ids);
        }

        // Filter: credit range
        if ($request->filled('min_credits')) {
            $query->where('credit_cost', '>=', (int) $request->min_credits);
        }

        if ($request->filled('max_credits')) {
            $query->where('credit_cost', '<=', (int) $request->max_credits);
        }

        // Filter: keyword search across name + short_description
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        $services = $query->latest()->paginate(12)->withQueryString();

        // All active categories with their service count (for sidebar checkboxes)
        $categories = Category::active()
            ->withCount(['services' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'icon']);

        return Inertia::render('Client/Services/Index', [
            'services'   => $services,
            'categories' => $categories,
            'filters'    => $request->only(['category_ids', 'min_credits', 'max_credits', 'search']),
        ]);
    }

    /**
     * Service detail page — read-only display of all service data.
     */
    public function show(Service $service)
    {
        abort_unless($service->is_active, 404);

        $service->load([
            'category',
            'fieldValues.categoryField',
            'steps.options',
        ]);

        // Pass only the count of eligible workers, not names
        $eligibleWorkersCount = $service->eligibleWorkers()->count();

        // Check if this service is already in the client's session cart
        $cart      = session('cart', []);
        $inCart    = collect($cart)->firstWhere('service_id', $service->id);
        $cartItemId = $inCart['cart_item_id'] ?? null;

        return Inertia::render('Client/Services/Show', [
            'service'               => $service,
            'eligibleWorkersCount'  => $eligibleWorkersCount,
            'inCart'                => (bool) $inCart,
            'cartItemId'            => $cartItemId,
        ]);
    }
}
