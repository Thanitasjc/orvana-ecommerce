<?php

use App\Http\Controllers\Api\V1\Admin\AdminCmsController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\HomepageCmsController;
use App\Http\Controllers\Api\V1\MemberAuthController;
use App\Http\Controllers\Api\V1\MemberCheckoutController;
use App\Http\Controllers\Api\V1\Pos\PosCheckoutController;
use App\Http\Controllers\Api\V1\Pos\PosCustomerController;
use App\Http\Controllers\Api\V1\Pos\PosProductController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\StaffAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
  Route::get('categories', [CategoryController::class, 'index']);
  Route::get('products', [ProductController::class, 'index']);
  Route::get('products/{slug}', [ProductController::class, 'show']);
  Route::get('cms/homepage', [HomepageCmsController::class, 'show']);

  Route::prefix('member')->group(function () {
    Route::post('register', [MemberAuthController::class, 'register']);
    Route::post('login', [MemberAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'member'])->group(function () {
      Route::post('logout', [MemberAuthController::class, 'logout']);
      Route::get('me', [MemberAuthController::class, 'me']);
      Route::post('avatar', [MemberAuthController::class, 'updateAvatar']);
      Route::get('orders', [MemberCheckoutController::class, 'orders']);
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
      Route::get('customers/search', [PosCustomerController::class, 'search']);
      Route::post('customers', [PosCustomerController::class, 'store']);
      Route::post('checkout', [PosCheckoutController::class, 'store']);
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
    });
});
