<?php

namespace App\Filament\Concerns;

trait MutatesTranslatable
{
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return $this->hydrateTranslatableFormData($data);
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return $this->hydrateTranslatableFormData($data);
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $record = $this->getRecord();

        if (! $record || ! method_exists($record, 'getTranslatableAttributes')) {
            return $data;
        }

        foreach ($record->getTranslatableAttributes() as $attribute) {
            foreach (array_keys(config('locales.supported', [])) as $locale) {
                $data[$attribute][$locale] = $record->getTranslation($attribute, $locale, false);
            }
        }

        return $data;
    }

    protected function hydrateTranslatableFormData(array $data): array
    {
        $model = static::getModel()::make();

        if (! method_exists($model, 'getTranslatableAttributes')) {
            return $data;
        }

        foreach ($model->getTranslatableAttributes() as $attribute) {
            if (! isset($data[$attribute]) || ! is_array($data[$attribute])) {
                continue;
            }

            $translations = array_filter(
                $data[$attribute],
                fn ($value) => $value !== null && $value !== ''
            );

            $data[$attribute] = $translations;
        }

        return $data;
    }
}
