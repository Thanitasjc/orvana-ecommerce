# AESTHETE Fashion — ระบบ Omnichannel (POS + E-Commerce)

โปรเจกต์ร้านแฟชั่นแบบ **Omnichannel**: สต็อกและออเดอร์รวมศูนย์ที่ Laravel ขายได้ทั้ง **ร้านออนไลน์** (Shofy template) และ **POS หน้าร้าน** พร้อม **หลังบ้าน Admin**

อ้างอิง logic จาก `omnichannel_fashion_pos_e_commerce.tsx` และ UI ร้านจากโฟลเดอร์ Shofy HTML template

---

## โครงสร้างโปรเจกต์

```
project1/
├── frontend/          # Next.js 16 (App Router) — หน้าบ้าน + POS + Admin
├── backend/           # Laravel 12 API — ธุรกิจ + ฐานข้อมูล
├── shofy-multipurpose-ecommerce-html-template-.../   # Template ต้นฉบับ (อ้างอิง)
└── omnichannel_fashion_pos_e_commerce.tsx            # Prototype React (อ้างอิง logic)
```

---

## สถาปัตยกรรม

| ชั้น | เทคโนโลยี | หน้าที่ |
|------|-----------|--------|
| ร้านออนไลน์ | Next.js + Shofy CSS | ลูกค้าทั่วไป / สมาชิก |
| POS | Next.js + Tailwind | พนักงานขายหน้าร้าน |
| Admin | Next.js + Tailwind | ผู้ดูแลระบบ |
| API | Laravel + Sanctum | สินค้า, สต็อก, ออเดอร์, loyalty |

### การแยก Login (สำคัญ)

| ระบบ | URL | ผู้ใช้ | เข้าได้ |
|------|-----|--------|--------|
| สมาชิก | `/login`, `/account` | ลูกค้า (`customers`) | บัญชีตัวเองเท่านั้น |
| POS | `/pos/login` → `/pos` | พนักงาน `cashier` หรือ `admin` | ขายหน้าร้าน |
| Admin | `/admin/login` → `/admin` | `admin` เท่านั้น | รายงาน / คลัง |

**สมาชิกไม่สามารถเข้า POS หรือ Admin** — แยก token, middleware และ guard คนละชุด

---

## ความต้องการของระบบ

- PHP 8.2+
- Composer
- Node.js 20+
- npm

---

## การติดตั้ง

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env   # ถ้ายังไม่มี .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API จะรันที่: **http://localhost:8000**  
Prefix: **http://localhost:8000/api/v1**

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

เว็บจะรันที่: **http://localhost:3000**

### 3. Assets Shofy

ไฟล์ CSS/รูปถูก copy ไปที่ `frontend/public/assets/` แล้ว (จาก template Shofy)

---

## บัญชีทดสอบ (หลัง seed)

| บทบาท | อีเมล | รหัสผ่าน |
|--------|-------|----------|
| Admin | `admin@aesthete.local` | `password` |
http://localhost:3000/admin/login
| พนักงาน POS | `cashier@aesthete.local` | `password` |
http://localhost:3000/pos/login

| สมาชิก | `ananya@mail.com` | `password` |

สมาชิกคนอื่น: `panuwat@mail.com`, `nathrada@mail.com`, `worawut@mail.com` (รหัสผ่าน `password`)

---

## API หลัก (v1)

### สาธารณะ

- `GET /api/v1/categories`
- `GET /api/v1/products`
- `GET /api/v1/products/{slug}`

### สมาชิก (`Authorization: Bearer` + token ของ Customer)

- `POST /api/v1/member/register`
- `POST /api/v1/member/login`
- `GET /api/v1/member/me`
- `GET /api/v1/member/orders`
- `POST /api/v1/member/checkout`

### พนักงาน

- `POST /api/v1/staff/pos/login` — cashier / admin
- `POST /api/v1/staff/admin/login` — admin เท่านั้น

### POS (ต้อง login พนักงาน)

- `GET /api/v1/pos/products`
- `GET /api/v1/pos/customers/search?q=`
- `POST /api/v1/pos/checkout`

### Admin

- `GET /api/v1/admin/dashboard`

---

## เส้นทาง Frontend

| Path | คำอธิบาย |
|------|----------|
| `/` | หน้าแรกร้าน (Shofy) |
| `/shop` | รายการสินค้า |
| `/products/[slug]` | รายละเอียดสินค้า + SKU |
| `/login`, `/register` | สมาชิก |
| `/account` | หลังบ้านสมาชิก (ต้อง login) |
| `/pos/login`, `/pos` | POS |
| `/admin/login`, `/admin` | Admin |

---

## Omnichannel — สต็อกกลาง

- ทุก SKU อยู่ในตาราง `product_variations`
- เมื่อ checkout (Online หรือ POS) ระบบใช้ **DB Transaction** + `lockForUpdate()` ตัดสต็อก
- สมาชิกได้แต้ม: ทุก 100 บาท = 1 แต้ม, อัป tier ตามยอดสะสม (Silver / Gold / Platinum)
- บริการหลัก: `InventoryService`, `OrderService`, `LoyaltyService`

---

## Phase ถัดไป (แนะนำ)

1. แปลง section ใน `index-2.html` เป็น React components เต็มรูปแบบ
2. ตะกร้าสินค้า (Zustand) + checkout ฝั่งร้าน
3. POS เต็มรูปแบบจาก prototype (ตะกร้า, ใบเสร็จ, เลือกสมาชิก)
4. Admin CRUD สินค้า / หมวด / รายงาน
5. Payment gateway, อีเมลแจ้งออเดอร์

---

## คำสั่งที่ใช้บ่อย

```bash
# Backend
cd backend && php artisan migrate:fresh --seed
cd backend && php artisan serve

# Frontend
cd frontend && npm run dev
cd frontend && npm run build

# Sync local catalog (products, categories) to Supabase production
.\scripts\sync-to-supabase.ps1
.\scripts\sync-to-supabase.ps1 -DryRun
.\scripts\sync-to-supabase.ps1 -DeployFrontend
```

---

## หมายเหตุ

- API ใช้ **Bearer token** (ไม่ใช้ Sanctum CSRF cookie) — ถ้าเจอ `CSRF token mismatch` ตรวจว่าไม่ได้เปิด `EnsureFrontendRequestsAreStateful` บน API routes ใน `bootstrap/app.php`
- Template Shofy ต้นฉบับอยู่ที่ `shofy-multipurpose-ecommerce-html-template-2025-09-17-10-18-00-utc/` — ไม่แก้ไขโดยตรง
- Prototype `omnichannel_fashion_pos_e_commerce.tsx` เก็บไว้เป็น reference สำหรับ POS/Admin UI

---

## ใบอนุญาต

โค้ดใน `frontend/` และ `backend/` เป็นของโปรเจกต์นี้  
Template Shofy เป็นไฟล์จากผู้ขาย template — ตรวจสอบ license ของ template ก่อนใช้งานเชิงพาณิชย์
