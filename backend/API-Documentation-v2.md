# Dokumentasi API: Aplikasi Magang BPS (v2.0)

**Base URL:** `http://localhost:3000`  
**Last Updated:** Januari 2025

---

## Daftar Isi

1. [Autentikasi & Manajemen User](#bagian-1-autentikasi--manajemen-user)
2. [Aktivitas Inti Magang](#bagian-2-aktivitas-inti-magang)
3. [Modul Penugasan](#bagian-3-modul-penugasan)
4. [Modul Laporan Akhir](#bagian-4-modul-laporan-akhir)
5. [Modul Sertifikat](#bagian-5-modul-sertifikat)
6. [Catatan & Standar Umum](#bagian-6-catatan--standar-umum)

---

## Bagian 1: Autentikasi & Manajemen User

### 1.1 Endpoint Publik

#### POST `/auth/register`

**Deskripsi:** Mendaftarkan user baru dengan peran default "Mahasiswa"

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (201):**

```json
{
  "message": "User berhasil didaftarkan",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "name": "Mahasiswa"
    }
  }
}
```

**Response Error (409):**

```json
{
  "message": "Email sudah terdaftar"
}
```

---

#### POST `/auth/login`

**Deskripsi:** Login untuk mendapatkan JWT access token

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "name": "Mahasiswa"
    }
  }
}
```

**Response Error (401):**

```json
{
  "message": "Email atau password salah"
}
```

---

### 1.2 Endpoint Pengguna

#### GET `/auth/profile`

**Deskripsi:** Mendapatkan profil lengkap user yang sedang login

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "namaLengkap": "John Doe",
  "nimNisn": "123456789",
  "asalInstitusi": "Universitas ABC",
  "jurusanProdi": "Teknik Informatika",
  "nomorTelepon": "081234567890",
  "alamat": "Jl. Contoh No. 123",
  "role": {
    "name": "Mahasiswa"
  }
}
```

---

#### PATCH `/auth/profile`

**Deskripsi:** Update profil dan upload berkas pendaftaran

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `namaLengkap` (string)
- `nimNisn` (string)
- `asalInstitusi` (string)
- `jurusanProdi` (string)
- `nomorTelepon` (string)
- `alamat` (string)
- `cv` (file: PDF, max 2MB)
- `transkripNilai` (file: PDF, max 2MB)
- `suratPermohonan` (file: PDF, max 2MB)

**Response Success (200):**

```json
{
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": 1,
    "namaLengkap": "John Doe",
    "nimNisn": "123456789",
    "asalInstitusi": "Universitas ABC"
  }
}
```

---

#### PATCH `/auth/profile`

**Deskripsi:** Update profil user dengan upload foto profil (opsional)

**Headers:** `Authorization: Bearer {jwt_token}`

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**

| Field         | Type   | Required | Description                             |
| ------------- | ------ | -------- | --------------------------------------- |
| name          | string | No       | Nama user                               |
| namaLengkap   | string | No       | Nama lengkap user                       |
| nimNisn       | string | No       | NIM/NISN user                           |
| asalInstitusi | string | No       | Asal institusi user                     |
| jurusanProdi  | string | No       | Jurusan/Program Studi                   |
| nomorTelepon  | string | No       | Nomor telepon                           |
| alamat        | string | No       | Alamat user                             |
| profilePhoto  | file   | No       | File foto profil (JPG/PNG/GIF, max 2MB) |

**Response Success (200):**

```json
{
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john@example.com",
    "profilePhoto": "uploads/profile-photos/profile-1625123456-123456789.jpg",
    "namaLengkap": "John Doe Lengkap",
    "nimNisn": "12345678",
    "asalInstitusi": "Universitas ABC",
    "jurusanProdi": "Teknik Informatika",
    "nomorTelepon": "081234567890",
    "alamat": "Jl. ABC No. 123",
    "role": {
      "name": "Intern"
    }
  }
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "Hanya file gambar yang diperbolehkan (JPG, JPEG, PNG, GIF)"
}
```

---

### 1.3 Pendaftaran Magang

#### POST `/internship-applications`

**Deskripsi:** Submit pendaftaran magang dengan berkas dan periode magang (opsional)

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `cv` (file: PDF, max 2MB)
- `transcript` (file: PDF, max 2MB)
- `requestLetter` (file: PDF, max 2MB)
- `startDate` (string, optional): Tanggal mulai magang (format: YYYY-MM-DD)
- `endDate` (string, optional): Tanggal selesai magang (format: YYYY-MM-DD)

**Response Success (201):**

```json
{
  "id": 1,
  "status": "pending",
  "cvPath": "/uploads/cv_file.pdf",
  "transcriptPath": "/uploads/transcript_file.pdf",
  "requestLetterPath": "/uploads/request_letter.pdf",
  "startDate": "2025-02-01T00:00:00.000Z",
  "endDate": "2025-04-30T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Response Success (tanpa periode):**

```json
{
  "id": 2,
  "status": "pending",
  "cvPath": "/uploads/cv_file.pdf",
  "transcriptPath": "/uploads/transcript_file.pdf",
  "requestLetterPath": "/uploads/request_letter.pdf",
  "startDate": null,
  "endDate": null,
  "userId": 2,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Response Error (400) - Validasi Periode:**

```json
{
  "statusCode": 400,
  "message": "Tanggal mulai magang harus sebelum tanggal selesai magang.",
  "error": "Bad Request"
}
```

**Response Error (400) - Durasi Terlalu Pendek:**

```json
{
  "statusCode": 400,
  "message": "Durasi magang minimal 1 bulan.",
  "error": "Bad Request"
}
```

**Response Error (400) - Durasi Terlalu Panjang:**

```json
{
  "statusCode": 400,
  "message": "Durasi magang maksimal 6 bulan.",
  "error": "Bad Request"
}
```

**Response Error (400) - Tanggal Masa Lalu:**

```json
{
  "statusCode": 400,
  "message": "Tanggal mulai magang tidak boleh di masa lalu.",
  "error": "Bad Request"
}
```

**Business Rules Periode Magang:**

- Kedua field `startDate` dan `endDate` bersifat opsional
- Jika diisi, `startDate` harus sebelum `endDate`
- Durasi minimal: 1 bulan
- Durasi maksimal: 6 bulan
- `startDate` tidak boleh di masa lalu (untuk mahasiswa)
- Format tanggal: ISO 8601 (YYYY-MM-DD)

---

### 1.4 Endpoint Admin

#### GET `/internship-applications`

**Deskripsi:** Mendapatkan semua pendaftaran magang dengan periode magang (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**

- `page` (optional): Halaman (default: 1)
- `limit` (optional): Items per halaman (default: 10)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "status": "pending",
      "cvPath": "/uploads/cv_file.pdf",
      "transcriptPath": "/uploads/transcript_file.pdf",
      "requestLetterPath": "/uploads/request_letter.pdf",
      "startDate": "2025-02-01T00:00:00.000Z",
      "endDate": "2025-04-30T00:00:00.000Z",
      "verifiedAt": null,
      "feedback": null,
      "createdAt": "2025-01-15T10:30:00Z",
      "applicant": {
        "name": "John Doe",
        "email": "john@example.com",
        "namaLengkap": "John Doe",
        "asalInstitusi": "Universitas ABC"
      }
    },
    {
      "id": 2,
      "status": "accepted",
      "startDate": null,
      "endDate": null,
      "verifiedAt": "2025-01-14T08:00:00Z",
      "feedback": "Diterima tanpa periode spesifik",
      "applicant": {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "namaLengkap": "Jane Smith",
        "asalInstitusi": "Institut XYZ"
      }
    }
  ],
  "meta": {
    "totalItems": 25,
    "itemCount": 10,
    "itemsPerPage": 10,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

---

#### GET `/internship-applications/:id`

**Deskripsi:** Mendapatkan detail pendaftaran magang berdasarkan ID dengan periode magang

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "status": "pending",
  "cvPath": "/uploads/cv_file.pdf",
  "transcriptPath": "/uploads/transcript_file.pdf",
  "requestLetterPath": "/uploads/request_letter.pdf",
  "cvUrl": "http://localhost:3000/uploads/cv_file.pdf",
  "transcriptUrl": "http://localhost:3000/uploads/transcript_file.pdf",
  "requestLetterUrl": "http://localhost:3000/uploads/request_letter.pdf",
  "startDate": "2025-02-01T00:00:00.000Z",
  "endDate": "2025-04-30T00:00:00.000Z",
  "verifiedAt": null,
  "feedback": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "applicant": {
    "name": "John Doe",
    "email": "john@example.com",
    "namaLengkap": "John Doe",
    "nimNisn": "123456789",
    "asalInstitusi": "Universitas ABC",
    "jurusanProdi": "Teknik Informatika",
    "nomorTelepon": "081234567890",
    "alamat": "Jl. Contoh No. 123"
  }
}
```

---

#### PATCH `/internship-applications/:id/status`

**Deskripsi:** Update status pendaftaran magang dengan opsi set periode (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "status": "accepted",
  "feedback": "Dokumen lengkap dan memenuhi syarat",
  "startDate": "2025-03-01",
  "endDate": "2025-05-30"
}
```

**Request Body (tanpa periode):**

```json
{
  "status": "rejected",
  "feedback": "Dokumen tidak lengkap"
}
```

**Response Success (200):**

```json
{
  "id": 1,
  "status": "accepted",
  "feedback": "Dokumen lengkap dan memenuhi syarat",
  "startDate": "2025-03-01T00:00:00.000Z",
  "endDate": "2025-05-30T00:00:00.000Z",
  "verifiedAt": "2025-01-15T10:30:00Z",
  "verifiedBy": 2,
  "userId": 1
}
```

**Business Rules Admin:**

- Admin dapat set/update periode magang saat approve/reject
- Admin dapat set tanggal di masa lalu (untuk kasus khusus)
- Validasi durasi tetap berlaku (1-6 bulan)
- Periode yang di-set admin akan override periode dari mahasiswa

---

## Bagian 2: Aktivitas Inti Magang

### 2.1 Presensi (Attendance)

#### POST `/attendances/clock-in`

**Deskripsi:** Melakukan presensi masuk dengan validasi lokasi

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "latitude": -5.235,
  "longitude": 105.1572
}
```

**Response Success (201):**

```json
{
  "message": "Presensi masuk berhasil",
  "attendance": {
    "id": 1,
    "clockIn": "2025-01-15T08:00:00Z",
    "clockOut": null,
    "latitude": -5.235,
    "longitude": 105.1572,
    "ipAddress": "192.168.1.100",
    "userId": 1
  }
}
```

**Response Error (403):**

```json
{
  "message": "Anda harus berada dalam radius 50 meter dari kantor. Jarak Anda: 120 meter."
}
```

---

#### PATCH `/attendances/clock-out`

**Deskripsi:** Melakukan presensi pulang dengan validasi lokasi

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "latitude": -5.371217822527355,
  "longitude": 105.0494688446529
}
```

**Response Success (200):**

```json
{
  "message": "Presensi pulang berhasil",
  "attendance": {
    "id": 1,
    "clockIn": "2025-01-15T08:00:00Z",
    "clockOut": "2025-01-15T17:00:00Z",
    "latitude": -5.371217822527355,
    "longitude": 105.0494688446529,
    "clockOutLatitude": -5.371217822527355,
    "clockOutLongitude": 105.0494688446529,
    "ipAddress": "::1",
    "userId": 1,
    "createdAt": "2025-07-11T08:50:47.952Z",
    "updatedAt": "2025-07-11T09:09:02.186Z"
  },
  "clockOutCoordinates": {
    "latitude": -5.371217822527355,
    "longitude": 105.0494688446529
  }
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Anda harus berada dalam radius 30 meter dari kantor. Jarak Anda: 120 meter."
}
```

**Response Error (404):**

```json
{
  "statusCode": 404,
  "message": "Tidak ditemukan data presensi masuk untuk hari ini. Silakan clock-in terlebih dahulu."
}
```

---

#### GET `/attendances`

**Deskripsi:** Mendapatkan riwayat presensi user yang login

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "clockIn": "2025-01-15T08:00:00Z",
      "clockOut": "2025-01-15T17:00:00Z",
      "latitude": -5.235,
      "longitude": 105.1572,
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

---

#### GET `/attendances/all`

**Deskripsi:** Mendapatkan semua data presensi (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**

- `page` (optional): Halaman (default: 1)
- `limit` (optional): Items per halaman (default: 20)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "clockIn": "2025-01-15T08:00:00Z",
      "clockOut": "2025-01-15T17:00:00Z",
      "latitude": -5.235,
      "longitude": 105.1572,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "lastPage": 8
}
```

---

### 2.2 Logbook Harian

#### POST `/logbooks`

**Deskripsi:** Membuat entri logbook baru

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "logDate": "2025-01-15",
  "content": "Hari ini saya mempelajari sistem database BPS dan membantu input data survei."
}
```

**Response Success (201):**

```json
{
  "message": "Logbook berhasil dibuat",
  "logbook": {
    "id": 1,
    "logDate": "2025-01-15T00:00:00Z",
    "content": "Hari ini saya mempelajari sistem database BPS dan membantu input data survei.",
    "status": "draft",
    "userId": 1
  }
}
```

---

#### GET `/logbooks`

**Deskripsi:** Mendapatkan semua logbook user yang login

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "logDate": "2025-01-15T00:00:00Z",
      "content": "Hari ini saya mempelajari sistem database BPS dan membantu input data survei.",
      "status": "draft"
    }
  ]
}
```

---

#### GET `/logbooks/all`

**Deskripsi:** Mendapatkan semua logbook dengan paginasi (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**

- `page` (optional): Halaman (default: 1)
- `limit` (optional): Items per halaman (default: 20)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "logDate": "2025-01-15T00:00:00Z",
      "content": "Hari ini saya mempelajari sistem database BPS dan membantu input data survei.",
      "status": "draft",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "total": 200,
  "page": 1,
  "lastPage": 10
}
```

