<?php

declare(strict_types=1);

$viewsBase = dirname(__DIR__) . '/Modules/Frontend/resources/views';

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

function toBladeAboutContact(string $content): string
{
    $content = preg_replace(
        '/(src|href)=[\"\']assets\/([^\"\']+)[\"\']/',
        '$1="{{ asset(\'assets/$2\') }}"',
        $content
    );

    $replacements = [
        'href="index.html"' => 'href="{{ route(\'frontend.home\') }}"',
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

function convertAboutContactPage(string $htmlPath, array $sections): void
{
    global $viewsBase;

    $html = file_get_contents($htmlPath);

    foreach ($sections as $path => [$start, $end]) {
        $content = between($html, $start, $end);
        if ($content === '') {
            echo "WARN: empty section {$path}\n";
            continue;
        }
        $blade = toBladeAboutContact($content);
        $file = $viewsBase . '/' . $path . '.blade.php';
        $dir = dirname($file);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($file, $blade . "\n");
        echo "OK: {$path}\n";
    }
}

convertAboutContactPage(dirname(__DIR__) . '/_html_source/about-us.html', [
    'components/about-page-title' => ['<!-- Page Title -->', '<!-- /Page Title -->'],
    'components/about-intro' => ['<!-- Intro About -->', '<!-- /Intro About -->'],
    'components/about-history' => ['<!-- History -->', '<!-- /History -->'],
    'components/about-break-image' => ['<!-- Break Image -->', '<!-- /Break Image -->'],
    'components/about-service' => ['<!-- Service -->', '<!-- /Service -->'],
    'components/about-team' => ['<!-- Team -->', '<!-- /Team -->'],
    'components/about-break-line' => ['<!-- Break Line -->', '<!-- Testimonial -->'],
    'components/about-testimonial' => ['<!-- Testimonial -->', '<!-- /Testimonial -->'],
    'components/about-partner-contact' => ['<!-- Parner Contact -->', '<!-- /Parner Contact -->'],
    'components/about-gallery' => ['<!-- Gallery -->', '<!-- /Gallery -->'],
]);

convertAboutContactPage(dirname(__DIR__) . '/_html_source/contact.html', [
    'components/contact-page-title' => ['<!-- Page Title -->', '<!-- /Page Title -->'],
    'components/contact-content' => ['<!-- Contact -->', '<!-- /Contact -->'],
]);

echo "Done.\n";

