# AESTHETE Fashion — ระบบ Omnichannel (POS + E-Commerce)

โปรเจกต์ร้านแฟชั่นแบบ **Omnichannel**: สต็อกและออเดอร์รวมศูนย์ที่ Laravel API ขายได้ทั้ง **ร้านออนไลน์** (Shofy template), **POS หน้าร้าน** และ **หลังบ้าน Admin**

---

## โครงสร้างโปรเจกต์

```
project1/
├── frontend/          # Next.js 16 (App Router) — ร้าน + POS + Admin
├── backend/           # Laravel 12 API
├── scripts/           # deploy, sync Supabase
├── render.yaml        # Render Blueprint (API)
└── DEPLOY.md          # คู่มือ deploy แบบละเอียด
```

---

## สถาปัตยกรรม

| ชั้น | เทคโนโลยี | หน้าที่ |
|------|-----------|--------|
| ร้านออนไลน์ | Next.js + Shofy CSS | ลูกค้า / สมาชิก |
| POS | Next.js + Tailwind | พนักงานขายหน้าร้าน |
| Admin | Next.js + Tailwind | ผู้ดูแลระบบ |
| API | Laravel 12 + Sanctum | สินค้า, สต็อก, ออเดอร์, ชำระเงิน, loyalty |

### การแยก Login

| ระบบ | URL | ผู้ใช้ |
|------|-----|--------|
| สมาชิก | `/login`, `/account` | ลูกค้า (`customers`) |
| POS | `/pos/login` → `/pos` | `cashier` หรือ `admin` |
| Admin | `/admin/login` → `/admin` | `admin` เท่านั้น |

สมาชิกเข้า POS/Admin ไม่ได้ — แยก token และ middleware คนละชุด

---

## ฟีเจอร์หลัก (ที่ทำแล้ว)

### ร้านออนไลน์
- หน้าแรก + CMS (hero, header, curated products)
- สินค้า / SKU / gallery, ตะกร้า, wishlist, compare
- Checkout สมาชิก + Guest, คูปอง, วิธีจัดส่ง
- ชำระเงิน: โอนธนาคาร (อัปสลิป), COD, Omise บัตร, PromptPay QR
- บัญชีสมาชิก, แต้มสะสม, blog

### POS หน้าร้าน
- ค้นหาสินค้า, ตะกร้า, สมาชิก, คูปอง, สแกนคูปอง
- ชำระเงิน: เงินสด (ทอน), บัตรหน้าร้าน, PromptPay QR
- ใบเสร็จ + พิมพ์

### Admin
- Dashboard, สินค้า, หมวด, ออเดอร์ (export CSV), สมาชิก
- คูปอง, จัดส่ง, ช่องทางชำระเงิน, แต้มสะสม
- CMS หน้าร้าน, บทความ

### Omnichannel
- สต็อกกลาง (`product_variations`) — ตัดตอน checkout ด้วย transaction + `lockForUpdate()`
- **คืนสต็อก** เมื่อ Admin ตั้งออเดอร์เป็น `cancelled` หรือ `payment_status = refunded` (ครั้งเดียวต่อออเดอร์, บันทึก `stock_restored_at`)
- Loyalty: สะสม/แลกแต้ม, tier, คืนแต้มเมื่อยกเลิก

---

## ความต้องการของระบบ

- PHP 8.2+, Composer
- Node.js 20+, npm
- PostgreSQL (production) หรือ SQLite/MySQL (local)

---

## การติดตั้ง (Local)

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API: **http://localhost:8000/api/v1**

`.env` สำคัญ:
- `OMISE_PUBLIC_KEY` / `OMISE_SECRET_KEY` — ใส่ test keys เพื่อแสดงบัตร/PromptPay บน checkout (ดู `.env.example`)
- `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS` — สำหรับ CORS/cookie

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

เว็บ: **http://localhost:3000**  
`NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`

---

## บัญชีทดสอบ (หลัง seed)

