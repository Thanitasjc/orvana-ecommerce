<section class="s-blog-grid flat-spacing">
    <div class="container">
        @if ($blogPosts->isNotEmpty())
            <div class="tf-grid-layout sm-col-2 xl-col-3">
                @foreach ($blogPosts as $post)
                    @include('frontend::components.partials.blog-card', [
                        'post' => $post,
                        'locale' => $locale ?? config('locales.default', 'th'),
                    ])
                @endforeach
            </div>
            <div class="mt-4">
                {{ $blogPosts->withQueryString()->links() }}
            </div>
        @else
            <div class="text-center py-5">
                <p class="text-primary h5 mb-2">ยังไม่มีบทความ — เพิ่มได้ที่ Admin → บทความ</p>
                <p class="text-body-large">ตรวจสอบว่าเปิด <strong>เผยแพร่</strong> กรอกหัวข้อ (ไทย) และ <strong>วันที่เผยแพร่</strong> ว่างหรือไม่เกินวันนี้</p>
            </div>
        @endif
    </div>
</section>
