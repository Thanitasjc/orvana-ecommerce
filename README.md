# Project1 E-commerce System

ระบบ E-commerce บน Laravel 12 ที่แยก Frontend เป็น Module และใช้ Filament สำหรับ Admin Panel

## Overview

โปรเจกต์นี้รองรับการทำงานหลักดังนี้:

- แสดงสินค้า/หมวดหมู่/คอนเทนต์หน้าเว็บ
- ระบบลูกค้า (สมัครสมาชิก, เข้าสู่ระบบ, ออกจากระบบ)
- ระบบลูกค้าเพิ่มเติม (ลืมรหัสผ่าน, reset password, ยืนยันอีเมล, โปรไฟล์ลูกค้า)
- ระบบตะกร้าแบบใช้งานจริง
- Checkout สร้างออเดอร์จริง
- บันทึกการชำระเงิน
- ตัดสต็อกและเก็บประวัติสต็อก
- รองรับ payment webhook พร้อม signature verification
- หลังบ้านจัดการสินค้าและออเดอร์

## Tech Stack

- PHP `^8.2`
- Laravel `^12.0`
- Filament `^4.11`
- nwidart/laravel-modules `^12.0`
- spatie/laravel-translatable `^6.11.4`

ดูจาก `composer.json`

## Project Structure

### Core

- `app/Models` โมเดลหลักของระบบ
- `app/Services/Ecommerce` business logic ด้าน ecommerce
- `app/Filament/Resources` หลังบ้าน (Products, Orders, Inventory Transactions ฯลฯ)
- `config/ecommerce.php` ตั้งค่า webhook security และ admin notify

### Frontend Module

- `Modules/Frontend/routes/web.php` เส้นทางทั้งหมดของหน้าเว็บ
- `Modules/Frontend/app/Http/Controllers` controller ของหน้าเว็บ, cart, checkout, auth, webhook
- `Modules/Frontend/resources/views` blade templates และ partials

### Database

- `database/migrations` โครงสร้างฐานข้อมูล
- `database/seeders` ข้อมูลตั้งต้น (เช่น admin user)

## Main Database Tables

### Catalog/CMS

- `categories`
- `products`
- `banners`
- `services`
- `blog_posts`
- `testimonials`

### E-commerce

- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `inventory_transactions`

### Users

- `users` (มี `is_admin` สำหรับสิทธิ์เข้าหลังบ้าน)

## End-to-End Flow

1. ลูกค้าเข้าสู่ระบบ
2. เพิ่มสินค้าเข้าตะกร้า (`POST /cart/items`)
3. แก้จำนวน/ลบสินค้า (`PATCH/DELETE /cart/items/{item}`)
4. ลูกค้าต้องยืนยันอีเมลก่อน checkout
5. ระบบสร้าง `orders`, `order_items`, `payments` (checkout ตรวจสต็อกพอ แต่ยังไม่ตัด)
6. เมื่อออเดอร์เป็น `paid` → ตัดสต็อก + บันทึก `inventory_transactions` ประเภท `sale` (`OrderInventoryService`)
7. เมื่อออเดอร์เป็น `cancelled` → คืนสต็อก + บันทึก `return` (ถ้าเคยตัดไปแล้ว)
8. ระบบส่ง notification (order placed / status updated)
9. รองรับ webhook อัปเดตสถานะจ่ายเงิน (`POST /payments/webhook`) — `paid`/`cancelled` จัดการสต็อกเช่นกัน

## Important Routes

ดูไฟล์ `Modules/Frontend/routes/web.php`

- Home: `GET /`
- Product list: `GET /all-products/{category?}`
- Product detail: `GET /product-single-1/{slug}`
- Cart page: `GET /shopping-cart`
- Checkout page: `GET /check-out` (auth + verified required)
- Add cart: `POST /cart/items`
- Update cart item: `PATCH /cart/items/{item}`
- Remove cart item: `DELETE /cart/items/{item}`
- Place order: `POST /checkout/place-order` (auth + verified required)
- Payment webhook: `POST /payments/webhook`
- Auth forgot password: `POST /auth/forgot-password`
- Auth reset password form: `GET /auth/reset-password/{token}`
- Auth reset password submit: `POST /auth/reset-password`
- Email verify notice: `GET /email/verify`
- Email verify callback: `GET /email/verify/{id}/{hash}`
- Email resend verify: `POST /email/verification-notification`
- Customer profile: `GET /account/profile` + `POST /account/profile` (auth + verified required)
- Customer orders: `GET /account/orders` (auth + verified required)
- Customer order detail: `GET /account/orders/{order}` (auth + verified required)

## Payment Webhook Security

ระบบ webhook ตรวจสอบ signature แบบ HMAC SHA-256:

- Secret จาก env: `PAYMENT_WEBHOOK_SECRET`
- Header ชื่อจาก env: `PAYMENT_SIGNATURE_HEADER` (default: `X-Payment-Signature`)
- เปรียบเทียบค่า signature ก่อนประมวลผล
- หากไม่ถูกต้อง ตอบ `401 Invalid signature`

