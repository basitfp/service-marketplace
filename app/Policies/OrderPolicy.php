<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\OrderStatus;

class OrderPolicy
{
    /**
     * Any authenticated user can view the orders list
     * (controllers will scope the query by role).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Admin: always. Client: only their own. Worker: only if assigned.
     */
    public function view(User $user, Order $order): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        if ($user->role === UserRole::Client && $order->client_id === $user->id) {
            return true;
        }

        if ($user->role === UserRole::Worker && $order->worker_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Only admin can assign a worker to an order.
     */
    public function assign(User $user, Order $order): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only admin can cancel an order.
     */
    public function cancel(User $user, Order $order): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only the owning client can mark an order as completed.
     */
    public function complete(User $user, Order $order): bool
    {
        return $user->role === UserRole::Client && $order->client_id === $user->id;
    }

    /**
     * Only the owning client can request a revision,
     * and only when the order status is 'submitted'.
     */
    public function requestRevision(User $user, Order $order): bool
    {
        return $user->role === UserRole::Client
            && $order->client_id === $user->id
            && $order->status === OrderStatus::Submitted;
    }

    /**
     * Only the assigned worker can submit a delivery.
     */
    public function submitDelivery(User $user, Order $order): bool
    {
        return $user->role === UserRole::Worker
            && $order->worker_id === $user->id;
    }
}
