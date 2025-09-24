# 🔐 Auth API

Modul Auth menyediakan endpoint untuk proses autentikasi, otorisasi, dan manajemen akun user, termasuk registrasi, login, update profil, ganti password, lupa password, verifikasi OTP, serta login dengan Google OAuth.

---

## 🔒 Mekanisme Autentikasi & Otorisasi

> **Catatan:**
>
> - Sebagian besar endpoint **tidak membutuhkan autentikasi** (kecuali `/profile`, `/change-password`, dan `/profile` [PATCH]).
> - Endpoint yang membutuhkan autentikasi JWT harus menyertakan header:
>
>   ```
>   Authorization: Bearer <jwt_token>
>   ```
>
> - Untuk upload file, gunakan `Content-Type: multipart/form-data`.

---

## 📑 Daftar Endpoint

| **Metode** | **URL**                       | **Deskripsi**                             | **Auth** |
| :--------: | :---------------------------- | :---------------------------------------- | :------: |
|   `POST`   | `/auth/register`              | Registrasi user baru                      |    -     |
|   `POST`   | `/auth/login`                 | Login user                                |    -     |
|   `GET`    | `/auth/profile`               | Mendapatkan profil user yang sedang login |   JWT    |
|  `PATCH`   | `/auth/profile`               | Update profil user & upload foto profil   |   JWT    |
|   `POST`   | `/auth/change-password`       | Ganti password user                       |   JWT    |
|   `POST`   | `/auth/forgot-password`       | Kirim email lupa password (OTP)           |    -     |
|   `POST`   | `/auth/verify-reset-password` | Verifikasi OTP & reset password           |    -     |
|   `POST`   | `/auth/verify-otp`            | Verifikasi OTP aktivasi user              |    -     |
|   `POST`   | `/auth/resend-otp`            | Kirim ulang OTP aktivasi user             |    -     |
|   `GET`    | `/auth/google`                | Inisiasi login Google OAuth               |    -     |
|   `GET`    | `/auth/google/callback`       | Callback login Google OAuth               |    -     |

---

## 📌 Detail Endpoint

<details>
<summary><strong>1. Registrasi User Baru</strong></summary>

- **URL:** `/auth/register`
- **Method:** `POST`
- **Deskripsi:** Registrasi akun baru (role default: Intern).

