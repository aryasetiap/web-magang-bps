# Internship Applications API

API ini digunakan untuk mengelola pengajuan magang, termasuk pembuatan, pengambilan, dan pembaruan status aplikasi magang.

---

## Authentication & Authorization

- Semua endpoint membutuhkan autentikasi JWT.
- Beberapa endpoint hanya dapat diakses oleh peran tertentu (`Admin`, `Staff BPS`, atau `Intern`).

---

## Endpoints

### 1. Create Internship Application

**POST** `/internship-applications`

#### Deskripsi

Membuat pengajuan magang baru. Hanya dapat diakses oleh user yang sudah login.

#### Fitur Baru (Mulai Juli 2025)

- **User dapat mengajukan ulang magang jika pengajuan sebelumnya berstatus `ditolak`.**
- Jika pengajuan sebelumnya masih `pending` atau sudah `diterima`, user **tidak dapat mengajukan ulang**.

#### Headers

- `Authorization: Bearer <token>`

#### Form Data (multipart/form-data)

| Field         | Tipe   | Required | Keterangan                                                    |
| ------------- | ------ | -------- | ------------------------------------------------------------- |
| cv            | File   | No       | File CV (PDF, max 2MB)                                        |
| transcript    | File   | Yes      | File transkrip (PDF, max 2MB)                                 |
| requestLetter | File   | Yes      | Surat permohonan (PDF, max 2MB)                               |
| startDate     | String | No       | Tanggal mulai magang (ISO 8601)                               |
| endDate       | String | No       | Tanggal selesai magang (ISO 8601, wajib jika startDate diisi) |

#### Response

```json
{
  "id": 1,
  "userId": 2,
  "cvPath": "uploads/xxx.pdf",
  "transcriptPath": "uploads/xxx.pdf",
  "requestLetterPath": "uploads/xxx.pdf",
  "startDate": "2025-08-01T00:00:00.000Z",
  "endDate": "2025-09-01T00:00:00.000Z",
  ...
}
```

#### Error

- 400: File tidak valid, ukuran melebihi batas, atau format bukan PDF.
- 409: User sudah pernah mengajukan magang dan status pengajuan sebelumnya masih `pending` atau `diterima`.

#### Contoh Kasus Pengajuan Ulang

- **Kasus:** User pernah mengajukan magang dan statusnya `ditolak`.
- **Aksi:** User dapat mengajukan ulang dengan endpoint ini (POST `/internship-applications`).
- **Catatan:** Setiap pengajuan ulang akan membuat record baru di database.

---

### 2. Get All Internship Applications

**GET** `/internship-applications`

#### Deskripsi

Mengambil seluruh data pengajuan magang. Hanya dapat diakses oleh **Admin dan Staff BPS**.

#### Headers

- `Authorization: Bearer <token>`

#### Query Parameters

| Nama  | Tipe   | Default | Keterangan              |
| ----- | ------ | ------- | ----------------------- |
| page  | Number | 1       | Halaman data            |
| limit | Number | 10      | Jumlah data per halaman |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "userId": 2,
      "cvPath": "...",
      "transcriptPath": "...",
      "requestLetterPath": "...",
      "startDate": "...",
      "endDate": "...",
      "applicant": {
        "id": 2,
        "name": "...",
        "email": "...",
        ...
      }
    }
  ],
  "meta": {
    "totalItems": 20,
    "itemCount": 10,
    "itemsPerPage": 10,
    "currentPage": 1,
    "totalPages": 2
  }
}
```

#### Error

- 401: Unauthorized
- 403: Forbidden (bukan Admin atau Staff BPS)

---

### 3. Get My Internship Application

**GET** `/internship-applications/me`

#### Deskripsi

Mengambil data pengajuan magang milik user yang sedang login. Hanya untuk peran Intern.

#### Headers

- `Authorization: Bearer <token>`

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "userId": 2,
      "cvPath": "...",
      "transcriptPath": "...",
      "requestLetterPath": "...",
      "startDate": "...",
      "endDate": "...",
      ...
    }
  ]
}
```

#### Error

- 401: Unauthorized
- 403: Forbidden (bukan Intern)

---

### 4. Get Internship Application by ID

**GET** `/internship-applications/:id`

#### Deskripsi

Mengambil detail pengajuan magang berdasarkan ID. Hanya untuk **Admin dan Staff BPS**.

#### Headers

- `Authorization: Bearer <token>`

#### Path Parameters

| Nama | Tipe   | Keterangan         |
| ---- | ------ | ------------------ |
| id   | Number | ID aplikasi magang |

#### Response

```json
{
  "id": 1,
  "userId": 2,
  "cvPath": "...",
  "transcriptPath": "...",
  "requestLetterPath": "...",
  "cvUrl": "http://localhost:3000/uploads/xxx.pdf",
  "transcriptUrl": "http://localhost:3000/uploads/xxx.pdf",
  "requestLetterUrl": "http://localhost:3000/uploads/xxx.pdf",
  "applicant": {
    "id": 2,
    "name": "...",
    "email": "...",
    ...
  }
}
```

#### Error

- 401: Unauthorized
- 403: Forbidden (bukan Admin atau Staff BPS)
- 404: Data tidak ditemukan

---

### 5. Update Application Status

**PATCH** `/internship-applications/:id/status`

#### Deskripsi

Memperbarui status aplikasi magang. Hanya untuk **Admin dan Staff BPS**.

#### Headers

- `Authorization: Bearer <token>`

#### Path Parameters

| Nama | Tipe   | Keterangan         |
| ---- | ------ | ------------------ |
| id   | Number | ID aplikasi magang |

#### Body (JSON)

| Field     | Tipe   | Required | Keterangan                                                    |
| --------- | ------ | -------- | ------------------------------------------------------------- |
| status    | Enum   | Yes      | Status aplikasi (`pending`, `diterima`, `ditolak`)            |
| feedback  | String | No       | Umpan balik                                                   |
| startDate | String | No       | Tanggal mulai magang (ISO 8601)                               |
| endDate   | String | No       | Tanggal selesai magang (ISO 8601, wajib jika startDate diisi) |

#### Response

```json
{
  "id": 1,
  "status": "diterima",
  "feedback": "Selamat, diterima.",
  "verifiedBy": 3,
  "verifiedAt": "2025-07-21T10:00:00.000Z",
  ...
}
```

#### Error

- 400: Validasi gagal (periode tidak valid, dsb)
- 401: Unauthorized
- 403: Forbidden (bukan Admin atau Staff BPS)
- 404: Data tidak ditemukan

---

## Catatan

- Semua file yang diupload harus berformat PDF dan maksimal 2MB.
- Field `cv` bersifat opsional, sedangkan `transcript` dan `requestLetter` wajib.
- Periode magang minimal 1 bulan dan maksimal 6 bulan.
- Tanggal mulai magang tidak boleh di masa lalu (kecuali oleh admin atau staff BPS saat verifikasi).
- **User dapat mengajukan ulang magang jika pengajuan sebelumnya berstatus `ditolak`.**

---

## Contoh Status Enum

```ts
enum StatusInternship {
  pending = 'pending',
  diterima = 'diterima',
  ditolak = 'ditolak',
}
```

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Pesan error",
  ...
}
```