---

#### GET `/logbooks/:id`

**Deskripsi:** Mendapatkan detail logbook berdasarkan ID

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "logDate": "2025-01-15T00:00:00Z",
  "content": "Hari ini saya mempelajari sistem database BPS dan membantu input data survei.",
  "status": "draft",
  "userId": 1
}
```

---

#### PATCH `/logbooks/:id`

**Deskripsi:** Update logbook

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "content": "Hari ini saya mempelajari sistem database BPS, membantu input data survei, dan mengikuti rapat koordinasi.",
  "status": "submitted"
}
```

**Response Success (200):**

```json
{
  "message": "Logbook berhasil diperbarui",
  "logbook": {
    "id": 1,
    "logDate": "2025-01-15T00:00:00Z",
    "content": "Hari ini saya mempelajari sistem database BPS, membantu input data survei, dan mengikuti rapat koordinasi.",
    "status": "submitted",
    "userId": 1
  }
}
```

---

#### DELETE `/logbooks/:id`

**Deskripsi:** Menghapus logbook

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "message": "Logbook berhasil dihapus"
}
```

---

## Bagian 3: Modul Penugasan

### 3.1 Manajemen Tugas (Admin/Staff)

#### POST `/tasks`

**Deskripsi:** Membuat tugas baru dan langsung assign ke intern

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "title": "Analisis Data Survei",
  "description": "Lakukan analisis terhadap data survei ekonomi Q4 2024",
  "deadline": "2025-01-30",
  "internIds": [1, 2, 3]
}
```

