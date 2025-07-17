# 📚 Dokumentasi API Task & Submission

## **A. TASK**

### 1. Buat Tugas

- **Endpoint:** `POST /tasks`
- **Role:** Admin, Staff BPS
- **Form Data:**
  - `title`: string (wajib)
  - `description`: string (wajib)
  - `deadline`: string (ISO date, wajib)
  - `internIds`: array of number (opsional, bisa `1,2,3` atau beberapa key)
  - `file`: file (opsional, PDF/DOC/DOCX, max 5MB)
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Judul Tugas",
    "description": "Deskripsi tugas",
    "deadline": "2025-07-31T23:59:59.000Z",
    "filePath": "uploads/tasks/xxxx.pdf",
    "fileUrl": "http://localhost:3000/uploads/tasks/xxxx.pdf",
    "createdBy": 10
  }
  ```

---

### 2. Assign Tugas ke Intern

- **Endpoint:** `POST /tasks/:id/assign`
- **Role:** Admin, Staff BPS
- **Body:**
  ```json
  {
    "internIds": [2, 3, 4]
  }
  ```
- **Response:**
  ```json
  {
    "count": 3
  }
  ```

---

### 3. Lihat Semua Tugas

- **Endpoint:** `GET /tasks`
- **Role:** Admin, Staff BPS
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "Judul Tugas",
        "description": "Deskripsi tugas",
        "deadline": "2025-07-31T23:59:59.000Z",
        "filePath": "uploads/tasks/xxxx.pdf",
        "fileUrl": "http://localhost:3000/uploads/tasks/xxxx.pdf",
        "createdBy": 10
      }
    ]
  }
  ```

---

### 4. Lihat Detail Tugas

- **Endpoint:** `GET /tasks/:id`
- **Role:** Admin, Staff BPS, Intern (intern hanya jika di-assign)
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Judul Tugas",
    "description": "Deskripsi tugas",
    "deadline": "2025-07-31T23:59:59.000Z",
    "filePath": "uploads/tasks/xxxx.pdf",
    "fileUrl": "http://localhost:3000/uploads/tasks/xxxx.pdf",
    "createdBy": 10
  }
  ```

---

### 5. Lihat Tugas Sendiri (Intern)

- **Endpoint:** `GET /tasks/my-tasks?page=1&limit=10`
- **Role:** Intern
- **Response:**
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

---

### 6. Soft Delete Tugas

- **Endpoint:** `DELETE /tasks/:id`
- **Role:** Admin, Staff BPS
- **Response:** Data tugas yang dihapus (soft delete).

---

### 7. Update Tugas

- **Endpoint:** `PATCH /tasks/:id`
- **Role:** Admin, Staff BPS
- **Body:** Field yang ingin diubah (title, description, deadline, dst)
- **Response:** Data tugas yang sudah diupdate.

---

## **B. SUBMISSION**

### 1. Submit Tugas

- **Endpoint:** `POST /tasks/:id/submissions`
- **Role:** Intern (hanya untuk tugas yang di-assign)
- **Form Data:**
  - `submissionFile`: file tugas (PDF/DOC/DOCX, max 5MB)
  - `description`: string (opsional, penjelasan tambahan/referensi/link)
- **Response:**
  ```json
  {
    "id": 5,
    "filePath": "uploads/submissions/xxxx.pdf",
    "taskId": 1,
    "userId": 2,
    "status": "submitted",
    "isLate": false,
    "description": "Penjelasan tambahan atau referensi/link penting"
  }
  ```

---

### 2. Resubmit Tugas

- **Endpoint:** `PATCH /submissions/:id/resubmit`
- **Role:** Intern (hanya untuk submission milik sendiri, status revisi/submitted)
- **Form Data:**
  - `file`: file tugas baru
  - `description`: string (opsional, penjelasan tambahan/referensi/link)
- **Response:**
  ```json
  {
    "id": 5,
    "filePath": "uploads/submissions/xxxx.pdf",
    "taskId": 1,
    "userId": 2,
    "status": "submitted",
    "isLate": false,
    "description": "Penjelasan tambahan atau referensi/link penting"
  }
  ```

---

### 3. Lihat Submission Tugas (Admin/Staff)

- **Endpoint:** `GET /tasks/:id/submissions`
- **Role:** Admin, Staff BPS
- **Response:** List submission untuk tugas tersebut, termasuk field `description`.

---

### 4. Menilai Submission

- **Endpoint:** `PATCH /tasks/submissions/:submissionId/grade`
- **Role:** Admin, Staff BPS (hanya creator tugas)
- **Body:**
  ```json
  {
    "grade": 85,
    "feedback": "Bagus, tapi ada yang perlu diperbaiki.",
    "status": "reviewed" // atau "revisi"
  }
  ```
- **Response:** Data submission yang sudah dinilai (termasuk field `description`).

---

## **Role & Akses**

- **Admin/Staff BPS:**
  - Buat, assign, update, delete, lihat semua tugas, lihat semua submission, menilai submission.
- **Intern:**
  - Lihat tugas yang di-assign, submit/resubmit tugas (dengan deskripsi), lihat status submission milik sendiri.

---

## **Cara Menggunakan Endpoint**

- Semua endpoint membutuhkan JWT token di header Authorization.
- Untuk upload file, gunakan form-data.
- Untuk assign ke banyak intern, gunakan `internIds` dengan format `1,2,3` atau beberapa key.
- Untuk submit/resubmit, tambahkan field `description` jika ingin memberikan penjelasan tambahan atau referensi/link.

---

## **Error Handling**

- Jika intern akses tugas/submission yang bukan miliknya: **403 Forbidden**.
- Jika file tidak valid: **400 Bad Request**.
- Jika tugas/submission tidak ditemukan: **404 Not Found**.

---

**Catatan:**

- Semua field pada response sudah sesuai dengan implementasi di backend.
- Untuk endpoint submit/resubmit, file wajib bertipe PDF/DOC/DOCX dan maksimal 5MB.
- Untuk endpoint yang mengembalikan tugas, field `fileUrl` dapat langsung digunakan FE untuk download/preview file.
- Pagination pada `/tasks/my-tasks` sudah didukung dengan query param `page` dan `limit`.
- Field `description` pada submission dapat digunakan untuk penjelasan tambahan atau referensi/link penting yang mendukung isi tugas.

---

**Jika FE butuh field tambahan atau format khusus, silakan informasikan ke tim backend.**
