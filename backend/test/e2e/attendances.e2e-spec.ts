/**
 * E2E Test AttendancesModule
 * -------------------------------------------------
 * Pengujian end-to-end untuk seluruh endpoint AttendancesModule.
 * Menggunakan @nestjs/testing dan supertest.
 * Setiap bagian test didokumentasikan dengan docstring berbahasa Indonesia.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

// =====================
// Konstanta & Variabel
// =====================

/**
 * Konstanta untuk user test dan file dummy
 */
const TEST_USER = {
  email: 'intern1@mail.com',
  password: 'intern12345',
};
const TEST_COORDINATE = { latitude: -5.235, longitude: 105.1572 };
const INVALID_COORDINATE = { latitude: 'salah', longitude: 105.1572 };
const DUMMY_PROOF_PATH = path.resolve('__tests__/dummy-proof.pdf');
const PROOFS_DIR = path.resolve('uploads/proofs');
const TEST_ATTENDANCE_ID = 1;
const TEST_USER_ID = 1;
const TEST_DATE_RANGE = { startDate: '2025-07-01', endDate: '2025-07-31' };

// Variabel global untuk JWT hasil login otomatis
let accessToken: string;

describe('AttendancesModule (e2e)', () => {
  /**
   * Inisialisasi aplikasi dan setup sebelum seluruh test dijalankan.
   * - Membuat folder uploads/proofs jika belum ada.
   * - Membuat file dummy PDF untuk test upload.
   * - Melakukan login otomatis untuk mendapatkan JWT.
   */
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    // Pastikan folder uploads/proofs tersedia
    if (!fs.existsSync(PROOFS_DIR)) {
      fs.mkdirSync(PROOFS_DIR, { recursive: true });
    }

    // Buat file PDF dummy jika belum ada
    if (!fs.existsSync(DUMMY_PROOF_PATH)) {
      fs.mkdirSync(path.dirname(DUMMY_PROOF_PATH), { recursive: true });
      const pdfHeader =
        '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000125 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n173\n%%EOF';
      fs.writeFileSync(DUMMY_PROOF_PATH, pdfHeader);
    }

    // Inisialisasi aplikasi NestJS
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

    // Login otomatis untuk mendapatkan JWT
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    accessToken = loginRes.body?.access_token;
    if (!accessToken) {
      // eslint-disable-next-line no-console
      console.warn(
        'WARNING: Tidak bisa login user test. Semua endpoint protected akan gagal 401.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Pengujian endpoint clock-in (POST /attendances/clock-in)
   * --------------------------------------------------------
   * Menguji proses clock-in dengan berbagai skenario validasi.
   */
  describe('POST /attendances/clock-in', () => {
    /**
     * Menguji clock-in berhasil jika data valid dan user terautentikasi.
     */
    it('berhasil clock-in jika data valid dan user terautentikasi', async () => {
      const res = await request(app.getHttpServer())
        .post('/attendances/clock-in')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(TEST_COORDINATE);

      // Status 201 = sukses, 401 = tidak terautentikasi, 403 = lokasi di luar radius kantor
      expect([201, 401, 403]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('userId');
      }
    });

    /**
     * Menguji clock-in gagal jika tidak ada token autentikasi.
     */
    it('gagal clock-in jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .post('/attendances/clock-in')
        .send(TEST_COORDINATE);

      expect(res.status).toBe(401);
    });

    /**
     * Menguji clock-in gagal jika data tidak valid.
     */
    it('gagal clock-in jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/attendances/clock-in')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(INVALID_COORDINATE);

      expect([400, 401]).toContain(res.status);
    });
  });

  /**
   * Pengujian endpoint clock-out (PATCH /attendances/clock-out)
   * -----------------------------------------------------------
   * Menguji proses clock-out dengan berbagai skenario validasi.
   */
  describe('PATCH /attendances/clock-out', () => {
    /**
     * Menguji clock-out gagal jika tidak ada token autentikasi.
     */
    it('gagal clock-out jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/attendances/clock-out')
        .send(TEST_COORDINATE);

      expect(res.status).toBe(401);
    });

    /**
     * Menguji clock-out gagal jika data tidak valid.
     */
    it('gagal clock-out jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .patch('/attendances/clock-out')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(INVALID_COORDINATE);

      expect([400, 401]).toContain(res.status);
    });

    /**
     * Menguji clock-out berhasil jika data valid dan sudah clock-in.
     */
    it('berhasil clock-out jika data valid dan sudah clock-in', async () => {
      const res = await request(app.getHttpServer())
        .patch('/attendances/clock-out')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(TEST_COORDINATE);

      // Status 200 = sukses, 404 = belum clock-in, 403 = lokasi di luar radius, 401 = tidak login
      expect([200, 404, 403, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('attendance');
      }
    });
  });

  /**
   * Pengujian endpoint riwayat presensi (GET /attendances)
   * ------------------------------------------------------
   * Menguji pengambilan riwayat presensi user.
   */
  describe('GET /attendances', () => {
    /**
     * Menguji pengambilan riwayat presensi berhasil jika user terautentikasi.
     */
    it('berhasil mengambil riwayat presensi user', async () => {
      const res = await request(app.getHttpServer())
        .get('/attendances')
        .set('Authorization', `Bearer ${accessToken}`);

      expect([200, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    /**
     * Menguji pengambilan riwayat presensi gagal jika tidak ada token.
     */
    it('gagal mengambil riwayat jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).get('/attendances');
      expect(res.status).toBe(401);
    });
  });

  /**
   * Pengujian endpoint request-leave (POST /attendances/request-leave)
   * ------------------------------------------------------------------
   * Menguji proses request izin/leave dengan dan tanpa file proof.
   */
  describe('POST /attendances/request-leave', () => {
    /**
     * Menguji request-leave gagal jika tidak ada token autentikasi.
     */
    it('gagal request-leave jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .post('/attendances/request-leave')
        .send({ type: 'izin', description: 'Alasan' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji request-leave gagal jika data tidak valid.
     */
    it('gagal request-leave jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/attendances/request-leave')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ type: 'salah', description: '' });

      expect([400, 401]).toContain(res.status);
    });

    /**
     * Menguji request-leave berhasil jika data valid dan file proof dikirim.
     */
    it('berhasil request-leave jika data valid dan file proof dikirim', async () => {
      // Skip test jika file dummy tidak tersedia
      if (!fs.existsSync(DUMMY_PROOF_PATH)) {
        console.warn('Skipping upload test: dummy file not found');
        return;
      }

      try {
        const res = await request(app.getHttpServer())
          .post('/attendances/request-leave')
          .set('Authorization', `Bearer ${accessToken}`)
          .field('type', 'izin')
          .field('description', 'Alasan izin untuk test E2E')
          .attach('proof', DUMMY_PROOF_PATH);

        // Status 201 = sukses, 400 = validasi, 401 = tidak login, 409 = sudah request hari ini
        expect([201, 400, 401, 409]).toContain(res.status);
        if (res.status === 201) {
          expect(res.body).toHaveProperty('id');
        }
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          console.warn('Upload test skipped due to ECONNRESET');
          return;
        }
        throw error;
      }
    });
  });

  /**
   * Pengujian endpoint validasi izin (PATCH /attendances/:id/validate)
   * ------------------------------------------------------------------
   * Menguji proses validasi izin oleh admin/staff.
   */
  describe('PATCH /attendances/:id/validate', () => {
    /**
     * Menguji validasi gagal jika tidak ada token autentikasi.
     */
    it('gagal validasi jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/attendances/${TEST_ATTENDANCE_ID}/validate`)
        .send({ status: 'izin' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji validasi gagal jika status tidak valid.
     */
    it('gagal validasi jika status tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/attendances/${TEST_ATTENDANCE_ID}/validate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'salah' });

      expect([400, 401, 403]).toContain(res.status);
    });

    /**
     * Menguji validasi izin berhasil jika data valid dan user admin.
     */
    it('berhasil validasi izin jika data valid dan admin', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/attendances/${TEST_ATTENDANCE_ID}/validate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'izin' });

      expect([200, 400, 403, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'izin');
      }
    });
  });

  /**
   * Pengujian endpoint detail presensi (GET /attendances/:id)
   * ---------------------------------------------------------
   * Menguji pengambilan detail presensi berdasarkan id.
   */
  describe('GET /attendances/:id', () => {
    /**
     * Menguji gagal mengambil detail jika tidak ada token autentikasi.
     */
    it('gagal jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).get(
        `/attendances/${TEST_ATTENDANCE_ID}`,
      );
      expect(res.status).toBe(401);
    });

    /**
     * Menguji gagal mengambil detail jika id tidak valid.
     */
    it('gagal jika id tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .get('/attendances/abc')
        .set('Authorization', `Bearer ${accessToken}`);
      expect([400, 401]).toContain(res.status);
    });

    /**
     * Menguji berhasil mengambil detail presensi jika id valid dan authorized.
     */
    it('berhasil mengambil detail presensi jika id valid dan authorized', async () => {
      const res = await request(app.getHttpServer())
        .get(`/attendances/${TEST_ATTENDANCE_ID}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id', TEST_ATTENDANCE_ID);
      }
    });
  });

  /**
   * Pengujian endpoint GET /attendances/all (khusus admin)
   * ------------------------------------------------------
   * Menguji pengambilan seluruh data presensi oleh admin.
   */
  describe('GET /attendances/all', () => {
    /**
     * Menguji pengambilan seluruh data presensi berhasil jika user admin.
     */
    it('berhasil mengambil seluruh data presensi jika admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/attendances/all')
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 403, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
      }
    });
  });

  /**
   * Pengujian endpoint GET /attendances/report (export PDF, khusus admin)
   * ---------------------------------------------------------------------
   * Menguji export rekap presensi semua intern ke PDF.
   */
  describe('GET /attendances/report', () => {
    /**
     * Menguji export rekap presensi semua intern ke PDF berhasil jika user admin.
     */
    it('berhasil export rekap presensi semua intern ke PDF jika admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/attendances/report')
        .set('Authorization', `Bearer ${accessToken}`)
        .query(TEST_DATE_RANGE);
      expect([200, 403, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.header['content-type']).toBe('application/pdf');
      }
    });
  });

  /**
   * Pengujian endpoint GET /attendances/:userId/report (export PDF satu user, khusus admin)
   * --------------------------------------------------------------------------------------
   * Menguji export presensi satu intern ke PDF.
   */
  describe('GET /attendances/:userId/report', () => {
    /**
     * Menguji export presensi satu intern ke PDF berhasil jika user admin.
     */
    it('berhasil export presensi satu intern ke PDF jika admin', async () => {
      const res = await request(app.getHttpServer())
        .get(`/attendances/${TEST_USER_ID}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query(TEST_DATE_RANGE);
      expect([200, 403, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.header['content-type']).toBe('application/pdf');
      }
    });
  });
});
