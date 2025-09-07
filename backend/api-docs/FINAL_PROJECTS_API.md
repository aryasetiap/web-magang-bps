# 📑 Final Projects API

Modul **Final Projects** menyediakan endpoint REST API untuk pengelolaan laporan akhir magang (final project) oleh peserta magang (**Intern**) dan proses review/penilaian oleh **Admin/Staff**. Mendukung upload file laporan, update, review, dan penghapusan final project.

---

## 🔒 Mekanisme Autentikasi & Otorisasi

> **Catatan Penting:**
>
> - Semua endpoint membutuhkan autentikasi **JWT** (Bearer Token).
> - Endpoint tertentu hanya dapat diakses oleh role tertentu: <span style="background:#e0e7ff; padding:2px 6px; border-radius:4px;">Intern</span>, <span style="background:#fee2e2; padding:2px 6px; border-radius:4px;">Admin</span>, <span style="background:#fef9c3; padding:2px 6px; border-radius:4px;">Staff BPS</span>.
>
> Sertakan header berikut pada setiap request:
>
> ```http
> Authorization: Bearer <jwt_token>
> ```

---

## 📑 Daftar Endpoint

|   Metode   | URL                          | Deskripsi                               | Akses                |
| :--------: | ---------------------------- | --------------------------------------- | -------------------- |
|  **POST**  | `/final-projects`            | Membuat final project baru              | Intern               |
|  **GET**   | `/final-projects`            | Lihat semua final project milik sendiri | Intern               |
|  **GET**   | `/final-projects/all`        | Lihat semua final project (paginasi)    | Admin, Staff BPS     |
|  **GET**   | `/final-projects/:id`        | Lihat detail final project              | Admin, Staff, Intern |
| **PATCH**  | `/final-projects/:id`        | Update final project & upload file baru | Intern               |
| **PATCH**  | `/final-projects/:id/review` | Review/penilaian final project          | Admin, Staff BPS     |
| **DELETE** | `/final-projects/:id`        | Hapus final project milik sendiri       | Intern               |

---

## 📌 Detail Endpoint

<details>
<summary><strong>1. Membuat Final Project Baru</strong></summary>

- **URL:** `/final-projects`
- **Method:** `POST`
- **Akses:** <span style="background:#e0e7ff; padding:2px 6px; border-radius:4px;">Intern</span>

**Deskripsi:**  
Membuat final project baru. Mendukung upload file laporan (**PDF/DOC/DOCX**, max **10MB**).

**Form-data:**

- `title` (**string**, wajib): Judul laporan akhir
- `description` (**string**, opsional): Deskripsi laporan
- `file` (**file**, opsional): File laporan akhir

**Contoh Request**

```http
POST /final-projects
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

title: "Laporan Akhir Magang"
description: "Laporan kegiatan magang di BPS"
file: laporan-akhir.pdf
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Laporan Akhir Magang",
  "description": "Laporan kegiatan magang di BPS",
  "userId": 2,
  "filePath": "uploads/final-projects/final-project-xxxx.pdf",
  "status": "submitted",
  "submittedAt": "2025-08-01T10:00:00.000Z"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 400,
  "message": "File tidak valid atau melebihi batas ukuran"
}
```

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

</details>

---

<details>
<summary><strong>2. Lihat Semua Final Project Milik Sendiri</strong></summary>

- **URL:** `/final-projects`
- **Method:** `GET`
- **Akses:** <span style="background:#e0e7ff; padding:2px 6px; border-radius:4px;">Intern</span>

**Deskripsi:**  
Mengambil seluruh final project milik user yang sedang login.

**Contoh Response Sukses**

```json
[
  {
    "id": 1,
    "title": "Laporan Akhir Magang",
    "description": "Laporan kegiatan magang di BPS",
    "filePath": "uploads/final-projects/final-project-xxxx.pdf",
    "status": "submitted",
    "submittedAt": "2025-08-01T10:00:00.000Z"
  }
]
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

</details>

---

<details>
<summary><strong>3. Lihat Semua Final Project (Admin/Staff, Paginasi)</strong></summary>

- **URL:** `/final-projects/all?page=1&limit=20`
- **Method:** `GET`
- **Akses:** <span style="background:#fee2e2; padding:2px 6px; border-radius:4px;">Admin</span>, <span style="background:#fef9c3; padding:2px 6px; border-radius:4px;">Staff BPS</span>

**Deskripsi:**  
Mengambil seluruh data final project dengan paginasi.

**Contoh Response Sukses**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Laporan Akhir Magang",
      "user": {
        "id": 2,
        "name": "Arya",
        "email": "arya@email.com",
        "isGraduated": false
      },
      "filePath": "uploads/final-projects/final-project-xxxx.pdf",
      "status": "submitted",
      "grade": null,
      "reviewedBy": null
    }
  ],
  "total": 10,
  "page": 1,
  "lastPage": 1
}
```

**Contoh Response Error**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

</details>

---

<details>
<summary><strong>4. Lihat Detail Final Project</strong></summary>

