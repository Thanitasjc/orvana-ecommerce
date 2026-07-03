<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->withCount('products')->orderBy('name');

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($builder) use ($term) {
                $builder->where('name', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%");
            });
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateCategory($request);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $this->resolveSlug($validated['slug'] ?? null, $validated['name']),
            'image' => $validated['image'] ?? null,
        ]);

        return response()->json(['data' => $this->formatCategory($category->loadCount('products'))], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $this->validateCategory($request, $category);

        $updates = collect($validated)->only(['name', 'image'])->filter(fn ($value) => $value !== null)->all();

        if (array_key_exists('slug', $validated) && filled($validated['slug'])) {
            $updates['slug'] = $this->resolveSlug($validated['slug'], $validated['name'] ?? $category->name, $category->id);
        }

        if (array_key_exists('name', $validated)) {
            $updates['name'] = $validated['name'];
        }

        if ($updates !== []) {
            $category->update($updates);
        }

        return response()->json(['data' => $this->formatCategory($category->fresh()->loadCount('products'))]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้ กรุณาย้ายหรือลบสินค้าก่อน',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'ลบหมวดหมู่แล้ว']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:4096'],
        ]);

        $path = $validated['image']->store('categories', 'public');

        return response()->json([
            'path' => '/storage/'.$path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateCategory(Request $request, ?Category $category = null): array
    {
        $slugRule = ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'];
        if ($category) {
            $slugRule[] = Rule::unique('categories', 'slug')->ignore($category->id);
        } else {
            $slugRule[] = Rule::unique('categories', 'slug');
        }

        return $request->validate([
            'name' => [$category ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => $slugRule,
            'image' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function resolveSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $name);
        if ($base === '') {
            $base = 'category';
        }

        $candidate = $base;
        $suffix = 1;

        while (
            Category::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCategory(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'image' => $category->image,
            'products_count' => $category->products_count ?? $category->products()->count(),
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];
    }
}
