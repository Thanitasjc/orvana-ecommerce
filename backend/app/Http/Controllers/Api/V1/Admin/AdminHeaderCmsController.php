<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\HeaderCmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminHeaderCmsController extends Controller
{
    public function __construct(private HeaderCmsService $cms) {}

    public function show(): JsonResponse
    {
        return response()->json([
            'data' => $this->cms->get(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'logoUrl' => ['required', 'string', 'max:500'],
            'logoAlt' => ['required', 'string', 'max:100'],
            'menuItems' => ['required', 'array'],
            'menuItems.*.id' => ['required', 'string', 'max:100'],
            'menuItems.*.label' => ['required', 'string', 'max:100'],
            'menuItems.*.href' => ['required', 'string', 'max:500'],
            'menuItems.*.sortOrder' => ['required', 'integer', 'min:0'],
            'menuItems.*.enabled' => ['required', 'boolean'],
        ]);

        $saved = $this->cms->save($validated);

        return response()->json([
            'data' => $saved,
        ]);
    }
}
