<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->text('message');
            $table->enum('status', ['requested', 'in_progress', 'resolved'])->default('requested');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisions');
    }
};
