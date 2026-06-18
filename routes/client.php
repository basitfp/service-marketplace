<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Client\DashboardController;
use App\Http\Controllers\Client\ServiceController;
use App\Http\Controllers\Client\CartController;
use App\Http\Controllers\Client\CheckoutController;
use App\Http\Controllers\Client\OrderController;
use App\Http\Controllers\Client\OrderCommentController;
use App\Http\Controllers\Client\WalletController;
use App\Http\Controllers\Client\ProfileController;

// Dashboard
Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Service catalog
Route::get('services',          [ServiceController::class, 'index'])->name('services.index');
Route::get('services/{service}', [ServiceController::class, 'show'])->name('services.show');

// Cart — order matters: DELETE cart (clear all) must come BEFORE DELETE cart/{id} (remove one)
Route::get('cart',            [CartController::class, 'index'])->name('cart.index');
Route::post('cart',           [CartController::class, 'add'])->name('cart.add');
Route::put('cart/{id}',       [CartController::class, 'update'])->name('cart.update');
Route::delete('cart',         [CartController::class, 'clear'])->name('cart.clear');
Route::delete('cart/{id}',    [CartController::class, 'remove'])->name('cart.remove');

// Checkout
Route::get('checkout',  [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');

// Orders
Route::resource('orders', OrderController::class)->only(['index', 'show']);
Route::post('orders/{order}/comments',                    [OrderCommentController::class, 'store'])->name('orders.comments.store');
Route::post('orders/{order}/complete',                    [OrderController::class, 'complete'])->name('orders.complete');
Route::post('orders/{order}/request-revision',            [OrderController::class, 'requestRevision'])->name('orders.request-revision');
Route::post('orders/{order}/escalate',                    [OrderController::class, 'escalate'])->name('orders.escalate');
Route::get('orders/{order}/assets/{asset}/download',      [OrderController::class, 'downloadAsset'])->name('orders.assets.download');

// Wallet
Route::get('wallet',              [WalletController::class, 'index'])->name('wallet.index');
Route::get('wallet/topup',        [WalletController::class, 'topup'])->name('wallet.topup');
Route::get('wallet/transactions', [WalletController::class, 'transactions'])->name('transactions.index');
Route::post('wallet/checkout',    [WalletController::class, 'createCheckoutSession'])->name('wallet.checkout');
Route::get('wallet/topup/success', [WalletController::class, 'topupSuccess'])->name('wallet.topup.success');
Route::get('wallet/topup/cancel',  [WalletController::class, 'topupCancel'])->name('wallet.topup.cancel');

// Profile
Route::get('profile',          [ProfileController::class, 'index'])->name('profile.index');
Route::put('profile',          [ProfileController::class, 'update'])->name('profile.update');
Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
