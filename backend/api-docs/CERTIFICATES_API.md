# 📄 **Certificates API**

Modul **Certificates** menyediakan endpoint REST API untuk pembuatan, upload, penerbitan, pengunduhan, dan pengecekan template sertifikat magang berbasis PDF. Seluruh proses terintegrasi dengan database dan file storage, serta dilindungi oleh autentikasi JWT.

---

## 🔒 Mekanisme Autentikasi & Otorisasi

> **Catatan:**  
> Semua endpoint membutuhkan autentikasi JWT (Bearer Token).

- Endpoint tertentu hanya dapat diakses oleh **Admin**.
- Sertakan header berikut pada setiap request:
  ```http
  Authorization: Bearer <jwt_token>
  ```

---

## 📑 **Daftar Endpoint**

| **Metode** | **URL**                         | **Deskripsi**                                    | **Akses**    |
| :--------: | :------------------------------ | :----------------------------------------------- | :----------- |
|   `POST`   | `/certificates/generate`        | Generate sertifikat baru (PDF)                   | Admin        |
|  `PATCH`   | `/certificates/:id/upload`      | Upload file sertifikat yang sudah ditandatangani | Admin        |
|  `PATCH`   | `/certificates/:id/issue`       | Menerbitkan sertifikat (issue)                   | Admin        |
|   `GET`    | `/certificates/me`              | Ambil sertifikat milik user login (intern)       | Intern       |
|  `PATCH`   | `/certificates/template/upload` | Upload/ganti template sertifikat PDF             | Admin        |
|   `GET`    | `/certificates/:id/download`    | Download file sertifikat (PDF)                   | Admin/Intern |
|   `GET`    | `/certificates/template/check`  | Cek ketersediaan template sertifikat             | Admin        |
|   `GET`    | `/certificates`                 | List seluruh sertifikat (beserta user)           | Admin        |

---

## 📌 **Detail Endpoint**

<details>
<summary><strong>1. Generate Sertifikat Baru</strong></summary>

- **URL:** `/certificates/generate`
- **Method:** `POST`
- **Akses:** Admin

**Deskripsi:**  
Membuat sertifikat magang baru dalam bentuk PDF dan menyimpan metadata ke database.

<details>
<summary><strong>Contoh Request</strong></summary>

```json
{
  "certificateNumber": "BPS-2025-001",
  "userId": 12,
  "predicate": "Sangat Memuaskan",
  "namaKepalaBPS": "Drs. Budi Santoso, M.Si",
  "nipKepalaBPS": "19650101 199003 1 001"
}
```

</details>

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
{
  "id": 1,
  "certificateNumber": "BPS-2025-001",
  "userId": 12,
  "internName": "Arya Setia Pratama",
  "predicate": "Sangat Memuaskan",
  "institusi": "Universitas Lampung",
  "activityPeriod": "1 Juli - 31 Agustus 2025",
  "templatePath": "uploads/certificates/generated/certificate-BPS-2025-001.pdf",
  "status": "generated",
  "generatedAt": "2025-08-01T10:00:00.000Z"
}
```

</details>

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 400,
  "message": "Intern sudah memiliki sertifikat."
}
```

```json
{
  "statusCode": 404,
  "message": "User tidak ditemukan."
}
```

```json
{
  "statusCode": 400,
  "message": "Final project belum accepted."
}
```

</details>
</details>

---

<details>
<summary><strong>2. Upload Sertifikat yang Sudah Ditandatangani</strong></summary>

- **URL:** `/certificates/:id/upload`
- **Method:** `PATCH`
- **Akses:** Admin
- **Body:** Form-data, field `file` (PDF, max 5MB)

**Deskripsi:**  
Mengunggah file PDF sertifikat yang sudah ditandatangani.

<details>
<summary><strong>Contoh Request</strong></summary>

Form-data:

- `file`: sertifikat-signed.pdf
</details>

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
{
  "id": 1,
  "status": "signed",
  "signedFilePath": "uploads/certificates/signed/certificate-signed-1720423456-123456789.pdf",
  "signedAt": "2025-08-01T11:00:00.000Z"
}
```

</details>

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 400,
  "message": "File PDF wajib diunggah"
}
```

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan."
}
```

```json
{
  "statusCode": 400,
  "message": "Sertifikat harus status generated."
}
```

</details>
</details>

---

<details>
<summary><strong>3. Menerbitkan Sertifikat (Issue)</strong></summary>

- **URL:** `/certificates/:id/issue`
- **Method:** `PATCH`
- **Akses:** Admin

**Deskripsi:**  
Menerbitkan sertifikat yang sudah ditandatangani dan mengubah status user menjadi lulus.

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
{
  "id": 1,
  "status": "issued",
  "issuedAt": "2025-08-01T12:00:00.000Z"
}
```

