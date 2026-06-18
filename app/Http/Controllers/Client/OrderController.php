<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Escalation;
use App\Models\Order;
use App\Models\OrderAsset;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    // ── Index — paginated list of the client's own orders ────────────

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Order::class);

        $query = Order::query()
            ->where('client_id', auth()->id())
            ->with([
                'service:id,name,image',
                'worker:id,name',
            ]);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('search')) {
            $orderId = ltrim(trim((string) $request->string('search')), '#');
            if (is_numeric($orderId)) {
                $query->where('id', (int) $orderId);
            }
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to'));
        }

        $orders = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Client/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    // ── Show — full order detail with all relationships ───────────────

    public function show(Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load([
            'client:id,name,email,phone,profile_photo',
            'worker:id,name,email,profile_photo',
            'service.category:id,name',
            'service.steps.options',
            'service.fieldValues.categoryField',
            'assets',
            'selections.step',
            'selections.option',
            'revisions' => fn ($q) => $q->orderBy('created_at', 'desc'),
            'review',
            'escalations',
            'comments' => fn ($q) => $q->with('user:id,name,role,profile_photo')
                                       ->oldest()
                                       ->paginate(20),
        ]);

        return Inertia::render('Client/Orders/Show', [
            'order'         => $order,
            'walletBalance' => auth()->user()->wallet?->balance ?? 0,
        ]);
    }

    // ── Complete (approve) ────────────────────────────────────────────

    public function complete(Request $request, Order $order): RedirectResponse
    {
        $this->authorize('complete', $order);

        $validated = $request->validate([
            'rating'      => ['required', 'integer', 'min:1', 'max:5'],
            'review_text' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->orderService->complete(
            $order,
            (int) $validated['rating'],
            $validated['review_text'] ?? null,
            auth()->user(),
        );

        return redirect()
            ->route('client.orders.show', $order)
            ->with('success', 'Order completed. Thank you for your review!');
    }

    // ── Request revision ──────────────────────────────────────────────

    public function requestRevision(Request $request, Order $order): RedirectResponse
    {
        $this->authorize('requestRevision', $order);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'files'   => ['nullable', 'array'],
            'files.*' => ['file', 'max:20480'],
        ]);

        $this->orderService->requestRevision(
            $order,
            $validated['message'],
            $request->file('files', []),
            auth()->user(),
        );

        return redirect()
            ->route('client.orders.show', $order)
            ->with('success', 'Revision requested. Worker has been notified.');
    }

    // ── Escalate ──────────────────────────────────────────────────────

    public function escalate(Request $request, Order $order): RedirectResponse
    {
        $this->authorize('view', $order);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        // Block duplicate open escalations
        $hasOpenEscalation = $order->escalations()
            ->where('status', 'open')
            ->exists();

        if ($hasOpenEscalation) {
            return redirect()->back()
                ->with('error', 'You already have an open escalation for this order.');
        }

        Escalation::create([
            'order_id'  => $order->id,
            'client_id' => auth()->id(),
            'message'   => $validated['message'],
            'status'    => 'open',
        ]);

        return redirect()->back()
            ->with('success', 'Escalation submitted. Our team will review it shortly.');
    }

    // ── Download asset ────────────────────────────────────────────────

    public function downloadAsset(Order $order, OrderAsset $asset): StreamedResponse
    {
        $this->authorize('view', $order);

        abort_unless($asset->order_id === $order->id, 404);

        return Storage::disk('public')->download(
            $asset->file_path,
            $asset->original_name,
        );
    }
}