- **URL:** `/final-projects/:id`
- **Method:** `GET`
- **Akses:** <span style="background:#fee2e2; padding:2px 6px; border-radius:4px;">Admin</span>, <span style="background:#fef9c3; padding:2px 6px; border-radius:4px;">Staff BPS</span>, <span style="background:#e0e7ff; padding:2px 6px; border-radius:4px;">Intern</span> (intern hanya miliknya sendiri)

**Deskripsi:**  
Mengambil detail final project berdasarkan ID.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Laporan Akhir Magang",
  "description": "Laporan kegiatan magang di BPS",
  "user": {
    "id": 2,
    "name": "Arya",
    "email": "arya@email.com"
  },
  "filePath": "uploads/final-projects/final-project-xxxx.pdf",
  "status": "submitted",
  "grade": null,
  "feedback": null,
  "reviewedBy": null
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "Final project tidak ditemukan"
}
```

```json
{
  "statusCode": 403,
  "message": "Anda tidak memiliki akses ke final project ini"
}
```

</details>

---

<details>
<summary><strong>5. Update Final Project & Upload File Baru</strong></summary>

- **URL:** `/final-projects/:id`
- **Method:** `PATCH`
- **Akses:** <span style="background:#e0e7ff; padding:2px 6px; border-radius:4px;">Intern</span> (hanya miliknya sendiri)

**Deskripsi:**  
Memperbarui data final project dan/atau upload file baru. Hanya bisa jika status belum `accepted`.

**Form-data:**

- `title` (**string**, opsional)
- `description` (**string**, opsional)
- `file` (**file**, opsional)

**Contoh Request**

```http
PATCH /final-projects/1
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

title: "Laporan Akhir Magang (Revisi)"
file: laporan-akhir-revisi.pdf
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Laporan Akhir Magang (Revisi)",
  "filePath": "uploads/final-projects/final-project-yyyy.pdf",
  "status": "submitted",
  "submittedAt": "2025-08-02T10:00:00.000Z"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 403,
  "message": "Final project sudah diterima, tidak dapat diubah"
}
```

```json
{
  "statusCode": 400,
  "message": "File tidak valid atau melebihi batas ukuran"
}
```

</details>

---

<details>
<summary><strong>6. Review/Penilaian Final Project (Admin/Staff)</strong></summary>

- **URL:** `/final-projects/:id/review`
- **Method:** `PATCH`
- **Akses:** <span style="background:#fee2e2; padding:2px 6px; border-radius:4px;">Admin</span>, <span style="background:#fef9c3; padding:2px 6px; border-radius:4px;">Staff BPS</span>

**Deskripsi:**  
Memberikan review, nilai, dan status pada final project yang sudah disubmit.

**Body (JSON):**

```json
{
  "status": "reviewed", // atau "accepted", "revisi"
  "grade": 90,
  "feedback": "Laporan sudah baik, silakan revisi bab 3."
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "status": "reviewed",
  "grade": 90,
  "feedback": "Laporan sudah baik, silakan revisi bab 3.",
  "reviewedById": 1,
  "reviewedAt": "2025-08-03T09:00:00.000Z"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 403,
  "message": "Hanya final project yang sudah disubmit yang dapat direview"
}
```

```json
{
  "statusCode": 400,
  "message": "Input tidak valid"
}
```

</details>

---

<details>
<summary><strong>7. Hapus Final Project Milik Sendiri</strong></summary>

- **URL:** `/final-projects/:id`
- **Method:** `DELETE`
- **Akses:** <span style="background:#e0e7ff; padding:2px 6px; border-radius:4px;">Intern</span> (hanya miliknya sendiri)

**Deskripsi:**  
Menghapus final project milik sendiri beserta file terkait.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "title": "Laporan Akhir Magang",
  "status": "deleted"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "Final project tidak ditemukan"
}
```

```json
{
  "statusCode": 403,
  "message": "Anda tidak memiliki akses ke final project ini"
}
```

</details>

---

## ⚠️ Catatan & Batasan

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Untuk upload file, gunakan `Content-Type: multipart/form-data`.
- File laporan hanya mendukung **PDF, DOC, DOCX**, maksimal **10MB**.
- **Intern** hanya dapat mengakses dan mengubah final project miliknya sendiri.
- **Admin/Staff** dapat melihat dan mereview seluruh final project.
- Status final project:  
  <span style="background:#f3f4f6; padding:2px 6px; border-radius:4px;">draft</span>,
  <span style="background:#f3f4f6; padding:2px 6px; border-radius:4px;">submitted</span>,
  <span style="background:#f3f4f6; padding:2px 6px; border-radius:4px;">reviewed</span>,
  <span style="background:#f3f4f6; padding:2px 6px; border-radius:4px;">accepted</span>,
  <span style="background:#f3f4f6; padding:2px 6px; border-radius:4px;">revisi</span>
- Semua tanggal menggunakan format **ISO 8601**.
- Error handling mengikuti standar **NestJS** (`statusCode`, `message`).

---
