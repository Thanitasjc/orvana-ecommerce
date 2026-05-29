<?php

namespace App\Filament\Support;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;

class TranslatableTabs
{
    /**
     * @param  callable(string $locale): array<int, \Filament\Forms\Components\Component>  $fieldsFactory
     * @return array<int, Tabs>
     */
    public static function make(string $label, callable $fieldsFactory): array
    {
        $tabs = [];

        foreach (config('locales.supported', ['th' => 'ไทย', 'en' => 'English']) as $locale => $localeLabel) {
            $tabs[] = Tab::make($locale)
                ->label($localeLabel)
                ->schema($fieldsFactory($locale));
        }

        return [
            Tabs::make($label)
                ->tabs($tabs)
                ->columnSpanFull(),
        ];
    }

    public static function textInput(string $field, string $label, bool $required = false): callable
    {
        return fn (string $locale) => [
            TextInput::make("{$field}.{$locale}")
                ->label("{$label} ({$locale})")
                ->required($required && $locale === config('locales.default', 'th')),
        ];
    }

    public static function textarea(string $field, string $label): callable
    {
        return fn (string $locale) => [
            Textarea::make("{$field}.{$locale}")
                ->label("{$label} ({$locale})")
                ->rows(3),
        ];
    }

    public static function richEditor(string $field, string $label): callable
    {
        return fn (string $locale) => [
            RichEditor::make("{$field}.{$locale}")
                ->label("{$label} ({$locale})")
                ->columnSpanFull(),
        ];
    }
}
