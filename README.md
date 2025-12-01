# PROJECT DEMO: ระบบประเมินนักศึกษาฝึกงาน (Backend)
This is a high-performance Backend API built with Elysia.js running on the Bun Runtime.
โปรเจกต์นี้ใช้ Prisma เป็น ORM สำหรับเชื่อมต่อกับ MongoDB และจัดการ Schema ของ Database

# Getting Started (Setup & Run)
เพื่อให้ Backend Server นี้ทำงานได้เต็มรูปแบบ คุณต้องตั้งค่า Database Connection และจัดการ Schema ให้เรียบร้อย

# 1. Prerequisites (สิ่งที่ต้องมีก่อนเริ่ม)
ต่อไปนี้คือสิ่งที่โปรเจกต์ต้องการ:

```
Node.js (v20.x.x+)
Bun Runtime (v1.3+)
Database Server: MongoDB (Cloud หรือ Local)
Frontend Server (Project Demo Frontend) รันอยู่ที่ Port 3000
```

# 2. Installation (ติดตั้ง Dependencies)
หลังจาก Clone Repository นี้มาแล้ว ให้เข้าไปในโฟลเดอร์โปรเจกต์ Backend และติดตั้ง Packages ทั้งหมด:

```
bun install
```

# 3. Environment Setup (กำหนดค่า Database)
สร้างไฟล์ชื่อ .env ใน Root Directory ของโปรเจกต์ (ระดับเดียวกับ package.json) และกำหนด URL สำหรับเชื่อมต่อ MongoDB Database:

```
.env
# ----------------------------------------------------
# ELYSIA BACKEND & PRISMA CONFIG
# ----------------------------------------------------

# MongoDB Atlas(Cloud) Connection String
# EXAMPLE: mongodb://user:password@host:port/databaseName
DATABASE_URL="<YOUR_MONGODB_CONNECTION_STRING_HERE>"

# Port สำหรับรัน Backend API (ใช้ 3001 เพื่อหลีกเลี่ยงการชนกับ Frontend:3000)
PORT=3001
```

# 4. Database Setup (สร้าง Schema และ Client)
เนื่องจากมีการใช้ Prisma คุณต้องสั่ง Generate Code และ Push Schema เข้าสู่ Database (รันเพียงครั้งเดียวในการ Setup ครั้งแรก):
Generate Prisma Client: สร้างโค้ดสำหรับเชื่อมต่อฐานข้อมูล

```
bun x prisma generate
```

Sync Database Schema (MongoDB): ตรวจสอบว่า DATABASE_URL ถูกต้อง และสั่งสร้าง/อัปเดต Collections ใน MongoDB
```
bun x prisma db push
```

# 5. Run Development Server
เมื่อตั้งค่า Environment และ Database เสร็จแล้ว ให้รัน Dev Server:

```
bun dev
```

Server จะรันอยู่ที่ http://localhost:3001

# โครงสร้างโค้ดสำคัญ
โครงสร้างไฟล์หลักของ Elysia.js + Bun:

src/index.ts: ไฟล์ Entry Point ของแอปพลิเคชัน และรวม Routes หลัก.
src/controllers/: ที่เก็บไฟล์ Route Group หรือ Plugins ที่จัดการ Logic ของ API แต่ละส่วน.
prisma/schema.prisma: ไฟล์กำหนด Schema ของ Database MongoDB.
