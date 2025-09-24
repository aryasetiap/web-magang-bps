# 👤 Users API

Modul **Users** menyediakan endpoint REST API untuk manajemen data pengguna: pembuatan, pembacaan, pembaruan, penghapusan user (admin), serta pembaruan profil user sendiri (semua role).

---

## 🔒 Mekanisme Autentikasi & Otorisasi

- Semua endpoint membutuhkan autentikasi JWT (Bearer Token).
- Endpoint CRUD user hanya dapat diakses oleh **Admin**.
- Endpoint update profil dapat diakses oleh user yang sedang login.
- Sertakan header berikut pada setiap request:
  ```http
  Authorization: Bearer <jwt_token>
  ```

---

## 📑 Daftar Endpoint

| Metode | URL            | Deskripsi                          | Akses      |
| ------ | -------------- | ---------------------------------- | ---------- |
| POST   | /users         | Membuat user baru                  | Admin      |
| GET    | /users         | Mendapatkan daftar user (paginasi) | Admin      |
| GET    | /users/:id     | Mendapatkan detail user            | Admin      |
| PATCH  | /users/:id     | Memperbarui data user              | Admin      |
| DELETE | /users/:id     | Menghapus user (soft delete)       | Admin      |
| PATCH  | /users/profile | Memperbarui profil user sendiri    | User login |

---

## 📌 Detail Endpoint

<details>
<summary><strong>1. Membuat User Baru</strong></summary>

- **URL:** `/users`
- **Method:** `POST`
- **Akses:** Admin

**Deskripsi:**  
Membuat user baru (role: Staff BPS/Admin).

**Contoh Request**

```json
{
  "name": "Budi Santoso",
  "email": "budi@bps.go.id",
  "password": "passwordku123",
  "roleName": "Staff BPS"
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "name": "Budi Santoso",
  "email": "budi@bps.go.id",
  "roleId": 2
}
```

**Contoh Response Error**

```json
{
  "statusCode": 409,
  "message": "User dengan email budi@bps.go.id sudah terdaftar."
}
```

```json
{
  "statusCode": 404,
  "message": "Peran 'Staff BPS' tidak ditemukan."
}
```

</details>

---

<details>
<summary><strong>2. Mendapatkan Daftar User (Paginasi)</strong></summary>

- **URL:** `/users?page=1&limit=10`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengambil daftar user dengan paginasi.

**Contoh Response Sukses**

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
<summary><strong>3. Mendapatkan Detail User</strong></summary>

- **URL:** `/users/:id`
- **Method:** `GET`
- **Akses:** Admin

**Deskripsi:**  
Mengambil detail user berdasarkan ID.

**Contoh Response Sukses**

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

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "User dengan ID 1 tidak ditemukan"
}
```

</details>

---

<details>
<summary><strong>4. Memperbarui Data User</strong></summary>

- **URL:** `/users/:id`
- **Method:** `PATCH`
- **Akses:** Admin

**Deskripsi:**  
Memperbarui data user berdasarkan ID. Semua field opsional.

**Contoh Request**

```json
{
  "name": "Nama Baru",
  "email": "userbaru@mail.com",
  "roleName": "Admin"
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "name": "Nama Baru",
  "email": "userbaru@mail.com",
  "role": { "name": "Admin" }
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "User dengan ID 1 tidak ditemukan."
}
```

</details>

---

<details>
<summary><strong>5. Menghapus User (Soft Delete)</strong></summary>

- **URL:** `/users/:id`
- **Method:** `DELETE`
- **Akses:** Admin

**Deskripsi:**  
Menghapus user (soft delete) berdasarkan ID.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "name": "Nama User",
  "email": "user@mail.com",
  "deletedAt": "2025-08-01T10:00:00.000Z"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "User dengan ID 1 tidak ditemukan."
}
```

</details>

---

<details>
<summary><strong>6. Memperbarui Profil User Sendiri</strong></summary>

- **URL:** `/users/profile`
- **Method:** `PATCH`
- **Akses:** User yang sedang login (semua role)

**Deskripsi:**  
Memperbarui profil user sendiri, termasuk upload foto profil.

**Form-data:**

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

**Contoh Request** (form-data)

- name: "Budi Santoso"
- asalInstitusi: "Universitas Lampung"
- profilePhoto: (file JPG/PNG)

**Contoh Response Sukses**

```json
{
  "id": 1,
  "name": "Budi Santoso",
  "asalInstitusi": "Universitas Lampung",
  "profilePhoto": "uploads/profile-photos/profile-123.jpg",
  ...
}
```

**Contoh Response Error**

```json
{
  "statusCode": 404,
  "message": "User dengan ID 1 tidak ditemukan."
}
```

</details>

---

## ⚠️ Catatan & Batasan

- Semua endpoint membutuhkan header `Authorization: Bearer <token>`.
- Untuk upload file, gunakan `Content-Type: multipart/form-data`.
- Field tanggal (`activityStart`, `activityEnd`) menggunakan format ISO 8601.
- Hanya admin yang dapat CRUD user, user biasa hanya dapat update profil sendiri.
- Error handling mengikuti standar NestJS (`statusCode`, `message
