# 📚 Dokumentasi API Auth

**Base URL:** `http://localhost:3000`

---

## Daftar Endpoint

- [POST /auth/register](#post-authregister)
- [POST /auth/login](#post-authlogin)
- [POST /auth/verify-otp](#post-authverify-otp)
- [POST /auth/resend-otp](#post-authresend-otp)
- [GET /auth/profile](#get-authprofile)
- [PATCH /auth/profile](#patch-authprofile)
- [GET /auth/google](#get-authgoogle)
- [GET /auth/google/callback](#get-authgooglecallback)

---

## POST `/auth/register`

**Deskripsi:**  
Mendaftarkan user baru (role default: Intern).  
Setelah register, user akan menerima OTP ke email untuk verifikasi.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (201):**

```json
{
  "message": "Registrasi berhasil. Silakan verifikasi email Anda.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "name": "Intern"
    }
  }
}
```

**Response Error (409):**

```json
{
  "statusCode": 409,
  "message": "Email sudah terdaftar."
}
```

---

## POST `/auth/login`

**Deskripsi:**  
Login user dengan email dan password. Hanya user yang sudah verifikasi email yang bisa login.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**

```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "name": "Intern"
    }
  }
}
```

**Response Error (401):**

```json
{
  "statusCode": 401,
  "message": "Email atau password salah"
}
```

**Response Error (401) - Email belum diverifikasi:**

```json
{
  "statusCode": 401,
  "message": "Email belum diverifikasi. Silakan cek email Anda."
}
```

---

## POST `/auth/verify-otp`

**Deskripsi:**  
Verifikasi email dengan OTP yang dikirim ke email user saat register.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response Success (200):**

```json
{
  "message": "Email berhasil diverifikasi"
}
```

**Response Error (401):**

```json
{
  "statusCode": 401,
  "message": "OTP salah"
}
```

**Response Error (401):**

```json
{
  "statusCode": 401,
  "message": "OTP kadaluarsa"
}
```

---

## POST `/auth/resend-otp`

**Deskripsi:**  
Mengirim ulang OTP ke email user (hanya jika belum diverifikasi). Rate limit: 1x per jam.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response Success (200):**

```json
{
  "message": "OTP baru telah dikirim ke email Anda."
}
```

**Response Error (401):**

```json
{
  "statusCode": 401,
  "message": "OTP masih aktif, silakan cek email Anda."
}
```

**Response Error (401):**

```json
{
  "statusCode": 401,
  "message": "Anda hanya dapat meminta OTP sekali per jam."
}
```

---

## GET `/auth/profile`

**Deskripsi:**  
Mendapatkan profil user yang sedang login.

**Headers:**  
`Authorization: Bearer {jwt_token}`

**Response Success (200):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profilePhoto": "uploads/profile-photos/profile-1625123456-123456789.jpg",
  "namaLengkap": "John Doe Lengkap",
  "nimNisn": "12345678",
  "asalInstitusi": "Universitas ABC",
  "jurusanProdi": "Teknik Informatika",
  "nomorTelepon": "081234567890",
  "alamat": "Jl. ABC No. 123",
  "role": {
    "name": "Intern"
  }
}
```

---

## PATCH `/auth/profile`

**Deskripsi:**  
Update profil user dan upload foto profil (opsional).

**Headers:**  
`Authorization: Bearer {jwt_token}`  
`Content-Type: multipart/form-data`

**Body (Form Data):**

| Field         | Type   | Required | Description                            |
| ------------- | ------ | -------- | -------------------------------------- |
| name          | string | No       | Nama user                              |
| namaLengkap   | string | No       | Nama lengkap user                      |
| nimNisn       | string | No       | NIM/NISN user                          |
| asalInstitusi | string | No       | Asal institusi user                    |
| jurusanProdi  | string | No       | Jurusan/Program Studi                  |
| nomorTelepon  | string | No       | Nomor telepon                          |
| alamat        | string | No       | Alamat user                            |
| profilePhoto  | file   | No       | File foto profil (JPG, JPEG, PNG, GIF) |

**Response Success (200):**

```json
{
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john@example.com",
    "profilePhoto": "uploads/profile-photos/profile-1625123456-123456789.jpg",
    "namaLengkap": "John Doe Lengkap",
    "nimNisn": "12345678",
    "asalInstitusi": "Universitas ABC",
    "jurusanProdi": "Teknik Informatika",
    "nomorTelepon": "081234567890",
    "alamat": "Jl. ABC No. 123",
    "role": {
      "name": "Intern"
    }
  }
}
```

**Response Error (400):**

```json
{
  "statusCode": 400,
  "message": "Hanya file gambar yang diperbolehkan (JPG, JPEG, PNG, GIF)"
}
```

---

## GET `/auth/google`

**Deskripsi:**  
Inisiasi login dengan Google OAuth. Akan redirect ke Google.

---

## GET `/auth/google/callback`

**Deskripsi:**  
Callback setelah login Google OAuth. Akan redirect ke frontend dengan token dan data user.

---

## Catatan Tambahan

- Semua endpoint yang membutuhkan autentikasi JWT harus menyertakan header:  
  `Authorization: Bearer {jwt_token}`
- Untuk upload file (foto profil), gunakan form-data.
- Untuk endpoint register, OTP akan dikirim ke email user.  
  User harus melakukan verifikasi OTP sebelum bisa login.
- Rate limit resend OTP: 1x per jam per user.
- Semua response error menggunakan format standar NestJS.

---

\*\*Jika ada kebutuhan field tambahan, silakan hubungi tim
