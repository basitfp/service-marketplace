# ANTIGRAVITY — Gap Fix Guide (Phases 1–8)
> Fix all 8 audit gaps in order. Each fix is self-contained and safe to apply without breaking other logic.

---

## GAP 1 — `Category` model missing `services()` relationship
**Affects:** Phase 3 Step 3.2, Phase 5 Step 5.2  
**Risk if unfixed:** Delete guard in `CategoryService::delete()` throws `BadMethodCallException` at runtime. Deleting a category that has services will crash instead of returning a validation error.

**File:** `app/Models/Category.php`

Add this method inside the class:

```php
public function services(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(\App\Models\Service::class);
}
```

**Where to place it:** After the existing `scopeActive()` method, before the closing `}`.

**Do NOT change:** The `boot()` method, fillable, casts, or slug logic.

**Verify:** In Tinker run `Category::first()->services()->exists()` — should return `true` or `false` without error.

---

## GAP 2 — `Service` model missing `orders()` relationship
**Affects:** Phase 5 Step 5.2  
**Risk if unfixed:** `ServiceService::delete()` guard (`method_exists($service, 'orders')`) always returns `false`, so services with active orders can be deleted silently.

**File:** `app/Models/Service.php`

Add this method inside the class:

```php
public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(\App\Models\Order::class);
}
```

**Where to place it:** After the `eligibleWorkers()` method, before the closing `}`.

**Do NOT change:** Any existing relationships, boot(), fillable, or casts.

**Verify:** In Tinker run `Service::first()->orders()->exists()` — no error expected.

---

## GAP 3 — `StoreServiceRequest` missing per-item validation on `dynamic_fields`
**Affects:** Phase 5 Step 5.3  
**Risk if unfixed:** Malformed `dynamic_fields` payloads pass validation silently — bad data hits the DB.

**File:** `app/Http/Requests/StoreServiceRequest.php`

In the `rules()` method, find the `dynamic_fields` rule and replace it with these two lines:

```php
// Before:
'dynamic_fields'   => 'nullable|array',

// After:
'dynamic_fields'            => 'nullable|array',
'dynamic_fields.*.field_key' => 'required_with:dynamic_fields|string',
'dynamic_fields.*.value'     => 'nullable',
```

> **Note:** The codebase uses `field_key` (not `category_field_id`) as the item identifier — this is an intentional internal deviation from the guide's suggested format. Keep using `field_key` to stay consistent with `ServiceService::store()`.

**Do NOT change:** Any other rules, the authorize() method, or UpdateServiceRequest (apply the same change there separately if desired).

**Verify:** POST to `/admin/services` with `dynamic_fields: [{}]` (empty item) — should now return a 422 validation error.

---

## GAP 4 — `WorkerController::show()` has hardcoded stub order counts
**Affects:** Phase 6 Steps 6.2, 6.4  
**Risk if unfixed:** Worker show page always displays 0 active orders and 0 completed orders regardless of actual data.

**File:** `app/Http/Controllers/Admin/WorkerController.php`

In the `show()` method, find these two stub lines:

```php
$activeOrdersCount = 0;
$completedOrdersCount = 0;
```

Replace them with real queries:

```php
$activeOrdersCount = \App\Models\Order::where('worker_id', $worker->id)
    ->whereNotIn('status', ['completed', 'cancelled'])
    ->count();

$completedOrdersCount = \App\Models\Order::where('worker_id', $worker->id)
    ->where('status', 'completed')
    ->count();
```

**Do NOT change:** The Inertia return statement or any other part of the method. The variable names `$activeOrdersCount` and `$completedOrdersCount` must stay the same since the Show.jsx page already reads those prop names.

**Verify:** Create a test order assigned to a worker, visit `/admin/workers/{id}` — counts should reflect real data.

---

## GAP 5 — `OrderPolicy` not registered
**Affects:** Phase 7 Step 7.2  
**Risk if unfixed:** All `$this->authorize()` calls using `OrderPolicy` in `OrderController` fall through to Laravel's gate default (deny for non-super-admins), which can silently block or allow requests unpredictably.

**File:** `app/Providers/AppServiceProvider.php`

In the `boot()` method, add the OrderPolicy registration next to the existing CategoryPolicy line:

```php
// Existing line (already there):
\Illuminate\Support\Facades\Gate::policy(\App\Models\Category::class, \App\Policies\CategoryPolicy::class);

// Add this line directly below it:
\Illuminate\Support\Facades\Gate::policy(\App\Models\Order::class, \App\Policies\OrderPolicy::class);
```

