# E-PRES • Sistem Presensi Elektronik Pribadi (Personal Attendance System)

Aplikasi web presensi pribadi *production-grade* untuk karyawan yang membutuhkan pencatatan kehadiran mandiri yang akurat, aman, dan siap audit. Dilengkapi dengan landing page publik mobile-first, jam digital tersinkronisasi waktu server (WIB), validasi radius geofence kantor, dashboard admin analitik dengan grafik Chart.js, serta export laporan PDF A4 siap cetak dan CSV.

---

## 🏛️ Arsitektur Monorepo & Keputusan Teknis

### Struktur Folder
```
e-pres/
├── docker-compose.yml              # Konfigurasi container PostgreSQL 16
├── package.json                    # Script root monorepo (concurrent dev, migrate, test)
├── README.md                       # Dokumentasi lengkap proyek
├── server/                         # Backend API (Node.js + Express.js)
│   ├── knexfile.js                 # Konfigurasi Knex untuk database
│   ├── .env.example / .env         # Environment variables server
│   ├── src/
│   │   ├── config/                 # Konfigurasi database & environment
│   │   ├── db/
│   │   │   ├── migrations/         # Migrasi skema database PostgreSQL
│   │   │   └── seeds/              # Seeder admin, jadwal, settings, hari libur & data 1 bulan
│   │   ├── middleware/             # Auth JWT, rate limit, validasi Zod, central error handler
│   │   ├── repositories/           # Akses query database terpusat
│   │   ├── services/               # Logika bisnis: hitung keterlambatan, lembur, PDFKit
│   │   ├── controllers/            # Controller penanganan HTTP request/response
│   │   ├── routes/                 # Definisi rute Express (/api/auth, /attendance, dll.)
│   │   ├── utils/                  # Helper Luxon Asia/Jakarta, rumus Haversine Geolocation
│   │   ├── validations/            # Skema validasi Zod
│   │   ├── app.js                  # Konfigurasi Express app, CORS ketat, Helmet
│   │   └── server.js               # Entrypoint HTTP server
│   └── tests/
│       ├── unit/                   # Unit test Vitest untuk perhitungan jam kerja & status
│       └── integration/            # Integration test Supertest untuk API flow
└── client/                         # Frontend SPA (Vue 3 + Vite + Tailwind CSS)
    ├── vite.config.js              # Proxy ke backend /api
    ├── tailwind.config.js          # Brand palette & modern typography
    ├── src/
    │   ├── assets/                 # Tailwind directives, glassmorphism & glow styles
    │   ├── components/             # ClockWidget, Navbar, StatCard, ModalDialog, Toast
    │   ├── router/                 # Vue Router + navigation guards (auth/guest)
    │   ├── stores/                 # Pinia stores: auth, attendance (sinkron offset jam server), toast
    │   ├── services/               # Axios client dengan auto-refresh token queue pada 401
    │   └── views/                  # LandingView, LoginView, Dashboard (Summary, List, Settings, Audit)
```

### Penjelasan Keputusan Teknis Penting
1. **Knex.js (Akses Data)**: *Knex.js dipilih karena ringan, memiliki footprint memori sangat rendah, memberikan kontrol querybuilder dan raw SQL presisi (seperti `INSERT ... ON CONFLICT`), serta skrip migrasi JS yang mudah diaudit tanpa beban Prisma runtime engine.*
2. **PDFKit (Laporan PDF)**: *PDFKit dipilih karena murni JavaScript tanpa ketergantungan Chromium headless (Puppeteer) yang boros memori ratusan MB, menghasilkan dokumen A4 vektor presisi, performa kilat, dan dapat langsung di-stream ke HTTP response.*
3. **Luxon (Waktu & Timezone)**: *Seluruh kalkulasi dan offset waktu dipatok pada zona waktu `Asia/Jakarta` (WIB, UTC+7). Waktu presensi diambil dari server, mencegah manipulasi jam lokal perangkat pengguna.*
4. **Keamanan**: *Password di-hash dengan `bcryptjs`, JWT access token berumur pendek (15m) + refresh token tersimpan di cookie `httpOnly` (`SameSite=Strict`), Express Rate Limiting pada endpoint login & presensi, Helmet security headers, dan CORS terisolasi.*

---

