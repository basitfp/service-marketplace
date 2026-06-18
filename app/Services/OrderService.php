<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Events\OrderAssigned;
use App\Events\OrderCancelled;
use App\Events\OrderCompleted;
use App\Events\OrderSubmitted;
use App\Events\RevisionRequested;
use App\Exceptions\InsufficientCreditsException;
use App\Models\Order;
use App\Models\OrderSelection;
use App\Models\User;
use App\Models\OrderAsset;
use App\Models\Revision;
use App\Models\Review;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Place orders for all items in the client's cart.
     *
     * The entire operation is wrapped in a single DB transaction so that
     * credit deduction and order creation are atomic — if anything fails,
     * the whole checkout rolls back.
     *
     * @param  User  $client
     * @param  array $cartItems  Array of cart item arrays (from session 'cart')
     * @return int[]             IDs of the newly created orders
     *
     * @throws InsufficientCreditsException
     */
    public function checkout(User $client, array $cartItems): array
    {
        return DB::transaction(function () use ($client, $cartItems) {

            // ── 1. Lock wallet row and verify balance ────────────────
            $wallet = $client->wallet()->lockForUpdate()->firstOrCreate(
                ['user_id' => $client->id],
                ['balance'  => 0]
            );

            $totalCredits = collect($cartItems)->sum('total_credits');

            if ($wallet->balance < $totalCredits) {
                throw new InsufficientCreditsException();
            }

            // ── 2. Deduct credits atomically ─────────────────────────
            $wallet->balance -= $totalCredits;
            $wallet->save();

            // ── 3. Create one Order + selections + transaction per item
            $orderIds = [];

            foreach ($cartItems as $item) {
                // a) Create the order
                $order = Order::create([
                    'client_id'    => $client->id,
                    'service_id'   => $item['service_id'],
                    'credits_used' => $item['total_credits'],
                    'status'       => OrderStatus::Pending,
                    'notes'        => $item['notes'] ?? null,
                ]);

                // b) Create a selection row for each configured step option
                foreach ($item['selections'] ?? [] as $sel) {
                    OrderSelection::create([
                        'order_id'     => $order->id,
                        'step_id'      => $sel['step_id'],
                        'step_name'    => $sel['step_name'],
                        'option_id'    => $sel['option_id'],
                        'option_label' => $sel['option_label'],
                        'credit_cost'  => $sel['credit_cost'],
                    ]);
                }

                // c) Record wallet transaction for this individual order
                WalletTransaction::create([
                    'user_id'     => $client->id,
                    'order_id'    => $order->id,
                    'type'        => 'order_payment',
                    'credits'     => $item['total_credits'],
                    'amount'      => null,
                    'reference'   => "ORDER-{$order->id}",
                    'description' => "Payment for Order #{$order->id}: {$item['service_name']}",
                ]);

                $orderIds[] = $order->id;
            }

            // ── 4. Clear the session cart ────────────────────────────
            session()->forget('cart');

            return $orderIds;
        });
    }

    public function assign(Order $order, int $workerId, User $admin): Order
    {
        if (!in_array($order->status, [OrderStatus::Pending, OrderStatus::Assigned])) {
            throw new Exception("Order must be pending or assigned to be assigned.");
        }

        $worker = User::findOrFail($workerId);
        
        if (!$worker->services()->where('service_id', $order->service_id)->exists()) {
            throw new Exception("Worker is not eligible for this service.");
        }

        $activeOrdersCount = Order::where('worker_id', $workerId)
            ->whereIn('status', [OrderStatus::Assigned, OrderStatus::InProgress, OrderStatus::RevisionRequested])
            ->count();

        // In a real app we'd load max_active_orders_per_worker from settings, hardcoding 5 for now 
        // as Settings implementation is slated for later.
        $maxActiveOrders = 5; 

        if ($activeOrdersCount >= $maxActiveOrders) {
            throw new Exception("Worker has reached the maximum number of active orders.");
        }

        $order->worker_id = $workerId;
        $order->status = OrderStatus::Assigned;
        $order->save();

        event(new OrderAssigned($order));

        return $order;
    }

    public function submitDelivery(Order $order, array $files, User $worker): Order
    {
        if ($order->worker_id !== $worker->id) {
            throw new Exception("Only the assigned worker can submit delivery.");
        }

        if (!in_array($order->status, [OrderStatus::Assigned, OrderStatus::InProgress, OrderStatus::RevisionRequested])) {
            throw new Exception("Order is not in a submittable status.");
        }

        DB::transaction(function () use ($order, $files) {
            foreach ($files as $file) {
                // file is expected to be an UploadedFile instance
                $path = $file->store('order-assets', 'public');
                OrderAsset::create([
                    'order_id' => $order->id,
                    'type' => 'deliverable',
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }

            $order->revisions()->where('status', '!=', 'resolved')->update(['status' => 'resolved']);

            $order->status = OrderStatus::Submitted;
            $order->save();
        });

        event(new OrderSubmitted($order));

        return $order;
    }

    public function complete(Order $order, int $rating, ?string $reviewText, User $client): Order
    {
        if ($order->client_id !== $client->id) {
            throw new Exception("Only the client can complete this order.");
        }

        if ($order->status !== OrderStatus::Submitted) {
            throw new Exception("Order must be submitted to be completed.");
        }

        DB::transaction(function () use ($order, $rating, $reviewText, $client) {
            $order->status = OrderStatus::Completed;
            $order->save();

            Review::create([
                'order_id' => $order->id,
                'client_id' => $client->id,
                'rating' => $rating,
                'review_text' => $reviewText,
            ]);
        });

        event(new OrderCompleted($order));

        return $order;
    }

    public function requestRevision(Order $order, string $message, array $files, User $client): Order
    {
        if ($order->status !== OrderStatus::Submitted) {
            throw new Exception("Order must be submitted to request a revision.");
        }

        $service = $order->service;
        $revisionCount = $order->revisionCount();

        DB::transaction(function () use ($order, $message, $files, $client, $service, $revisionCount) {
            
            // Check if extra revision fee applies
            if ($revisionCount >= $service->revisions && $service->extra_revision_cost > 0) {
                $this->walletService->spend(
                    $client,
                    $service->extra_revision_cost,
                    'revision_charge',
                    $order->id,
                    "Extra revision charge for Order #{$order->id}",
                    "ORDER-{$order->id}-REV"
                );
            }

            $revision = Revision::create([
                'order_id' => $order->id,
                'message' => $message,
                'status' => 'requested',
            ]);

            foreach ($files as $file) {
                $path = $file->store('order-assets', 'public');
                OrderAsset::create([
                    'order_id' => $order->id,
                    'type' => 'reference',
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }

            // Set to RevisionRequested (worker then moves it to InProgress later)
            $order->status = OrderStatus::RevisionRequested;
            $order->save();

            event(new RevisionRequested($order, $revision));
        });

        return $order;
    }

    public function cancel(Order $order, string $reason, User $admin): Order
    {
        if ($order->isCompleted()) {
            throw new Exception("Completed orders cannot be cancelled.");
        }

        DB::transaction(function () use ($order, $reason) {
            
            // Refund client if credits were used
            if ($order->credits_used > 0) {
                $this->walletService->topup(
                    $order->client,
                    $order->credits_used,
                    null,
                    "ORDER-{$order->id}-REFUND",
                    'order_refund',
                    $order->id,
                    "Refund for cancelled Order #{$order->id}"
                );
            }

            $order->status = OrderStatus::Cancelled;
            $order->cancellation_reason = $reason;
            $order->save();
        });

        event(new OrderCancelled($order));

        return $order;
    }
}