**Do NOT change:** Anything else in AppServiceProvider. Do not move or touch the CategoryPolicy line.

**Verify:** In Tinker: `Gate::getPolicyFor(App\Models\Order::class)` — should return an `OrderPolicy` instance.

---

## GAP 6 — `OrderCancelled` event has no listener registered
**Affects:** Phase 7 Step 7.4  
**Risk if unfixed:** When an order is cancelled, the event fires but nobody listens — no notification is sent to the client or worker.

### Step A — Create the missing listener
**New file:** `app/Listeners/SendOrderCancelledNotification.php`

```php
<?php

namespace App\Listeners;

use App\Events\OrderCancelled;
use App\Notifications\OrderCancelledNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderCancelledNotification implements ShouldQueue
{
    public function handle(OrderCancelled $event): void
    {
        $order = $event->order;

        // Notify client
        if ($order->client) {
            $order->client->notify(new OrderCancelledNotification($order, 'client'));
        }

        // Notify worker if assigned
        if ($order->worker) {
            $order->worker->notify(new OrderCancelledNotification($order, 'worker'));
        }
    }
}
```

> If `OrderCancelledNotification` doesn't exist yet, create it following the same pattern as `OrderAssignedNotification` — constructor takes `($order, $recipientRole)`, channels are `['database', 'mail']`.

### Step B — Register in EventServiceProvider

**File:** `app/Providers/EventServiceProvider.php`

In the `$listen` array, add:

```php
\App\Events\OrderCancelled::class => [
    \App\Listeners\SendOrderCancelledNotification::class,
],
```

**Do NOT change:** Any existing event→listener mappings.

**Verify:** Cancel a test order — check `notifications` table for a new row with `type = OrderCancelledNotification`.

---

## GAP 7 — Admin Dashboard uses local inline `StatCard` instead of shared component
**Affects:** Phase 8 Step 8.2  
**Risk if unfixed:** Any future update to the shared `StatCard` component won't be reflected on the admin dashboard. Duplication debt.

**File:** `resources/js/Pages/Admin/Dashboard/Index.jsx`

At the top of the file, find the local inline StatCard definition (something like `const StatCard = ({ ... }) => { ... }`) and remove it entirely.

Then add the import at the top with the other imports:

```js
import StatCard from '@/Components/Common/StatCard';
```

Also find any local `STATUS_COLORS` constant defined inline in this file and remove it, replacing with:

```js
import { STATUS_COLORS } from '@/Utils/constants';
```

**Do NOT change:** The JSX that uses `<StatCard ... />` or `STATUS_COLORS[...]` — the prop API and color keys are the same in both the local and shared versions.

**Verify:** Hard reload `/admin/dashboard` — dashboard should render identically. Check browser console for no import errors.

---

## GAP 8 — Client wallet not created on registration
**Affects:** Pre-Phase 9 (required for Phase 9 Step 1)  
**Risk if unfixed:** New client registrations have no wallet row → any Phase 9 credit/purchase logic will throw a "wallet not found" error.

**File:** `app/Http/Controllers/Auth/RegisteredUserController.php`

In the `store()` method, after the `$user = User::create([...])` call, add:

```php
// Create wallet for new client
\App\Models\Wallet::create([
    'user_id' => $user->id,
    'balance' => 0,
]);
```

**Where to place it:** Immediately after the `User::create()` call and before the `event(new Registered($user))` line.

**Do NOT change:** The role hardcoding (`UserRole::Client`), the redirect, or the event dispatch.

**Verify:** Register a new account, then in Tinker: `\App\Models\Wallet::where('user_id', User::latest()->first()->id)->exists()` — should return `true`.

---

## Fix Order Recommendation

Apply in this sequence to avoid dependency issues:

| Order | Gap | Why This Order |
|-------|-----|----------------|
| 1 | Gap 1 (Category→services) | No dependencies |
| 2 | Gap 2 (Service→orders) | No dependencies |
| 3 | Gap 5 (OrderPolicy registration) | Must be registered before testing any order-related routes |
| 4 | Gap 6 (OrderCancelled listener) | Depends on OrderCancelledNotification existing |
| 5 | Gap 4 (Worker order counts) | Depends on Order model being queryable (Gap 2 done) |
| 6 | Gap 3 (StoreServiceRequest validation) | Standalone, safe anytime |
| 7 | Gap 7 (Dashboard StatCard import) | Pure UI, safe anytime |
| 8 | Gap 8 (Client wallet on register) | Do last — Phase 9 prep |

After all fixes, run:
```bash
php artisan optimize:clear
php artisan test
```

No migrations needed — all 8 gaps are code-only fixes.