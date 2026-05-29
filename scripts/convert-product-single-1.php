<?php

declare(strict_types=1);

$htmlPath = dirname(__DIR__) . '/_html_source/product-single-1.html';
$viewsBase = dirname(__DIR__) . '/Modules/Frontend/resources/views';

$html = file_get_contents($htmlPath);

function between(string $html, string $start, string $end): string
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

function toBlade(string $content): string
{
    $content = preg_replace(
        '/(src|href)=["\']assets\/([^"\']+)["\']/',
        '$1="{{ asset(\'assets/$2\') }}"',
        $content
    );

    $content = str_replace('href="index.html"', 'href="{{ route(\'frontend.home\') }}"', $content);
    $content = str_replace('href="product-single-1.html"', 'href="{{ route(\'frontend.product.single1\') }}"', $content);
    $content = str_replace('href="shop-left-sidebar.html"', 'href="{{ route(\'frontend.shop.left-sidebar\') }}"', $content);
    $content = str_replace('href="shopping-cart.html"', 'href="{{ route(\'frontend.shopping-cart\') }}"', $content);
    $content = str_replace('href="check-out.html"', 'href="{{ route(\'frontend.checkout\') }}"', $content);

    return $content;
}

$sections = [
    'components/top-bar' => ['<!-- Top Bar-->', '<!-- /Top Bar -->'],
    'components/header-product' => ['<!-- Header -->', '<!-- /Header -->'],
    'components/page-title' => ['<!-- Page Title -->', '<!-- /Page Title -->'],
    'components/product-single' => ['<!-- Product Single -->', '<!-- /Product Single -->'],
    'components/product-description' => ['<!-- Product Description -->', '<!-- /Product Description -->'],
];

foreach ($sections as $path => [$start, $end]) {
    $content = between($html, $start, $end);
    if ($content === '') {
        echo "WARN: empty section {$path}\n";
        continue;
    }
    $blade = toBlade($content);
    $file = $viewsBase . '/' . $path . '.blade.php';
    $dir = dirname($file);
    if (! is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($file, $blade . "\n");
    echo "OK: {$path}\n";
}

echo "Done.\n";
