# Deploy — Vercel + Render + Supabase

## 1) Supabase (PostgreSQL)

1. สร้างโปรเจกต์ที่ [Supabase](https://supabase.com)
2. ไปที่ **Project Settings → Database → Connection string (URI)**
3. คัดลอก `postgresql://...` (ใช้ **Session pooler** หรือ Direct ตามที่ Render รองรับ)

ตั้งค่าใน **Render** (Environment):

```env
DB_CONNECTION=pgsql
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> Laravel อ่าน `DATABASE_URL` อัตโนมัติเมื่อ `DB_CONNECTION=pgsql`

---

## 2) Render (Laravel API)

1. Push โค้ดขึ้น GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**
3. เชื่อม repo `orvana-ecommerce` (หรือ repo ของคุณ)
4. Render จะอ่าน `render.yaml` ที่ root
5. ตั้งค่า env ที่ยัง `sync: false`:
   - `APP_URL` = `https://aesthete-api.onrender.com` (URL จริงจาก Render)
   - `DATABASE_URL` = connection string จาก Supabase
   - `FRONTEND_URL` = URL Vercel (ขั้นตอนถัดไป)
   - `SANCTUM_STATEFUL_DOMAINS` = โดเมน Vercel (ไม่มี `https://`) เช่น `aesthete.vercel.app`

หลัง deploy สำเร็จ ทดสอบ:

```text
GET https://<render-url>/api/v1/categories
```

---

## 3) Vercel (Next.js Frontend)

1. [Vercel Dashboard](https://vercel.com) → **Add New Project**
2. Import repo จาก GitHub
3. **Root Directory** = `frontend`
4. Framework: Next.js (auto)
5. Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://<render-api-url>/api/v1
```

6. Deploy

---

## 4) หลัง deploy ครบ

| บริการ | URL ตัวอย่าง |
|--------|----------------|
| Frontend | `https://your-app.vercel.app` |
| API | `https://aesthete-api.onrender.com` |
| Database | Supabase Dashboard |

อัปเดต `FRONTEND_URL` และ `SANCTUM_STATEFUL_DOMAINS` บน Render ให้ตรงโดเมน Vercel แล้ว **Redeploy** API

---

## บัญชีทดสอบ (หลัง seed)

| บทบาท | อีเมล | รหัสผ่าน |
|--------|-------|----------|
| Admin | admin@aesthete.local | password |
| POS | cashier@aesthete.local | password |