**Response Success (201):**

```json
{
  "message": "Tugas berhasil dibuat dan ditugaskan",
  "task": {
    "id": 1,
    "title": "Analisis Data Survei",
    "description": "Lakukan analisis terhadap data survei ekonomi Q4 2024",
    "deadline": "2025-01-30T00:00:00Z",
    "createdBy": 2
  }
}
```

---

#### GET `/tasks`

**Deskripsi:** Mendapatkan semua tugas untuk user yang login

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Analisis Data Survei",
      "description": "Lakukan analisis terhadap data survei ekonomi Q4 2024",
      "deadline": "2025-01-30T00:00:00Z",
      "createdBy": 2,
      "creator": {
        "name": "Jane Staff"
      },
      "submission": {
        "id": 1,
        "status": "not_submitted",
        "filePath": null,
        "grade": null,
        "feedback": null
      }
    }
  ]
}
```

---

#### GET `/tasks/:id`

**Deskripsi:** Mendapatkan detail tugas berdasarkan ID

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "title": "Analisis Data Survei",
  "description": "Lakukan analisis terhadap data survei ekonomi Q4 2024",
  "deadline": "2025-01-30T00:00:00Z",
  "createdBy": 2,
  "creator": {
    "name": "Jane Staff"
  },
  "assignments": [
    {
      "user": {
        "id": 1,
        "name": "John Doe"
      },
      "submission": {
        "id": 1,
        "status": "not_submitted",
        "filePath": null,
        "grade": null,
        "feedback": null
      }
    }
  ]
}
```