**Contoh Request**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Contoh Response Sukses**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": { "name": "Intern" },
  "message": "Registrasi berhasil, silakan verifikasi email Anda."
}
```

**Contoh Response Error**

```json
{
  "statusCode": 409,
  "message": "Email sudah terdaftar"
}
```

</details>

---

<details>
<summary><strong>2. Login User</strong></summary>

- **URL:** `/auth/login`
- **Method:** `POST`
- **Deskripsi:** Login dengan email dan password.

**Contoh Request**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Contoh Response Sukses**

```json
{
  "access_token": "<jwt_token>",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": { "name": "Intern" }
  }
}
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "Email atau password salah"
}
```

```json
{
  "statusCode": 401,
  "message": "Email belum diverifikasi"
}
```

</details>

---

<details>
<summary><strong>3. Mendapatkan Profil User Login</strong></summary>

- **URL:** `/auth/profile`
- **Method:** `GET`
- **Auth:** JWT
- **Deskripsi:** Mendapatkan data profil user yang sedang login.

**Contoh Response Sukses**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": { "name": "Intern" },
  "profilePhoto": "uploads/profile-photos/profile-123.jpg",
  "asalInstitusi": "Universitas Lampung",
  ...
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
<summary><strong>4. Update Profil User & Upload Foto Profil</strong></summary>

- **URL:** `/auth/profile`
- **Method:** `PATCH`
- **Auth:** JWT
- **Deskripsi:** Update data profil user, termasuk upload foto profil (opsional).

**Contoh Request (form-data)**

- Field: `name`, `asalInstitusi`, dll (opsional)
- Field: `profilePhoto` (file, JPG/PNG/GIF, max 2MB)

**Contoh Response Sukses**

```json
{
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": 1,
    "name": "John Doe",
    "profilePhoto": "uploads/profile-photos/profile-123.jpg",
    ...
  }
}
```

**Contoh Response Error**

```json
{
  "statusCode": 400,
  "message": "File tidak valid atau terlalu besar"
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
<summary><strong>5. Ganti Password User</strong></summary>

- **URL:** `/auth/change-password`
- **Method:** `POST`
- **Auth:** JWT
- **Deskripsi:** Ganti password user yang sedang login.

**Contoh Request**

```json
{
  "oldPassword": "password123",
  "newPassword": "password456"
}
```

**Contoh Response Sukses**

```json
{
  "message": "Password berhasil diubah"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "Password lama salah"
}
```

</details>

---

<details>
<summary><strong>6. Lupa Password (Kirim OTP ke Email)</strong></summary>

- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Deskripsi:** Kirim OTP ke email untuk reset password.

**Contoh Request**

```json
{
  "email": "john@example.com"
}
```

**Contoh Response Sukses**

```json
{
  "message": "OTP reset password telah dikirim ke email Anda."
}
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "Email tidak ditemukan"
}
```

</details>

---

<details>
<summary><strong>7. Verifikasi OTP & Reset Password</strong></summary>

- **URL:** `/auth/verify-reset-password`
- **Method:** `POST`
- **Deskripsi:** Verifikasi OTP dan set password baru.

**Contoh Request**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "passwordBaru"
}
```

**Contoh Response Sukses**

```json
{
  "message": "Password berhasil direset. Silakan login dengan password baru."
}
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "OTP salah atau sudah kadaluarsa"
}
```

</details>

---

<details>
<summary><strong>8. Verifikasi OTP Aktivasi User</strong></summary>

- **URL:** `/auth/verify-otp`
- **Method:** `POST`
- **Deskripsi:** Verifikasi OTP yang dikirim ke email saat registrasi.

**Contoh Request**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Contoh Response Sukses**

```json
{
  "message": "Email berhasil diverifikasi"
}
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "OTP salah atau sudah kadaluarsa"
}
```

</details>

---

<details>
<summary><strong>9. Kirim Ulang OTP Aktivasi User</strong></summary>

- **URL:** `/auth/resend-otp`
- **Method:** `POST`
- **Deskripsi:** Kirim ulang OTP ke email user.

**Contoh Request**

```json
{
  "email": "john@example.com"
}
```

**Contoh Response Sukses**

```json
{
  "message": "OTP baru telah dikirim ke email Anda."
}
```

**Contoh Response Error**

```json
{
  "statusCode": 401,
  "message": "Email tidak ditemukan atau sudah diverifikasi"
}
```

</details>

---

<details>
<summary><strong>10. Login Google OAuth</strong></summary>

- **URL:** `/auth/google`
- **Method:** `GET`
- **Deskripsi:** Inisiasi login dengan Google OAuth (redirect ke Google).

**Contoh Response**

- Akan redirect ke halaman login Google.
</details>

---

<details>
<summary><strong>11. Callback Google OAuth</strong></summary>

- **URL:** `/auth/google/callback`
- **Method:** `GET`
- **Deskripsi:** Callback setelah login Google, redirect ke FE dengan token & data user.

**Contoh Response Sukses**

- Redirect ke:  
  `http://localhost:3001/auth/callback?token=<jwt_token>&user=<user_json>`

**Contoh Response Error**

- Redirect ke:  
 `http://localhost:3001/auth/callback?error=<error_message>`
</details>

---

## ⚠️ Catatan & Batasan

- **Registrasi:** Email harus unik dan valid, password minimal 6 karakter.
- **Login:** Email harus sudah diverifikasi.
- **Reset Password:** OTP berlaku 10 menit, rate limit pengiriman OTP berlaku.
- **Upload Foto Profil:** Hanya JPG, PNG, GIF, maksimal 2MB.
- **Google OAuth:** Pastikan environment variable Google OAuth sudah dikonfigurasi.
- **Semua tanggal menggunakan format ISO 8601.**
- **Error handling:** Response error selalu mengandung `statusCode` dan `message`.
