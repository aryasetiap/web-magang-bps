# 📚 Attendance API Documentation

## 1. Authentication

Semua endpoint menggunakan JWT Auth.  
Tambahkan header:

```
Authorization: Bearer <token>
```

---

## 2. Endpoint List

### A. Clock In

#### `POST /attendances/clock-in`

Presensi masuk dengan validasi lokasi.

**Request Body:**

```json
{
  "latitude": -5.235,
  "longitude": 105.1572
}
```

**Response:**

```json
{
  "id": 1,
  "userId": 1,
  "clockIn": "2025-07-18T08:00:00.000Z",
  "latitude": -5.235,
  "longitude": 105.1572,
  ...
}
```

**Error:**

- Sudah presensi hari ini: `409 Conflict`
- Lokasi tidak valid: `403 Forbidden`

---

### B. Clock Out

#### `PATCH /attendances/clock-out`

Presensi pulang dengan validasi lokasi.

**Request Body:**

```json
{
  "latitude": -5.235,
  "longitude": 105.1572
}
```

**Response:**

```json
{
  "message": "Presensi pulang berhasil",
  "attendance": {
    "id": 1,
    "clockIn": "...",
    "clockOut": "...",
    "clockOutCoordinates": {
      "latitude": -5.235,
      "longitude": 105.1572
    }
  }
}
```

**Error:**

- Belum clock-in: `404 Not Found`
- Lokasi tidak valid: `403 Forbidden`

---

### C. Pengajuan Sakit/Izin

#### `POST /attendances/request-leave`

Pengajuan sakit/izin dengan upload bukti dan deskripsi.

**Form Data (multipart/form-data):**

- `type`: `sakit` atau `izin` (enum, required)
- `description`: alasan tidak hadir (required)
- `proof`: file JPG/PNG/PDF, max 5MB (required)

**Response:**

```json
{
  "id": 2,
  "userId": 1,
  "status": "izin",
  "reasonDescription": "Ada urusan keluarga",
  "proofFilePath": "uploads/proofs/1234567890.pdf",
  "submittedAt": "2025-07-18T09:00:00.000Z",
  ...
}
```

**Error:**

- Lewat jam 11.00 WIB: `400 Bad Request`
- File tidak valid: `400 Bad Request`
- Sudah presensi hari ini: `409 Conflict`

---

### D. Validasi Pengajuan oleh Admin/Staff

#### `PATCH /attendances/:id/validate`

Validasi pengajuan sakit/izin, ubah status presensi.

**Request Body:**

```json
{
  "status": "hadir" | "sakit" | "izin" | "tanpa_keterangan"
}
```

**Response:**

```json
{
  "id": 2,
  "status": "sakit",
  "validatedBy": 99,
  "validatedAt": "2025-07-18T10:00:00.000Z",
  ...
}
```

**Error:**

- Status tidak valid: `400 Bad Request`

---

### E. Riwayat Presensi Sendiri

#### `GET /attendances`

