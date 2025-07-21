# 📄 Dokumentasi API Final Project

**Base URL:** `/final-projects`

---

## Alur Umum

1. **Intern** membuat/mengunggah Final Project (bisa draft, bisa langsung submit dengan file).
2. **Intern** dapat memperbarui atau menghapus Final Project miliknya (selama belum diterima).
3. **Admin/Staff BPS** dapat melihat seluruh Final Project, melakukan review (beri nilai, feedback, dan status).
4. **Intern** hanya dapat melihat dan mengelola miliknya sendiri.

---

## Endpoint List

- `POST /final-projects`  
  Membuat Final Project baru (Intern)
- `GET /final-projects`  
  List seluruh Final Project milik user login (Intern)
- `GET /final-projects/all`  
  List seluruh Final Project (Admin/Staff BPS, paginasi)
- `GET /final-projects/:id`  
  Detail Final Project (Intern hanya miliknya, Admin semua)
- `PATCH /final-projects/:id`  
  Update Final Project (Intern, hanya miliknya, selama belum diterima)
- `PATCH /final-projects/:id/review`  
  Review Final Project (Admin/Staff BPS)
- `DELETE /final-projects/:id`  
  Hapus Final Project (Intern, hanya miliknya)

---

## POST `/final-projects`

**Deskripsi:**  
Membuat Final Project baru.  
Jika file diunggah, status otomatis `submitted`, jika tidak, status `draft`.

**Role:** Intern

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (form-data):**

- `title` (string, required): Judul final project
- `description` (string, optional): Deskripsi final project
- `file` (file, optional): File PDF/DOC/DOCX final project

**Response Success (201):**

```json
{
  "id": 1,
  "title": "Aplikasi Monitoring Magang",
  "description": "Aplikasi untuk memonitor logbook dan tugas magang.",
  "filePath": "uploads/final-projects/final-project-xxxx.pdf",
  "status": "submitted",
  "userId": 2,
  "createdAt": "2025-07-21T10:00:00.000Z",
  "submittedAt": "2025-07-21T10:00:00.000Z"
}
```

**Response Error (400):**

```json
{ "statusCode": 400, "message": "File tidak valid" }
```

---

## GET `/final-projects`

**Deskripsi:**  
Mengambil seluruh Final Project milik user login (Intern).

**Role:** Intern

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
[
  {
    "id": 1,
    "title": "Aplikasi Monitoring Magang",
    "description": "...",
    "filePath": "...",
    "status": "draft",
    "userId": 2,
    "createdAt": "...",
    "submittedAt": null
  }
]
```

---

## GET `/final-projects/all`

**Deskripsi:**  
Mengambil seluruh Final Project (Admin/Staff BPS) dengan paginasi.

**Role:** Admin, Staff BPS

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Query Params:**

- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response Success (200):**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Aplikasi Monitoring Magang",
      "description": "...",
      "filePath": "...",
      "status": "submitted",
      "user": {
        "id": 2,
        "name": "Arya",
        "email": "arya@email.com"
      },
      "reviewedBy": {
        "id": 1,
        "name": "Admin"
      }
    }
  ],
  "total": 12,
  "page": 1,
  "lastPage": 2
}
```

---

## GET `/final-projects/:id`

**Deskripsi:**  
Mengambil detail Final Project berdasarkan ID.

- Intern hanya bisa akses miliknya sendiri.
- Admin/Staff BPS bisa akses semua.

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "title": "Aplikasi Monitoring Magang",
  "description": "...",
  "filePath": "...",
  "status": "reviewed",
  "grade": 90,
  "feedback": "Sangat baik",
  "user": {
    "id": 2,
    "name": "Arya",
    "email": "arya@email.com"
  },
  "reviewedBy": {
    "id": 1,
    "name": "Admin"
  }
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Anda tidak memiliki akses ke final project ini"
}
```

**Response Error (404):**

```json
{ "statusCode": 404, "message": "Final project tidak ditemukan" }
```

---

## PATCH `/final-projects/:id`

**Deskripsi:**  
Update Final Project milik user login (Intern).  
Hanya bisa jika status belum `accepted`.

**Role:** Intern

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (form-data):**

- `title` (string, optional): Judul baru
- `description` (string, optional): Deskripsi baru
- `file` (file, optional): File baru (PDF/DOC/DOCX)

**Response Success (200):**

```json
{
  "id": 1,
  "title": "Aplikasi Monitoring Magang (Revisi)",
  "description": "...",
  "filePath": "...",
  "status": "submitted",
  "submittedAt": "2025-07-21T12:00:00.000Z"
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Final project yang sudah diterima tidak dapat diubah"
}
```

---

## PATCH `/final-projects/:id/review`

**Deskripsi:**  
Review Final Project (beri status, nilai, dan feedback).  
Hanya bisa jika status saat ini `submitted`.

**Role:** Admin, Staff BPS

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: application/json`

**Request Body:**

```json
{
  "status": "reviewed", // atau "accepted", "revisi"
  "grade": 90,
  "feedback": "Sangat baik, presentasi jelas."
}
```

**Response Success (200):**

```json
{
  "id": 1,
  "status": "reviewed",
  "grade": 90,
  "feedback": "Sangat baik, presentasi jelas.",
  "reviewedById": 1,
  "reviewedAt": "2025-07-21T13:00:00.000Z"
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Hanya final project yang sudah disubmit yang dapat direview"
}
```

---

## DELETE `/final-projects/:id`

**Deskripsi:**  
Menghapus Final Project milik user login (Intern).  
File yang terkait juga akan dihapus.

**Role:** Intern

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "title": "Aplikasi Monitoring Magang",
  "status": "draft",
  "deleted": true
}
```

**Response Error (403):**

```json
{
  "statusCode": 403,
  "message": "Anda tidak memiliki akses ke final project ini"
}
```

**Response Error (404):**

```json
{ "statusCode": 404, "message": "Final project tidak ditemukan" }
```

---

## Status Final Project

- `draft`: Belum disubmit, bisa diubah/hapus oleh intern.
- `submitted`: Sudah disubmit, menunggu review.
- `reviewed`: Sudah direview, bisa revisi.
- `accepted`: Sudah diterima, tidak bisa diubah.
- `revisi`: Perlu revisi.

---

## Catatan Teknis

- File yang diupload hanya boleh PDF, DOC, atau DOCX, maksimal 10MB.
- Intern hanya bisa mengakses dan mengubah/hapus miliknya sendiri.
- Admin/Staff BPS bisa melihat dan mereview semua final project.
- Jika file baru diupload saat update, file lama akan dihapus otomatis.
- Semua endpoint membutuhkan JWT Auth.

---

## Error Umum

- **400 Bad Request**: Request tidak valid, file tidak sesuai, dsb.
- **401 Unauthorized**: Token tidak valid atau belum login.
- **403 Forbidden**: Role tidak sesuai atau akses data bukan miliknya.
- **404 Not Found**: Data tidak ditemukan.
- **500 Internal Server Error**: Kesalahan server.

---

\*\*Dokumentasi ini sudah disesuaikan dengan implementasi kode dan siap digunakan untuk
