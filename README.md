# E-PRES • LogBook (Personal Electronic Attendance System)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%7C%2017-blue.svg)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-emerald.svg)](https://supabase.com/)
[![Vue 3](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-42b883.svg)](https://vuejs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://web.dev/progressive-web-apps/)

Aplikasi web presensi mandiri (*personal attendance system*) kelas *production* yang akurat, aman, dan siap audit. Dilengkapi dengan landing page publik *mobile-first*, jam digital presisi tersinkronisasi waktu server (WIB), validasi radius geofence kantor berbasis GPS, dashboard admin analitik dengan Chart.js, ekspor laporan PDF A4 siap cetak & CSV, dukungan PWA (*installable app*), serta kompatibilitas penuh dengan **Supabase PostgreSQL**.

---

## 🏛️ Arsitektur & Teknologi

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | Vue 3 (Composition API), Vite, Tailwind CSS, Pinia | UI reaktif, glassmorphism modern, dark/light mode, mobile-first |
| **Backend** | Node.js, Express.js | REST API arsitektural controller-service-repository |
| **Database** | PostgreSQL (Lokal / Docker / Supabase Cloud) | Knex.js query builder & skrip migrasi/seeder otomatis |
| **Keamanan** | JWT (HttpOnly Cookie), Bcrypt, Helmet, CORS, Rate Limiting | Perlindungan brute-force, XSS, dan CSRF |
| **Fitur Unggulan**| PWA (Vite PWA Plugin), PDFKit (Vektor A4), Luxon (WIB) | Dapat di-install ke HP/desktop, ekspor PDF tanpa headless browser |

### Struktur Direktori
```
LogBook/
├── docker-compose.yml              # Konfigurasi container PostgreSQL 16
├── package.json                    # Script root monorepo (concurrent dev, migrate, test)
├── README.md                       # Dokumentasi resmi proyek
├── .gitignore                      # Proteksi file rahasia (.env, keys, node_modules)
├── server/                         # Backend API (Node.js + Express.js)
│   ├── knexfile.js                 # Konfigurasi database Knex (Local & Supabase SSL)
│   ├── .env.example / .env         # Konfigurasi kredensial server
│   ├── src/
│   │   ├── config/                 # Konfigurasi database & env
│   │   ├── db/
│   │   │   ├── migrations/         # Migrasi skema database PostgreSQL
│   │   │   └── seeds/              # Seeder admin, jadwal, settings, & hari libur
│   │   ├── middleware/             # Auth JWT, rate limit, validasi Zod, error handler
│   │   ├── repositories/           # Layer akses query database terpusat
│   │   ├── services/               # Logika bisnis: keterlambatan, lembur, PDF generator
│   │   ├── controllers/            # Penanganan HTTP request/response
│   │   ├── routes/                 # Routing Express (/api/auth, /api/attendance, dll.)
│   │   ├── utils/                  # Helper Luxon Asia/Jakarta, rumus Haversine Geolocation
│   │   ├── validations/            # Skema validasi data request (Zod)
│   │   ├── app.js                  # Setup Express, CORS, Helmet, Cookie-parser
│   │   └── server.js               # Entrypoint HTTP server
│   └── tests/
│       ├── unit/                   # Unit test Vitest (kalkulasi jam kerja, lembur, toleransi)
│       └── integration/            # Integration test Supertest (alur API lengkap)
└── client/                         # Frontend SPA & PWA (Vue 3 + Vite + Tailwind CSS)
    ├── vite.config.js              # Proxy backend & konfigurasi Vite PWA
    ├── tailwind.config.js          # Brand palette, radius, dan styling
    ├── public/                     # Manifest web & ikon PWA (192x192, 512x512)
    └── src/
        ├── assets/                 # Gaya CSS, glassmorphism & glow effects
        ├── components/             # ClockWidget, Navbar, StatCard, ModalDialog, Toast
        ├── layouts/                # Layout shell dashboard & publik
        ├── router/                 # Vue Router + navigation guards (auth/guest)
        ├── stores/                 # Pinia: auth, attendance, theme, toast, pwa
        ├── services/               # Axios client dengan interceptor & auto-refresh token
        └── views/                  # LandingView, LoginView, Dashboard (Summary, List, Settings, Audit)
```

---

## ⚙️ Persyaratan Sistem
- **Node.js**: Versi LTS 18.x, 20.x, atau 22.x+
- **NPM**: Versi 9.x+
- **Database**:
  - Pilihan 1: **Supabase** (PostgreSQL Cloud gratis - Sangat direkomendasikan untuk deployment)
  - Pilihan 2: **Docker Compose**
  - Pilihan 3: **PostgreSQL Lokal**

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Klon Repositori
```bash
git clone https://github.com/tyasnurtaufiq/LogBook.git
cd LogBook
```

### 2. Instal Seluruh Dependensi (Root, Client, & Server)
```bash
npm run install:all
```

### 3. Konfigurasi Environment Variable
Salin file template konfigurasi di dalam folder `server`:
```bash
cd server
cp .env.example .env
```

Buka file `server/.env` dan tentukan database yang digunakan:

#### Opsi A: Menggunakan Supabase (Rekomendasi Cloud)
Gunakan connection pooler Supabase (mode Session, port 5432) yang mendukung IPv4 & IPv6:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
DATABASE_URL=postgresql://postgres.novlhygrbzrnclxbmzro:YOUR_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

JWT_ACCESS_SECRET=your_super_secret_access_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
TIMEZONE=Asia/Jakarta
```

#### Opsi B: Menggunakan Docker Compose Lokal
Jalankan container PostgreSQL lokal:
```bash
# Dari root direktori proyek
docker-compose up -d
```
Lalu konfigurasi `server/.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=epres_db
DB_SSL=false
```

---

### 4. Eksekusi Migrasi & Seeder Database
Dari direktori root proyek:
```bash
# Jalankan migrasi tabel
npm run migrate

# Masukkan data bawaan (admin, jadwal, hari libur)
npm run seed
```

> 🔑 **Kredensial Default Administrator:**
> - **Email**: `admin@epres.local`
> - **Password**: `Password123!`

---

### 5. Jalankan Aplikasi
Jalankan server backend dan client frontend secara bersamaan dengan satu perintah:
```bash
npm run dev
```

Aplikasi dapat langsung diakses di browser:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Pengujian Otomatis (Automated Tests)

Aplikasi memiliki rangkaian pengujian unit dan integrasi dengan **Vitest** dan **Supertest**:
```bash
# Jalankan test suite
npm run test:server
```

Cakupan pengujian:
- ✅ Perhitungan jam kerja, toleransi keterlambatan, dan lembur otomatis.
- ✅ Deteksi hari libur nasional & jadwal hari kerja fleksibel.
- ✅ Alur autentikasi JWT (Login, Refresh Token, Logout).
- ✅ Validasi larangan presensi duplikat per tanggal (409 Conflict).
- ✅ Pembuatan laporan PDF dan CSV.

---

## 📋 Fitur Utama Sistem

### 1. Halaman Presensi Publik (`/`)
- **Waktu Server Presisi**: Jam digital tersinkronisasi langsung dengan offset server WIB untuk mencegah manipulasi waktu lokal perangkat.
- **Action Button Cerdas**: Tombol *Absen Datang* dan *Absen Pulang* beradaptasi secara otomatis berdasarkan riwayat hari ini dengan debounce anti double-click.
- **Validasi Geofencing**: Deteksi GPS dengan formula Haversine untuk memastikan kehadiran berada dalam radius kantor yang ditentukan.
- **PWA Ready**: Dapat diunduh dan dipasang (*Install to Home Screen*) di perangkat Android, iOS, maupun Desktop.

### 2. Dashboard Admin (`/dashboard`)
- **Ringkasan Analitik**: Metrik bulanan (Total Hadir, Keterlambatan, Lembur) dan visualisasi grafik jam kerja menggunakan Chart.js.
- **Manajemen Presensi (`/dashboard/attendances`)**:
  - Filter rentang tanggal, pencarian nama/status, sorting kolom, dan pagination server-side.
  - Tambah / Koreksi presensi manual (wajib menyertakan alasan & ditandai dengan badge khusus).
- **Pengaturan Jam Kerja & Kantor (`/dashboard/settings`)**:
  - Konfigurasi jam masuk/pulang per hari (Senin - Minggu).
  - Toleransi keterlambatan (menit).
  - Geofence kantor (koordinat latitude, longitude, radius batas, dan detektor GPS otomatis).
  - Profil instansi / perusahaan (tampil pada kop PDF).
  - Manajemen kalender hari libur nasional.
- **Audit Log (`/dashboard/audit-logs`)**:
  - Jejak audit lengkap mencatat aktor, aksi, IP address, waktu, serta perbandingan *diff* JSON (sebelum & sesudah perubahan).

### 3. Ekspor Laporan Siap Cetak
- **Laporan PDF**: Format A4 formal rapi siap cetak menggunakan PDFKit, dilengkapi kop perusahaan, informasi karyawan, tabel rekapitulasi, nomor halaman dinamis, serta kolom tanda tangan.
- **Laporan CSV**: Format spreadsheet kompatibel Microsoft Excel dan Google Sheets (UTF-8).

---

## 🌐 Panduan Deployment Cloud

### Deployment Database (Supabase)
1. Buat proyek baru di [Supabase](https://supabase.com).
2. Ambil connection string dari **Project Settings** > **Database** > **Connection Pooling** (Pilih mode **Session**, port `5432`).
3. Set `DATABASE_URL` pada environment variable backend hosting Anda.

### Deployment Backend (Render / Railway / Fly.io)
1. Hubungkan repositori GitHub Anda.
2. Atur Root Directory ke `server`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js` (atau jalankan migrasi saat release: `npx knex migrate:latest && node src/server.js`).
5. Tambahkan Environment Variables dari file `server/.env`.

### Deployment Frontend (Vercel / Netlify)
1. Hubungkan repositori GitHub Anda.
2. Atur Root Directory ke `client`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Tambahkan Environment Variable: `VITE_API_BASE_URL=https://api-anda.com`

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE). Hak Cipta (c) 2026 Tyas Nur Taufiq.
