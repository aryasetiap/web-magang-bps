# 📝 **Tasks API**

Modul **Tasks** menyediakan endpoint REST API untuk manajemen tugas, upload file, penugasan ke intern, pengumpulan tugas (submission), dan penilaian. Mendukung upload file (**PDF/DOC/DOCX**), role-based access, dan audit log.

---

## 🔒 **Mekanisme Autentikasi & Otorisasi**

> **Semua endpoint membutuhkan autentikasi JWT (Bearer Token).**

| Role                | Hak Akses                                                         |
| ------------------- | ----------------------------------------------------------------- |
| **Admin/Staff BPS** | CRUD tugas, assign, lihat semua tugas, nilai submission           |
| **Intern**          | Lihat tugas yang di-assign, submit tugas, lihat status submission |

**Header Wajib pada Setiap Request:**

```http
Authorization: Bearer <jwt_token>
```

---

## 📑 **Daftar Endpoint**

| Metode | URL                                      | Deskripsi                            | Akses                |
| ------ | ---------------------------------------- | ------------------------------------ | -------------------- |
| POST   | `/tasks`                                 | Membuat tugas baru (dengan file)     | Admin, Staff BPS     |
| POST   | `/tasks/:id/assign`                      | Assign tugas ke intern               | Admin, Staff BPS     |
| POST   | `/tasks/:id/submissions`                 | Submit tugas (intern)                | Intern               |
| GET    | `/tasks/my-tasks`                        | Lihat tugas yang di-assign ke intern | Intern               |
| GET    | `/tasks`                                 | Lihat semua tugas                    | Admin, Staff BPS     |
| GET    | `/tasks/:id`                             | Lihat detail tugas                   | Admin, Staff, Intern |
| GET    | `/tasks/:id/submissions`                 | Lihat semua submission untuk tugas   | Admin, Staff BPS     |
| PATCH  | `/tasks/:id`                             | Update tugas                         | Admin, Staff BPS     |
| PATCH  | `/tasks/submissions/:submissionId/grade` | Nilai submission tugas               | Admin, Staff BPS     |
| DELETE | `/tasks/:id`                             | Soft delete tugas                    | Admin, Staff BPS     |

---

## 📌 **Detail Endpoint**

<details>
<summary><strong>1. Membuat Tugas Baru</strong></summary>

- **URL:** `/tasks`
- **Method:** `POST`
- **Akses:** Admin, Staff BPS

**Deskripsi:**  
Membuat tugas baru, bisa upload file lampiran (**PDF/DOC/DOCX**, max 5MB), dan assign ke intern sekaligus.

**Form-data:**

- `title`: string (**wajib**)
- `description`: string (**wajib**)
- `deadline`: string (ISO date, **wajib**)
- `internIds`: array of number/string (opsional, bisa `1,2,3`)
- `file`: file (opsional, PDF/DOC/DOCX, max 5MB)

**Contoh Request**

```http
POST /tasks
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

title: "Tugas Membuat Laporan"
description: "Buat laporan mingguan"
deadline: "2025-07-31T23:59:59.000Z"
internIds: 2,3,4
file: tugas.pdf
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Tugas Membuat Laporan",
  "description": "Buat laporan mingguan",
  "deadline": "2025-07-31T23:59:59.000Z",
  "createdBy": 10,
  "filePath": "uploads/tasks/xxxx.pdf"
}
```

**Contoh Response Error**

```json
{ "statusCode": 400, "message": "Judul tugas tidak boleh kosong." }
```

```json
{
  "statusCode": 400,
  "message": "Tipe file tidak didukung. Hanya PDF/DOC/DOCX."
}
```

```json
{ "statusCode": 400, "message": "Ukuran file melebihi 5MB." }
```

</details>

---

<details>
<summary><strong>2. Assign Tugas ke Intern</strong></summary>

- **URL:** `/tasks/:id/assign`
- **Method:** `POST`
- **Akses:** Admin, Staff BPS

**Deskripsi:**  
Assign tugas ke satu atau beberapa intern.

**Body (JSON):**

```json
{
  "internIds": [2, 3, 4]
}
```

