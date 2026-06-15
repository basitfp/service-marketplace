<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('image', 255)->nullable();
            $table->unsignedInteger('credit_cost');
            $table->unsignedInteger('delivery_days');
            $table->unsignedInteger('revisions')->default(1);
            $table->unsignedInteger('extra_revision_cost')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_deliverable')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
