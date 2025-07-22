# Logbooks API Documentation

Modul Logbooks menyediakan endpoint untuk mengelola entri logbook harian pengguna. Semua endpoint (kecuali endpoint admin) hanya dapat diakses oleh user yang sudah login (JWT Auth).

---

## Authentication

Semua endpoint (kecuali yang bertanda khusus) membutuhkan header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### 1. Membuat Logbook

**POST** `/logbooks`

#### Request Body

```json
{
  "logDate": "2025-07-21",
  "content": "Deskripsi kegiatan minimal 10 karakter."
}
```

#### Response

- **201 Created**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-21T00:00:00.000Z",
  "content": "Deskripsi kegiatan minimal 10 karakter.",
  "status": "draft"
}
```

#### Error

- **400 Bad Request**: Jika sudah ada logbook di tanggal yang sama.

---

### 2. Melihat Semua Logbook Milik Sendiri

**GET** `/logbooks`

#### Response

- **200 OK**

```json
[
  {
    "id": 1,
    "userId": 2,
    "logDate": "2025-07-21T00:00:00.000Z",
    "content": "Deskripsi kegiatan...",
    "status": "draft"
  },
  ...
]
```

---

### 3. Melihat Satu Logbook Milik Sendiri

**GET** `/logbooks/:id`

#### Response

- **200 OK**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-21T00:00:00.000Z",
  "content": "Deskripsi kegiatan...",
  "status": "draft"
}
```

#### Error

- **403 Forbidden**: Jika mencoba mengakses logbook milik user lain.
- **404 Not Found**: Jika logbook tidak ditemukan.

---

### 4. Memperbarui Logbook

**PATCH** `/logbooks/:id`

#### Request Body (semua field opsional)

```json
{
  "logDate": "2025-07-22",
  "content": "Update kegiatan...",
  "status": "submitted"
}
```

#### Response

- **200 OK**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-22T00:00:00.000Z",
  "content": "Update kegiatan...",
  "status": "submitted"
}
```

---

### 5. Menghapus Logbook

**DELETE** `/logbooks/:id`

#### Response

- **200 OK**

```json
{
  "id": 1,
  "userId": 2,
  "logDate": "2025-07-21T00:00:00.000Z",
  "content": "Deskripsi kegiatan...",
  "status": "draft"
}
```

---

### 6. [ADMIN] Melihat Semua Logbook Seluruh User (dengan paginasi)

**GET** `/logbooks/all?page=1&limit=20`

#### Header

- Hanya dapat diakses oleh user dengan role `admin`.

#### Response

- **200 OK**

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
    },
    ...
  ],
  "total": 100,
  "page": 1,
  "lastPage": 5
}
```

---

## DTO & Validasi

### CreateLogbookDto

| Field   | Type   | Required | Validation         |
| ------- | ------ | -------- | ------------------ |
| logDate | string | Yes      | Format: YYYY-MM-DD |
| content | string | Yes      | Min. 10 karakter   |

### UpdateLogbookDto

| Field   | Type   | Required | Validation               |
| ------- | ------ | -------- | ------------------------ |
| logDate | string | No       | Format: YYYY-MM-DD       |
| content | string | No       | Min. 10 karakter         |
| status  | string | No       | 'draft' atau 'submitted' |

---

## Error Handling

- **400 Bad Request**: Validasi gagal atau logbook sudah ada di tanggal yang sama.
- **403 Forbidden**: Mengakses/mengubah logbook milik user lain.
- **404 Not Found**: Logbook tidak ditemukan.

---

## Catatan

- Semua tanggal menggunakan format ISO (YYYY-MM-DD).
- Field `status` default: `draft`, dapat diubah menjadi `submitted`.
- Endpoint admin (`/logbooks/all`) hanya dapat diakses oleh
