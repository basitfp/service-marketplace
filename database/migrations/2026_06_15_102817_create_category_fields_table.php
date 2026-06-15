<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('label', 255);
            $table->string('field_key', 100);
            $table->enum('field_type', [
                'text', 'textarea', 'number', 'decimal', 'email', 'phone', 'date',
                'dropdown', 'multi_select', 'radio_group', 'checkbox_group', 'switch',
                'image_upload', 'file_upload', 'url', 'tags'
            ]);
            $table->string('placeholder', 255)->nullable();
            $table->text('help_text')->nullable();
            $table->text('default_value')->nullable();
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->string('min_value', 50)->nullable();
            $table->string('max_value', 50)->nullable();
            $table->integer('min_length')->nullable();
            $table->integer('max_length')->nullable();
            $table->string('allowed_extensions', 255)->nullable();
            $table->integer('max_file_size_mb')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Field key must be unique per category
            $table->unique(['category_id', 'field_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_fields');
    }
};