</details>

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan."
}
```

```json
{
  "statusCode": 400,
  "message": "Sertifikat harus status signed."
}
```

</details>
</details>

---

<details>
<summary><strong>4. Ambil Sertifikat Milik Sendiri (Intern)</strong></summary>

- **URL:** `/certificates/me`
- **Method:** `GET`
- **Akses:** Intern

**Deskripsi:**  
Mengambil data sertifikat milik user yang sedang login.

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
{
  "id": 1,
  "certificateNumber": "BPS-2025-001",
  "userId": 12,
  "internName": "Arya Setia Pratama",
  "predicate": "Sangat Memuaskan",
  "status": "issued",
  "signedFilePath": "uploads/certificates/signed/certificate-signed-1720423456-123456789.pdf"
}
```

</details>

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan"
}
```

</details>
</details>

---

<details>
<summary><strong>5. Upload/Ganti Template Sertifikat PDF</strong></summary>

- **URL:** `/certificates/template/upload`
- **Method:** `PATCH`
- **Akses:** Admin
- **Body:** Form-data, field `file` (PDF, max 5MB)

**Deskripsi:**  
Mengunggah atau mengganti template sertifikat yang digunakan untuk generate PDF.

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
{
  "success": true,
  "message": "Template sertifikat berhasil diunggah."
}
```

</details>

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 400,
  "message": "File PDF wajib diunggah"
}
```

```json
{
  "statusCode": 400,
  "message": "File harus PDF"
}
```

</details>
</details>

---

<details>
<summary><strong>6. Download File Sertifikat (PDF)</strong></summary>

- **URL:** `/certificates/:id/download`
- **Method:** `GET`
- **Akses:** Admin (semua status), Intern (hanya status issued)

**Deskripsi:**  
Mengunduh file PDF sertifikat (signed/generated).

- Response berupa file PDF (`Content-Type: application/pdf`)
- Nama file: `Sertifikat_<certificateNumber>.pdf` atau `Certificate_<certificateNumber>_for-signing.pdf`

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan"
}
```

```json
{
  "statusCode": 400,
  "message": "Sertifikat belum siap untuk diunduh."
}
```

```json
{
  "statusCode": 404,
  "message": "File sertifikat tidak ditemukan di server."
}
```

</details>
</details>

---

<details>
<summary><strong>7. Cek Ketersediaan Template Sertifikat</strong></summary>

- **URL:** `/certificates/template/check`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengecek apakah template sertifikat PDF tersedia di server.

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
{
  "templateExists": true,
  "templatePath": "./uploads/certificate-templates/certificate-template.pdf"
}
```

</details>
</details>

---

<details>
<summary><strong>8. List Seluruh Sertifikat (Admin)</strong></summary>

- **URL:** `/certificates`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengambil seluruh data sertifikat beserta data user terkait.

<details>
<summary><strong>Contoh Response Sukses</strong></summary>

```json
[
  {
    "id": 1,
    "certificateNumber": "BPS-2025-001",
    "user": {
      "id": 12,
      "name": "Arya Setia Pratama",
      "email": "arya@email.com",
      "asalInstitusi": "Universitas Lampung",
      "isGraduated": true
    },
    "predicate": "Sangat Memuaskan",
    "status": "issued"
  }
]
```

</details>

<details>
<summary><strong>Contoh Response Error</strong></summary>

```json
{
  "statusCode": 403,
  "message": "Hanya admin"
}
```

</details>
</details>

---

## ⚠️ **Catatan & Batasan**

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Untuk upload file, gunakan `Content-Type: multipart/form-data`.
- File sertifikat dan template hanya mendukung **PDF**, maksimal **5MB**.
- Hanya **Admin** yang dapat generate, upload, issue, dan melihat seluruh sertifikat.
- **Intern** hanya dapat mengakses sertifikat miliknya sendiri.
- Semua tanggal menggunakan format **ISO 8601**.
- Error handling mengikuti standar **NestJS** (`statusCode`, `message`).
