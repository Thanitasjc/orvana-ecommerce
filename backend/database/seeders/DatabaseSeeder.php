<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(OmnichannelSeeder::class);
        $this->call(PaymentMethodSeeder::class);
        $this->call(CouponSeeder::class);
        $this->call(BlogSeeder::class);
    }
}
