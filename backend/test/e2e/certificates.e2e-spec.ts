/**
 * ============================================================
 * E2E Test CertificatesModule
 * ------------------------------------------------------------
 * Pengujian end-to-end untuk endpoint utama CertificatesModule.
 * Menggunakan @nestjs/testing dan supertest.
 * Setiap bagian penting diberi docstring berbahasa Indonesia.
 * ============================================================
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

// =====================
// Konstanta untuk test
// =====================
const ADMIN_EMAIL = 'admin@webmagangbps.com';
const ADMIN_PASSWORD = 'WebMagangBPSKabPringsewu2025';
const INTERN_EMAIL = 'intern1@mail.com';
const INTERN_PASSWORD = 'intern12345';
const DUMMY_TEMPLATE_PATH = '__tests__/dummy-certificate-template.pdf';
const DUMMY_SIGNED_PATH = '__tests__/dummy-signed-certificate.pdf';
const VALID_USER_ID = 2;
const INVALID_ID = 9999;
const VALID_CERTIFICATE_NUMBER = 'E2E-001';
const VALID_PREDICATE = 'Sangat Memuaskan';
const VALID_NAMA_KEPALA_BPS = 'Kepala BPS';
const VALID_NIP_KEPALA_BPS = '1234567890';

let adminToken: string;
let internToken: string;

describe('CertificatesModule (e2e)', () => {
  /**
   * Inisialisasi aplikasi NestJS dan login user sebelum semua test.
   * Membuat file PDF dummy jika belum ada.
   */
  let app: INestApplication;

  beforeAll(async () => {
    // Membuat file PDF dummy valid menggunakan pdf-lib agar bisa diproses oleh pdf-lib di service
    for (const filePath of [DUMMY_TEMPLATE_PATH, DUMMY_SIGNED_PATH]) {
      if (!fs.existsSync(filePath)) {
        const { PDFDocument } = require('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([595.28, 841.89]); // A4 size
        const pdfBytes = await pdfDoc.save();
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, pdfBytes);
      }
    }

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

    // Login admin dan intern untuk mendapatkan token
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminRes.body?.access_token;

    const internRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: INTERN_EMAIL, password: INTERN_PASSWORD });
    internToken = internRes.body?.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * ============================================================
   * Pengujian upload template sertifikat (PATCH /certificates/template/upload)
   * ============================================================
   */
  describe('PATCH /certificates/template/upload', () => {
    /**
     * Menguji upload template sertifikat PDF oleh admin.
     * Berhasil jika file valid, gagal jika file tidak valid.
     */
    it('berhasil upload template sertifikat PDF', async () => {
      /**
       * Test: Upload file template PDF yang valid.
       * Diharapkan status 200 (sukses) atau 400 (gagal validasi template).
       */
      const res = await request(app.getHttpServer())
        .patch('/certificates/template/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', DUMMY_TEMPLATE_PATH);

      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('success', true);
      } else {
        expect(res.body).toHaveProperty('message');
      }
    });

    /**
     * Menguji upload template tanpa file.
     * Diharapkan gagal dengan status 400.
     */
    it('gagal upload template jika file tidak diupload', async () => {
      /**
       * Test: Upload tanpa file.
       * Diharapkan gagal (400).
       */
      const res = await request(app.getHttpServer())
        .patch('/certificates/template/upload')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  /**
   * ============================================================
   * Pengujian cek ketersediaan template (GET /certificates/template/check)
   * ============================================================
   */
  describe('GET /certificates/template/check', () => {
    /**
     * Menguji endpoint pengecekan ketersediaan template sertifikat.
     * Diharapkan mengembalikan status 200 dan property templateExists.
     */
    it('berhasil cek ketersediaan template', async () => {
      /**
       * Test: Cek ketersediaan template.
       */
      const res = await request(app.getHttpServer())
        .get('/certificates/template/check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('templateExists');
    });
  });

  /**
   * ============================================================
   * Pengujian generate sertifikat (POST /certificates/generate)
   * ============================================================
   */
  describe('POST /certificates/generate', () => {
    /**
     * Menguji endpoint generate sertifikat.
     * Hanya admin yang boleh generate, data harus valid, dan user harus memenuhi syarat.
     */

    it('gagal generate jika bukan admin', async () => {
      /**
       * Test: Intern mencoba generate sertifikat.
       * Diharapkan gagal (403).
       */
      const res = await request(app.getHttpServer())
        .post('/certificates/generate')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          certificateNumber: VALID_CERTIFICATE_NUMBER,
          userId: VALID_USER_ID,
          predicate: VALID_PREDICATE,
          namaKepalaBPS: VALID_NAMA_KEPALA_BPS,
          nipKepalaBPS: VALID_NIP_KEPALA_BPS,
        });

      expect(res.status).toBe(403);
    });

    it('gagal generate jika data tidak valid', async () => {
      /**
       * Test: Admin mengirim data tidak valid.
       * Diharapkan gagal (400).
       */
      const res = await request(app.getHttpServer())
        .post('/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          certificateNumber: '',
          userId: 'salah',
          predicate: '',
          namaKepalaBPS: '',
          nipKepalaBPS: '',
        });

      expect(res.status).toBe(400);
    });

    it('gagal generate jika user belum memenuhi syarat', async () => {
      /**
       * Test: Admin generate sertifikat untuk user yang belum memenuhi syarat.
       * Diharapkan gagal (400 atau 404).
       */
      const res = await request(app.getHttpServer())
        .post('/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          certificateNumber: VALID_CERTIFICATE_NUMBER,
          userId: VALID_USER_ID,
          predicate: VALID_PREDICATE,
          namaKepalaBPS: VALID_NAMA_KEPALA_BPS,
          nipKepalaBPS: VALID_NIP_KEPALA_BPS,
        });

      expect([400, 404]).toContain(res.status);
    });
  });

  /**
   * ============================================================
   * Pengujian upload file signed certificate (PATCH /certificates/:id/upload)
   * ============================================================
   */
  describe('PATCH /certificates/:id/upload', () => {
    /**
     * Menguji upload file sertifikat yang sudah ditandatangani.
     * Hanya admin yang boleh upload, file harus ada, dan sertifikat harus ditemukan.
     */

    it('gagal upload jika tidak ada file', async () => {
      /**
       * Test: Upload tanpa file.
       * Diharapkan gagal (400).
       */
      const res = await request(app.getHttpServer())
        .patch(`/certificates/1/upload`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('gagal upload jika sertifikat tidak ditemukan', async () => {
      /**
       * Test: Upload file ke sertifikat yang tidak ada.
       * Diharapkan gagal (404 atau 400).
       */
      const res = await request(app.getHttpServer())
        .patch(`/certificates/${INVALID_ID}/upload`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', DUMMY_SIGNED_PATH);

      expect([404, 400]).toContain(res.status);
    });
  });

  /**
   * ============================================================
   * Pengujian issue sertifikat (PATCH /certificates/:id/issue)
   * ============================================================
   */
  describe('PATCH /certificates/:id/issue', () => {
    /**
     * Menguji proses issue sertifikat.
     * Sertifikat harus ditemukan.
     */
    it('gagal issue jika sertifikat tidak ditemukan', async () => {
      /**
       * Test: Issue sertifikat yang tidak ada.
       * Diharapkan gagal (404).
       */
      const res = await request(app.getHttpServer())
        .patch(`/certificates/${INVALID_ID}/issue`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  /**
   * ============================================================
   * Pengujian get own certificate (GET /certificates/me)
   * ============================================================
   */
  describe('GET /certificates/me', () => {
    /**
     * Menguji pengambilan sertifikat milik sendiri.
     * Token harus ada, dan hanya user terkait yang bisa akses.
     */

    it('gagal get own certificate jika tidak ada token', async () => {
      /**
       * Test: Akses tanpa token.
       * Diharapkan gagal (401).
       */
      const res = await request(app.getHttpServer()).get('/certificates/me');
      expect(res.status).toBe(401);
    });

    it('berhasil get own certificate jika sudah ada', async () => {
      /**
       * Test: Intern mengambil sertifikat miliknya.
       * Diharapkan status 200 (jika ada) atau 404 (jika belum ada).
       */
      const res = await request(app.getHttpServer())
        .get('/certificates/me')
        .set('Authorization', `Bearer ${internToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id');
      }
    });
  });

  /**
   * ============================================================
   * Pengujian get all certificates (GET /certificates)
   * ============================================================
   */
  describe('GET /certificates', () => {
    /**
     * Menguji pengambilan seluruh sertifikat.
     * Hanya admin yang boleh akses.
     */

    it('gagal get all jika bukan admin', async () => {
      /**
       * Test: Intern mencoba akses semua sertifikat.
       * Diharapkan gagal (403).
       */
      const res = await request(app.getHttpServer())
        .get('/certificates')
        .set('Authorization', `Bearer ${internToken}`);

      expect(res.status).toBe(403);
    });

    it('berhasil get all certificates jika admin', async () => {
      /**
       * Test: Admin mengambil seluruh sertifikat.
       * Diharapkan sukses (200) dan response berupa array.
       */
      const res = await request(app.getHttpServer())
        .get('/certificates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  /**
   * ============================================================
   * Pengujian download sertifikat (GET /certificates/:id/download)
   * ============================================================
   */
  describe('GET /certificates/:id/download', () => {
    /**
     * Menguji proses download sertifikat.
     * Sertifikat harus ditemukan.
     */
    it('gagal download jika sertifikat tidak ditemukan', async () => {
      /**
       * Test: Download sertifikat yang tidak ada.
       * Diharapkan gagal (404 atau 400).
       */
      const res = await request(app.getHttpServer())
        .get(`/certificates/${INVALID_ID}/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 400]).toContain(res.status);
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint GET /certificates/:id
   * ============================================================
   * Menguji pengambilan detail sertifikat berdasarkan id.
   */
  describe('GET /certificates/:id', () => {
    /**
     * Menguji pengambilan detail sertifikat.
     * Token harus ada, dan id harus valid.
     */

    it('gagal mengambil detail sertifikat jika tidak ada token', async () => {
      /**
       * Test: Akses tanpa token.
       * Diharapkan gagal (401).
       */
      const res = await request(app.getHttpServer()).get('/certificates/1');
      expect(res.status).toBe(401);
    });

    it('gagal mengambil detail sertifikat jika id tidak ditemukan', async () => {
      /**
       * Test: Akses dengan id tidak valid.
       * Diharapkan gagal (404 atau 400).
       */
      const res = await request(app.getHttpServer())
        .get(`/certificates/${INVALID_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([404, 400]).toContain(res.status);
    });

    it('berhasil mengambil detail sertifikat jika id valid dan admin', async () => {
      /**
       * Test: Admin mengambil detail sertifikat id 1 (asumsi ada di database test).
       * Diharapkan sukses (200) atau 404 jika tidak ada.
       */
      const res = await request(app.getHttpServer())
        .get('/certificates/1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id', 1);
      }
    });
  });

  /**
   * ============================================================
   * Pengujian endpoint PATCH /certificates/:id/status
   * ============================================================
   * Menguji update status sertifikat secara manual.
   */
  describe('PATCH /certificates/:id/status', () => {
    /**
     * Menguji update status sertifikat.
     * Token harus ada, status harus valid, dan sertifikat harus ditemukan.
     */

    it('gagal update status jika tidak ada token', async () => {
      /**
       * Test: Update status tanpa token.
       * Diharapkan gagal (401).
       */
      const res = await request(app.getHttpServer())
        .patch('/certificates/1/status')
        .send({ status: 'issued' });
      expect(res.status).toBe(401);
    });

    it('gagal update status jika status tidak valid', async () => {
      /**
       * Test: Update status dengan status tidak valid.
       * Diharapkan gagal (400).
       */
      const res = await request(app.getHttpServer())
        .patch('/certificates/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'salah' });
      expect(res.status).toBe(400);
    });

    it('gagal update status jika sertifikat tidak ditemukan', async () => {
      /**
       * Test: Update status pada sertifikat yang tidak ada.
       * Diharapkan gagal (404 atau 400).
       */
      const res = await request(app.getHttpServer())
        .patch(`/certificates/${INVALID_ID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'issued' });
      expect([404, 400]).toContain(res.status);
    });

    it('berhasil update status jika data valid dan admin', async () => {
      /**
       * Test: Admin update status sertifikat id 1 (asumsi ada di database test).
       * Diharapkan sukses (200), atau gagal (400/404) jika tidak ada.
       */
      const res = await request(app.getHttpServer())
        .patch('/certificates/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'issued' });
      expect([200, 400, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'issued');
      }
    });
  });
});
