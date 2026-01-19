# Task Management API (Backend)

Sistem backend manajemen tugas yang robust dan skalabel, dibangun menggunakan **Fastify**, **Prisma**, dan **TypeScript**. Aplikasi ini dirancang untuk menangani struktur organisasi yang kompleks, manajemen proyek, dan pelacakan tugas dengan fitur monitoring bawaan.

## 🚀 Fitur Utama

- **Autentikasi & Keamanan**:
  - JWT-based authentication dengan support Refresh Token.
  - Proteksi CSRF (Cross-Site Request Forgery).
  - Keamanan header dengan `@fastify/helmet`.
  - Rate limiting untuk mencegah abuse API.
- **Manajemen Resource**:
  - **Organizations**: Struktur tingkat atas untuk memisahkan data antar entitas bisnis.
  - **Projects**: Pengelompokan tugas di dalam organisasi.
  - **Tasks**: Manajemen tugas dengan prioritas (Low to Urgent) dan status (Todo to Done).
  - **Memberships**: Role-based access control (RBAC) di tingkat organisasi dan proyek (Owner, Admin, Member).
- **Database & Data**:
  - **Prisma ORM**: Type-safe database queries.
  - **Soft Delete**: Data organisasi, proyek, dan tugas tidak dihapus permanen untuk keamanan data.
  - **Audit Logging**: Pelacakan aktivitas pengguna pada entitas penting.
- **Monitoring & Pemeliharaan**:
  - **Swagger UI**: Dokumentasi API interaktif yang dapat diakses di `/documentation`.
  - **Prometheus Metrics**: Endpoint `/metrics` untuk monitoring real-time.
  - **Database Seeder**: Data contoh untuk kemudahan pengembangan.

## 🛠️ Stack Teknologi

- **Runtime**: Node.js
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Validation**: Ajv (Built-in Fastify)
- **Monitoring**: Prometheus & Grafana support

## 📋 Prasyarat

- Node.js (v18+)
- PostgreSQL
- Docker (Opsional, untuk monitoring stack)

## 📦 Instalasi & Setup

1. **Install Dependensi**:

   ```bash
   npm install
   ```

2. **Konfigurasi Environment**:
   Salin file `.env.example` ke `.env` dan sesuaikan nilainya:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

3. **Sinkronisasi Database**:

   ```bash
   npx prisma db push
   ```

4. **Jalankan Seeder (Opsional)**:
   Untuk mengisi database dengan data contoh (termasuk admin user):
   ```bash
   npx prisma db seed
   ```
   _Default Admin: `admin@example.com` / `password123`_

## 🏃 Menjalankan Aplikasi

- **Mode Pengembangan (dengan hot-reload)**:
  ```bash
  npm run dev
  ```
- **Produksi**:
  ```bash
  npm run build
  ```

## 📖 Dokumentasi API

Dokumentasi lengkap API tersedia secara interaktif melalui Swagger. Setelah server berjalan, buka:

[http://localhost:3000/documentation](http://localhost:3000/documentation)

Setiap endpoint telah dikelompokkan berdasarkan resource (`Auth`, `Organization`, `Project`, `Task`, `User`) untuk kemudahan navigasi.

## 📁 Struktur Folder

```text
src/
├── libs/           # Utility dan konfigurasi (Prisma, Config)
├── modules/        # Domain logic terbagi per modul (Auth, Task, dll)
│   ├── [module]/
│   │   ├── [module].routes.ts
│   │   ├── [module].controller.ts
│   │   ├── [module].service.ts
│   │   ├── [module].schema.ts
│   │   └── [module].repository.ts
├── plugins/        # Plugin Fastify (Auth, Swagger, Error Handler)
├── metrics/        # Definisi metrik Prometheus
└── app.ts          # Registrasi plugin dan routes utama
```

## 🧪 Pengujian

Jalankan suite pengujian menggunakan Vitest:

```bash
npm test
```
