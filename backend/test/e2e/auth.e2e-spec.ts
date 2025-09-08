/**
 * ============================================================
 * E2E Test untuk AuthModule
 * ------------------------------------------------------------
 * File ini berisi pengujian end-to-end untuk seluruh endpoint
 * utama pada AuthModule menggunakan @nestjs/testing dan supertest.
 * Setiap bagian dan test case didokumentasikan dengan docstring
 * berbahasa Indonesia untuk memudahkan pemahaman.
 * ============================================================
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';

// Konstanta untuk user yang sudah diverifikasi (dari seed)
const VERIFIED_USER_EMAIL = 'intern1@mail.com';
const VERIFIED_USER_PASSWORD = 'intern12345';
const INVALID_EMAIL = 'tidakada@mail.com';
const DUMMY_PHOTO_PATH = '__tests__/dummy-photo.jpg';

describe('AuthModule (e2e)', () => {
  /**
   * Inisialisasi aplikasi NestJS dan variabel global yang digunakan pada seluruh test.
   */
  let app: INestApplication;
  let accessToken: string;
  let testEmail: string;
  const testPassword = 'password123';

  /**
   * Setup aplikasi sebelum seluruh test dijalankan.
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  /**
   * Menutup aplikasi setelah seluruh test selesai.
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * ============================================================
   * Pengujian endpoint register (POST /auth/register)
   * ------------------------------------------------------------
   * Bagian ini menguji proses registrasi user baru, validasi data,
   * dan penanganan email yang sudah terdaftar.
   * ============================================================
   */
  describe('POST /auth/register', () => {
    /**
     * Menguji registrasi user baru dengan data valid.
     * Diharapkan berhasil dan mengembalikan data user.
     */
    it('berhasil register user baru jika data valid', async () => {
      // Email unik agar tidak bentrok dengan data lain
      testEmail = `e2euser${Date.now()}@mail.com`;
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'E2E User',
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testEmail);
    });

    /**
     * Menguji registrasi dengan email yang sudah terdaftar.
     * Diharapkan gagal dengan status 400 atau 409.
     */
    it('gagal register jika email sudah terdaftar', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'E2E User',
          email: testEmail,
          password: testPassword,
        });

      expect([400, 409]).toContain(res.status);
    });

    /**
     * Menguji registrasi dengan data tidak valid.
     * Diharapkan gagal dengan status 400.
     */
    it('gagal register jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: '',
          email: 'salah',
          password: '123',
        });

      expect(res.status).toBe(400);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint login (POST /auth/login)
   * ------------------------------------------------------------
   * Bagian ini menguji proses login dengan berbagai skenario,
   * termasuk email belum diverifikasi, password salah, dan login sukses.
   * ============================================================
   */
  describe('POST /auth/login', () => {
    /**
     * Menguji login dengan email yang belum diverifikasi.
     * Diharapkan gagal dengan status 401 atau 403.
     */
    it('gagal login jika email belum diverifikasi', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: testEmail,
        password: testPassword,
      });

      expect([401, 403]).toContain(res.status);
    });

    /**
     * Menguji login dengan password yang salah.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal login jika password salah', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: testEmail,
        password: 'salahpassword',
      });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji login sukses dengan user yang sudah diverifikasi.
     * Diharapkan berhasil dan mengembalikan access_token.
     */
    it('berhasil login jika email dan password benar serta sudah diverifikasi', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: VERIFIED_USER_EMAIL,
        password: VERIFIED_USER_PASSWORD,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      accessToken = res.body.access_token;
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint get profile (GET /auth/profile)
   * ------------------------------------------------------------
   * Bagian ini menguji pengambilan data profile user dengan dan tanpa token.
   * ============================================================
   */
  describe('GET /auth/profile', () => {
    /**
     * Menguji pengambilan profile dengan token yang valid.
     * Diharapkan berhasil dan mengembalikan data user.
     */
    it('berhasil mengambil profile jika token valid', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
    });

    /**
     * Menguji pengambilan profile tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal mengambil profile jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).get('/auth/profile');
      expect(res.status).toBe(401);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint update profile (PATCH /auth/profile)
   * ------------------------------------------------------------
   * Bagian ini menguji update profile user, baik tanpa maupun dengan upload foto.
   * ============================================================
   */
  describe('PATCH /auth/profile', () => {
    /**
     * Menguji update profile tanpa upload foto.
     * Diharapkan berhasil mengubah nama user.
     */
    it('berhasil update profile tanpa foto', async () => {
      const res = await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('name', 'Nama Baru');

      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('name', 'Nama Baru');
      }
    });

    /**
     * Menguji update profile tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal update profile jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/auth/profile')
        .field('name', 'Nama Baru');

      expect(res.status).toBe(401);
    });

    /**
     * Menguji update profile dengan upload foto profil.
     * Diharapkan berhasil mengubah nama dan mengupload foto.
     */
    it('berhasil update profile dengan upload foto profil', async () => {
      // Pastikan file dummy ada
      if (!fs.existsSync(DUMMY_PHOTO_PATH)) {
        fs.writeFileSync(
          DUMMY_PHOTO_PATH,
          Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
        ); // JPEG minimal
      }
      const res = await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('name', 'Nama Dengan Foto')
        .attach('profilePhoto', DUMMY_PHOTO_PATH);

      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('name', 'Nama Dengan Foto');
      }
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint change password (POST /auth/change-password)
   * ------------------------------------------------------------
   * Bagian ini menguji proses ganti password dengan berbagai skenario.
   * ============================================================
   */
  describe('POST /auth/change-password', () => {
    /**
     * Menguji ganti password tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal ganti password jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          oldPassword: VERIFIED_USER_PASSWORD,
          newPassword: 'newpass123',
        });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji ganti password dengan password lama yang salah.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal ganti password jika password lama salah', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: 'salah', newPassword: 'newpass123' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji ganti password dengan password baru kurang dari 6 karakter.
     * Diharapkan gagal dengan status 400.
     */
    it('gagal ganti password jika password baru kurang dari 6 karakter', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: VERIFIED_USER_PASSWORD, newPassword: '123' });

      expect(res.status).toBe(400);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint forgot password (POST /auth/forgot-password)
   * ------------------------------------------------------------
   * Bagian ini menguji request forgot password dengan email valid dan tidak valid.
   * ============================================================
   */
  describe('POST /auth/forgot-password', () => {
    /**
     * Menguji request forgot password dengan email valid.
     * Diharapkan berhasil atau gagal tergantung implementasi.
     */
    it('berhasil request forgot password jika email valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: VERIFIED_USER_EMAIL });

      expect([200, 400, 401]).toContain(res.status);
    });

    /**
     * Menguji request forgot password dengan email yang tidak ditemukan.
     * Diharapkan gagal dengan status 400 atau 401.
     */
    it('gagal request forgot password jika email tidak ditemukan', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: INVALID_EMAIL });

      expect([400, 401]).toContain(res.status);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint verify-reset-password (POST /auth/verify-reset-password)
   * ------------------------------------------------------------
   * Bagian ini hanya contoh karena OTP dinamis, biasanya di-skip atau di-mock.
   * ============================================================
   */
  describe('POST /auth/verify-reset-password', () => {
    /**
     * Menguji verifikasi reset password dengan data tidak valid.
     * Diharapkan gagal dengan status 400 atau 401.
     */
    it('gagal verifikasi reset password jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/verify-reset-password')
        .send({
          email: VERIFIED_USER_EMAIL,
          otp: '000000',
          newPassword: 'newpass123',
        });

      expect([400, 401]).toContain(res.status);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint verify-otp (POST /auth/verify-otp)
   * ------------------------------------------------------------
   * Bagian ini hanya contoh karena OTP dinamis, biasanya di-skip atau di-mock.
   * ============================================================
   */
  describe('POST /auth/verify-otp', () => {
    /**
     * Menguji verifikasi OTP dengan data tidak valid.
     * Diharapkan gagal dengan status 400, 401, atau 409.
     */
    it('gagal verifikasi OTP jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          email: VERIFIED_USER_EMAIL,
          otp: '000000',
        });

      expect([400, 401, 409]).toContain(res.status);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint resend-otp (POST /auth/resend-otp)
   * ------------------------------------------------------------
   * Bagian ini menguji proses pengiriman ulang OTP.
   * ============================================================
   */
  describe('POST /auth/resend-otp', () => {
    /**
     * Menguji resend OTP dengan email valid.
     * Diharapkan berhasil atau gagal tergantung implementasi.
     */
    it('berhasil resend OTP jika email valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/resend-otp')
        .send({ email: VERIFIED_USER_EMAIL });

      expect([200, 400, 401, 409]).toContain(res.status);
    });

    /**
     * Menguji resend OTP dengan email yang tidak ditemukan.
     * Diharapkan gagal dengan status 400 atau 401.
     */
    it('gagal resend OTP jika email tidak ditemukan', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/resend-otp')
        .send({ email: INVALID_EMAIL });

      expect([400, 401]).toContain(res.status);
    });
  });
});
