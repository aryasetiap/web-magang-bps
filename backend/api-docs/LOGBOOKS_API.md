# 📒 Logbooks API

Modul **Logbooks** menyediakan endpoint REST API untuk mengelola entri logbook harian peserta magang.  
Fitur utama:

- Pembuatan, pembacaan, pembaruan, penghapusan logbook
- Ekspor logbook ke PDF (**khusus admin**)

---

## 🔒 Autentikasi & Otorisasi

> **Semua endpoint membutuhkan autentikasi JWT (Bearer Token).**

- Endpoint admin (`/logbooks/all`, `/logbooks/:userId/report`) hanya untuk user **admin**.
- Sertakan header berikut pada setiap request:
  ```http
  Authorization: Bearer <jwt_token>
  ```

---

## 📑 Daftar Endpoint

| **Metode** | **URL**                                      | **Deskripsi**                               | **Akses**  |
| :--------: | :------------------------------------------- | :------------------------------------------ | :--------- |
|   `POST`   | `/logbooks`                                  | Membuat logbook harian                      | Semua user |
|   `GET`    | `/logbooks`                                  | Lihat semua logbook milik sendiri           | Semua user |
|   `GET`    | `/logbooks/:id`                              | Lihat detail satu logbook milik sendiri     | Semua user |
|  `PATCH`   | `/logbooks/:id`                              | Update logbook milik sendiri                | Semua user |
|  `DELETE`  | `/logbooks/:id`                              | Hapus logbook milik sendiri                 | Semua user |
|   `GET`    | `/logbooks/all?page=1&limit=20`              | Lihat semua logbook seluruh user (paginasi) | **Admin**  |
|   `GET`    | `/logbooks/:userId/report?startDate&endDate` | Ekspor logbook satu intern ke PDF           | **Admin**  |

---

## 📌 Detail Endpoint

<details>
<summary><strong>1. Membuat Logbook</strong></summary>

- **URL:** `/logbooks`
- **Method:** `POST`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Membuat entri logbook harian. Hanya satu logbook per tanggal per user.

**Contoh Request**

```json
{
  "logDate": "2025-07-21",
  "content": "Deskripsi kegiatan minimal 10 karakter."
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-21T00:00:00.000Z",
  "content": "Deskripsi kegiatan minimal 10 karakter.",
  "status": "draft"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 400,
  "message": "Anda sudah mengisi logbook untuk tanggal ini."
}
```

</details>

---

<details>
<summary><strong>2. Melihat Semua Logbook Milik Sendiri</strong></summary>

- **URL:** `/logbooks`
- **Method:** `GET`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Mengambil seluruh logbook milik user yang sedang login.

**Contoh Response Sukses**

```json
[
  {
    "id": 1,
    "userId": 2,
    "logDate": "2025-07-21T00:00:00.000Z",
    "content": "Deskripsi kegiatan...",
    "status": "draft"
  }
]
```

</details>

---

<details>
<summary><strong>3. Melihat Satu Logbook Milik Sendiri</strong></summary>

- **URL:** `/logbooks/:id`
- **Method:** `GET`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Mengambil satu logbook berdasarkan ID milik user yang sedang login.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-21T00:00:00.000Z",
  "content": "Deskripsi kegiatan...",
  "status": "draft"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 403,
  "message": "Anda tidak memiliki izin untuk mengakses logbook ini."
}
```

```json
{
  "statusCode": 404,
  "message": "Logbook dengan ID 99 tidak ditemukan."
}
```

</details>

---

<details>
<summary><strong>4. Memperbarui Logbook</strong></summary>

- **URL:** `/logbooks/:id`
- **Method:** `PATCH`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Memperbarui data logbook milik sendiri. Semua field opsional.

**Contoh Request**

```json
{
  "logDate": "2025-07-22",
  "content": "Update kegiatan...",
  "status": "submitted"
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-22T00:00:00.000Z",
  "content": "Update kegiatan...",
  "status": "submitted"
}
```

</details>

---

<details>
<summary><strong>5. Menghapus Logbook</strong></summary>

- **URL:** `/logbooks/:id`
- **Method:** `DELETE`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Menghapus logbook milik sendiri berdasarkan ID.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-21T00:00:00.000Z",
  "content": "Deskripsi kegiatan...",
  "status": "draft"
}
```

</details>

---

<details>
<summary><strong>6. [ADMIN] Melihat Semua Logbook Seluruh User (Paginasi)</strong></summary>

- **URL:** `/logbooks/all?page=1&limit=20`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengambil seluruh logbook seluruh user dengan paginasi.

**Contoh Response Sukses**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 2,
      "logDate": "2025-07-21T00:00:00.000Z",
      "content": "Deskripsi kegiatan...",
      "status": "draft",
      "user": {
        "id": 2,
        "username": "user1",
        "email": "user1@email.com",
        "password": null
      }
    }
  ],
  "total": 100,
  "page": 1,
  "lastPage": 5
}
```

</details>

---

<details>
<summary><strong>7. Ekspor Logbook Satu Intern ke PDF (Admin)</strong></summary>

- **URL:** `/logbooks/:userId/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengunduh file PDF logbook satu intern pada periode tertentu.

**Contoh Request di Postman:**

```http
GET http://localhost:3000/logbooks/1/report?startDate=2025-07-01&endDate=2025-07-31
Authorization: Bearer <JWT_TOKEN_ADMIN>
```

**Contoh Response Sukses**

- Response berupa file PDF (`Content-Type: application/pdf`)
- Nama file: `logbook-intern-<userId>.pdf`

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "User tidak ditemukan"
}
```

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

</details>

---

## 📝 DTO & Validasi

### <span style="color:#4B9CD3">CreateLogbookDto</span>

| **Field** | **Type** | **Required** | **Validation**     |
| --------- | -------- | ------------ | ------------------ |
| logDate   | string   | Yes          | Format: YYYY-MM-DD |
| content   | string   | Yes          | Min. 10 karakter   |

### <span style="color:#4B9CD3">UpdateLogbookDto</span>

| **Field** | **Type** | **Required** | **Validation**           |
| --------- | -------- | ------------ | ------------------------ |
| logDate   | string   | No           | Format: YYYY-MM-DD       |
| content   | string   | No           | Min. 10 karakter         |
| status    | string   | No           | 'draft' atau 'submitted' |

---

## ⚠️ Catatan & Batasan

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Semua tanggal menggunakan format ISO (YYYY-MM-DD).
- Field `status` default: `draft`, dapat diubah menjadi `submitted`.
- Satu user hanya boleh membuat satu logbook per tanggal.
- Endpoint admin (`/logbooks/all`, `/logbooks/:userId/report`) hanya untuk role admin.
- Error handling mengikuti standar NestJS (`statusCode`, `message`).

---
