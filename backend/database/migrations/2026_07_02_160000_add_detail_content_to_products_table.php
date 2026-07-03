<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('detail_content')->nullable()->after('description');
        });

        Product::query()
            ->where('slug', 'boys-graphic-t-shirt')
            ->update([
                'detail_content' => '<h3>คุณภาพจาก AESTHETE</h3><p>ผ้าคุณภาพ สวมใส่สบาย เหมาะสำหรับใช้งานประจำวัน<br>ดูแลรักษาง่าย ทรงสวยทันสมัย</p>',
            ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('detail_content');
        });
    }
};
