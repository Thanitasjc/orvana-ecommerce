<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OmnichannelSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@aesthete.local'],
            [
                'name' => 'ผู้ดูแลระบบ',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
            ],
        );

        User::updateOrCreate(
            ['email' => 'cashier@aesthete.local'],
            [
                'name' => 'พนักงานขายหน้าร้าน',
                'password' => 'password',
                'role' => User::ROLE_CASHIER,
            ],
        );

        $categories = [
            ['name' => 'เสื้อยืด & เสื้อเชิ้ต', 'slug' => 'tops'],
            ['name' => 'แจ็กเก็ต & คาร์ดิแกน', 'slug' => 'outerwear'],
            ['name' => 'กางเกง & กระโปรง', 'slug' => 'bottoms'],
            ['name' => 'เดรส', 'slug' => 'dresses'],
            ['name' => 'เครื่องประดับ & กระเป๋า', 'slug' => 'accessories'],
        ];

        $categoryMap = [];
        foreach ($categories as $cat) {
            $categoryMap[$cat['slug']] = Category::updateOrCreate(
                ['slug' => $cat['slug']],
                ['name' => $cat['name']],
            );
        }

        $products = [
            [
                'name' => 'Minimalist Autumn Blazer',
                'slug' => 'minimalist-autumn-blazer',
                'category' => 'outerwear',
                'price' => 1890,
                'cost' => 850,
                'featured' => true,
                'variations' => [
                    ['Cream', 'S', 5], ['Cream', 'M', 8], ['Cream', 'L', 4],
                    ['Charcoal Black', 'M', 10], ['Warm Taupe', 'L', 3],
                ],
            ],
            [
                'name' => 'Oversized Premium Cotton Tee',
                'slug' => 'oversized-premium-cotton-tee',
                'category' => 'tops',
                'price' => 590,
                'cost' => 220,
                'featured' => true,
                'variations' => [
                    ['White', 'M', 15], ['White', 'L', 18],
                    ['Heather Gray', 'L', 14], ['Navy Blue', 'XL', 10],
                ],
            ],
            [
                'name' => 'Linen Summer Wrap Dress',
                'slug' => 'linen-summer-wrap-dress',
                'category' => 'dresses',
                'price' => 1450,
                'cost' => 600,
                'featured' => true,
                'variations' => [
                    ['Olive Green', 'M', 6], ['Oatmeal', 'S', 5], ['Blush Pink', 'L', 1],
                ],
            ],
            [
                'name' => 'Urban Cargo Pants Modern Fit',
                'slug' => 'urban-cargo-pants-modern-fit',
                'category' => 'bottoms',
                'price' => 1290,
                'cost' => 520,
                'featured' => false,
                'variations' => [
                    ['Army Green', 'M', 9], ['Black', 'L', 8], ['Sand Khaki', 'XL', 3],
                ],
            ],
            [
                'name' => 'Cropped Heavyweight Denim Jacket',
                'slug' => 'cropped-heavyweight-denim-jacket',
                'category' => 'outerwear',
                'price' => 1950,
                'cost' => 900,
                'featured' => false,
                'variations' => [
                    ['Indigo Wash', 'M', 5], ['Light Acid Wash', 'L', 1],
                ],
            ],
            [
                'name' => 'Aesthetic Tan Leather Crossbody',
                'slug' => 'aesthetic-tan-leather-crossbody',
                'category' => 'accessories',
                'price' => 2450,
                'cost' => 1100,
                'featured' => true,
                'variations' => [
                    ['Tan Gold', 'One Size', 12], ['Matte Black', 'One Size', 15],
                ],
            ],
            [
                'name' => 'Boys Graphic T-Shirt',
                'slug' => 'boys-graphic-t-shirt',
                'category' => 'tops',
                'price' => 650,
                'cost' => 280,
                'featured' => true,
                'description' => 'เสื้อยืดกราฟิกสำหรับเด็กชาย ผ้านุ่ม สวมใส่สบาย เลือกลายและสีได้หลากหลาย',
                'variations' => [
                    ['Orange', 'S', 12], ['Orange', 'M', 15], ['Orange', 'L', 10],
                    ['Tan', 'S', 8], ['Tan', 'M', 12], ['Tan', 'L', 9],
                    ['Green', 'S', 10], ['Green', 'M', 14], ['Green', 'L', 7],
                    ['Pink', 'S', 11], ['Pink', 'M', 13], ['Pink', 'L', 6],
                ],
            ],
        ];

        $boysGraphicGallery = [
            ['thumb' => '/assets/img/product/boys-graphic-t-shirt/orange.png', 'main' => '/assets/img/product/boys-graphic-t-shirt/orange.png'],
            ['thumb' => '/assets/img/product/boys-graphic-t-shirt/tan.png', 'main' => '/assets/img/product/boys-graphic-t-shirt/tan.png'],
            ['thumb' => '/assets/img/product/boys-graphic-t-shirt/green.png', 'main' => '/assets/img/product/boys-graphic-t-shirt/green.png'],
            ['thumb' => '/assets/img/product/boys-graphic-t-shirt/pink.png', 'main' => '/assets/img/product/boys-graphic-t-shirt/pink.png'],
        ];

        $imageMap = [
            'minimalist-autumn-blazer' => '/assets/img/product/slider/product-slider-1.jpg',
            'oversized-premium-cotton-tee' => '/assets/img/product/2/prodcut-3.jpg',
            'linen-summer-wrap-dress' => '/assets/img/product/trending/trending-1.jpg',
            'urban-cargo-pants-modern-fit' => '/assets/img/product/2/prodcut-7.jpg',
            'cropped-heavyweight-denim-jacket' => '/assets/img/product/slider/product-slider-4.jpg',
            'aesthetic-tan-leather-crossbody' => '/assets/img/product/2/prodcut-12.jpg',
            'boys-graphic-t-shirt' => '/assets/img/product/boys-graphic-t-shirt/orange.png',
        ];

        foreach ($products as $data) {
            $product = Product::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'category_id' => $categoryMap[$data['category']]->id,
                    'name' => $data['name'],
                    'description' => $data['description'] ?? 'สินค้าแฟชั่นจากคอลเลกชัน AESTHETE',
                    'price' => $data['price'],
                    'cost' => $data['cost'],
                    'is_featured' => $data['featured'],
                    'image' => $imageMap[$data['slug']] ?? '/assets/img/product/2/prodcut-1.jpg',
                    'images' => $data['slug'] === 'boys-graphic-t-shirt' ? $boysGraphicGallery : null,
                ],
            );

            foreach ($data['variations'] as [$color, $size, $stock]) {
                $sku = strtoupper(Str::slug($product->slug.'-'.$color.'-'.$size));
                ProductVariation::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'color' => $color,
                        'size' => $size,
                    ],
                    [
                        'sku' => $sku,
                        'stock' => $stock,
                    ],
                );
            }
        }

        $members = [
            ['name' => 'คุณ อนัญญา รักดี', 'email' => 'ananya@mail.com', 'phone' => '0812345678', 'points' => 340, 'tier' => 'Gold', 'total_spent' => 12400],
            ['name' => 'คุณ ภานุวัฒน์ แสงทวี', 'email' => 'panuwat@mail.com', 'phone' => '0898765432', 'points' => 120, 'tier' => 'Silver', 'total_spent' => 4500],
            ['name' => 'คุณ ณัฐรดา เกียรติสกุล', 'email' => 'nathrada@mail.com', 'phone' => '0854445555', 'points' => 850, 'tier' => 'Platinum', 'total_spent' => 28900],
            ['name' => 'คุณ วรวุฒิ นามสว่าง', 'email' => 'worawut@mail.com', 'phone' => '0871112233', 'points' => 45, 'tier' => 'Silver', 'total_spent' => 1800],
        ];

        foreach ($members as $member) {
            Customer::updateOrCreate(
                ['email' => $member['email']],
                array_merge($member, ['password' => 'password']),
            );
        }
    }
}
