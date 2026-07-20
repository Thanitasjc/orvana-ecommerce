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
        $request->validate([
            'logoUrl' => ['required', 'string', 'max:500'],
            'logoAlt' => ['required', 'string', 'max:100'],
            'menuItems' => ['required', 'array'],
            'menuItems.*.id' => ['required', 'string', 'max:100'],
            'menuItems.*.label' => ['required', 'string', 'max:100'],
            'menuItems.*.href' => ['required', 'string', 'max:500'],
            'menuItems.*.sortOrder' => ['required', 'integer', 'min:0'],
            'menuItems.*.enabled' => ['required', 'boolean'],
            'menuItems.*.megaMenu' => ['nullable', 'array'],
            'topbar' => ['required', 'array'],
            'topbar.enabled' => ['required', 'boolean'],
            'topbar.phone' => ['nullable', 'string', 'max:50'],
            'topbar.defaultLanguage' => ['required', 'string', 'max:20'],
            'topbar.languages' => ['required', 'array'],
            'topbar.languages.*.code' => ['required', 'string', 'max:20'],
            'topbar.languages.*.label' => ['required', 'string', 'max:50'],
            'topbar.languages.*.enabled' => ['required', 'boolean'],
            'topbar.socialLinks' => ['required', 'array'],
            'topbar.socialLinks.*.id' => ['required', 'string', 'max:100'],
            'topbar.socialLinks.*.platform' => ['required', 'string', 'max:20'],
            'topbar.socialLinks.*.label' => ['required', 'string', 'max:100'],
            'topbar.socialLinks.*.url' => ['nullable', 'string', 'max:500'],
            'topbar.socialLinks.*.iconClass' => ['nullable', 'string', 'max:100'],
            'topbar.socialLinks.*.imageUrl' => ['nullable', 'string', 'max:500'],
            'topbar.socialLinks.*.sortOrder' => ['required', 'integer', 'min:0'],
            'topbar.socialLinks.*.enabled' => ['required', 'boolean'],
        ]);

        $saved = $this->cms->save($request->only([
            'logoUrl',
            'logoAlt',
            'menuItems',
            'topbar',
        ]));

        return response()->json([
            'data' => $saved,
        ]);
    }
}