**Contoh Response Sukses**

```json
{ "count": 3 }
```

**Contoh Response Error**

```json
{ "statusCode": 404, "message": "Tugas dengan ID 1 tidak ditemukan." }
```

```json
{
  "statusCode": 400,
  "message": "Pilih setidaknya satu intern untuk ditugaskan."
}
```

</details>

---

<details>
<summary><strong>3. Submit Tugas (Intern)</strong></summary>

- **URL:** `/tasks/:id/submissions`
- **Method:** `POST`
- **Akses:** Intern

**Deskripsi:**  
Intern mengumpulkan tugas. Minimal file atau deskripsi harus diisi.

**Form-data:**

- `submissionFile`: file tugas (PDF/DOC/DOCX, max 5MB, opsional)
- `description`: string (opsional, penjelasan tambahan/referensi/link)

**Contoh Request**

```http
POST /tasks/1/submissions
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

submissionFile: tugas.pdf
description: "Sudah dikerjakan"
```

**Contoh Response Sukses**

```json
{
  "id": 5,
  "filePath": "uploads/submissions/xxxx.pdf",
  "taskId": 1,
  "userId": 2,
  "status": "submitted",
  "isLate": false,
  "description": "Sudah dikerjakan"
}
```

**Contoh Response Error**

```json
{ "statusCode": 400, "message": "Minimal file atau deskripsi harus diisi." }
```

```json
{
  "statusCode": 403,
  "message": "Anda tidak ditugaskan untuk mengerjakan tugas ini."
}
```

```json
{ "statusCode": 400, "message": "Anda sudah pernah mengumpulkan tugas ini." }
```

</details>

---

<details>
<summary><strong>4. Lihat Tugas yang Di-assign ke Intern</strong></summary>

- **URL:** `/tasks/my-tasks?page=1&limit=10`
- **Method:** `GET`
- **Akses:** Intern

**Deskripsi:**  
Melihat daftar tugas yang di-assign ke intern yang sedang login, beserta status submission.

**Contoh Response Sukses**

```json
[
  {
    "id": 1,
    "title": "Judul Tugas",
    "description": "Deskripsi tugas",
    "deadline": "2025-07-31T23:59:59.000Z",
    "filePath": "uploads/tasks/xxxx.pdf",
    "fileUrl": "http://localhost:3000/uploads/tasks/xxxx.pdf",
    "submission": {
      "id": 5,
      "status": "submitted",
      "grade": 90,
      "feedback": "Bagus",
      "isLate": false,
      "description": "Penjelasan tambahan atau referensi/link penting"
    }
  }
]
```

</details>

---

<details>
<summary><strong>5. Lihat Semua Tugas</strong></summary>

- **URL:** `/tasks`
- **Method:** `GET`
- **Akses:** Admin, Staff BPS

**Deskripsi:**  
Mengambil seluruh tugas yang belum dihapus.

**Contoh Response Sukses**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Judul Tugas",
      "description": "Deskripsi tugas",
      "deadline": "2025-07-31T23:59:59.000Z",
      "createdBy": 10,
      "filePath": "uploads/tasks/xxxx.pdf",
      "fileUrl": "http://localhost:3000/uploads/tasks/xxxx.pdf"
    }
  ]
}
```

</details>

---

<details>
<summary><strong>6. Lihat Detail Tugas</strong></summary>

- **URL:** `/tasks/:id`
- **Method:** `GET`
- **Akses:** Admin, Staff BPS, Intern (intern hanya jika di-assign)

**Deskripsi:**  
Mengambil detail satu tugas berdasarkan ID. Intern hanya bisa akses jika sudah di-assign.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Judul Tugas",
  "description": "Deskripsi tugas",
  "deadline": "2025-07-31T23:59:59.000Z",
  "createdBy": 10,
  "filePath": "uploads/tasks/xxxx.pdf",
  "fileUrl": "http://localhost:3000/uploads/tasks/xxxx.pdf"
}
```

**Contoh Response Error**

```json
{ "statusCode": 403, "message": "Anda tidak berhak mengakses tugas ini." }
```