---

#### PATCH `/tasks/:id`

**Deskripsi:** Update tugas (Admin/Staff only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "title": "Analisis Data Survei (Updated)",
  "description": "Lakukan analisis terhadap data survei ekonomi Q4 2024 dengan metodologi baru",
  "deadline": "2025-02-15"
}
```

**Response Success (200):**

```json
{
  "message": "Tugas berhasil diperbarui",
  "task": {
    "id": 1,
    "title": "Analisis Data Survei (Updated)",
    "description": "Lakukan analisis terhadap data survei ekonomi Q4 2024 dengan metodologi baru",
    "deadline": "2025-02-15T00:00:00Z",
    "createdBy": 2
  }
}
```

---

#### DELETE `/tasks/:id`

**Deskripsi:** Menghapus tugas (Admin/Staff only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "message": "Tugas berhasil dihapus"
}
```

---

### 3.2 Penugasan Tugas

#### POST `/tasks/:id/assign`

**Deskripsi:** Menugaskan tugas kepada peserta magang (Admin/Staff only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "internIds": [1, 2, 3]
}
```

**Response Success (201):**

```json
{
  "message": "Tugas berhasil ditugaskan",
  "assignments": [
    {
      "taskId": 1,
      "userId": 1
    },
    {
      "taskId": 1,
      "userId": 2
    },
    {
      "taskId": 1,
      "userId": 3
    }
  ]
}
```

---

### 3.3 Submission Tugas

#### POST `/submissions`

**Deskripsi:** Mengirim submission tugas

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `taskId` (number)
- `file` (file: PDF/DOC, max 5MB)

**Response Success (201):**

```json
{
  "message": "Submission berhasil dikirim",
  "submission": {
    "id": 1,
    "taskId": 1,
    "userId": 1,
    "filePath": "/uploads/submission_file.pdf",
    "status": "submitted",
    "submittedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

#### GET `/submissions`

**Deskripsi:** Mendapatkan semua submission user yang login

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "filePath": "/uploads/submission_file.pdf",
      "status": "submitted",
      "grade": null,
      "feedback": null,
      "submittedAt": "2025-01-15T10:30:00Z",
      "task": {
        "id": 1,
        "title": "Analisis Data Survei",
        "deadline": "2025-01-30T00:00:00Z"
      }
    }
  ]
}
```

---

#### PATCH `/submissions/:id/resubmit`

**Deskripsi:** Mengunggah ulang submission untuk revisi

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `file` (file: PDF/DOC, max 5MB)

**Response Success (200):**

```json
{
  "message": "Submission berhasil diunggah ulang",
  "submission": {
    "id": 1,
    "taskId": 1,
    "userId": 1,
    "filePath": "/uploads/submission_file_revised.pdf",
    "status": "submitted",
    "grade": null,
    "feedback": null,
    "submittedAt": "2025-01-16T14:20:00Z"
  }
}
```

---

#### PATCH `/submissions/:id/grade`

**Deskripsi:** Memberikan nilai dan feedback pada submission (Admin/Staff only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "grade": 85.5,
  "feedback": "Analisis bagus, namun perlu perbaikan pada bagian kesimpulan.",
  "status": "reviewed"
}
```