| บทบาท | อีเมล | รหัสผ่าน | URL |
|--------|-------|----------|-----|
| Admin | `admin@aesthete.local` | `password` | http://localhost:3000/admin/login |
| POS | `cashier@aesthete.local` | `password` | http://localhost:3000/pos/login |
| สมาชิก | `ananya@mail.com` | `password` | http://localhost:3000/login |

สมาชิกอื่น: `panuwat@mail.com`, `nathrada@mail.com`, `worawut@mail.com` (รหัส `password`)

---

## API หลัก (v1)

### สาธารณะ
`GET /health`, `/categories`, `/products`, `/products/{slug}`, `/shipping/methods`, `/payment/methods`, `/checkout/guest`, `/checkout/orders/{orderNumber}`, Omise/slip endpoints

### สมาชิก
`POST /member/register|login`, `GET /member/me|orders`, `POST /member/checkout`

### POS (staff)
`GET /pos/products`, `/pos/payment-methods`, `/pos/customers/search`, `POST /pos/checkout`, Omise charge/refresh

### Admin (admin only)
Dashboard, CRUD สินค้า/หมวด/สมาชิก/คูปอง/จัดส่ง/ชำระเงิน/บล็อก, CMS, loyalty, `PATCH /admin/orders/{id}` (ยกเลิก/คืนเงิน → คืนสต็อก+แต้ม)

---

## เส้นทาง Frontend

| Path | คำอธิบาย |
|------|----------|
| `/`, `/shop`, `/products/[slug]` | ร้านออนไลน์ |
| `/cart`, `/checkout`, `/checkout/pay/[orderNumber]` | ตะกร้า + ชำระเงิน |
| `/account`, `/login`, `/register` | สมาชิก |
| `/pos/login`, `/pos` | POS |
| `/admin/login`, `/admin/*` | Admin |

---

## Deploy (Production)

| Service | URL | Auto-deploy |
|---------|-----|-------------|
| Frontend (Vercel) | https://frontend-beta-teal-71.vercel.app | Push `main` |
| API (Render) | https://aesthete-api.onrender.com | Push `main` |
| Database | Supabase PostgreSQL | migrate ด้วยมือ |

ตรวจ build API: `GET https://aesthete-api.onrender.com/api/v1/health`

```bash
# Migrate บน production (จากเครื่องที่มี DATABASE_URL)
cd backend
$env:DB_SCHEMA="aesthete"; php artisan migrate --force
```

รายละเอียดเพิ่ม: [DEPLOY.md](./DEPLOY.md)

---

## คำสั่งที่ใช้บ่อย

```bash
# Backend
cd backend && php artisan migrate --seed
cd backend && php artisan test
cd backend && php artisan serve

# Frontend
cd frontend && npm run dev
cd frontend && npm run build

# Sync catalog ไป Supabase
.\scripts\sync-to-supabase.ps1
```

---

## Phase ถัดไป (แนะนำ)

1. Omise **Live** keys + webhook `charge.complete`
2. Object storage (S3 / Supabase Storage) สำหรับสลิปและรูป
3. ตั้งค่า Mail (อีเมลยืนยันออเดอร์)
4. Workflow อนุมัติสลิปโอนใน Admin
5. Forgot/change password, ที่อยู่สมาชิก
6. Automated tests + CI

---

## หมายเหตุ

- API ใช้ **Bearer token** — ไม่ใช้ Sanctum CSRF cookie บน API routes
- Omise ตอนนี้ใช้ **Test Mode** — สแกน PromptPay จ่ายจริงต้องเปลี่ยน Live keys หลัง Omise อนุมัติบัญชี
- Template Shofy อยู่ใน `shofy-multipurpose-ecommerce-html-template-.../` (อ้างอิงเท่านั้น)

---

## ใบอนุญาต

โค้ดใน `frontend/` และ `backend/` เป็นของโปรเจกต์นี้  
Template Shofy — ตรวจสอบ license ก่อนใช้เชิงพาณิชย์
