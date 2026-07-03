<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with([
            'category',
            'variations' => fn ($relation) => $relation->orderBy('color')->orderBy('size'),
        ])->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        return response()->json(['data' => $query->get()]);
    }
}