**Response Success (200):**

```json
{
  "message": "Submission berhasil dinilai",
  "submission": {
    "id": 1,
    "taskId": 1,
    "userId": 1,
    "filePath": "/uploads/submission_file.pdf",
    "status": "reviewed",
    "grade": 85.5,
    "feedback": "Analisis bagus, namun perlu perbaikan pada bagian kesimpulan.",
    "gradedAt": "2025-01-17T09:15:00Z"
  }
}
```

---

## Bagian 4: Modul Laporan Akhir

### 4.1 Final Project Management

#### POST `/final-projects`

**Deskripsi:** Upload laporan akhir (Intern only)

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `title` (string)
- `description` (string, optional)
- `file` (file: PDF, max 10MB)

**Response Success (201):**

```json
{
  "message": "Laporan akhir berhasil diunggah",
  "finalProject": {
    "id": 1,
    "title": "Analisis Sistem Informasi BPS",
    "description": "Laporan analisis mendalam tentang sistem informasi di BPS",
    "filePath": "/uploads/final-projects/final-project-abc123.pdf",
    "status": "submitted",
    "userId": 1,
    "submittedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

#### GET `/final-projects`

**Deskripsi:** Mendapatkan laporan akhir user yang login

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Analisis Sistem Informasi BPS",
      "description": "Laporan analisis mendalam tentang sistem informasi di BPS",
      "filePath": "/uploads/final-projects/final-project-abc123.pdf",
      "status": "submitted",
      "grade": null,
      "feedback": null,
      "submittedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

#### GET `/final-projects/all`

**Deskripsi:** Mendapatkan semua laporan akhir (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**

- `page` (optional): Halaman (default: 1)
- `limit` (optional): Items per halaman (default: 20)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Analisis Sistem Informasi BPS",
      "filePath": "/uploads/final-projects/final-project-abc123.pdf",
      "status": "submitted",
      "grade": null,
      "feedback": null,
      "submittedAt": "2025-01-15T10:30:00Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "reviewedBy": null
    }
  ],
  "total": 25,
  "page": 1,
  "lastPage": 2
}
```

