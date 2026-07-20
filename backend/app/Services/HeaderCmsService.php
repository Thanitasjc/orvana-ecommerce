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
            'menuItems' => array_values(array_map(
                fn (array $item, int $index) => $this->mergeMenuItem($item, $index, $defaults['menuItems']),
                $menuItems,
                array_keys($menuItems),
            )),
            'topbar' => $this->mergeTopbarDefaults($payload['topbar'] ?? []),
        ];
    }

    private function mergeMenuItem(array $item, int $index, array $defaultMenuItems): array
    {
        $fallback = collect($defaultMenuItems)->firstWhere('id', $item['id'] ?? null);
        $megaMenu = $item['megaMenu'] ?? ($fallback['megaMenu'] ?? null);

        return [
            'id' => filled($item['id'] ?? null) ? $item['id'] : ('menu-'.$index),
            'label' => filled($item['label'] ?? null) ? $item['label'] : ('Menu '.($index + 1)),
            'href' => filled($item['href'] ?? null) ? $item['href'] : '/',
            'sortOrder' => is_numeric($item['sortOrder'] ?? null) ? (int) $item['sortOrder'] : $index,
            'enabled' => array_key_exists('enabled', $item) ? (bool) $item['enabled'] : true,
            'megaMenu' => $this->mergeMegaMenu($megaMenu),
        ];
    }

    private function mergeMegaMenu(mixed $megaMenu): ?array
    {
        if (! is_array($megaMenu)) {
            return null;
        }

        $columns = $megaMenu['columns'] ?? [];
        $promos = $megaMenu['promos'] ?? [];

        if (! is_array($columns)) {
            $columns = [];
        }

        if (! is_array($promos)) {
            $promos = [];
        }

        return [
            'enabled' => array_key_exists('enabled', $megaMenu) ? (bool) $megaMenu['enabled'] : false,
            'columns' => array_values(array_map(function (array $column, int $index) {
                $links = $column['links'] ?? [];

                if (! is_array($links)) {
                    $links = [];
                }

                return [
                    'id' => filled($column['id'] ?? null) ? $column['id'] : ('mega-col-'.$index),
                    'title' => filled($column['title'] ?? null) ? $column['title'] : ('Column '.($index + 1)),
                    'sortOrder' => is_numeric($column['sortOrder'] ?? null) ? (int) $column['sortOrder'] : $index,
                    'enabled' => array_key_exists('enabled', $column) ? (bool) $column['enabled'] : true,
                    'links' => array_values(array_map(function (array $link, int $linkIndex) {
                        return [
                            'id' => filled($link['id'] ?? null) ? $link['id'] : ('mega-link-'.$linkIndex),
                            'label' => filled($link['label'] ?? null) ? $link['label'] : ('Link '.($linkIndex + 1)),
                            'href' => filled($link['href'] ?? null) ? $link['href'] : '/',
                            'sortOrder' => is_numeric($link['sortOrder'] ?? null) ? (int) $link['sortOrder'] : $linkIndex,
                            'enabled' => array_key_exists('enabled', $link) ? (bool) $link['enabled'] : true,
                        ];
                    }, $links, array_keys($links))),
                ];
            }, $columns, array_keys($columns))),
            'promos' => array_values(array_map(function (array $promo, int $index) {
                return [
                    'id' => filled($promo['id'] ?? null) ? $promo['id'] : ('mega-promo-'.$index),
                    'image' => filled($promo['image'] ?? null) ? $promo['image'] : '/assets/img/header/menu/menu-1.jpg',
                    'label' => filled($promo['label'] ?? null) ? $promo['label'] : ('Promo '.($index + 1)),
                    'href' => filled($promo['href'] ?? null) ? $promo['href'] : '/shop',
                    'sortOrder' => is_numeric($promo['sortOrder'] ?? null) ? (int) $promo['sortOrder'] : $index,
                    'enabled' => array_key_exists('enabled', $promo) ? (bool) $promo['enabled'] : true,
                ];
            }, $promos, array_keys($promos))),
        ];
    }

    private function mergeTopbarDefaults(array $topbar): array
    {
        $defaults = $this->defaults()['topbar'];
        $languages = $topbar['languages'] ?? $defaults['languages'];

        if (! is_array($languages) || count($languages) === 0) {
            $languages = $defaults['languages'];
        }

        $normalizedLanguages = array_values(array_map(function (array $language, int $index) {
            return [
                'code' => filled($language['code'] ?? null) ? $language['code'] : ('lang-'.$index),
                'label' => filled($language['label'] ?? null) ? $language['label'] : ('Language '.($index + 1)),
                'enabled' => array_key_exists('enabled', $language) ? (bool) $language['enabled'] : true,
            ];
        }, $languages, array_keys($languages)));

        $defaultLanguage = filled($topbar['defaultLanguage'] ?? null)
            ? $topbar['defaultLanguage']
            : $defaults['defaultLanguage'];

        $languageCodes = collect($normalizedLanguages)->pluck('code')->all();
        if (! in_array($defaultLanguage, $languageCodes, true)) {
            $defaultLanguage = $normalizedLanguages[0]['code'] ?? $defaults['defaultLanguage'];
        }

        return [
            'enabled' => array_key_exists('enabled', $topbar) ? (bool) $topbar['enabled'] : $defaults['enabled'],
            'phone' => filled($topbar['phone'] ?? null) ? $topbar['phone'] : $defaults['phone'],
            'defaultLanguage' => $defaultLanguage,
            'languages' => $normalizedLanguages,
            'socialLinks' => $this->mergeSocialLinks($topbar, $defaults['socialLinks']),
        ];
    }

    private function mergeSocialLinks(array $topbar, array $defaultLinks): array
    {
        $links = $topbar['socialLinks'] ?? null;

        if (! is_array($links) || count($links) === 0) {
            if (filled($topbar['facebookUrl'] ?? null)) {
                return [[
                    'id' => 'social-facebook',
                    'platform' => 'facebook',
                    'label' => 'Facebook',
                    'url' => $topbar['facebookUrl'],
                    'iconClass' => 'fa-brands fa-facebook-f',
                    'imageUrl' => '',
                    'sortOrder' => 0,
                    'enabled' => true,
                ]];
            }

            return $defaultLinks;
        }

        $platformIcons = [
            'facebook' => 'fa-brands fa-facebook-f',
            'line' => 'fa-brands fa-line',
            'youtube' => 'fa-brands fa-youtube',
            'instagram' => 'fa-brands fa-instagram',
            'tiktok' => 'fa-brands fa-tiktok',
            'x' => 'fa-brands fa-x-twitter',
            'custom' => 'fa-light fa-link',
        ];

        return array_values(array_map(function (array $link, int $index) use ($platformIcons) {
            $platform = filled($link['platform'] ?? null) ? $link['platform'] : 'custom';

            return [
                'id' => filled($link['id'] ?? null) ? $link['id'] : ('social-'.$index),
                'platform' => $platform,
                'label' => filled($link['label'] ?? null) ? $link['label'] : ucfirst($platform),
                'url' => filled($link['url'] ?? null) ? $link['url'] : '#',
                'iconClass' => filled($link['iconClass'] ?? null) ? $link['iconClass'] : ($platformIcons[$platform] ?? $platformIcons['custom']),
                'imageUrl' => $link['imageUrl'] ?? '',
                'sortOrder' => is_numeric($link['sortOrder'] ?? null) ? (int) $link['sortOrder'] : $index,
                'enabled' => array_key_exists('enabled', $link) ? (bool) $link['enabled'] : true,
            ];
        }, $links, array_keys($links)));
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
                    'megaMenu' => null,
                ],
                [
                    'id' => 'menu-shop',
                    'label' => 'ร้านค้า',
                    'href' => '/shop',
                    'sortOrder' => 1,
                    'enabled' => true,
                    'megaMenu' => [
                        'enabled' => true,
                        'columns' => [
                            [
                                'id' => 'mega-col-shop-pages',
                                'title' => 'Shop Pages',
                                'sortOrder' => 0,
                                'enabled' => true,
                                'links' => [
                                    ['id' => 'mega-link-1', 'label' => 'Grid Layout', 'href' => '/shop', 'sortOrder' => 0, 'enabled' => true],
                                    ['id' => 'mega-link-2', 'label' => 'Shop Categories', 'href' => '/shop', 'sortOrder' => 1, 'enabled' => true],
                                    ['id' => 'mega-link-3', 'label' => 'List Layout', 'href' => '/shop', 'sortOrder' => 2, 'enabled' => true],
                                    ['id' => 'mega-link-4', 'label' => 'Full width Layout', 'href' => '/shop', 'sortOrder' => 3, 'enabled' => true],
                                ],
                            ],
                            [
                                'id' => 'mega-col-features',
                                'title' => 'Features',
                                'sortOrder' => 1,
                                'enabled' => true,
                                'links' => [
                                    ['id' => 'mega-link-5', 'label' => 'Filter Dropdown', 'href' => '/shop', 'sortOrder' => 0, 'enabled' => true],
                                    ['id' => 'mega-link-6', 'label' => 'Filters Offcanvas', 'href' => '/shop', 'sortOrder' => 1, 'enabled' => true],
                                    ['id' => 'mega-link-7', 'label' => 'Filters Sidebar', 'href' => '/shop', 'sortOrder' => 2, 'enabled' => true],
                                    ['id' => 'mega-link-8', 'label' => 'Load More button', 'href' => '/shop', 'sortOrder' => 3, 'enabled' => true],
                                ],
                            ],
                            [
                                'id' => 'mega-col-hover',
                                'title' => 'Hover Style',
                                'sortOrder' => 2,
                                'enabled' => true,
                                'links' => [
                                    ['id' => 'mega-link-9', 'label' => 'Hover Style 1', 'href' => '/shop', 'sortOrder' => 0, 'enabled' => true],
                                    ['id' => 'mega-link-10', 'label' => 'Hover Style 2', 'href' => '/shop', 'sortOrder' => 1, 'enabled' => true],
                                    ['id' => 'mega-link-11', 'label' => 'Hover Style 3', 'href' => '/shop', 'sortOrder' => 2, 'enabled' => true],
                                    ['id' => 'mega-link-12', 'label' => 'Hover Style 4', 'href' => '/shop', 'sortOrder' => 3, 'enabled' => true],
                                ],
                            ],
                        ],
                        'promos' => [
                            [
                                'id' => 'mega-promo-1',
                                'image' => '/assets/img/header/menu/menu-1.jpg',
                                'label' => 'Phones',
                                'href' => '/shop',
                                'sortOrder' => 0,
                                'enabled' => true,
                            ],
                            [
                                'id' => 'mega-promo-2',
                                'image' => '/assets/img/header/menu/menu-2.jpg',
                                'label' => 'Headphones',
                                'href' => '/shop',
                                'sortOrder' => 1,
                                'enabled' => true,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'menu-coupons',
                    'label' => 'คูปอง',
                    'href' => '/coupons',
                    'sortOrder' => 2,
                    'enabled' => true,
                    'megaMenu' => null,
                ],
            ],
            'topbar' => [
                'enabled' => true,
                'phone' => '02-123-4567',
                'defaultLanguage' => 'th',
                'languages' => [
                    ['code' => 'th', 'label' => 'ไทย', 'enabled' => true],
                    ['code' => 'en', 'label' => 'English', 'enabled' => true],
                ],
                'socialLinks' => [
                    [
                        'id' => 'social-facebook',
                        'platform' => 'facebook',
                        'label' => 'Facebook',
                        'url' => 'https://facebook.com',
                        'iconClass' => 'fa-brands fa-facebook-f',
                        'imageUrl' => '',
                        'sortOrder' => 0,
                        'enabled' => true,
                    ],
                    [
                        'id' => 'social-line',
                        'platform' => 'line',
                        'label' => 'LINE',
                        'url' => 'https://line.me',
                        'iconClass' => 'fa-brands fa-line',
                        'imageUrl' => '',
                        'sortOrder' => 1,
                        'enabled' => true,
                    ],
                    [
                        'id' => 'social-youtube',
                        'platform' => 'youtube',
                        'label' => 'YouTube',
                        'url' => 'https://youtube.com',
                        'iconClass' => 'fa-brands fa-youtube',
                        'imageUrl' => '',
                        'sortOrder' => 2,
                        'enabled' => true,
                    ],
                ],
            ],
        ];
    }
}
