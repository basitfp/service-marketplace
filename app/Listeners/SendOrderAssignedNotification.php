<?php

namespace App\Listeners;

use App\Events\OrderAssigned;
use App\Notifications\OrderAssignedNotification;
use Illuminate\Support\Facades\DB;

class SendOrderAssignedNotification
{
    public function handle(OrderAssigned $event): void
    {
        $order = $event->order->loadMissing(['client', 'worker', 'service']);

        if ($order->worker && $this->settingEnabled('notify_worker_on_new_order')) {
            $order->worker->notify(new OrderAssignedNotification($order, 'worker'));
        }

        if ($order->client && $this->settingEnabled('notify_client_on_order_accepted')) {
            $order->client->notify(new OrderAssignedNotification($order, 'client'));
        }
    }

    private function settingEnabled(string $key): bool
    {
        $value = DB::table('settings')->where('key', $key)->value('value');

        if ($value === null) {
            return true;
        }

        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true;
    }
}
