# Users API

Modul Users menyediakan endpoint untuk manajemen data pengguna, termasuk pembuatan, pembacaan, pembaruan, penghapusan user, serta pembaruan profil user sendiri.

**Seluruh endpoint dilindungi oleh JWT Auth dan RolesGuard.**

---

## 1. Membuat User Baru

**Endpoint:**  
`POST /users`

**Akses:**  
Admin

**Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 8 karakter)",
  "roleName": "Staff BPS | Admin"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "Nama User",
  "email": "user@mail.com",
  "roleId": 2
}
```

---

## 2. Mendapatkan Daftar User (Paginasi)

**Endpoint:**  
`GET /users?page=1&limit=10`

**Akses:**  
Admin

**Query Params:**

- `page` (opsional, default: 1)
- `limit` (opsional, default: 10)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Nama User",
      "email": "user@mail.com",
      "profilePhoto": "uploads/profile/xxx.jpg",
      "namaLengkap": "Nama Lengkap",
      "nimNisn": "123456",
      "asalInstitusi": "Universitas X",
      "jurusanProdi": "Teknik Informatika",
      "nomorTelepon": "08123456789",
      "alamat": "Jl. Contoh",
      "educationStatus": "S1",
      "activityType": "Magang",
      "activityStart": "2025-07-01T00:00:00.000Z",
      "activityEnd": "2025-08-01T00:00:00.000Z",
      "role": { "name": "Staff BPS" }
    }
  ],
  "meta": {
    "totalItems": 100,
    "itemCount": 10,
    "itemsPerPage": 10,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

---

## 3. Mendapatkan Detail User

**Endpoint:**  
`GET /users/:id`

**Akses:**  
Admin

**Response:**

```json
{
  "id": 1,
  "name": "Nama User",
  "email": "user@mail.com",
  "profilePhoto": "uploads/profile/xxx.jpg",
  "namaLengkap": "Nama Lengkap",
  "nimNisn": "123456",
  "asalInstitusi": "Universitas X",
  "jurusanProdi": "Teknik Informatika",
  "nomorTelepon": "08123456789",
  "alamat": "Jl. Contoh",
  "educationStatus": "S1",
  "activityType": "Magang",
  "activityStart": "2025-07-01T00:00:00.000Z",
  "activityEnd": "2025-08-01T00:00:00.000Z",
  "role": { "name": "Staff BPS" }
}
```

---

## 4. Memperbarui Data User

**Endpoint:**  
`PATCH /users/:id`

**Akses:**  
Admin

**Body:**  
Sama seperti `CreateUserDto`, namun seluruh field opsional.

**Response:**  
Data user yang telah diperbarui (lihat response detail user).

---

## 5. Menghapus User (Soft Delete)

**Endpoint:**  
`DELETE /users/:id`

**Akses:**  
Admin

**Response:**  
Data user yang telah dihapus (soft delete).

---

## 6. Memperbarui Profil User Sendiri

**Endpoint:**  
`PATCH /users/profile`

**Akses:**  
User yang sedang login (semua role)

**Body:**  
Form-data (support upload file `profilePhoto`)

| Field           | Tipe   | Keterangan                |
| --------------- | ------ | ------------------------- |
| name            | string | Opsional                  |
| namaLengkap     | string | Opsional                  |
| nimNisn         | string | Opsional                  |
| asalInstitusi   | string | Opsional                  |
| jurusanProdi    | string | Opsional                  |
| nomorTelepon    | string | Opsional                  |
| alamat          | string | Opsional                  |
| educationStatus | string | Opsional                  |
| activityType    | string | Opsional                  |
| activityStart   | string | Opsional, format ISO date |
| activityEnd     | string | Opsional, format ISO date |
| profilePhoto    | file   | Opsional, foto profil     |

**Response:**  
Data user yang telah diperbarui (lihat response detail user).

---

## 7. Mendapatkan Profil User Sendiri

**Endpoint:**  
`GET /users/:id`  
(Gunakan ID user yang sedang login)

---

## Error Response

- **401 Unauthorized**: Token tidak valid atau tidak ada.
- **403 Forbidden**: Tidak memiliki hak akses.
- **404 Not Found**: Data tidak ditemukan.
- **409 Conflict**: Email sudah terdaftar.

---

## Catatan

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Untuk upload file, gunakan `Content-Type: multipart/form-data`.
- Field tanggal (`activityStart`, `activityEnd`) menggunakan format ISO 8601.

---
