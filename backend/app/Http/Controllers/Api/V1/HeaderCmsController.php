<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\HeaderCmsService;
use Illuminate\Http\JsonResponse;

class HeaderCmsController extends Controller
{
    public function __construct(private HeaderCmsService $cms) {}

    public function show(): JsonResponse
    {
        return response()->json([
            'data' => $this->cms->get(),
        ]);
    }
}
