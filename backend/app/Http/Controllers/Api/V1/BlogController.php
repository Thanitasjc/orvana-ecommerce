<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Blog::query()
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($builder) use ($term) {
                $builder->where('title', 'like', "%{$term}%")
                    ->orWhere('excerpt', 'like', "%{$term}%");
            });
        }

        if ($request->filled('tag')) {
            $tag = $request->string('tag');
            $query->whereJsonContains('tags', $tag);
        }

        $paginator = $query->paginate($request->integer('per_page', 9));

        return response()->json([
            'data' => $paginator->getCollection()->map(fn (Blog $blog) => $this->formatBlog($blog))->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $blog = Blog::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json(['data' => $this->formatBlog($blog, true)]);
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