---

#### GET `/final-projects/:id`

**Deskripsi:** Mendapatkan detail laporan akhir berdasarkan ID

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "title": "Analisis Sistem Informasi BPS",
  "description": "Laporan analisis mendalam tentang sistem informasi di BPS",
  "filePath": "/uploads/final-projects/final-project-abc123.pdf",
  "status": "submitted",
  "grade": null,
  "feedback": null,
  "submittedAt": "2025-01-15T10:30:00Z",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "reviewedBy": null
}
```

---

#### PATCH `/final-projects/:id`

**Deskripsi:** Update laporan akhir (hanya jika status draft atau revision)

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `title` (string, optional)
- `description` (string, optional)
- `file` (file: PDF, max 10MB, optional)

**Response Success (200):**

```json
{
  "message": "Laporan akhir berhasil diperbarui",
  "finalProject": {
    "id": 1,
    "title": "Analisis Sistem Informasi BPS (Revised)",
    "status": "submitted",
    "submittedAt": "2025-01-16T14:20:00Z"
  }
}
```

---

#### PATCH `/final-projects/:id/review`

**Deskripsi:** Review laporan akhir (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "status": "accepted",
  "grade": 88.5,
  "feedback": "Laporan sangat baik, analisis mendalam dan metodologi tepat."
}
```

**Response Success (200):**

```json
{
  "message": "Review laporan akhir berhasil",
  "finalProject": {
    "id": 1,
    "status": "accepted",
    "grade": 88.5,
    "feedback": "Laporan sangat baik, analisis mendalam dan metodologi tepat.",
    "reviewedAt": "2025-01-17T09:15:00Z",
    "reviewedBy": 2
  }
}
```

---

#### DELETE `/final-projects/:id`

**Deskripsi:** Menghapus laporan akhir

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "message": "Laporan akhir berhasil dihapus"
}
```

---

## Bagian 5: Modul Sertifikat

### 5.1 Certificate Management

#### GET `/certificates/check-template`

**Deskripsi:** Mengecek ketersediaan template sertifikat (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "success": true,
  "templateExists": true,
  "templatePath": "./uploads/certificate-templates/certificate-template.pdf",
  "hasFormFields": true,
  "fieldCount": 4,
  "fieldNames": [
    { "name": "internName", "type": "PDFTextField" },
    { "name": "predicate", "type": "PDFTextField" },
    { "name": "certificateNumber", "type": "PDFTextField" },
    { "name": "grade", "type": "PDFTextField" }
  ],
  "pageInfo": {
    "pageCount": 1,
    "firstPageSize": { "width": 842, "height": 596 }
  },
  "recommendation": "Template memiliki form fields, system akan mengisi fields otomatis"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Template PDF tidak ditemukan di: ./uploads/certificate-templates/certificate-template.pdf",
  "templateExists": false
}
```

---

#### POST `/certificates/generate`

**Deskripsi:** Generate sertifikat untuk intern (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "userId": 1
}
```

**Response Success (201):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe",
  "predicate": "Sangat Baik",
  "status": "generated",
  "templatePath": "./uploads/certificates/generated/certificate-CERT-2025-0115-1234.pdf",
  "signedFilePath": null,
  "generatedAt": "2025-01-15T10:30:00Z",
  "signedAt": null,
  "issuedAt": null,
  "userId": 1,
  "generatedById": 2,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "generatedBy": {
    "id": 2,
    "name": "Admin User"
  }
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "User sudah memiliki sertifikat"
}
```

---

#### GET `/certificates/:id/download-for-signing`

**Deskripsi:** Download sertifikat untuk ditandatangani (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="certificate-CERT-2025-0115-1234-for-signing.pdf"

[PDF binary data]
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Certificate belum di-generate atau sudah diproses"
}
```

---

#### PATCH `/certificates/:id/upload`

**Deskripsi:** Upload sertifikat yang sudah ditandatangani (Admin only)

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body (Form Data):**

- `file` (file: PDF, max 5MB)

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe",
  "predicate": "Sangat Baik",
  "status": "signed",
  "templatePath": "./uploads/certificates/generated/certificate-CERT-2025-0115-1234.pdf",
  "signedFilePath": "/uploads/certificates/signed/certificate-signed-abc123.pdf",
  "signedAt": "2025-01-15T15:30:00Z",
  "userId": 1,
  "generatedById": 2
}
```

---

#### PATCH `/certificates/:id/issue`