Ambil semua riwayat presensi user yang sedang login.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "status": "hadir",
      "clockIn": "...",
      "clockOut": "...",
      ...
    },
    {
      "id": 2,
      "status": "izin",
      "reasonDescription": "...",
      "proofFilePath": "...",
      ...
    }
  ]
}
```

---

### F. Riwayat Presensi Semua User (Admin)

#### `GET /attendances/all?page=1&limit=20`

Ambil semua presensi untuk admin, paginasi.

**Response:**

```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "lastPage": 5
}
```

---

### G. Detail Presensi

#### `GET /attendances/:id`

Ambil detail satu presensi.

**Response:**

```json
{
  "id": 1,
  "status": "hadir",
  ...
}
```

---

## 3. Status Presensi

- `hadir`: Presensi normal
- `sakit`: Pengajuan sakit
- `izin`: Pengajuan izin
- `tanpa_keterangan`: Otomatis jika tidak presensi/izin/sakit sebelum jam 11.00 WIB

---

## 4. Catatan Validasi

- Pengajuan sakit/izin hanya bisa dilakukan sebelum jam 11.00 WIB.
- File bukti wajib dan harus JPG, PNG, atau PDF, maksimal 5MB.
- Admin/staff dapat mengubah status presensi setelah validasi.

---

## 5. Contoh Error Response

```json
{
  "statusCode": 400,
  "message": "Pengajuan hanya bisa dilakukan sebelum pukul 11.00 WIB"
}
```

---

## 6. Tips Implementasi FE

- Gunakan form multipart untuk pengajuan sakit/izin.
- Tampilkan status presensi sesuai enum.
- Tampilkan preview file bukti jika ada.
- Tampilkan alasan dan status validasi pada detail presensi.

---

## 7. Status Otomatis "Tanpa Keterangan"

Jika user belum melakukan presensi atau pengajuan sakit/izin sebelum jam 11.00 WIB, sistem akan otomatis membuat record presensi dengan status `tanpa_keterangan` setiap hari pada jam 11:01 WIB.

---

## 8. Hak Akses Endpoint

- Endpoint `/attendances/all` dan `/attendances/:id/validate` hanya dapat diakses oleh user dengan role `admin` atau `staff`.
- Endpoint lain dapat diakses oleh user yang sudah login.

---

## 9. Contoh Curl Pengajuan Sakit/Izin

```bash
curl -X POST http://localhost:3000/attendances/request-leave \
  -H "Authorization: Bearer <token>" \
  -F "type=izin" \
  -F "description=Alasan tidak hadir" \
  -F "proof=@/path/to/file.pdf"
```

---

## 10. Export Rekap Presensi ke PDF (Admin)

### A. Rekap Semua Intern

#### `GET /attendances/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&institution=INSTITUSI`

- **Deskripsi:** Export rekap presensi semua intern dalam format PDF, dapat difilter berdasarkan tanggal dan institusi.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Query Params:**
  - `startDate` (string, required): Tanggal awal filter (format YYYY-MM-DD)
  - `endDate` (string, required): Tanggal akhir filter (format YYYY-MM-DD)
  - `institution` (string, optional): Nama institusi (misal: ITS, Unila, dsb)
- **Response:**  
  File PDF dengan header gambar BPS Pringsewu di tengah, tabel presensi tanpa kolom Validator.
- **Contoh Response Header:**
  ```
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="rekap-presensi.pdf"
  ```

### B. Rekap Satu Intern

#### `GET /attendances/:userId/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

- **Deskripsi:** Export rekap presensi satu intern dalam format PDF, dapat difilter berdasarkan tanggal.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Query Params:**
  - `startDate` (string, required): Tanggal awal filter
  - `endDate` (string, required): Tanggal akhir filter
- **Response:**  
  File PDF dengan header gambar BPS Pringsewu di tengah, tabel presensi tanpa kolom Validator.
- **Contoh Response Header:**
  ```
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="presensi-intern-<userId>.pdf"
  ```

---

## 11. Format Tabel PDF

- **Kolom pada rekap semua intern:**  
  `No | Nama Intern | Institusi | Tanggal | Status | Clock In | Clock Out | Keterangan`
- **Kolom pada rekap satu intern:**  
  `No | Tanggal | Status | Clock In | Clock Out | Keterangan`

---

## 12. Header PDF

- Setiap file PDF presensi memiliki gambar header (logo BPS Pringsewu dan BerAKHLAK) di bagian atas, selalu di tengah halaman.

---

## 13. Catatan Perubahan

- Kolom Validator dihapus dari semua rekap PDF.
- Gambar header selalu di tengah secara horizontal.
- Filter institusi pada endpoint `/attendances/report` sudah didukung.
- Format PDF lebih ringkas dan informatif.

---

**Referensi Enum Status:**  
`AttendanceStatus = ['hadir', 'sakit', 'izin', 'tanpa_keterangan']`
