<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\HomepageCmsService;
use Illuminate\Http\JsonResponse;

class HomepageCmsController extends Controller
{
    public function __construct(private HomepageCmsService $cms) {}

    public function show(): JsonResponse
    {
        return response()->json([
            'data' => $this->cms->get(),
        ]);
    }
}
