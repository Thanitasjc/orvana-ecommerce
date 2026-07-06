<?php

namespace App\Services;

use App\Models\CmsHomepageSetting;

class HeaderCmsService
{
    public const KEY = 'header';

    public function get(): array
    {
        $row = CmsHomepageSetting::query()->where('key', self::KEY)->first();

        if ($row?->payload) {
            return $this->mergeDefaults($row->payload);
        }

        return $this->defaults();
    }

    public function save(array $payload): array
    {
        $normalized = $this->mergeDefaults($payload);

        CmsHomepageSetting::query()->updateOrCreate(
            ['key' => self::KEY],
            ['payload' => $normalized],
        );

        return $normalized;
    }

    private function mergeDefaults(array $payload): array
    {
        $defaults = $this->defaults();
        $menuItems = $payload['menuItems'] ?? $defaults['menuItems'];

        if (! is_array($menuItems)) {
            $menuItems = $defaults['menuItems'];
        }

        return [
            'logoUrl' => filled($payload['logoUrl'] ?? null) ? $payload['logoUrl'] : $defaults['logoUrl'],
            'logoAlt' => filled($payload['logoAlt'] ?? null) ? $payload['logoAlt'] : $defaults['logoAlt'],
            'menuItems' => array_values($menuItems),
        ];
    }

    private function defaults(): array
    {
        return [
            'logoUrl' => '/assets/img/logo/logo.svg',
            'logoAlt' => 'AESTHETE',
            'menuItems' => [
                [
                    'id' => 'menu-home',
                    'label' => 'หน้าแรก',
                    'href' => '/',
                    'sortOrder' => 0,
                    'enabled' => true,
                ],
                [
                    'id' => 'menu-shop',
                    'label' => 'ร้านค้า',
                    'href' => '/shop',
                    'sortOrder' => 1,
                    'enabled' => true,
                ],
                [
                    'id' => 'menu-coupons',
                    'label' => 'คูปอง',
                    'href' => '/coupons',
                    'sortOrder' => 2,
                    'enabled' => true,
                ],
            ],
        ];
    }
}
