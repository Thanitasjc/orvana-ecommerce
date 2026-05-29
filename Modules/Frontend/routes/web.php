<?php

use Illuminate\Support\Facades\Route;
use Modules\Frontend\Http\Controllers\AccountOrderController;
use Modules\Frontend\Http\Controllers\AccountProfileController;
use Modules\Frontend\Http\Controllers\AuthController;
use Modules\Frontend\Http\Controllers\CartController;
use Modules\Frontend\Http\Controllers\CheckoutController;
use Modules\Frontend\Http\Controllers\FrontendController;
use Modules\Frontend\Http\Controllers\PaymentWebhookController;

Route::get('/', [FrontendController::class, 'index'])->name('frontend.home');
Route::get('/login', function () {
    return redirect()->route('frontend.home')->withErrors(['auth' => 'Please login first.']);
})->name('login');
Route::get('/product-single-1', [FrontendController::class, 'productSingle1'])->name('frontend.product.single1');
Route::get('/product-single-1/{slug}', [FrontendController::class, 'productShow'])->name('frontend.product.show');
Route::get('/all-products/{category?}', [FrontendController::class, 'shopLeftSidebar'])->name('frontend.shop.left-sidebar');
Route::get('/shop-left-sidebar/{category?}', function (?string $category = null) {
    return $category
        ? redirect("/all-products/{$category}", 301)
        : redirect('/all-products', 301);
});
Route::get('/shopping-cart', [FrontendController::class, 'shoppingCart'])->name('frontend.shopping-cart');
Route::get('/check-out', [FrontendController::class, 'checkout'])->middleware(['auth', 'verified'])->name('frontend.checkout');
Route::post('/cart/items', [CartController::class, 'add'])->name('frontend.cart.items.add');
Route::patch('/cart/items/{item}', [CartController::class, 'update'])->name('frontend.cart.items.update');
Route::delete('/cart/items/{item}', [CartController::class, 'destroy'])->name('frontend.cart.items.destroy');
Route::post('/checkout/place-order', [CheckoutController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('frontend.checkout.place-order');
Route::post('/payments/webhook', PaymentWebhookController::class)->name('frontend.payments.webhook');
Route::post('/auth/login', [AuthController::class, 'login'])->name('frontend.auth.login');
Route::post('/auth/register', [AuthController::class, 'register'])->name('frontend.auth.register');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth')->name('frontend.auth.logout');
Route::post('/auth/forgot-password', [AuthController::class, 'sendResetLink'])->name('frontend.auth.forgot-password');
Route::get('/auth/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
Route::get('/email/verify', [AuthController::class, 'verifyNotice'])->middleware('auth')->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['auth', 'signed'])
    ->name('verification.verify');
Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');
Route::get('/account/profile', [AccountProfileController::class, 'edit'])
    ->middleware(['auth', 'verified'])
    ->name('frontend.account.profile');
Route::post('/account/profile', [AccountProfileController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('frontend.account.profile.update');
Route::get('/account/orders', [AccountOrderController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('frontend.account.orders');
Route::get('/account/orders/{order}', [AccountOrderController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('frontend.account.orders.show');
Route::get('/blog-grid', [FrontendController::class, 'blogGrid'])->name('frontend.blog.grid');
Route::get('/blog/{slug}', [FrontendController::class, 'blogShow'])->name('frontend.blog.show');
Route::get('/blog-post-2', [FrontendController::class, 'blogPost2'])->name('frontend.blog.post2');
Route::get('/blog-post-2/{slug}', function (string $slug) {
    return redirect()->route('frontend.blog.show', $slug, status: 301);
});
Route::get('/about-us', [FrontendController::class, 'about'])->name('frontend.about');
Route::get('/contact', [FrontendController::class, 'contact'])->name('frontend.contact');
Route::get('/our-service-1', [FrontendController::class, 'servicesIndex'])->name('frontend.services.index');
Route::get('/service/{slug}', [FrontendController::class, 'servicesShow'])->name('frontend.services.show');
Route::get('/service-detail', [FrontendController::class, 'servicesDetail'])->name('frontend.services.detail');