**Deskripsi:** Issue sertifikat agar bisa didownload intern (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe",
  "predicate": "Sangat Baik",
  "status": "issued",
  "issuedAt": "2025-01-15T16:00:00Z",
  "userId": 1,
  "generatedById": 2
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Hanya sertifikat yang sudah signed yang dapat diterbitkan"
}
```

---

#### GET `/certificates`

**Deskripsi:** Mendapatkan sertifikat user yang login (Intern only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe",
  "predicate": "Sangat Baik",
  "status": "issued",
  "generatedAt": "2025-01-15T10:30:00Z",
  "issuedAt": "2025-01-15T16:00:00Z",
  "generatedBy": {
    "id": 2,
    "name": "Admin User"
  }
}
```

**Response Error (404):**

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan"
}
```

---

#### GET `/certificates/:id/download`

**Deskripsi:** Download sertifikat yang sudah issued (Intern only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Sertifikat_CERT-2025-0115-1234.pdf"

[PDF binary data]
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Sertifikat belum diterbitkan"
}
```

---

#### GET `/certificates/all`

**Deskripsi:** Mendapatkan semua sertifikat (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**

- `page` (optional): Halaman (default: 1)
- `limit` (optional): Items per halaman (default: 20)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "certificateNumber": "CERT-2025-0115-1234",
      "internName": "John Doe",
      "predicate": "Sangat Baik",
      "status": "issued",
      "generatedAt": "2025-01-15T10:30:00Z",
      "issuedAt": "2025-01-15T16:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "generatedBy": {
        "id": 2,
        "name": "Admin User"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "lastPage": 1
}
```

---

#### GET `/certificates/:id`

**Deskripsi:** Mendapatkan detail sertifikat berdasarkan ID

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe",
  "predicate": "Sangat Baik",
  "status": "issued",
  "templatePath": "./uploads/certificates/generated/certificate-CERT-2025-0115-1234.pdf",
  "signedFilePath": "/uploads/certificates/signed/certificate-signed-abc123.pdf",
  "generatedAt": "2025-01-15T10:30:00Z",
  "signedAt": "2025-01-15T15:30:00Z",
  "issuedAt": "2025-01-15T16:00:00Z",
  "userId": 1,
  "generatedById": 2,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "generatedBy": {
    "id": 2,
    "name": "Admin User"
  }
}
```

---

#### PATCH `/certificates/:id`

