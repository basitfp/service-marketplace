<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CategoryFieldController;
use App\Http\Controllers\Admin\CreditPackageController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\EscalationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\WorkerController;

Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('reports', [ReportController::class, 'revenue'])->name('reports.revenue');

Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');

Route::patch('categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status');
Route::post('categories/bulk-enable', [CategoryController::class, 'bulkEnable'])->name('categories.bulk-enable');
Route::post('categories/bulk-disable', [CategoryController::class, 'bulkDisable'])->name('categories.bulk-disable');
Route::post('categories/bulk-delete', [CategoryController::class, 'bulkDelete'])->name('categories.bulk-delete');

Route::patch('services/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');
Route::resource('services', ServiceController::class);

Route::patch('workers/{worker}/toggle-status', [WorkerController::class, 'toggleStatus'])->name('workers.toggle-status');
Route::resource('workers', WorkerController::class);

Route::post('orders/{order}/assign', [OrderController::class, 'assign'])->name('orders.assign');
Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
Route::get('orders/{order}/assets/{asset}/download', [OrderController::class, 'downloadAsset'])->name('orders.assets.download');
Route::resource('orders', OrderController::class)->only(['index', 'show']);

Route::patch('credit-packages/{creditPackage}/toggle', [CreditPackageController::class, 'toggle'])->name('credit-packages.toggle');
Route::resource('credit-packages', CreditPackageController::class)->only(['index', 'store', 'update', 'destroy']);

Route::resource('customers', CustomerController::class)->only(['index', 'show']);
Route::resource('transactions', TransactionController::class)->only(['index']);

Route::post('escalations/{escalation}/resolve', [EscalationController::class, 'resolve'])->name('escalations.resolve');
Route::resource('escalations', EscalationController::class)->only(['index', 'show']);

Route::prefix('services/{service}/steps')->name('services.steps.')->group(function () {
    Route::get('/', [ServiceController::class, 'steps'])->name('index');
    Route::post('/', [ServiceController::class, 'storeStep'])->name('store');
    Route::put('{step}', [ServiceController::class, 'updateStep'])->name('update');
    Route::delete('{step}', [ServiceController::class, 'destroyStep'])->name('destroy');
    Route::post('reorder', [ServiceController::class, 'reorderSteps'])->name('reorder');
});

Route::prefix('steps/{step}/options')->name('steps.options.')->group(function () {
    Route::post('/', [ServiceController::class, 'storeOption'])->name('store');
    Route::put('{option}', [ServiceController::class, 'updateOption'])->name('update');
    Route::delete('{option}', [ServiceController::class, 'destroyOption'])->name('destroy');
});

Route::prefix('categories/{category}/fields')->name('categories.fields.')->group(function () {
    Route::get('for-form', [CategoryFieldController::class, 'forForm'])->name('for-form');
    Route::post('reorder', [CategoryFieldController::class, 'reorder'])->name('reorder');
    Route::get('/', [CategoryFieldController::class, 'index'])->name('index');
    Route::post('/', [CategoryFieldController::class, 'store'])->name('store');
    Route::put('{field}', [CategoryFieldController::class, 'update'])->name('update');
    Route::delete('{field}', [CategoryFieldController::class, 'destroy'])->name('destroy');
});

Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
