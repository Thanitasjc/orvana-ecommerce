<?php

namespace App\Models\Concerns;

trait HasTranslationsHelper
{
    public static function localeLabels(): array
    {
        return config('locales.supported', ['th' => 'ไทย', 'en' => 'English']);
    }
}
