<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminBlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Blog::query()->orderByDesc('published_at')->orderByDesc('id');

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($builder) use ($term) {
                $builder->where('title', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%")
                    ->orWhere('excerpt', 'like', "%{$term}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->string('status') === 'published') {
                $query->where('is_published', true);
            } elseif ($request->string('status') === 'draft') {
                $query->where('is_published', false);
            }
        }

        $paginator = $query->paginate(15);

        return response()->json([
            'data' => $paginator->getCollection()->map(fn (Blog $blog) => $this->formatBlog($blog, true))->values(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }

    public function show(Blog $blog): JsonResponse
    {
        return response()->json(['data' => $this->formatBlog($blog, true)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateBlog($request);

        $blog = Blog::create([
            'title' => $validated['title'],
            'slug' => $this->resolveSlug($validated['slug'] ?? null, $validated['title']),
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'image' => $validated['image'] ?? null,
            'tags' => array_values($validated['tags'] ?? []),
            'author' => $validated['author'] ?? 'Admin',
            'is_published' => $validated['is_published'] ?? true,
            'published_at' => $validated['published_at'] ?? now(),
        ]);

        return response()->json(['data' => $this->formatBlog($blog, true)], 201);
    }

    public function update(Request $request, Blog $blog): JsonResponse
    {
        $validated = $this->validateBlog($request, $blog);

        $updates = collect($validated)->except(['slug'])->filter(fn ($value) => $value !== null)->all();

        if (array_key_exists('tags', $validated)) {
            $updates['tags'] = array_values($validated['tags'] ?? []);
        }

        if (array_key_exists('slug', $validated) && filled($validated['slug'])) {
            $updates['slug'] = $this->resolveSlug($validated['slug'], $validated['title'] ?? $blog->title, $blog->id);
        }

        if ($updates !== []) {
            $blog->update($updates);
        }

        return response()->json(['data' => $this->formatBlog($blog->fresh(), true)]);
    }

    public function destroy(Blog $blog): JsonResponse
    {
        $blog->delete();

        return response()->json(['message' => 'ลบบทความแล้ว']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:4096'],
        ]);

        $path = $validated['image']->store('blogs', 'public');

        return response()->json([
            'path' => '/storage/'.$path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateBlog(Request $request, ?Blog $blog = null): array
    {
        $slugRule = ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'];
        if ($blog) {
            $slugRule[] = Rule::unique('blogs', 'slug')->ignore($blog->id);
        } else {
            $slugRule[] = Rule::unique('blogs', 'slug');
        }

        return $request->validate([
            'title' => [$blog ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => $slugRule,
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'author' => ['nullable', 'string', 'max:100'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ]);
    }

    private function resolveSlug(?string $slug, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $title);
        if ($base === '') {
            $base = 'blog-post';
        }

        $candidate = $base;
        $suffix = 1;

        while (
            Blog::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatBlog(Blog $blog, bool $includeContent = false): array
    {
        $payload = [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'excerpt' => $blog->excerpt,
            'image' => $blog->image,
            'tags' => $blog->tags ?? [],
            'author' => $blog->author,
            'is_published' => $blog->is_published,
            'published_at' => $blog->published_at?->toIso8601String(),
            'created_at' => $blog->created_at?->toIso8601String(),
            'updated_at' => $blog->updated_at?->toIso8601String(),
        ];

        if ($includeContent) {
            $payload['content'] = $blog->content;
        }

        return $payload;
    }
}
