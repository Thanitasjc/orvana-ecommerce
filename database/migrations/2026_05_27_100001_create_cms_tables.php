<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->json('name');
            $table->json('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('sku')->nullable();
            $table->json('name');
            $table->json('short_description')->nullable();
            $table->json('description')->nullable();
            $table->string('image')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->json('title');
            $table->json('excerpt')->nullable();
            $table->json('content')->nullable();
            $table->string('image')->nullable();
            $table->string('author')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->json('name');
            $table->json('short_description')->nullable();
            $table->json('description')->nullable();
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('placement')->default('home_slider');
            $table->json('title');
            $table->json('subtitle')->nullable();
            $table->json('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->json('role')->nullable();
            $table->json('content');
            $table->string('image')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('services');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
