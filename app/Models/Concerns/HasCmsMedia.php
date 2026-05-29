<?php

namespace App\Models\Concerns;

use Illuminate\Support\Facades\Storage;

trait HasCmsMedia
{
    public function mediaUrl(?string $path = null, ?string $fallback = null): string
    {
        $path = $path ?? ($this->image ?? null);

        if (! $path) {
            return $fallback ?? '';
        }

        return Storage::disk('public')->url($path);
    }
}
