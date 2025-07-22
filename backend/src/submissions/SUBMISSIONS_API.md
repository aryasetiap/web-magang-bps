# Submissions API

## Autentikasi

Seluruh endpoint pada modul Submissions **wajib** menggunakan autentikasi JWT (Bearer Token).

---

## Endpoint

### 1. Resubmit Submission

- **URL:** `/submissions/:id/resubmit`
- **Method:** `PATCH`
- **Auth:** JWT (Bearer Token)
- **Deskripsi:**  
  Melakukan unggah ulang (resubmit) submission tugas oleh user. User dapat mengunggah file baru dan/atau memperbarui deskripsi submission.

#### Request

- **Path Parameter:**
  - `id` (number, required): ID submission yang akan di-resubmit

- **Body (form-data):**
  - `file` (file, optional): File baru yang diunggah (PDF, DOC, DOCX, max 5MB)
  - `description` (string, optional): Deskripsi baru submission

#### Contoh Request

```http
PATCH /submissions/12/resubmit
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: tugas_baru.pdf
description: "Perbaikan tugas sesuai feedback"
```

#### Validasi

- Minimal salah satu dari `file` atau `description` harus diisi.
- File hanya boleh bertipe PDF, DOC, atau DOCX, maksimal 5MB.
- Hanya submission dengan status `revisi` atau `submitted` yang dapat di-resubmit.
- User hanya dapat mengubah submission miliknya sendiri.
- Submission yang sudah dinilai (`reviewed`) tidak dapat diubah.

#### Response

- **200 OK**

  ```json
  {
    "id": 12,
    "filePath": "uploads/12-tugas_baru.pdf",
    "status": "submitted",
    "grade": null,
    "feedback": null,
    "isLate": false,
    "description": "Perbaikan tugas sesuai feedback",
    ...
  }
  ```

- **400 Bad Request**
  - Jika file/description tidak diisi, file tidak valid, atau ukuran file melebihi batas.
- **403 Forbidden**
  - Jika user bukan pemilik submission, atau status tidak mengizinkan resubmit.
- **404 Not Found**
  - Jika submission tidak ditemukan.

---

### 2. Submit Submission (Dari Service, Belum Ada Endpoint)

> **Catatan:**  
> Fungsi `submit` sudah tersedia di service, namun belum ada endpoint pada controller.  
> Endpoint ini **perlu ditambahkan** jika ingin mendukung submit tugas baru.

#### Rekomendasi Endpoint

- **URL:** `/submissions/:taskId/submit`
- **Method:** `POST`
- **Auth:** JWT (Bearer Token)

#### Request

- **Path Parameter:**
  - `taskId` (number, required): ID tugas yang akan dikumpulkan

- **Body (form-data):**
  - `file` (file, optional): File tugas (PDF, DOC, DOCX, max 5MB)
  - `description` (string, optional): Deskripsi submission

#### Validasi

- Minimal salah satu dari `file` atau `description` harus diisi.
- File hanya boleh bertipe PDF, DOC, atau DOCX, maksimal 5MB.
- User harus terdaftar pada assignment tugas tersebut.
- Tidak boleh submit lebih dari satu kali untuk tugas yang sama.
- Submit setelah deadline akan menandai submission sebagai `isLate: true`.

#### Response

- **201 Created**

  ```json
  {
    "id": 21,
    "filePath": "uploads/21-tugas.pdf",
    "taskId": 5,
    "userId": 3,
    "status": "submitted",
    "isLate": false,
    "description": "Tugas minggu ke-2"
  }
  ```

- **400 Bad Request**
  - Jika file/description tidak diisi, file tidak valid, ukuran file melebihi batas, atau sudah pernah submit.
- **403 Forbidden**
  - Jika user tidak ditugaskan pada tugas tersebut.

---

## DTO (Data Transfer Object)

### CreateSubmissionDto

```typescript
{
  description?: string; // Deskripsi tambahan (opsional)
}
```

### GradeSubmissionDto

```typescript
{
  grade: number; // Nilai 0-100 (wajib)
  feedback?: string; // Umpan balik (opsional)
  status?: 'reviewed' | 'revisi'; // Status penilaian (opsional)
}
```

---

## Status Submission

- `submitted`: Sudah dikumpulkan, menunggu penilaian.
- `reviewed`: Sudah dinilai, tidak bisa diubah.
- `revisi`: Perlu revisi, bisa di-resubmit.

---

## Error Handling

- **400 Bad Request:**  
  Input tidak valid, file tidak didukung, ukuran file melebihi batas, sudah pernah submit.
- **403 Forbidden:**  
  Tidak memiliki hak akses, status tidak mengizinkan aksi, bukan pemilik submission.
- **404 Not Found:**  
  Submission tidak ditemukan.

---

## Catatan Tambahan

- File yang diunggah akan disimpan pada path yang ditentukan oleh field `filePath`.
- Jika file baru diunggah saat resubmit, file lama akan dihapus dari storage.
- Semua operasi file menggunakan modul `fs` Node.js.

---
