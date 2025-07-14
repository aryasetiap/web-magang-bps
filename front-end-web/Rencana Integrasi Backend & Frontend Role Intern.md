# Rencana Integrasi Backend & Frontend (Role: Intern)

## 1. Tujuan

Mengintegrasikan seluruh fitur yang berkaitan dengan role **Intern** antara backend dan frontend, sehingga seluruh proses magang (pendaftaran, aktivitas harian, penugasan, laporan akhir, sertifikat) berjalan end-to-end secara real-time.

---

## 2. Daftar Modul & Endpoint Utama Intern

### 2.1. Autentikasi & Manajemen User

- [ ] **Register** (`POST /auth/register`)
- [ ] **Login** (`POST /auth/login`)
- [ ] **Google OAuth** (`GET /auth/google`, `GET /auth/google/callback`)
- [ ] **Profile** (`GET /auth/profile`, `PATCH /auth/profile`)

### 2.2. Pendaftaran Magang

- [ ] **Ajukan Pendaftaran** (`POST /internship-applications`)
- [ ] **Lihat Status Pendaftaran** (`GET /internship-applications`)

### 2.3. Aktivitas Inti Magang

- [ ] **Presensi** (`POST /attendances/clock-in`, `PATCH /attendances/clock-out`, `GET /attendances`)
- [ ] **Logbook Harian** (`POST /logbooks`, `GET /logbooks`, `PATCH /logbooks/:id`, `DELETE /logbooks/:id`)

### 2.4. Modul Penugasan

- [ ] **Lihat Tugas** (`GET /tasks`)
- [ ] **Lihat Detail Tugas** (`GET /tasks/:id`)
- [ ] **Upload Submission** (`POST /submissions`, `PATCH /submissions/:id/resubmit`)

### 2.5. Laporan Akhir

- [ ] **Upload Laporan Akhir** (`POST /final-projects`)
- [ ] **Lihat Status Laporan Akhir** (`GET /final-projects`)
- [ ] **Update Laporan Akhir** (`PATCH /final-projects/:id`)

### 2.6. Sertifikat

- [ ] **Lihat & Download Sertifikat** (`GET /certificates`)

---

## 3. Langkah Integrasi

### 3.1. Persiapan ✅ (Selesai)

- [x] Review endpoint backend di [backend/API-Documentation-v2.md](backend/API-Documentation-v2.md)
- [x] Mapping kebutuhan frontend (halaman, komponen, state) ke endpoint backend

#### Tabel Mapping Frontend & Backend

| Fitur              | Halaman/Komponen Frontend       | Endpoint Backend                                            |
| ------------------ | ------------------------------- | ----------------------------------------------------------- |
| Register/Login     | LoginPage.jsx, Registration.jsx | /auth/register, /auth/login                                 |
| Google OAuth       | LoginPage.jsx                   | /auth/google, /auth/google/callback                         |
| Profile/Biodata    | Biodata.jsx                     | /auth/profile (GET, PATCH)                                  |
| Pendaftaran Magang | SubmissionStatus.jsx            | /internship-applications (POST, GET)                        |
| Presensi           | PresenceSection.jsx             | /attendances/clock-in, /attendances/clock-out, /attendances |
| Logbook Harian     | LogbookSection.jsx              | /logbooks (POST, GET, PATCH, DELETE)                        |
| Penugasan          | AssignmentSection.jsx           | /tasks, /tasks/:id, /submissions, /submissions/:id/resubmit |
| Laporan Akhir      | InternReports.jsx               | /final-projects (POST, GET, PATCH)                          |
| Sertifikat         | Certificate.jsx                 | /certificates                                               |

### 3.2. Implementasi Bertahap

#### Tahap 1: Autentikasi & Profile

- [x] Integrasi login/register (JWT, penyimpanan token)
- [x] Integrasi Google OAuth
- [ ] Fetch & update profile intern

#### Tahap 2: Pendaftaran Magang

- [ ] Form pendaftaran → kirim ke backend
- [ ] Tampilkan status pendaftaran dari backend

#### Tahap 3: Aktivitas Harian

- [ ] Integrasi presensi (clock-in/out)
- [ ] Integrasi logbook harian (CRUD)

#### Tahap 4: Penugasan & Submission

- [ ] Fetch daftar tugas & detail tugas
- [ ] Upload submission tugas

#### Tahap 5: Laporan Akhir

- [ ] Upload laporan akhir (file PDF)
- [ ] Lihat status & feedback laporan akhir
- [ ] Update laporan akhir jika perlu revisi

#### Tahap 6: Sertifikat

- [ ] Fetch & tampilkan sertifikat kelulusan

---

## 4. Monitoring Progress

| Modul              | Endpoint Utama           | Status     | PIC | Catatan                                                      |
| ------------------ | ------------------------ | ---------- | --- | ------------------------------------------------------------ |
| Autentikasi        | /auth/\*                 | 🟩 Selesai |     | Login/register, JWT, Google OAuth, logout sudah terintegrasi |
| Profile            | /auth/profile            | ⬜ Belum   |     |                                                              |
| Pendaftaran Magang | /internship-applications | ⬜ Belum   |     |                                                              |
| Presensi           | /attendances/\*          | ⬜ Belum   |     |                                                              |
| Logbook Harian     | /logbooks/\*             | ⬜ Belum   |     |                                                              |
| Penugasan          | /tasks/_, /submissions/_ | ⬜ Belum   |     |                                                              |
| Laporan Akhir      | /final-projects/\*       | ⬜ Belum   |     |                                                              |
| Sertifikat         | /certificates            | ⬜ Belum   |     |                                                              |

> Status: ⬜ Belum | 🟨 Proses | 🟩 Selesai

---

## 5. Catatan & Kendala

- [x] Tahap 3.1 Persiapan selesai, tidak ada kendala pada tahap ini.
- [x] Tahap 1: Autentikasi & Profile (Integrasi login/register, JWT, Google OAuth, logout) sudah berjalan normal.

---

## 6. Referensi

- [Dokumentasi API Backend](backend/API-Documentation-v2.md)
- [Struktur Frontend](front-end-web/Dokumentasi-Front-end-V1.md)
