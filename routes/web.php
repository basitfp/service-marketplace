<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebhookController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Stripe Webhook (OUTSIDE auth middleware)
Route::post('/stripe/webhook', [WebhookController::class, 'handleStripe'])
    ->name('stripe.webhook');

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('login');
});

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(base_path('routes/admin.php'));

Route::middleware(['auth', 'role:client'])
    ->prefix('client')
    ->name('client.')
    ->group(base_path('routes/client.php'));

Route::middleware(['auth', 'role:worker'])
    ->prefix('worker')
    ->name('worker.')
    ->group(base_path('routes/worker.php'));

Route::middleware('auth')->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
