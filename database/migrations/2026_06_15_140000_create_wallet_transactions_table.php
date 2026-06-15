<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('order_id')->nullable()->constrained('orders');
            $table->enum('type', ['credit_purchase', 'order_payment', 'order_refund', 'revision_charge']);
            $table->unsignedInteger('credits');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('reference', 255)->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
