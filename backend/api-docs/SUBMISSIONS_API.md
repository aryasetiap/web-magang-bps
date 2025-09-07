# 📤 Submissions API

Modul **Submissions** menyediakan endpoint REST API untuk pengumpulan tugas (submission) oleh intern, resubmit tugas, dan penilaian submission oleh admin/staff. Mendukung upload file tugas (**PDF/DOC/DOCX**, max **5MB**) dan deskripsi tambahan.

---

## 🔒 Mekanisme Autentikasi & Otorisasi

> **Semua endpoint membutuhkan autentikasi JWT (Bearer Token).**  
> Endpoint penilaian hanya dapat diakses oleh **admin/staff (creator tugas)**.

**Header Wajib:**

```http
Authorization: Bearer <jwt_token>
```

---

## 📑 Daftar Endpoint

| Metode |              URL              |              Deskripsi               |         Akses         |
| :----: | :---------------------------: | :----------------------------------: | :-------------------: |
| PATCH  |  `/submissions/:id/resubmit`  | Resubmit tugas (file/deskripsi baru) |   Intern (pemilik)    |
| PATCH  | `/submissions/:taskId/submit` |          Submit tugas baru           |   Intern (assigned)   |
| PATCH  |   `/submissions/:id/grade`    |         Penilaian submission         | Admin/Staff (creator) |

---

## 📌 Detail Endpoint

<details>
<summary><strong>1. Resubmit Submission</strong></summary>

- **URL:** `/submissions/:id/resubmit`
- **Method:** `PATCH`
- **Akses:** Intern (hanya submission milik sendiri)

**Deskripsi:**  
Mengunggah ulang file tugas dan/atau memperbarui deskripsi submission yang statusnya <kbd>revisi</kbd> atau <kbd>submitted</kbd>.

**Form-data:**

- <kbd>file</kbd>: file tugas baru (opsional, PDF/DOC/DOCX, max 5MB)
- <kbd>description</kbd>: string (opsional, penjelasan tambahan)

**Contoh Request**

```http
PATCH /submissions/5/resubmit
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: tugas-revisi.pdf
description: "Sudah diperbaiki sesuai feedback"
```

**Contoh Response Sukses**

```json
{
  "id": 5,
  "filePath": "uploads/submissions/tugas-revisi.pdf",
  "taskId": 1,
  "userId": 2,
  "status": "submitted",
  "isLate": false,
  "description": "Sudah diperbaiki sesuai feedback"
}
```

**Contoh Response Error**

```json
{ "statusCode": 400, "message": "Minimal file atau deskripsi harus diisi." }
```

```json
{ "statusCode": 403, "message": "Anda tidak berhak mengubah submission ini." }
```

```json
{ "statusCode": 404, "message": "Submission tidak ditemukan." }
```

</details>

---

<details>
<summary><strong>2. Submit Tugas Baru</strong></summary>

- **URL:** `/submissions/:taskId/submit`
- **Method:** `PATCH`
- **Akses:** Intern (hanya untuk tugas yang di-assign)

**Deskripsi:**  
Mengumpulkan tugas baru. Minimal salah satu dari file atau deskripsi harus diisi.

**Form-data:**

- <kbd>file</kbd>: file tugas (opsional, PDF/DOC/DOCX, max 5MB)
- <kbd>description</kbd>: string (opsional, penjelasan tambahan)

**Contoh Request**

```http
PATCH /submissions/1/submit
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: tugas.pdf
description: "Sudah dikerjakan"
```

**Contoh Response Sukses**

```json
{
  "id": 10,
  "filePath": "uploads/submissions/tugas.pdf",
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
<summary><strong>3. Penilaian Submission</strong></summary>

- **URL:** `/submissions/:id/grade`
- **Method:** `PATCH`
- **Akses:** Admin/Staff (hanya creator tugas)

**Deskripsi:**  
Memberikan nilai, feedback, dan status pada submission.

**Body (JSON):**

```json
{
  "grade": 90,
  "feedback": "Bagus, sudah sesuai.",
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
  "grade": 90,
  "feedback": "Bagus, sudah sesuai.",
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

## ⚠️ Catatan & Batasan

- Semua endpoint membutuhkan header <kbd>Authorization: Bearer &lt;token&gt;</kbd>.
- Untuk upload file, gunakan <kbd>Content-Type: multipart/form-data</kbd>.
- File tugas hanya mendukung **PDF, DOC, DOCX**, maksimal **5MB**.
- Intern hanya dapat submit/resubmit tugas yang di-assign dan miliknya sendiri.
- Admin/Staff hanya dapat menilai submission pada tugas yang mereka buat.
- Error handling mengikuti standar NestJS (`statusCode`, `message`).
