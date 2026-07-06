<?php

namespace App\Services;

use App\Models\CmsHomepageSetting;

class HomepageCmsService
{
    public const KEY = 'homepage';

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

        return [
            'heroSlides' => $payload['heroSlides'] ?? $defaults['heroSlides'],
            'customerFavorite' => array_merge(
                $defaults['customerFavorite'],
                $payload['customerFavorite'] ?? [],
            ),
            'featuredProducts' => array_merge(
                $defaults['featuredProducts'],
                $payload['featuredProducts'] ?? [],
            ),
        ];
    }

    private function defaults(): array
    {
        return [
            'heroSlides' => [
                [
                    'id' => 'hero-1',
                    'adminName' => 'Slide 1 — Hero with text',
                    'mediaType' => 'image',
                    'sortOrder' => 0,
                    'enabled' => true,
                    'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=2000',
                    'title' => 'Apple Style Ecommerce',
                    'subtitle' => 'ประสบการณ์ช้อปปิ้งระดับพรีเมียม พร้อมสินค้าและโปรโมชั่นพิเศษ',
                    'ctaLabel' => 'Shop Now',
                    'ctaUrl' => '/shop',
                    'showCta' => true,
                ],
                [
                    'id' => 'hero-2',
                    'adminName' => 'Slide 2 — New Collection',
                    'mediaType' => 'image',
                    'sortOrder' => 1,
                    'enabled' => true,
                    'image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=2000',
                    'title' => 'New Collection 2026',
                    'subtitle' => 'ดีไซน์เรียบหรู พร้อมเทคโนโลยีล่าสุดสำหรับทุกไลฟ์สไตล์',
                    'ctaLabel' => 'Explore',
                    'ctaUrl' => '/shop',
                    'showCta' => true,
                ],
                [
                    'id' => 'hero-3',
                    'adminName' => 'Slide 3 — Premium Accessories',
                    'mediaType' => 'youtube',
                    'sortOrder' => 2,
                    'enabled' => true,
                    'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=2000',
                    'youtubeId' => 'x5hkD526A5M',
                    'title' => 'Premium Accessories',
                    'subtitle' => 'อุปกรณ์เสริมคุณภาพสูง',
                    'showCta' => false,
                ],
            ],
            'customerFavorite' => [
                'title' => 'Customer Favorite Style Product',
                'subtitle' => 'สินค้ายอดนิยมที่ลูกค้าเลือกซื้อมากที่สุด',
                'enabled' => true,
                'items' => [],
            ],
            'featuredProducts' => [
                'title' => 'Featured Products',
                'subtitle' => 'สินค้าแนะนำพิเศษบนหน้าแรก',
                'enabled' => true,
                'items' => [],
            ],
        ];
    }
}
