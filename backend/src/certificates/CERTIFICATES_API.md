# 📄 Certificate API Documentation

**Base URL:** `http://localhost:3000`

---

## Alur Proses Sertifikat

1. **Generate Certificate** (Admin)
2. **Upload Signed Certificate** (Admin)
3. **Issue Certificate** (Admin)
4. **Download Certificate** (Admin/Intern)
5. **Get Own Certificate** (Intern)

---

## Endpoint List

- `PATCH /certificates/template/upload`  
  Upload/replace template sertifikat (Admin)
- `GET /certificates/template/check`  
  Cek ketersediaan template (Admin)
- `GET /certificates`  
  List semua sertifikat (Admin)
- `POST /certificates/generate`  
  Generate sertifikat baru (Admin)
- `PATCH /certificates/:id/upload`  
  Upload signed certificate (Admin)
- `PATCH /certificates/:id/issue`  
  Issue sertifikat (Admin)
- `GET /certificates/:id/download`  
  Download sertifikat (Admin/Intern)
- `GET /certificates/me`  
  Get own certificate (Intern)

---

## PATCH `/certificates/template/upload`

**Deskripsi:**  
Upload atau ganti template sertifikat (PDF, max 5MB).

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (form-data):**

- `file`: PDF template sertifikat

**Response Success (200):**

```json
{ "success": true, "message": "Template sertifikat berhasil diunggah." }
```

**Response Error (400):**

```json
{ "statusCode": 400, "message": "File PDF wajib diunggah" }
```

---

## GET `/certificates/template/check`

**Deskripsi:**  
Cek apakah template sertifikat tersedia.

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "templateExists": true,
  "templatePath": "./uploads/certificate-templates/certificate-template.pdf"
}
```

---

## GET `/certificates`

**Deskripsi:**  
Ambil seluruh data sertifikat beserta data user.

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
[
  {
    "id": 1,
    "certificateNumber": "CERT-2025-0001-BPSPringsewu",
    "userId": 1,
    "internName": "Arya Setia Pratama",
    "status": "issued",
    "createdAt": "2025-07-21T03:02:18.214Z",
    "user": {
      "id": 1,
      "name": "Arya",
      "email": "arya@email.com",
      "namaLengkap": "Arya Setia Pratama",
      "asalInstitusi": "Universitas Lampung"
    }
    // ...field lain sesuai kebutuhan
  }
]
```

**Response Error (403):**

```json
{ "statusCode": 403, "message": "Hanya admin" }
```

---

## POST `/certificates/generate`

**Deskripsi:**  
Generate sertifikat baru untuk intern (hanya jika final project sudah accepted).

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: application/json`

**Request Body:**

```json
{
  "certificateNumber": "CERT-2025-0001-BPSPringsewu",
  "userId": 1,
  "predicate": "Sangat Baik",
  "namaKepalaBPS": "Drs. Budi Santoso, M.Si",
  "nipKepalaBPS": "19650101 199001 1 001"
}
```

**Response Success (201):**

```json
{
  "id": 1,
  "certificateNumber": "...",
  "userId": 1,
  "internName": "...",
  "status": "generated",
  "templatePath": "..."
  // ...field lain
}
```

**Response Error (400):**

```json
{ "statusCode": 400, "message": "Intern sudah memiliki sertifikat." }
```

atau

```json
{ "statusCode": 400, "message": "Final project belum accepted." }
```

---

## PATCH `/certificates/:id/upload`

**Deskripsi:**  
Upload file PDF sertifikat yang sudah ditandatangani.

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (form-data):**

- `file`: PDF hasil scan tanda tangan

**Response Success (200):**

```json
{
  "id": 1,
  "status": "signed",
  "signedFilePath": "uploads/certificates/signed/certificate-signed-123456789.pdf"
  // ...
}
```

**Response Error (400):**

```json
{ "statusCode": 400, "message": "Sertifikat harus status generated." }
```

atau

```json
{ "statusCode": 400, "message": "File PDF wajib diunggah" }
```

---

## PATCH `/certificates/:id/issue`

**Deskripsi:**  
Menerbitkan sertifikat yang sudah ditandatangani.

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "status": "issued",
  "issuedAt": "2025-07-21T03:10:00.000Z"
  // ...
}
```

**Response Error (400):**

```json
{ "statusCode": 400, "message": "Sertifikat harus status signed." }
```

---

## GET `/certificates/:id/download`

**Deskripsi:**  
Download file sertifikat (PDF).

- Admin: dapat download status `generated` dan `signed`
- Intern: hanya dapat download status `issued`

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

- File PDF (Content-Type: application/pdf)
- Content-Disposition: attachment; filename="Sertifikat\_{certificateNumber}.pdf"

**Response Error (404):**

```json
{ "statusCode": 404, "message": "Sertifikat tidak ditemukan" }
```

atau

```json
{ "statusCode": 400, "message": "Sertifikat belum siap untuk diunduh." }
```

atau

```json
{ "statusCode": 404, "message": "File sertifikat tidak ditemukan di server." }
```

---

## GET `/certificates/me`

**Deskripsi:**  
Ambil data sertifikat milik intern yang sedang login.

**Role:** Intern

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "...",
  "internName": "...",
  "predicate": "...",
  "status": "issued",
  "templatePath": "...",
  "signedFilePath": "...",
  "generatedAt": "...",
  "signedAt": "...",
  "issuedAt": "..."
}
```

**Response Error (404):**

```json
{ "statusCode": 404, "message": "Sertifikat tidak ditemukan" }
```

---

## Status Enum

- `generated`: Sudah digenerate, belum ditandatangani
- `signed`: Sudah ditandatangani, belum issued
- `issued`: Sudah diterbitkan, bisa didownload intern

---

## Error Umum

- **400 Bad Request**: Request tidak valid, file tidak sesuai, status tidak valid, dsb.
- **401 Unauthorized**: Token tidak valid atau belum login.
- **403 Forbidden**: Role tidak sesuai.
- **404 Not Found**: Data/file tidak ditemukan.
- **500 Internal Server Error**: Kesalahan server.

---

## Catatan Integrasi FE

- Intern hanya bisa download jika status sertifikat = `issued`.
- Admin bisa download file generated (untuk ditandatangani manual) dan file signed.
- Gunakan endpoint `/certificates/me` untuk menampilkan status sertifikat di dashboard intern.
- Gunakan endpoint `/certificates/:id/download` untuk download file PDF.
- Jika ingin menampilkan preview, gunakan response Content-Type: application/pdf.
