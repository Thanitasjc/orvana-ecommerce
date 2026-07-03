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
        $query = Product::with(['category', 'variations'])->orderByDesc('sales_count');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where('name', 'like', "%{$search}%");
        }

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