ตั้งค่าได้ที่ `config/ecommerce.php`

## Shipment Workflow

ระบบออเดอร์รองรับข้อมูลขนส่ง:

- `shipping_carrier`
- `tracking_number`
- `shipped_at`
- `delivered_at`
- `status_note`

และรองรับสถานะออเดอร์เช่น:

- `pending`
- `paid`
- `processing`
- `shipped`
- `completed`
- `cancelled`

## Notifications

ระบบมี notification หลัก:

- `OrderPlacedNotification`
- `OrderStatusUpdatedNotification`

ผ่าน service: `app/Services/Ecommerce/OrderNotificationService.php`

โดยส่งให้:

- ลูกค้า (owner ของ order หรือ customer email)
- แอดมิน (จาก `ECOMMERCE_ADMIN_EMAIL`)

## Customer Auth Flow (เพิ่มเติม)

### Register/Login/Logout

- สมัครสมาชิกผ่าน `POST /auth/register`
- เข้าสู่ระบบผ่าน `POST /auth/login`
- ออกจากระบบผ่าน `POST /auth/logout`

### Email Verification

- หลังสมัครสมาชิก ระบบส่งอีเมล verify
- ลูกค้าที่ไม่ verify จะเข้า checkout/account routes ที่บังคับ verified ไม่ได้
- หน้าแจ้งเตือน verify: `/email/verify`
- ขอส่งลิงก์ยืนยันใหม่: `POST /email/verification-notification`
- ถ้า `MAIL_MAILER=log` หรือ `array` หน้า `/email/verify` จะแสดงปุ่ม `Verify Email Now (Local)` สำหรับทดสอบในเครื่อง

### Forgot/Reset Password

- ส่งลิงก์ reset จาก modal forgot password (`POST /auth/forgot-password`)
- ฟอร์มตั้งรหัสใหม่ที่ `/auth/reset-password/{token}`
- submit รหัสใหม่ผ่าน `POST /auth/reset-password`

### Customer Profile

- หน้าโปรไฟล์ลูกค้า: `/account/profile`
- แก้ชื่อ/อีเมลได้
- ถ้าเปลี่ยนอีเมล ระบบจะ reset `email_verified_at` และส่ง verify mail ใหม่
- Header สำหรับผู้ใช้ที่ login แล้วมีทางลัด `My Profile`, `My Orders`, และ `Logout`

## Installation & Setup

### 1) Install dependencies

```bash
composer install
npm install
```

### 2) Environment

```bash
cp .env.example .env
php artisan key:generate
```

ตั้งค่าที่สำคัญใน `.env`:

- `APP_URL`
- `DB_*`
- `MAIL_*`
- `PAYMENT_WEBHOOK_SECRET`
- `PAYMENT_SIGNATURE_HEADER`
- `ECOMMERCE_ADMIN_EMAIL`

### 3) Database

```bash
php artisan migrate --force
php artisan db:seed
```

### 4) Storage link + Frontend assets

```bash
php artisan storage:link
npm run build
```

### 5) Run app

```bash
php artisan serve
```

## Admin Access

Seeder default admin (ดู `database/seeders/AdminUserSeeder.php`):

- Email: `admin@orvana.test`
- Password: `password`

Admin URL:

- `/admin`

จัดการผู้ใช้/เพิ่ม admin ใหม่: เมนู **ระบบ → ผู้ใช้** ใน Filament (`/admin/users`)

## Testing

รันเทสต์ทั้งหมด:

```bash
php artisan test
```

ไฟล์เทสต์หลัก:

- `tests/Feature/EcommerceFlowTest.php`

ครอบคลุม:

- checkout + order + inventory transaction
- webhook update payment/order status
- webhook invalid signature

## Dev Commands

รันโหมดพัฒนาแบบครบ (server, queue, logs, vite) ตาม `composer.json`:

```bash
composer run dev
```

## Troubleshooting

- รูปไม่ขึ้น: `php artisan storage:link`
- CSS/JS เก่า: `npm run build` แล้ว hard refresh
- เข้า admin ไม่ได้: รัน `php artisan db:seed --class=AdminUserSeeder`
- webhook fail: เช็ก `PAYMENT_WEBHOOK_SECRET` และ header signature
- cart/offcanvas แปลก: ล้าง browser cache และทดสอบใหม่
- เวลาใน admin ไม่ตรง: ตั้ง `APP_TIMEZONE=Asia/Bangkok` ใน `.env` แล้วรัน `php artisan config:clear` (ออเดอร์เก่าที่บันทึกตอน timezone เป็น UTC อาจยังเพี้ยน 7 ชม. — สั่งซื้อใหม่เพื่อทดสอบ หรือปรับ `placed_at` ในฐานข้อมูล)

## Production Recommendations

- เปลี่ยนรหัสผ่าน admin ทันที
- ตั้ง webhook secret ที่เดายาก
- ใช้ HTTPS จริง
- ตั้ง queue worker และ mail transport จริง
- สำรองฐานข้อมูลสม่ำเสมอ

## License

Internal project.
