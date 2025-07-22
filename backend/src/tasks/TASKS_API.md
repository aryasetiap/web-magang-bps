# Tasks API

Modul Tasks menyediakan endpoint untuk manajemen tugas, penugasan ke intern, pengumpulan tugas (submission), dan penilaian tugas.

**Seluruh endpoint dilindungi oleh JWT Auth dan RolesGuard.**

---

## 1. Membuat Tugas Baru

**Endpoint:**  
`POST /tasks`

**Akses:**  
Admin, Staff BPS

**Body:**  
Form-data (support upload file `file`)

| Field       | Tipe   | Keterangan                                       |
| ----------- | ------ | ------------------------------------------------ |
| title       | string | Wajib, judul tugas                               |
| description | string | Wajib, deskripsi tugas                           |
| deadline    | string | Wajib, format ISO date (contoh: 2025-12-31)      |
| internIds   | array  | Opsional, daftar ID intern yang di-assign        |
| file        | file   | Opsional, lampiran tugas (PDF/DOC/DOCX, max 5MB) |

**Contoh Body (JSON):**

```json
{
  "title": "Laporan Mingguan",
  "description": "Buat laporan mingguan kegiatan magang.",
  "deadline": "2025-12-31",
  "internIds": [2, 3]
}
```

**Response:**

```json
{
  "id": 1,
  "title": "Laporan Mingguan",
  "description": "Buat laporan mingguan kegiatan magang.",
  "deadline": "2025-12-31T00:00:00.000Z",
  "createdBy": 1,
  "filePath": "uploads/tasks/xxx.pdf"
}
```

---

## 2. Assign Tugas ke Intern

**Endpoint:**  
`POST /tasks/:id/assign`

**Akses:**  
Admin, Staff BPS

**Body:**

```json
{
  "internIds": [2, 3]
}
```

**Response:**

```json
{
  "count": 2
}
```

---

## 3. Mengumpulkan Tugas (Submission) oleh Intern

**Endpoint:**  
`POST /tasks/:id/submissions`

**Akses:**  
Intern

**Body:**  
Form-data (support upload file `submissionFile` dan/atau field `description`)

| Field          | Tipe   | Keterangan                                         |
| -------------- | ------ | -------------------------------------------------- |
| submissionFile | file   | Opsional, file hasil tugas (PDF/DOC/DOCX, max 5MB) |
| description    | string | Opsional, deskripsi submission                     |

**Catatan:** Minimal salah satu (file atau deskripsi) harus diisi.

**Response:**

```json
{
  "id": 1,
  "filePath": "uploads/submissions/xxx.pdf",
  "taskId": 1,
  "userId": 2,
  "status": "submitted",
  "isLate": false,
  "description": "Sudah dikerjakan"
}
```

---

## 4. Mendapatkan Seluruh Submission untuk Suatu Tugas

**Endpoint:**  
`GET /tasks/:id/submissions`

**Akses:**  
Admin, Staff BPS

**Response:**

```json
[
  {
    "id": 1,
    "filePath": "uploads/submissions/xxx.pdf",
    "taskId": 1,
    "userId": 2,
    "status": "submitted",
    "isLate": false,
    "description": "Sudah dikerjakan",
    "user": {
      "name": "Budi",
      "namaLengkap": "Budi Santoso"
    }
  }
]
```

---

## 5. Menilai Submission

**Endpoint:**  
`PATCH /tasks/submissions/:submissionId/grade`

**Akses:**  
Admin, Staff BPS

**Body:**

```json
{
  "grade": 90, // Opsional, nilai (jika status reviewed)
  "feedback": "Bagus", // Opsional, feedback/revisi
  "status": "reviewed" // "reviewed" atau "revisi"
}
```

**Response:**

```json
{
  "id": 1,
  "grade": 90,
  "feedback": "Bagus",
  "status": "reviewed",
  "gradedBy": 1,
  "gradedAt": "2025-07-22T10:00:00.000Z"
}
```

---

## 6. Mendapatkan Daftar Tugas yang Di-assign ke Intern

**Endpoint:**  
`GET /tasks/my-tasks?page=1&limit=10`

**Akses:**  
Intern

**Response:**

```json
[
  {
    "id": 1,
    "title": "Laporan Mingguan",
    "description": "Buat laporan mingguan kegiatan magang.",
    "deadline": "2025-12-31T00:00:00.000Z",
    "createdBy": 1,
    "filePath": "uploads/tasks/xxx.pdf",
    "fileUrl": "http://localhost:3000/uploads/tasks/xxx.pdf",
    "creator": { "name": "Admin" },
    "submission": {
      "id": 10,
      "status": "submitted",
      "grade": null,
      "feedback": null,
      "isLate": false
    }
  }
]
```

---

## 7. Mendapatkan Daftar Semua Tugas

**Endpoint:**  
`GET /tasks`

**Akses:**  
Admin, Staff BPS

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Laporan Mingguan",
      "description": "Buat laporan mingguan kegiatan magang.",
      "deadline": "2025-12-31T00:00:00.000Z",
      "createdBy": 1,
      "filePath": "uploads/tasks/xxx.pdf",
      "fileUrl": "http://localhost:3000/uploads/tasks/xxx.pdf"
    }
  ]
}
```

---

## 8. Mendapatkan Detail Satu Tugas

**Endpoint:**  
`GET /tasks/:id`

**Akses:**  
Admin, Staff BPS, Intern (Intern hanya jika sudah di-assign ke tugas tersebut)

**Response:**

```json
{
  "id": 1,
  "title": "Laporan Mingguan",
  "description": "Buat laporan mingguan kegiatan magang.",
  "deadline": "2025-12-31T00:00:00.000Z",
  "createdBy": 1,
  "filePath": "uploads/tasks/xxx.pdf",
  "fileUrl": "http://localhost:3000/uploads/tasks/xxx.pdf"
}
```

---

## 9. Memperbarui Data Tugas

**Endpoint:**  
`PATCH /tasks/:id`

**Akses:**  
Admin, Staff BPS

**Body:**  
Sama seperti `CreateTaskDto`, namun seluruh field opsional.

**Response:**  
Data tugas yang telah diperbarui (lihat response detail tugas).

---

## 10. Menghapus (Soft Delete) Tugas

**Endpoint:**  
`DELETE /tasks/:id`

**Akses:**  
Admin, Staff BPS

**Response:**  
Data tugas yang telah dihapus (soft delete).

---

## Error Response

- **401 Unauthorized**: Token tidak valid atau tidak ada.
- **403 Forbidden**: Tidak memiliki hak akses.
- **404 Not Found**: Data tidak ditemukan.
- **409 Conflict**: Sudah pernah mengumpulkan tugas ini.
- **400 Bad Request**: Validasi gagal, file tidak didukung, atau deadline sudah lewat.

---

## Catatan

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Untuk upload file, gunakan `Content-Type: multipart/form-data`.
- Field tanggal (`deadline`) menggunakan format ISO 8601.
- File tugas/submission hanya mendukung PDF, DOC,