```json
{ "statusCode": 404, "message": "Task tidak ditemukan" }
```

</details>

---

<details>
<summary><strong>7. Lihat Semua Submission untuk Tugas</strong></summary>

- **URL:** `/tasks/:id/submissions`
- **Method:** `GET`
- **Akses:** Admin, Staff BPS

**Deskripsi:**  
Mengambil seluruh submission untuk suatu tugas, termasuk data user.

**Contoh Response Sukses**

```json
[
  {
    "id": 5,
    "user": {
      "name": "Budi",
      "namaLengkap": "Budi Santoso"
    },
    "filePath": "uploads/submissions/xxxx.pdf",
    "status": "submitted",
    "grade": 90,
    "feedback": "Bagus",
    "isLate": false,
    "description": "Penjelasan tambahan"
  }
]
```

</details>

---

<details>
<summary><strong>8. Update Tugas</strong></summary>

- **URL:** `/tasks/:id`
- **Method:** `PATCH`
- **Akses:** Admin, Staff BPS

**Deskripsi:**  
Mengupdate data tugas jika belum melewati deadline.

**Body (JSON):**

```json
{
  "title": "Tugas Revisi",
  "description": "Deskripsi baru",
  "deadline": "2025-08-01T23:59:59.000Z"
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Tugas Revisi",
  "description": "Deskripsi baru",
  "deadline": "2025-08-01T23:59:59.000Z",
  "createdBy": 10,
  "filePath": "uploads/tasks/xxxx.pdf"
}
```

**Contoh Response Error**

```json
{ "statusCode": 404, "message": "Task tidak ditemukan atau sudah dihapus." }
```

```json
{
  "statusCode": 400,
  "message": "Task sudah melewati deadline dan tidak bisa diubah."
}
```

</details>

---

<details>
<summary><strong>9. Nilai Submission Tugas</strong></summary>

- **URL:** `/tasks/submissions/:submissionId/grade`
- **Method:** `PATCH`
- **Akses:** Admin, Staff BPS (hanya creator tugas)

**Deskripsi:**  
Memberikan nilai, feedback, dan status pada submission.

**Body (JSON):**

```json
{
  "grade": 85,
  "feedback": "Bagus, tapi ada yang perlu diperbaiki.",
  "status": "reviewed" // atau "revisi"
}
```

**Contoh Response Sukses**

```json
{
  "id": 5,
  "taskId": 1,
  "userId": 2,
  "status": "reviewed",
  "grade": 85,
  "feedback": "Bagus, tapi ada yang perlu diperbaiki.",
  "gradedBy": 10,
  "gradedAt": "2025-08-01T10:00:00.000Z"
}
```

**Contoh Response Error**

```json
{ "statusCode": 403, "message": "Anda tidak berhak menilai submission ini." }
```

```json
{
  "statusCode": 400,
  "message": "Submission hanya bisa dinilai jika status submitted/revisi."
}
```

```json
{ "statusCode": 404, "message": "Submission tidak ditemukan." }
```

</details>

---

<details>
<summary><strong>10. Soft Delete Tugas</strong></summary>

- **URL:** `/tasks/:id`
- **Method:** `DELETE`
- **Akses:** Admin, Staff BPS

**Deskripsi:**  
Soft delete tugas berdasarkan ID.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Judul Tugas",
  "deletedAt": "2025-08-01T10:00:00.000Z"
}
```

**Contoh Response Error**

```json
{ "statusCode": 404, "message": "Task tidak ditemukan" }
```

</details>

---

## ⚠️ **Catatan & Batasan**

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Untuk upload file, gunakan `Content-Type: multipart/form-data`.
- File tugas hanya mendukung **PDF, DOC, DOCX**, maksimal **5MB**.
- Intern hanya dapat submit tugas yang di-assign dan melihat tugas miliknya.
- Admin/Staff hanya dapat mengedit, menghapus, assign, dan menilai tugas yang mereka buat.
- Error handling mengikuti standar **NestJS** (`statusCode`, `message`).
- Semua tanggal menggunakan format **ISO 8601**.

---
