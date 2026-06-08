# Panduan Deploy ke Insforge via GitHub

Panduan ini menjelaskan langkah-langkah deploy aplikasi **Sistem Informasi Henkaten & Problem Produksi** ke Insforge menggunakan GitHub sebagai sumber kode.

---

## Daftar Isi
1. [Persiapan Lokal](#1-persiapan-lokal)
2. [Push Kode ke GitHub](#2-push-kode-ke-github)
3. [Setup Database PostgreSQL di Insforge](#3-setup-database-postgresql-di-insforge)
4. [Update Schema ke PostgreSQL](#4-update-schema-ke-postgresql)
5. [Deploy Aplikasi di Insforge](#5-deploy-aplikasi-di-insforge)
6. [Konfigurasi Environment Variables](#6-konfigurasi-environment-variables)
7. [Jalankan Migrasi Database](#7-jalankan-migrasi-database)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Persiapan Lokal

Pastikan kondisi lokal sudah siap sebelum push ke GitHub.

### Cek semua file penting ada
```
problem-produksi-app/
├── app/                    ← halaman dan API
├── components/             ← Navbar, AuthModal, dll
├── prisma/
│   └── schema.prisma       ← definisi database
├── public/
│   └── logo.jpg            ← logo Anda (letakkan di sini)
├── .env                    ← JANGAN di-commit (sudah di .gitignore)
├── .env.example            ← template — ini boleh di-commit
├── package.json
└── next.config.ts
```

### Pasang logo
Salin file logo JPG Anda ke:
```
public/logo.jpg
```

---

## 2. Push Kode ke GitHub

### Langkah 2a — Buat repository di GitHub
1. Buka [github.com](https://github.com) → klik **New repository**
2. Nama repo: `henkaten-problem-produksi` (atau nama lain)
3. Pilih **Private** (disarankan, data produksi)
4. Klik **Create repository** — **JANGAN** centang "Add README"

### Langkah 2b — Inisialisasi Git dan push dari komputer

Buka terminal (PowerShell) di folder `problem-produksi-app`, jalankan satu per satu:

```powershell
# Inisialisasi git
git init

# Tambahkan semua file kecuali yang ada di .gitignore
git add .

# Pastikan .env dan *.db tidak masuk (cek dulu)
git status

# Commit pertama
git commit -m "Initial commit: Sistem Informasi Henkaten & Problem Produksi"

# Hubungkan ke GitHub (ganti URL sesuai repo Anda)
git remote add origin https://github.com/USERNAME/henkaten-problem-produksi.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

> ⚠️ **Pastikan** file `.env` dan `dev.db` **TIDAK** muncul di `git status` sebagai file yang akan di-commit.

---

## 3. Setup Database PostgreSQL di Insforge

1. Login ke dashboard Insforge
2. Masuk ke project atau buat project baru
3. Cari menu **Database** → pilih **PostgreSQL** → klik **Create**
4. Setelah database dibuat, catat detail koneksi:

| Info | Contoh |
|------|--------|
| Host | `db.insforge.io` |
| Port | `5432` |
| Database | `henkaten_db` |
| Username | `admin` |
| Password | `*****` |

5. Format URL koneksi yang dibutuhkan:
   ```
   postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?schema=public
   ```

---

## 4. Update Schema ke PostgreSQL

Schema bawaan menggunakan **SQLite** (untuk lokal). Untuk production, ubah ke **PostgreSQL**.

### Buka `prisma/schema.prisma`, ubah provider:

**Sebelum (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Sesudah (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Buat migration baru untuk PostgreSQL:

Sementara ubah `DATABASE_URL` di `.env` dengan URL PostgreSQL produksi Anda:
```
DATABASE_URL="postgresql://admin:password@db.insforge.io:5432/henkaten_db?schema=public"
```

Kemudian jalankan:
```powershell
npx prisma migrate dev --name init_postgresql
```

### Push perubahan ke GitHub:
```powershell
git add prisma/ package.json
git commit -m "chore: switch database to postgresql for production"
git push
```

---

## 5. Deploy Aplikasi di Insforge

1. Login ke Insforge → klik **New Application** atau **Deploy**
2. Pilih **Deploy from GitHub**
3. Authorize GitHub jika diminta → pilih repository `henkaten-problem-produksi`
4. Pilih branch: **main**
5. Atur konfigurasi build:

| Setting | Nilai |
|---------|-------|
| **Framework / Runtime** | Node.js / Next.js |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Install Command** | `npm install` |
| **Node.js Version** | `20` |
| **Root Directory** | *(kosongkan / root)* |

6. Klik **Deploy** dan tunggu proses selesai

---

## 6. Konfigurasi Environment Variables

Di dashboard Insforge, masuk ke **Settings → Environment** (atau serupa).

Tambahkan variabel berikut:

| Variable | Nilai |
|----------|-------|
| `DATABASE_URL` | URL PostgreSQL dari Langkah 3 |
| `NODE_ENV` | `production` |

Setelah menambah env variable, klik **Save** dan **Redeploy** jika diperlukan.

---

## 7. Jalankan Migrasi Database

Setelah deploy berhasil, jalankan migrasi agar tabel terbuat di PostgreSQL.

### Opsi A — Via Console/Terminal Insforge
Di dashboard Insforge, buka **Console** atau **Terminal** aplikasi, jalankan:
```bash
npx prisma migrate deploy
```

### Opsi B — Dari komputer lokal (jika Insforge tidak punya console)
Sementara set `DATABASE_URL` di `.env` lokal dengan URL produksi, lalu:
```powershell
npx prisma migrate deploy
```
Kemudian kembalikan `.env` ke URL lokal (`file:./dev.db`).

### Verifikasi tabel berhasil dibuat:
```bash
npx prisma studio
```
Buka browser ke `http://localhost:5555` → pastikan tabel `Problem` ada.

---

## 8. Troubleshooting

### ❌ Error: "Can't reach database server"
- Periksa `DATABASE_URL` di environment variables Insforge
- Pastikan format URL benar: `postgresql://user:pass@host:5432/db?schema=public`
- Pastikan IP server Insforge diizinkan di whitelist/firewall database

### ❌ Error: "PrismaClientInitializationError"
- `DATABASE_URL` belum diset di environment variables
- Jalankan `npm run postinstall` untuk regenerate Prisma client

### ❌ Error: "Table 'Problem' doesn't exist"
- Migrasi belum dijalankan. Jalankan: `npx prisma migrate deploy`

### ❌ Logo tidak muncul setelah deploy
- Pastikan `public/logo.jpg` sudah di-commit: `git add public/logo.jpg && git commit -m "add logo"`
- File di folder `public/` harus ikut ter-push ke GitHub

### ❌ Build gagal karena Prisma
```bash
npx prisma generate
npm run build
```

### ❌ Push GitHub ditolak karena file besar
Pastikan `node_modules/` dan `*.db` tidak ikut:
```powershell
git rm -r --cached node_modules
git rm --cached dev.db
git commit -m "fix: remove node_modules and db from tracking"
git push
```

---

## Referensi Cepat

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan mode development (lokal) |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan hasil build |
| `npm run db:migrate` | Jalankan migrasi database production |
| `npm run db:push` | Push schema ke database (tanpa file migrasi) |
| `npx prisma studio` | GUI untuk lihat/edit isi database |
| `npx prisma generate` | Regenerate Prisma client |

---

## Catatan Penting

- File `.env` **jangan pernah** di-commit ke GitHub — sudah diatur di `.gitignore`
- Simpan baik-baik `DATABASE_URL` production di tempat yang aman
- Setiap ada perubahan kode, cukup `git push` dan Insforge akan otomatis redeploy (jika auto-deploy diaktifkan)

---

*Panduan ini dibuat untuk Sistem Informasi Henkaten & Problem Produksi — Divisi Produksi*
