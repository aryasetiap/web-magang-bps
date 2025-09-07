# 📚 Attendances API

Modul Attendances menyediakan endpoint REST API untuk mengelola presensi (clock-in, clock-out), riwayat kehadiran, pengajuan cuti/izin, validasi izin oleh admin/staff, serta ekspor laporan presensi ke PDF. Seluruh endpoint diamankan dengan **JWT Auth** dan sebagian membutuhkan role tertentu.

---

## 🔒 Autentikasi & Otorisasi

> **Catatan:**
>
> - Semua endpoint membutuhkan autentikasi JWT (Bearer Token).
> - Endpoint tertentu hanya dapat diakses oleh role `admin` atau `staff`.

**Header yang wajib disertakan pada setiap request:**

```http
Authorization: Bearer <jwt_token>
```

---

## 📑 Daftar Endpoint

| **Metode** | **URL**                       | **Deskripsi**                             | **Akses**   |
| :--------: | :---------------------------- | :---------------------------------------- | :---------- |
|   `POST`   | `/attendances/clock-in`       | Presensi masuk (clock-in)                 | Semua user  |
|  `PATCH`   | `/attendances/clock-out`      | Presensi pulang (clock-out)               | Semua user  |
|   `GET`    | `/attendances`                | Lihat riwayat presensi sendiri            | Semua user  |
|   `GET`    | `/attendances/all`            | Lihat seluruh data presensi (paginasi)    | Admin       |
|   `GET`    | `/attendances/:id`            | Lihat detail presensi berdasarkan ID      | Semua user  |
|   `POST`   | `/attendances/request-leave`  | Ajukan cuti/izin (dengan upload bukti)    | Semua user  |
|  `PATCH`   | `/attendances/:id/validate`   | Validasi cuti/izin (admin/staff)          | Admin/Staff |
|   `GET`    | `/attendances/report`         | Ekspor rekap presensi semua intern ke PDF | Admin       |
|   `GET`    | `/attendances/:userId/report` | Ekspor presensi satu intern ke PDF        | Admin       |

---

## 📌 Detail Endpoint

<details>
<summary><strong>1. Presensi Masuk (Clock-In)</strong></summary>

- **URL:** `/attendances/clock-in`
- **Method:** `POST`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Melakukan presensi masuk dengan validasi lokasi (latitude, longitude).

**Contoh Request**

```http
POST /attendances/clock-in
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "latitude": -5.235,
  "longitude": 105.1572
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "userId": 2,
  "clockIn": "2025-07-21T08:00:00.000Z",
  "latitude": -5.235,
  "longitude": 105.1572,
  "status": "hadir"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 409,
  "message": "Anda sudah melakukan presensi masuk hari ini."
}
```

```json
{
  "statusCode": 403,
  "message": "Anda harus berada dalam radius 50 meter dari kantor. Jarak Anda: 120 meter."
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
<summary><strong>2. Presensi Pulang (Clock-Out)</strong></summary>

- **URL:** `/attendances/clock-out`
- **Method:** `PATCH`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Melakukan presensi pulang dengan validasi lokasi.

**Contoh Request**

```http
PATCH /attendances/clock-out
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "latitude": -5.235,
  "longitude": 105.1572
}
```

**Contoh Response Sukses**

```json
{
  "message": "Presensi pulang berhasil",
  "attendance": {
    "id": 1,
    "clockIn": "2025-07-21T08:00:00.000Z",
    "clockOut": "2025-07-21T17:00:00.000Z",
    "latitude": -5.235,
    "longitude": 105.1572,
    "userId": 2,
    "clockOutCoordinates": {
      "latitude": -5.235,
      "longitude": 105.1572
    }
  }
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "Tidak ditemukan data presensi masuk untuk hari ini. Silakan clock-in terlebih dahulu."
}
```

```json
{
  "statusCode": 403,
  "message": "Anda harus berada dalam radius 50 meter dari kantor. Jarak Anda: 120 meter."
}
```

</details>

---

<details>
<summary><strong>3. Lihat Riwayat Presensi Sendiri</strong></summary>

- **URL:** `/attendances`
- **Method:** `GET`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Mengambil seluruh riwayat presensi milik user yang sedang login.

**Contoh Response Sukses**

```json
{
  "data": [
    {
      "id": 1,
      "clockIn": "2025-07-21T08:00:00.000Z",
      "clockOut": "2025-07-21T17:00:00.000Z",
      "status": "hadir",
      "reasonDescription": null
    },
    ...
  ]
}
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
<summary><strong>4. Lihat Seluruh Data Presensi (Admin)</strong></summary>

