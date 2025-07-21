# 📄 Certificate API Documentation

**Base URL:** `http://localhost:3000`

---

## 0. Upload/Replace Certificate Template

**Endpoint:**  
`PATCH /certificates/template/upload`

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (form-data):**

- `file`: (PDF template sertifikat, max 5MB)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Template sertifikat berhasil diunggah."
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "File PDF wajib diunggah"
}
```

---

## 0.1 Cek Ketersediaan Template Sertifikat

**Endpoint:**  
`GET /certificates/template/check`

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

## 0.2 List Semua Sertifikat

**Endpoint:**  
`GET /certificates`

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

---

## 1. Generate Certificate

**Endpoint:**  
`POST /certificates/generate`

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
  "certificateNumber": "CERT-2025-0001-BPSPringsewu",
  "userId": 1,
  "internName": "Arya Setia Pratama",
  "educationalStatus": "mahasiswa",
  "institusi": "Universitas Lampung",
  "predicate": "Sangat Baik",
  "namaKegiatan": "Kerja Praktik",
  "activityPeriod": "22 Juli - 30 Agustus 2025",
  "tglSertifikat": "2025-07-21T03:02:18.212Z",
  "namaKepalaBPS": "Drs. Budi Santoso, M.Si",
  "nipKepalaBPS": "19650101 199001 1 001",
  "templatePath": "uploads/certificates/generated/certificate-CERT-2025-0001-BPSPringsewu.pdf",
  "signedFilePath": null,
  "status": "generated",
  "generatedAt": "2025-07-21T03:02:18.212Z",
  "signedAt": null,
  "issuedAt": null,
  "createdBy": 2,
  "updatedBy": null,
  "createdAt": "2025-07-21T03:02:18.214Z",
  "updatedAt": "2025-07-21T03:02:18.214Z"
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "Intern sudah memiliki sertifikat."
}
```

---

## 2. Download Certificate (Generated/Signed/Issued)

**Endpoint:**  
`GET /certificates/:id/download`

**Role:**

- Admin: dapat download status `generated` dan `signed`
- Intern: hanya dapat download status `issued`

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

- File PDF (Content-Type: application/pdf)
- Content-Disposition: attachment; filename="Sertifikat\_{certificateNumber}.pdf"

**Response Error (404/400):**

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan"
}
```

atau

```json
{
  "statusCode": 400,
  "message": "Sertifikat belum siap untuk diunduh."
}
```

---

## 3. Upload Signed Certificate

**Endpoint:**  
`PATCH /certificates/:id/upload`

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (form-data):**

- `file`: (PDF hasil scan tanda tangan, max 5MB)

**Response Success (200):**

```json
{
  "id": 1,
  "status": "signed",
  "signedFilePath": "uploads/certificates/signed/certificate-signed-123456789.pdf",
  ...
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "Sertifikat harus status generated."
}
```

---

## 4. Issue Certificate

**Endpoint:**  
`PATCH /certificates/:id/issue`

**Role:** Admin

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "status": "issued",
  "issuedAt": "2025-07-21T03:10:00.000Z",
  ...
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "Sertifikat harus status signed."
}
```

---

## 5. Get Own Certificate (Intern)

**Endpoint:**  
`GET /certificates/me`

**Role:** Intern

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "certificateNumber": "CERT-2025-0001-BPSPringsewu",
  "internName": "Arya Setia Pratama",
  "predicate": "Sangat Baik",
  "status": "issued",
  "templatePath": "uploads/certificates/generated/certificate-CERT-2025-0001-BPSPringsewu.pdf",
  "signedFilePath": "uploads/certificates/signed/certificate-signed-123456789.pdf",
  "generatedAt": "2025-07-21T03:02:18.212Z",
  "signedAt": "2025-07-21T03:05:00.000Z",
  "issuedAt": "2025-07-21T03:10:00.000Z"
}
```

**Response Error (404):**

```json
{
  "statusCode": 404,
  "message": "Sertifikat tidak ditemukan"
}
```

---

## 6. Status Enum

- `generated`: Sudah digenerate, belum ditandatangani
- `signed`: Sudah ditandatangani, belum issued
- `issued`: Sudah diterbitkan, bisa didownload intern

---

## 7. Catatan Integrasi FE

- **Intern hanya bisa download jika status sertifikat = `issued`.**
- **Admin bisa download file generated (untuk ditandatangani manual) dan file signed.**
- **Gunakan endpoint `/certificates/me` untuk menampilkan status sertifikat di dashboard intern.**
- **Gunakan endpoint `/certificates/:id/download` untuk download file PDF.**
- **Jika ingin menampilkan preview, gunakan response Content-Type: application/pdf.**

---
