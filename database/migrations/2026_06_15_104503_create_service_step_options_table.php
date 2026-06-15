<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_step_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_step_id')->constrained('service_steps')->cascadeOnDelete();
            $table->string('label', 255);
            $table->text('description')->nullable();
            $table->unsignedInteger('credit_cost')->default(0);
            $table->boolean('is_default')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_step_options');
    }
};
