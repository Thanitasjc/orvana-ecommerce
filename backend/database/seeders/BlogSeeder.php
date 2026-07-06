<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => "The 'Boomerang' Employees Returning After Quitting",
                'slug' => 'boomerang-employees',
                'excerpt' => 'Why employees are coming back and what brands can learn from the boomerang trend.',
                'content' => '<p>Many professionals are returning to former employers after exploring new opportunities elsewhere. For fashion and retail brands, this shift creates a chance to rebuild culture with clearer growth paths.</p><p>Strong onboarding, flexible schedules, and meaningful benefits are becoming key reasons people choose to return.</p>',
                'image' => '/assets/img/blog/2/blog-1.jpg',
                'tags' => ['Fashion', 'Lift Style', 'News'],
                'author' => 'AESTHETE Editorial',
                'published_at' => now()->subMonths(2),
            ],
            [
                'title' => 'Fast fashion: How clothes are linked to climate change',
                'slug' => 'fast-fashion-climate-change',
                'excerpt' => 'A closer look at how production cycles and consumer habits affect sustainability goals.',
                'content' => '<p>Fast fashion has reshaped how quickly collections reach stores, but the environmental cost is significant. Brands are now investing in recycled materials and transparent supply chains.</p><p>Customers increasingly reward companies that communicate honest sustainability efforts.</p>',
                'image' => '/assets/img/blog/2/blog-2.jpg',
                'tags' => ['Fashion', 'Lift Style', 'News'],
                'author' => 'AESTHETE Editorial',
                'published_at' => now()->subMonths(3),
            ],
            [
                'title' => 'The Sound Of Fashion: Malcolm McLaren Words',
                'slug' => 'sound-of-fashion',
                'excerpt' => 'How music, attitude, and visual identity continue to influence modern streetwear culture.',
                'content' => '<p>Fashion and music have always moved together. From punk to hip-hop, cultural movements continue to define what people wear on the street and online.</p><p>Today\'s brands collaborate with artists to create limited drops that feel authentic to both worlds.</p>',
                'image' => '/assets/img/blog/2/blog-3.jpg',
                'tags' => ['Fashion', 'Lift Style', 'News'],
                'author' => 'AESTHETE Editorial',
                'published_at' => now()->subMonths(4),
            ],
        ];

        foreach ($posts as $post) {
            Blog::query()->updateOrCreate(
                ['slug' => $post['slug']],
                [
                    ...$post,
                    'is_published' => true,
                ],
            );
        }
    }
}
