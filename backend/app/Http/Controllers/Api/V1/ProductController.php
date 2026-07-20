<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variations']);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $sort = $request->string('sort')->toString() ?: 'popular';
        match ($sort) {
            'price_asc' => $query->orderBy('price')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price')->orderBy('id'),
            'newest' => $query->orderByDesc('id'),
            'name' => $query->orderBy('name'),
            default => $query->orderByDesc('sales_count')->orderByDesc('id'),
        };

        $products = $query->paginate(12);

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'variations'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => $product]);
    }
}
