<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('step_id')->constrained('service_steps');
            $table->foreignId('option_id')->constrained('service_step_options');
            $table->string('step_name', 255);
            $table->string('option_label', 255);
            $table->unsignedInteger('credit_cost')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_selections');
    }
};
