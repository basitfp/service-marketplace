<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Worker\DashboardController;
use App\Http\Controllers\Worker\OrderController;
use App\Http\Controllers\Worker\OrderCommentController;
use App\Http\Controllers\Worker\ProfileController;

Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('orders', OrderController::class)->only(['index', 'show']);
Route::post('orders/{order}/submit-delivery', [OrderController::class, 'submitDelivery'])->name('orders.submit-delivery');
Route::post('orders/{order}/comments', [OrderCommentController::class, 'store'])->name('orders.comments.store');

Route::get('profile', [ProfileController::class, 'index'])->name('profile.index');
Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
