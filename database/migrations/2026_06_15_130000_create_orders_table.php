<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('worker_id')->nullable()->constrained('users');
            $table->foreignId('service_id')->constrained('services');
            $table->enum('status', [
                'pending', 'assigned', 'in_progress', 'submitted',
                'revision_requested', 'completed', 'cancelled'
            ])->default('pending');
            $table->unsignedInteger('credits_used');
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
