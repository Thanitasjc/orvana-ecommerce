<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\HomepageCmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCmsController extends Controller
{
    public function __construct(private HomepageCmsService $cms) {}

    public function show(): JsonResponse
    {
        return response()->json([
            'data' => $this->cms->get(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'heroSlides' => ['required', 'array'],
            'customerFavorite' => ['required', 'array'],
            'productTabs' => ['sometimes', 'array'],
            'productTabs.*.id' => ['required', 'string'],
            'productTabs.*.label' => ['required', 'string', 'max:100'],
            'productTabs.*.categorySlugs' => ['sometimes', 'array'],
            'productTabs.*.categorySlugs.*' => ['string', 'max:255'],
            'productTabs.*.sortOrder' => ['sometimes', 'integer'],
            'productTabs.*.enabled' => ['sometimes', 'boolean'],
            'featuredProducts' => ['required', 'array'],
        ]);

        $saved = $this->cms->save($validated);

        return response()->json([
            'data' => $saved,
        ]);
    }
}