## ⚙️ Persyaratan Sistem
- Node.js LTS (v18, v20, atau v22+)
- PostgreSQL 16 (atau melalui Docker Compose)
- npm v9+

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Salin Environment Variables
```bash
cd server
cp .env.example .env
```
Isi konfigurasi database di `server/.env` jika berbeda dengan default:
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=epres_db
JWT_ACCESS_SECRET=epres_super_secret_access_jwt_key_2026_wib_secure
JWT_REFRESH_SECRET=epres_super_secret_refresh_jwt_key_2026_wib_secure
TIMEZONE=Asia/Jakarta
```

### 2. Jalankan PostgreSQL
Opsi A: Menggunakan Docker Compose (Direktori Root)
```bash
docker-compose up -d
```
Opsi B: Menggunakan PostgreSQL lokal di sistem Anda (Pastikan database `epres_db` sudah dibuat).

### 3. Instal Dependensi Seluruh Proyek
Dari folder root:
```bash
npm run install:all
```

### 4. Eksekusi Migrasi & Seeder Database
Dari folder root:
```bash
npm run migrate
npm run seed
```
> **Akun Default Seeder:**
> - Email: `admin@epres.local`
> - Password: `Password123!`

### 5. Jalankan Aplikasi (Mode Development)
Dari folder root untuk menjalankan Server dan Client sekaligus:
```bash
npm run dev
```
Atau jalankan terpisah di dua terminal:
- **Terminal 1 (Backend Server):** `npm run dev:server` (berjalan di `http://localhost:5000`)
- **Terminal 2 (Frontend Client):** `npm run dev:client` (berjalan di `http://localhost:5173`)

Buka browser Anda di: **`http://localhost:5173`**

---

## 🧪 Menjalankan Automated Tests

Aplikasi dilengkapi unit test (perhitungan jam kerja, lembur, hari libur, toleransi, timezone) dan integration test (login, token, presensi manual, penolakan presensi ganda, export PDF/CSV):

```bash
npm run test:server
```

---

## 📋 Fitur Utama & Panduan Penggunaan

### 1. Landing Page (`/`)
- Jam digital real-time (WIB) tersinkronisasi dengan offset waktu server.
- Tombol **Absen Datang** (hanya aktif jika belum absen hari ini).
- Tombol **Absen Pulang** (hanya aktif jika sudah absen datang dan belum pulang).
- Proteksi double-click dan validasi server-side unik per tanggal.
- Kartu konfirmasi instan setelah absen (waktu tercatat, durasi kerja, status, dan lembur).
- Validasi lokasi geofence kantor (menggunakan rumus Haversine jika diaktifkan di Pengaturan).
- 5 Riwayat kehadiran terakhir.

### 2. Dashboard Admin (`/dashboard`)
- **Ringkasan**: Kartu metrik kehadiran bulanan (Hari Hadir, Total Terlambat, Total Jam Lembur, Rata-rata Jam Masuk/Pulang) + Grafik Chart.js visualisasi jam kerja.
- **Data Presensi (`/dashboard/attendances`)**:
  - Tabel dengan pencarian, filter status, filter rentang tanggal, sorting kolom, dan pagination server-side.
  - Tambah / Koreksi manual (misal lupa absen) dengan kolom **Alasan/Keterangan Wajib** dan penanda badge `✏️ Koreksi Manual`.
  - Hapus data dengan dialog konfirmasi.
- **Pengaturan (`/dashboard/settings`)**:
  - Konfigurasi jam masuk & pulang per hari (Senin - Minggu) dan toggle hari kerja.
  - Toleransi keterlambatan (menit).
  - Geofencing kantor (koordinat latitude, longitude, radius meter, dan tombol deteksi GPS otomatis).
  - Profil perusahaan & karyawan (digunakan pada kop dan tanda tangan PDF).
  - Manajemen tanggal merah / libur nasional (otomatis dihitung full lembur).
- **Audit Log (`/dashboard/audit-logs`)**:
  - Mencatat aktor, aksi (`CHECK_IN`, `MANUAL_UPDATE`, `UPDATE_SETTING`, dll.), entitas, IP address, serta diff JSON nilai lama vs nilai baru.

### 3. Export Laporan (`/reports/pdf` & `/reports/csv`)
- **Export PDF**: Layout A4 rapi, logo & header perusahaan, info karyawan, tabel lengkap kehadiran, status, lembur, keterangan, ringkasan rekapitulasi, nomor halaman, dan area tanda tangan (Karyawan & Atasan).
- **Export CSV**: Format spreadsheet kompatibel Excel UTF-8.

---

## 🎯 Saran Pengembangan Lanjutan
1. **PWA (Progressive Web App)**: Tambahkan web app manifest dan service worker agar karyawan dapat meng-install aplikasi ini langsung di layar utama smartphone.
2. **Push Notifications / Pengingat Absen**: Integrasikan Web Push API untuk mengirimkan notifikasi pengingat absen masuk pada pukul 07.15 dan absen pulang pada pukul 16.00.
3. **Deployment Production**: Deploy backend dan frontend menggunakan Docker multi-stage build di VPS (seperti Ubuntu LTS) di balik Nginx Reverse Proxy dengan sertifikat SSL gratis dari Let's Encrypt / Certbot.
