<?php

use App\Http\Controllers\Api\V1\Admin\AdminHeaderCmsController;
use App\Http\Controllers\Api\V1\Admin\AdminCmsController;
use App\Http\Controllers\Api\V1\Admin\AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\AdminBlogController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminLoyaltyController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminPaymentMethodController;
use App\Http\Controllers\Api\V1\Admin\AdminShippingMethodController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\GuestCheckoutController;
use App\Http\Controllers\Api\V1\HeaderCmsController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\HomepageCmsController;
use App\Http\Controllers\Api\V1\LoyaltyController;
use App\Http\Controllers\Api\V1\MemberAuthController;
use App\Http\Controllers\Api\V1\MemberCheckoutController;
use App\Http\Controllers\Api\V1\MemberLoyaltyController;
use App\Http\Controllers\Api\V1\Pos\PosCheckoutController;
use App\Http\Controllers\Api\V1\Pos\PosOrderPaymentController;
use App\Http\Controllers\Api\V1\Pos\PosCustomerController;
use App\Http\Controllers\Api\V1\Pos\PosProductController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\OrderPaymentController;
use App\Http\Controllers\Api\V1\PaymentMethodController;
use App\Http\Controllers\Api\V1\ShippingController;
use App\Http\Controllers\Api\V1\StaffAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
  Route::get('health', [HealthController::class, 'show']);
  Route::get('categories', [CategoryController::class, 'index']);
  Route::get('products', [ProductController::class, 'index']);
  Route::get('products/{slug}', [ProductController::class, 'show']);
  Route::get('cms/homepage', [HomepageCmsController::class, 'show']);
  Route::get('cms/header', [HeaderCmsController::class, 'show']);
  Route::get('coupons', [CouponController::class, 'index']);
  Route::post('coupons/validate', [CouponController::class, 'validateCode']);
  Route::get('blogs', [BlogController::class, 'index']);
  Route::get('blogs/{slug}', [BlogController::class, 'show']);
  Route::get('loyalty/settings', [LoyaltyController::class, 'settings']);
  Route::post('loyalty/preview', [LoyaltyController::class, 'preview']);
  Route::post('checkout/guest', [GuestCheckoutController::class, 'store']);
  Route::get('shipping/methods', [ShippingController::class, 'index']);
  Route::get('payment/methods', [PaymentMethodController::class, 'index']);
  Route::get('checkout/orders/{orderNumber}', [OrderPaymentController::class, 'show']);
  Route::post('checkout/orders/{orderNumber}/slip', [OrderPaymentController::class, 'uploadSlip']);
  Route::post('checkout/orders/{orderNumber}/omise/charge', [OrderPaymentController::class, 'chargeOmise']);
  Route::get('checkout/orders/{orderNumber}/omise/refresh', [OrderPaymentController::class, 'refreshOmise']);

  Route::prefix('member')->group(function () {
    Route::post('register', [MemberAuthController::class, 'register']);
    Route::post('login', [MemberAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'member'])->group(function () {
      Route::post('logout', [MemberAuthController::class, 'logout']);
      Route::get('me', [MemberAuthController::class, 'me']);
      Route::post('avatar', [MemberAuthController::class, 'updateAvatar']);
      Route::get('orders', [MemberCheckoutController::class, 'orders']);
      Route::get('loyalty/transactions', [MemberLoyaltyController::class, 'transactions']);
      Route::post('checkout', [MemberCheckoutController::class, 'store']);
    });
  });

  Route::prefix('staff')->group(function () {
    Route::post('pos/login', [StaffAuthController::class, 'posLogin']);
    Route::post('admin/login', [StaffAuthController::class, 'adminLogin']);

    Route::middleware(['auth:sanctum', 'staff'])->group(function () {
      Route::post('logout', [StaffAuthController::class, 'logout']);
      Route::get('me', [StaffAuthController::class, 'me']);
    });
  });

  Route::prefix('pos')
    ->middleware(['auth:sanctum', 'staff', 'staff.role:cashier,admin'])
    ->group(function () {
      Route::get('products', [PosProductController::class, 'index']);
      Route::get('payment-methods', [PosOrderPaymentController::class, 'paymentMethods']);
      Route::get('customers/search', [PosCustomerController::class, 'search']);
      Route::post('customers', [PosCustomerController::class, 'store']);
      Route::post('checkout', [PosCheckoutController::class, 'store']);
      Route::get('orders/{orderNumber}', [PosOrderPaymentController::class, 'show']);
      Route::post('orders/{orderNumber}/omise/charge', [PosOrderPaymentController::class, 'chargeOmise']);
      Route::get('orders/{orderNumber}/omise/refresh', [PosOrderPaymentController::class, 'refreshOmise']);
    });

  Route::prefix('admin')
    ->middleware(['auth:sanctum', 'staff', 'staff.role:admin'])
    ->group(function () {
      Route::get('dashboard', [AdminDashboardController::class, 'summary']);
      Route::get('customers', [AdminCustomerController::class, 'index']);
      Route::post('customers', [AdminCustomerController::class, 'store']);
      Route::patch('customers/{customer}', [AdminCustomerController::class, 'update']);
      Route::delete('customers/{customer}', [AdminCustomerController::class, 'destroy']);
      Route::get('orders/export', [AdminOrderController::class, 'export']);
      Route::get('orders', [AdminOrderController::class, 'index']);
      Route::get('orders/{order}', [AdminOrderController::class, 'show']);
      Route::patch('orders/{order}', [AdminOrderController::class, 'update']);
      Route::get('categories', [AdminCategoryController::class, 'index']);
      Route::post('categories/upload-image', [AdminCategoryController::class, 'uploadImage']);
      Route::post('categories', [AdminCategoryController::class, 'store']);
      Route::patch('categories/{category}', [AdminCategoryController::class, 'update']);
      Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy']);
      Route::get('products', [AdminProductController::class, 'index']);
      Route::post('products/upload-image', [AdminProductController::class, 'uploadImage']);
      Route::post('products', [AdminProductController::class, 'store']);
      Route::get('products/{product}', [AdminProductController::class, 'show']);
      Route::patch('products/{product}', [AdminProductController::class, 'update']);
      Route::delete('products/{product}', [AdminProductController::class, 'destroy']);
      Route::get('cms/homepage', [AdminCmsController::class, 'show']);
      Route::patch('cms/homepage', [AdminCmsController::class, 'update']);
      Route::get('cms/header', [AdminHeaderCmsController::class, 'show']);
      Route::patch('cms/header', [AdminHeaderCmsController::class, 'update']);
      Route::get('coupons/reports/summary', [AdminCouponController::class, 'reportSummary']);
      Route::get('coupons/{coupon}/usages', [AdminCouponController::class, 'usages']);
      Route::get('coupons/{coupon}/codes', [AdminCouponController::class, 'codes']);
      Route::get('coupons', [AdminCouponController::class, 'index']);
      Route::post('coupons', [AdminCouponController::class, 'store']);
      Route::patch('coupons/{coupon}', [AdminCouponController::class, 'update']);
      Route::delete('coupons/{coupon}', [AdminCouponController::class, 'destroy']);
      Route::get('blogs', [AdminBlogController::class, 'index']);
      Route::post('blogs/upload-image', [AdminBlogController::class, 'uploadImage']);
      Route::post('blogs', [AdminBlogController::class, 'store']);
      Route::get('blogs/{blog}', [AdminBlogController::class, 'show']);
      Route::patch('blogs/{blog}', [AdminBlogController::class, 'update']);
      Route::delete('blogs/{blog}', [AdminBlogController::class, 'destroy']);
      Route::get('loyalty', [AdminLoyaltyController::class, 'show']);
      Route::patch('loyalty', [AdminLoyaltyController::class, 'update']);
      Route::get('shipping-methods', [AdminShippingMethodController::class, 'index']);
      Route::post('shipping-methods', [AdminShippingMethodController::class, 'store']);
      Route::patch('shipping-methods/{shippingMethod}', [AdminShippingMethodController::class, 'update']);
      Route::delete('shipping-methods/{shippingMethod}', [AdminShippingMethodController::class, 'destroy']);
      Route::get('payment-methods', [AdminPaymentMethodController::class, 'index']);
      Route::post('payment-methods', [AdminPaymentMethodController::class, 'store']);
      Route::patch('payment-methods/{paymentMethod}', [AdminPaymentMethodController::class, 'update']);
      Route::delete('payment-methods/{paymentMethod}', [AdminPaymentMethodController::class, 'destroy']);
      Route::get('customers/{customer}/loyalty-transactions', [AdminLoyaltyController::class, 'customerTransactions']);
    });
});
