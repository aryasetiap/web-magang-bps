# 🌟 Sistem Manajemen Magang BPS Kabupaten Pringsewu

**Versi:** 1.0.0  
**Tanggal Rilis:** 23 Juli 2025  
**Developer:**

- Arya Setia Pratama ([GitHub](https://github.com/aryasetiap), WA: [085669644533](https://wa.me/6285669644533))
- Divany Pangestika ([GitHub](https://github.com/dyvaniest), WA: [0895366740169](https://wa.me/62895366740169))  
  **Institusi:** Teknik Informatika, Universitas Lampung  
  **Kolaborasi:** BPS Kabupaten Pringsewu

---

## 🚀 Deskripsi Proyek

Sistem Manajemen Magang BPS Kabupaten Pringsewu adalah aplikasi web terintegrasi untuk mengelola seluruh proses magang, mulai dari pendaftaran, aktivitas harian, penugasan, pengumpulan tugas, laporan akhir, hingga sertifikat kelulusan. Sistem ini mendukung multi-role: **Peserta Magang (Intern)**, **Staff BPS**, dan **Admin**.

**Tujuan:**

- Mengotomatisasi dan menyederhanakan proses magang di BPS Kabupaten Pringsewu.
- Meningkatkan transparansi, efisiensi, dan monitoring peserta magang secara real-time.

---

## 🏗️ Struktur Proyek

```
web-magang-bps/
├── backend/                # Backend REST API (NestJS, Prisma, PostgreSQL)
│   ├── src/
│   ├── prisma/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── README.md
├── front-end-web/          # Frontend React.js (SPA)
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── README.md
├── README.md               # Dokumentasi utama (root)
└── .gitignore
```

---

## ⚙️ Teknologi & Library

### Backend

- **NestJS** (TypeScript)
- **Prisma ORM** & **PostgreSQL**
- **JWT Auth** & **Google OAuth**
- **Multer** (upload file)
- **PDFKit** & **pdf-lib** (sertifikat)
- **Nodemailer** (OTP email)
- **Swagger** (opsional dokumentasi API)

### Frontend

- **React.js** (v18.x)
- **Tailwind CSS** & **Headless UI**
- **React Router DOM** (v6.x)
- **Heroicons** (v2.x)
- **jwt-decode** (utility JWT)
- **State:** React Hooks & localStorage

---

## ✨ Fitur Utama

- **Autentikasi & Otorisasi:** Register, Login, Google OAuth, JWT, verifikasi OTP, reset password.
- **Manajemen User:** CRUD user, update profil, upload foto profil.
- **Pendaftaran Magang:** Upload dokumen (CV, transkrip, surat permohonan), status aplikasi.
- **Presensi:** Clock-in/out, validasi lokasi & radius kantor.
- **Logbook Harian:** CRUD logbook, status draft/submitted, validasi tanggal.
- **Penugasan & Submission:** CRUD tugas, assign ke intern, upload submission, resubmit, penilaian.
- **Laporan Akhir (Final Project):** Upload/update laporan akhir, status, feedback, review admin/staff.
- **Sertifikat:** Generate & download sertifikat kelulusan (PDF).
- **Upload File:** Validasi tipe & ukuran file, struktur folder upload otomatis.
- **Role-based Access:** Admin, Staff BPS, Intern.
- **Paginasi & Filtering:** Untuk data list (user, aplikasi, tugas, logbook, laporan akhir).
- **Notifikasi & Audit Log:** Monitoring aktivitas penting (opsional).

---

## 🖥️ Struktur Frontend

```
src/
├── assets/                  # Gambar, ikon, font lokal
├── components/              # Komponen UI reusable (umum & terdaftar)
│   ├── AlertDialog.jsx
│   ├── BrandLogo.jsx
│   ├── landing/             # Komponen landing page
│   └── protected/           # Layout & sidebar untuk pengguna terdaftar
├── pages/                   # Halaman utama aplikasi
│   ├── admin/               # Halaman khusus Admin
│   ├── intern/              # Halaman khusus Intern
│   ├── staff/               # Halaman khusus Staff
│   └── error/               # Halaman error (404, 500, 403)
├── App.js                   # Routing utama
├── index.js                 # Entry point React
├── index.css                # Import Tailwind CSS & global style
└── tailwind.config.js       # Konfigurasi Tailwind CSS
```

---

## 🗄️ Struktur Backend

```
src/
├── app.controller.ts
├── app.service.ts
├── app.module.ts
├── prisma/                  # Modul Prisma (ORM)
├── auth/                    # Autentikasi & otorisasi (JWT, Google OAuth)
├── users/                   # Manajemen user & profil
├── internship-applications/ # Pendaftaran magang
├── attendances/             # Presensi (clock-in/out)
├── logbooks/                # Logbook harian
├── tasks/                   # Penugasan & assignment
├── submissions/             # Pengumpulan tugas/submission
├── final-projects/          # Laporan akhir magang
├── certificates/            # Sertifikat kelulusan
└── common/                  # DTO, helper, dll
```

---

## 🔗 Endpoint Utama & Modul

| Modul              | Endpoint Utama                                    | Deskripsi Singkat                        |
| ------------------ | ------------------------------------------------- | ---------------------------------------- |
| Auth               | `/auth/register`, `/auth/login`                   | Register, login, Google OAuth            |
| User               | `/users`, `/users/profile`                        | CRUD user, update profil                 |
| Pendaftaran Magang | `/internship-applications`                        | Ajukan & cek status magang               |
| Presensi           | `/attendances/clock-in`, `/attendances/clock-out` | Clock-in/out, riwayat presensi           |
| Logbook Harian     | `/logbooks`                                       | CRUD logbook harian                      |
| Penugasan          | `/tasks`, `/tasks/:id`                            | Lihat tugas, detail, assign, update      |
| Submission         | `/submissions`, `/submissions/:id/resubmit`       | Upload & resubmit tugas                  |
| Laporan Akhir      | `/final-projects`                                 | Upload, update, cek status laporan akhir |
| Sertifikat         | `/certificates`                                   | Generate & download sertifikat           |

> Dokumentasi detail endpoint: [backend/src/\*/API.md](backend/src/)

---

## 📦 Instalasi & Setup

### 1. Clone Repository

```sh
git clone https://github.com/aryasetiap/web-magang-bps.git
cd web-magang-bps
```

### 2. Setup Backend

```sh
cd backend
npm install
cp .env.example .env   # Edit konfigurasi DB, JWT, Email, dsb
npx prisma migrate deploy
npx prisma db seed
npm run start:dev      # Jalankan server di http://localhost:3000
```

### 3. Setup Frontend

```sh
cd ../front-end-web
npm install
cp .env.example .env   # Edit jika perlu (API_BASE_URL, dsb)
npm start              # Jalankan di http://localhost:3001
```

---

## 📂 Uploads & File Handling

- Semua file upload (foto profil, dokumen, tugas, laporan, sertifikat) disimpan di folder `/uploads` (backend).
- Validasi tipe & ukuran file di setiap endpoint upload.
- File lama akan dihapus otomatis saat update file baru.

---

## 🧑‍💻 Kontribusi

Kontribusi sangat terbuka!  
Silakan buat issue atau pull request untuk perbaikan/fitur baru.

---

## 👤 Developer

- **Arya Setia Pratama**  
  [GitHub](https://github.com/aryasetiap) | [WhatsApp](https://wa.me/6285669644533)
- **Divany Pangestika**  
  [GitHub](https://github.com/dyvaniest) | [WhatsApp](https://wa.me/62895366740169)

---

## 📄 Lisensi

MIT License.  
© 2025 Teknik Informatika Universitas Lampung & BPS Kabupaten Pringsewu.

---

> Powered by [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), and [React.js](https://react.dev/).