**Deskripsi:** Update sertifikat (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Request Body:**

```json
{
  "internName": "John Doe Updated",
  "predicate": "Sangat Baik"
}
```

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe Updated",
  "predicate": "Sangat Baik",
  "status": "generated",
  "updatedAt": "2025-01-15T17:00:00Z",
  "userId": 1,
  "generatedById": 2
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Sertifikat yang sudah diterbitkan tidak dapat diubah"
}
```

---

#### DELETE `/certificates/:id`

**Deskripsi:** Menghapus sertifikat (Admin only)

**Headers:** `Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0115-1234",
  "internName": "John Doe",
  "predicate": "Sangat Baik",
  "status": "generated",
  "userId": 1,
  "generatedById": 2
}
```

---

## Bagian 6: Catatan & Standar Umum

### 6.1 Roles & Permissions

#### **Mahasiswa/Intern:**

- Dapat mengakses endpoint untuk aktivitas pribadi (profil, presensi, logbook, tugas)
- Dapat upload dan edit laporan akhir
- Dapat download sertifikat yang sudah issued
- Dapat melihat sertifikat pribadi

#### **Staff BPS:**

- Dapat membuat tugas dan menilai submission
- Dapat melihat presensi dan logbook semua intern
- Dapat review laporan akhir
- Dapat generate, upload, dan issue sertifikat

#### **Admin:**

- Memiliki akses penuh ke semua endpoint
- Dapat mengelola user dan verifikasi pendaftaran
- Dapat generate dan issue sertifikat
- Dapat mengakses semua data dengan paginasi
- Dapat mengelola template sertifikat

### 6.2 File Upload

#### **Format yang Didukung:**

- **Berkas Pendaftaran:** PDF (max 2MB)
- **Submission Tugas:** PDF, DOC, DOCX (max 5MB)
- **Laporan Akhir:** PDF (max 10MB)
- **Sertifikat:** PDF (max 5MB)

#### **Naming Convention:**

- **Berkas Upload:** `{type}-{random-hash}.{ext}`
- **Final Project:** `final-project-{random-hash}.pdf`
- **Certificate Generated:** `certificate-{certificateNumber}.pdf`
- **Certificate Signed:** `certificate-signed-{random-hash}.pdf`

#### **Storage Location:**

- **Berkas Pendaftaran:** `/uploads/internship-applications/`
- **Submission Tugas:** `/uploads/submissions/`
- **Laporan Akhir:** `/uploads/final-projects/`
- **Template Sertifikat:** `/uploads/certificate-templates/`
- **Sertifikat Generated:** `/uploads/certificates/generated/`
- **Sertifikat Signed:** `/uploads/certificates/signed/`

### 6.3 Pagination

Semua endpoint dengan paginasi menggunakan struktur response standar:

```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "lastPage": 8
}
```

**Query Parameters:**

- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah item per halaman (default: 10-20 tergantung endpoint)

### 6.4 Status Enum Values

#### **InternshipApplication Status:**

- `pending`: Menunggu verifikasi
- `diterima`: Diterima
- `ditolak`: Ditolak

#### **Logbook Status:**

- `draft`: Draft
- `submitted`: Sudah submit

#### **Submission Status:**

- `not_submitted`: Belum submit
- `submitted`: Sudah submit
- `reviewed`: Sudah dinilai
- `revision`: Perlu revisi

#### **FinalProject Status:**

- `draft`: Draft
- `submitted`: Sudah submit
- `reviewed`: Sedang direview
- `accepted`: Diterima
- `revision`: Perlu revisi

#### **Certificate Status:**

- `generated`: Sudah digenerate, belum ditandatangani
- `signed`: Sudah ditandatangani, belum issued
- `issued`: Sudah diterbitkan, bisa didownload intern

### 6.5 Standard Error Codes

#### **400 Bad Request**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

#### **401 Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### **403 Forbidden**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

#### **404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

#### **409 Conflict**

```json
{
  "statusCode": 409,
  "message": "Resource already exists"
}
```

#### **500 Internal Server Error**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### 6.6 Authentication

Semua endpoint yang memerlukan autentikasi harus menyertakan header:

```
Authorization: Bearer {jwt_token}
```

Token JWT diperoleh melalui endpoint `/auth/login` dan memiliki masa berlaku tertentu.

### 6.7 Rate Limiting

- **File Upload:** Max 10 requests per menit per user
- **General API:** Max 100 requests per menit per user
- **Admin Endpoints:** Max 200 requests per menit per admin

### 6.8 CORS

API mendukung CORS untuk domain frontend yang dikonfigurasi. Default: `http://localhost:3001`

### 6.9 Certificate Workflow

#### **Admin/Staff Workflow:**

1. **Generate Certificate** → Status: `generated`
2. **Download for Signing** → Admin download PDF
3. **Upload Signed Certificate** → Status: `signed`
4. **Issue Certificate** → Status: `issued`

#### **Intern Workflow:**

1. **View Certificate Status** → Check apakah sudah issued
2. **Download Certificate** → Download PDF final (jika status = `issued`)

#### **Business Rules:**

- Hanya intern dengan final project `accepted` yang bisa dibuatkan sertifikat
- Predicate auto-calculated dari grade final project
- Satu intern hanya bisa punya satu sertifikat
- Certificate number auto-generated dengan format `CERT-{YEAR}-{MMDD}-{RANDOM}`

### 6.10 Periode Magang

#### **Field Specifications:**

- **startDate**: DateTime (nullable) - Tanggal mulai magang
- **endDate**: DateTime (nullable) - Tanggal selesai magang
- **Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Input Format**: YYYY-MM-DD (akan dikonversi ke DateTime)

#### **Validation Rules:**

- Kedua field bersifat opsional
- Jika diisi, `startDate` < `endDate`
- Durasi minimal: 1 bulan
- Durasi maksimal: 6 bulan
- Mahasiswa tidak boleh set tanggal masa lalu
- Admin boleh set tanggal masa lalu

#### **Use Cases:**

1. **Mahasiswa pendaftar** - Bisa optional mengisi periode yang diinginkan
2. **Admin approval** - Bisa set periode saat approve application
3. **Periode tidak spesifik** - Kedua field null, periode ditentukan kemudian
4. **Update periode** - Admin bisa update periode via endpoint status

#### **Business Logic:**

- Aplikasi existing (sebelum update) akan memiliki periode null
- Backward compatibility terjaga
- Response API selalu include kedua field (null jika tidak diset)
- Validasi business rule hanya jalan jika kedua field diisi

---

**API Documentation v2.1** - Last updated: Januari 2025 (Periode Magang Update)  
For technical support, contact: dev@bps-magang.go.id
