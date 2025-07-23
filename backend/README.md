<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">BPS Kabupaten Pringsewu - Backend Magang</h1>
<p align="center">
  <b>Backend REST API untuk Manajemen Magang BPS Kabupaten Pringsewu</b><br>
  <a href="https://nestjs.com/">NestJS</a> | <a href="https://www.prisma.io/">Prisma</a> | PostgreSQL | JWT Auth | Multer Upload | <a href="https://github.com/aryasetiap">by Arya Setia Pratama</a>
</p>

---

## 🚀 Deskripsi

Backend aplikasi magang BPS Kabupaten Pringsewu menyediakan REST API untuk seluruh proses magang: pendaftaran, presensi, logbook, penugasan, submission, laporan akhir, hingga sertifikat. Dibangun dengan [NestJS](https://nestjs.com/) (TypeScript), ORM [Prisma](https://www.prisma.io/), dan database PostgreSQL.

---

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   ├── prisma/                  # Modul Prisma (ORM)
│   ├── auth/                    # Modul autentikasi & otorisasi (JWT, Google OAuth)
│   ├── users/                   # Manajemen user & profil
│   ├── internship-applications/ # Pendaftaran magang
│   ├── attendances/             # Presensi (clock-in/out)
│   ├── logbooks/                # Logbook harian
│   ├── tasks/                   # Penugasan & assignment
│   ├── submissions/             # Pengumpulan tugas/submission
│   ├── final-projects/          # Laporan akhir magang
│   ├── certificates/            # Sertifikat kelulusan
│   └── common/                  # DTO, helper, dll
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── uploads/                     # Folder upload file (profile, dokumen, tugas, laporan, sertifikat)
├── .env                         # Konfigurasi environment (DB, JWT, Email, OAuth)
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🛠️ Fitur Utama

- **Autentikasi & Otorisasi:** JWT, Google OAuth, verifikasi OTP, reset password.
- **Manajemen User:** CRUD user, update profil, upload foto profil.
- **Pendaftaran Magang:** Upload dokumen (CV, transkrip, surat permohonan), status aplikasi.
- **Presensi:** Clock-in/out, validasi lokasi & radius kantor.
- **Logbook Harian:** CRUD logbook, status draft/submitted, validasi tanggal.
- **Penugasan & Submission:** CRUD tugas, assign ke intern, upload submission, resubmit, penilaian.
- **Laporan Akhir (Final Project):** Upload/update laporan akhir, status, feedback, review admin/staff.
- **Sertifikat:** Generate & download sertifikat kelulusan (PDF).
- **Upload File:** Multer, validasi tipe & ukuran file, struktur folder upload otomatis.
- **Role-based Access:** Admin, Staff BPS, Intern.
- **Paginasi & Filtering:** Untuk data list (user, aplikasi, tugas, logbook, laporan akhir).
- **Dokumentasi API:** Markdown di setiap modul (`src/*/API.md`).

---

## ⚙️ Teknologi & Library

- [NestJS](https://nestjs.com/) (TypeScript)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/) & [Passport](http://www.passportjs.org/)
- [Multer](https://github.com/expressjs/multer) (upload file)
- [Class-validator](https://github.com/typestack/class-validator)
- [Nodemailer](https://nodemailer.com/) (email OTP)
- [PDFKit](https://pdfkit.org/) & [pdf-lib](https://pdf-lib.js.org/) (sertifikat)
- [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) (cron jobs)
- [Swagger](https://swagger.io/) (opsional, bisa diaktifkan)

---

## 📦 Instalasi & Setup

1. **Clone repository**

   ```bash
   git clone https://github.com/aryasetiap/web-magang-bps.git
   cd web-magang-bps/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi environment**
   - Salin `.env.example` ke `.env` dan sesuaikan:
     ```
     DATABASE_URL=...
     JWT_SECRET=...
     EMAIL_USER=...
     EMAIL_PASS=...
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     GOOGLE_CALLBACK_URL=...
     FRONTEND_URL=...
     ```

4. **Setup database & seed data**

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Jalankan aplikasi**

   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

6. **Testing**
   ```bash
   npm run test
   npm run test:e2e
   npm run test:cov
   ```

---

## 📚 Dokumentasi API

- Dokumentasi endpoint tersedia di setiap folder modul (`src/*/API.md`).
- Contoh endpoint utama:
  - **Auth:** `/auth/register`, `/auth/login`, `/auth/profile`, `/auth/google`
  - **User:** `/users`, `/users/profile`
  - **Pendaftaran Magang:** `/internship-applications`
  - **Presensi:** `/attendances/clock-in`, `/attendances/clock-out`
  - **Logbook:** `/logbooks`
  - **Tugas:** `/tasks`, `/tasks/:id`
  - **Submission:** `/submissions`, `/submissions/:id/resubmit`
  - **Laporan Akhir:** `/final-projects`
  - **Sertifikat:** `/certificates`

- Untuk detail format request/response, error handling, dan validasi, cek file API.md di masing-masing modul.

---

## 📂 Uploads & File Handling

- Semua file upload (profile photo, dokumen, tugas, laporan, sertifikat) disimpan di folder `/uploads`.
- Struktur folder upload otomatis dibuat sesuai kebutuhan (misal: `/uploads/profile-photos`, `/uploads/final-projects`).
- File lama akan dihapus otomatis saat update file baru.
- Validasi tipe & ukuran file di setiap endpoint upload.

---

## 🧑‍💻 Kontribusi

Kontribusi sangat terbuka! Silakan buat issue atau pull request untuk perbaikan/fitur baru.

---

## 👤 Author

- **Arya Setia Pratama**
- GitHub: [https://github.com/aryasetiap](https://github.com/aryasetiap)
- WhatsApp: [085669644533](https://wa.me/6285669644533)

---

## 📄 License

MIT License. See [LICENSE](https://github.com/nestjs/nest/blob/master/LICENSE).

---

> Powered by [NestJS](https://nestjs.com/) & Prisma ORM.  
> © 2025 BPS Kabupaten Pringsewu. All rights
