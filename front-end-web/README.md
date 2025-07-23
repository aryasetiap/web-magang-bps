# Dokumentasi Front-End: Manajemen Magang BPS Kabupaten Pringsewu

**Versi: 1.0.0**

**Tanggal:** 11 Juli 2025

**Pengembang Utama:** Divany Pangestika

## Ikhtisar Proyek

Sistem Manajemen Magang BPS Kabupaten Pringsewu adalah aplikasi web yang dirancang untuk memfasilitasi seluruh proses magang, mulai dari pendaftaran, aktivitas harian, penugasan, hingga kelulusan dan sertifikasi. Aplikasi ini mendukung berbagai role pengguna: Mahasiswa/Siswa (Peserta Magang), Staff BPS, dan Admin.

**Tujuan:** Mengotomatisasi dan menyederhanakan alur kerja magang di BPS Kabupaten Pringsewu.

**Target Pengguna:** Mahasiswa/Siswa (Peserta Magang), Staff BPS, Admin BPS.

## Teknologi yang Digunakan

**Framework/Library Utama:** `React.js (v18.x)`

- **Styling:** `Tailwind CSS (v3.x)` & `Headless UI` (untuk komponen tanpa style: Dialog, Transition, Menu, Disclosure)

- **Routing:** `React Router DOM (v6.x)`

- **State Management:** `React Hooks (useState, useEffect)` dan `localStorage` (untuk persistensi sesi/data dummy).

- **Icon Library:** `Heroicons (v2.x)`

- **Utils:** `jwtDecode` (untuk dekode JWT di frontend)

## Struktur Proyek

```
src/
├── assets/                  # Gambar, ikon, font lokal
│   ├── kantor-bps-1.jpg
│   ├── kantor-bps-3.jpg
│   └── logo-sistem-magang.png
├── components/              # Komponen UI yang dapat digunakan kembali (umum & terdaftar)
│   ├── AlertDialog.jsx      # Dialog/Modal/Alert yang generik
│   ├── BrandLogo.jsx        # Komponen logo dan nama sistem
|   └── landing/            # Komponen landing page
        ├── About.jsx
        ├── Contact.jsx
        ├── Faq.jsx
        ├── Footer.jsx
        ├── Header.jsx
        └── Hero.jsx
│   └── protected/          # Komponen layout & sidebar untuk pengguna terdaftar
│       ├── DashboardLayout.jsx # Layout dashboard tunggal untuk semua role
│       ├── Sidebar.jsx         # Sidebar tunggal untuk semua role
│       ├── HeadBar.jsx                # Header dashboard (avatar, logout, breadcrumbs)
|       └── ProtectedRoute.jsx   # Komponen untuk melindungi rute
├── pages/                   # Halaman-halaman utama aplikasi
│   ├── admin/               # Halaman khusus Admin
│   │   ├── AdminAssignmentsPage.jsx   # Manajemen Penugasan Admin
│   │   ├── AdminCertSettingsPage.jsx  # Pengaturan Sertifikat Admin
│   │   ├── AdminDashboard.jsx     # Dashboard Utama Admin (gabungan Laporan & Statistik)
│   │   ├── AdminGraduation.jsx    # Manajemen Kelulusan Admin
│   │   ├── AdminManagementSettings.jsx # Gabungan Manajemen Akun & Pengaturan Sistem
│   │   ├── AdminMonitoring.jsx    # Monitoring Peserta Admin
|   |   ├── AdminMasterDocs.jsx    # Manajemen Dokumen Master Admin
│   │   └── AdminApplicants.jsx    # Manajemen Pendaftar Admin

│   ├── intern/              # Halaman khusus Intern
        ├── activities
            ├── AssignmentSection.jsx # Section Assignment
            ├── LogbookSection # Bagian Logbook
            └── PresenceSection # Bagian Prensensi
│   │   ├── Activities.jsx          # Gabungan Aktivitas Harian Intern (Presensi, Penugasan, Logbook)
│   │   ├── Biodata.jsx            # Biodata Diri Intern
│   │   ├── InternDashboard.jsx        # Dashboard Utama Intern
│   │   ├── InternReports.jsx       # Laporan Akhir Intern
│   │   ├── Certificate.jsx         # Sertifikat Kelulusan Intern
│   │   └── SubmissionStatus.jsx        # Status Ajuan Magang Intern
│   ├── staff/               # Halaman khusus Staff
│   │   └── StaffAssignmentsPage.jsx   # Manajemen Penugasan
|   |   ├── StaffDashboard.jsx     # Dashboard Utama Staff
|   |   └── StaffMonitoring.jsx    # Monitoring Peserta oleh Staff.jsx
|   └── error/              # Halaman khusus Error
│   |   ├── NotFoundPage.jsx     # Halaman Error 404
|   │   ├── ServerErrorPage.jsx  # Halaman Error 500
|   │   └── ForbiddenPage.jsx    # Halaman Error 403
│   ├── LoginPage.jsx        # Halaman Login
│   ├── Registration.jsx     # Halaman Registrasi
│   ├── ForgotPasswordPage.jsx # Halaman Lupa Password
│   └── Home.jsx     # Halaman Gabungan Landing Page
├── App.js                   # Komponen utama dan konfigurasi routing
├── index.js                 # Entry point aplikasi React
├── index.css                # Import Tailwind CSS
├── tailwind.config.js       # Konfigurasi Tailwind CSS
└── .env                     # Variabel lingkungan (misal: REACT_APP_GOOGLE_CLIENT_ID)
```
