<?php

declare(strict_types=1);

$viewsBase = dirname(__DIR__) . '/Modules/Frontend/resources/views';

function betweenService(string $html, string $start, string $end): string
{
    $s = strpos($html, $start);
    if ($s === false) {
        return '';
    }
    $s += strlen($start);
    $e = strpos($html, $end, $s);
    if ($e === false) {
        return '';
    }

    return trim(substr($html, $s, $e - $s));
}

function toBladeService(string $content): string
{
    $content = preg_replace(
        '/(src|href)=[\"\']assets\/([^\"\']+)[\"\']/',
        '$1="{{ asset(\'assets/$2\') }}"',
        $content
    );

    $replacements = [
        'href="index.html"' => 'href="{{ route(\'frontend.home\') }}"',
        'href="our-service-1.html"' => 'href="{{ route(\'frontend.services.index\') }}"',
        'href="service-detail.html"' => 'href="{{ route(\'frontend.services.detail\') }}"',
        'href="about-us.html"' => 'href="{{ route(\'frontend.about\') }}"',
        'href="contact.html"' => 'href="{{ route(\'frontend.contact\') }}"',
        'href="product-single-1.html"' => 'href="{{ route(\'frontend.product.single1\') }}"',
        'href="shop-left-sidebar.html"' => 'href="{{ route(\'frontend.shop.left-sidebar\') }}"',
        'href="shopping-cart.html"' => 'href="{{ route(\'frontend.shopping-cart\') }}"',
        'href="check-out.html"' => 'href="{{ route(\'frontend.checkout\') }}"',
        'href="blog-grid.html"' => 'href="{{ route(\'frontend.blog.grid\') }}"',
        'href="blog-post-2.html"' => 'href="{{ route(\'frontend.blog.post2\') }}"',
        'href="blog-post-1.html"' => 'href="{{ route(\'frontend.blog.post2\') }}"',
    ];

    return str_replace(array_keys($replacements), array_values($replacements), $content);
}

function convertServicePage(string $htmlPath, array $sections): void
{
    global $viewsBase;

    $html = file_get_contents($htmlPath);

    foreach ($sections as $path => [$start, $end]) {
        $content = betweenService($html, $start, $end);
        if ($content === '') {
            echo "WARN: empty section {$path}\n";
            continue;
        }
        $blade = toBladeService($content);
        $file = $viewsBase . '/' . $path . '.blade.php';
        $dir = dirname($file);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($file, $blade . "\n");
        echo "OK: {$path}\n";
    }
}

convertServicePage(dirname(__DIR__) . '/_html_source/our-service-1.html', [
    'components/service-page-title' => ['<!-- Page Title -->', '<!-- /Page Title -->'],
    'components/service-benefit' => ['<!-- Benefit -->', '<!-- /Benefit -->'],
    'components/service-list' => ['<!-- Service -->', '<!-- Section Organic -->'],
    'components/service-organic' => ['<!-- Section Organic -->', '<!-- /Section Organic -->'],
]);

convertServicePage(dirname(__DIR__) . '/_html_source/service-detail.html', [
    'components/service-detail-page-title' => ['<!-- Page Title -->', '<!-- /Page Title -->'],
    'components/service-detail' => ['<!-- Service Detail -->', '<!-- /Service Detail -->'],
]);

echo "Done.\n";