- **URL:** `/attendances/all?page=1&limit=20`
- **Method:** `GET`
- **Akses:** Admin (JWT + Role)

**Deskripsi:**  
Mengambil seluruh data presensi dengan paginasi.

**Contoh Response Sukses**

```json
{
  "data": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "name": "Arya",
        "asalInstitusi": "Universitas ABC"
      },
      "clockIn": "2025-07-21T08:00:00.000Z",
      "clockOut": "2025-07-21T17:00:00.000Z",
      "status": "hadir"
    }
  ],
  "total": 100,
  "page": 1,
  "lastPage": 5
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
<summary><strong>5. Lihat Detail Presensi Berdasarkan ID</strong></summary>

- **URL:** `/attendances/:id`
- **Method:** `GET`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Mengambil detail presensi berdasarkan ID.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "userId": 2,
  "clockIn": "2025-07-21T08:00:00.000Z",
  "clockOut": "2025-07-21T17:00:00.000Z",
  "status": "hadir",
  "reasonDescription": null
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "Attendance tidak ditemukan"
}
```

</details>

---

<details>
<summary><strong>6. Ajukan Cuti/Izin (Upload Bukti)</strong></summary>

- **URL:** `/attendances/request-leave`
- **Method:** `POST`
- **Akses:** Semua user (JWT)

**Deskripsi:**  
Mengajukan permohonan cuti/izin dengan upload file bukti (JPG, PNG, PDF, max 5MB).

**Form-data:**

- `type`: `sakit` atau `izin`
- `description`: alasan tidak hadir
- `proof`: file bukti (JPG, PNG, PDF)

**Contoh Response Sukses**

```json
{
  "id": 10,
  "userId": 2,
  "status": "izin",
  "reasonDescription": "Ada keperluan keluarga",
  "proofFilePath": "uploads/proofs/1720423456-123456789.pdf",
  "submittedAt": "2025-07-21T07:00:00.000Z"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 400,
  "message": "Bukti pendukung wajib diunggah"
}
```

```json
{
  "statusCode": 409,
  "message": "Anda sudah mengajukan presensi hari ini"
}
```

</details>

---

<details>
<summary><strong>7. Validasi Permohonan Cuti/Izin (Admin/Staff)</strong></summary>

- **URL:** `/attendances/:id/validate`
- **Method:** `PATCH`
- **Akses:** Admin, Staff

**Deskripsi:**  
Memvalidasi permohonan cuti/izin (setuju/tolak) oleh admin/staff.

**Contoh Request**

```http
PATCH /attendances/10/validate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "izin"
}
```

**Contoh Response Sukses**

```json
{
  "id": 10,
  "status": "izin",
  "validatedBy": 1,
  "validatedAt": "2025-07-21T09:00:00.000Z"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 400,
  "message": "Status tidak valid"
}
```

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

</details>

---

<details>
<summary><strong>8. Ekspor Rekap Presensi Semua Intern ke PDF (Admin)</strong></summary>

- **URL:** `/attendances/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&institution=NamaInstansi`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengunduh file PDF rekap presensi seluruh intern pada periode dan institusi tertentu.

**Contoh Response Sukses**

- Response berupa file PDF (`Content-Type: application/pdf`)
- Nama file: `rekap-presensi.pdf`

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
<summary><strong>9. Ekspor Presensi Satu Intern ke PDF (Admin)</strong></summary>

- **URL:** `/attendances/:userId/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengunduh file PDF presensi satu intern pada periode tertentu.

**Contoh Response Sukses**

- Response berupa file PDF (`Content-Type: application/pdf`)
- Nama file: `presensi-intern-<userId>.pdf`

**Contoh Response Error**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

```json
{
  "statusCode": 404,
  "message": "User tidak ditemukan"
}
```

</details>

---

## ⚠️ Catatan & Batasan

- **Presensi masuk/pulang** hanya dapat dilakukan jika berada dalam radius kantor yang dikonfigurasi.
- **Pengajuan cuti/izin** hanya dapat dilakukan sebelum jam 11.00 WIB.
- **File bukti** hanya mendukung JPG, PNG, PDF, maksimal 5MB.
- **Role-based access:** Endpoint tertentu hanya untuk admin/staff.
- **Semua tanggal** menggunakan format ISO 8601.
- **Error handling** mengikuti standar NestJS (`statusCode`, `message`).
