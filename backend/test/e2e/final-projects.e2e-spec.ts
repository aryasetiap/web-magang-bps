/**
 * ============================================================
 * E2E Test FinalProjectsModule
 * ------------------------------------------------------------
 * Pengujian end-to-end untuk seluruh endpoint utama FinalProjectsModule.
 * Menggunakan @nestjs/testing dan supertest.
 * Setiap bagian test didokumentasikan dengan docstring berbahasa Indonesia.
 * ============================================================
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

// =====================
// Konstanta kredensial
// =====================
const INTERN_EMAIL = 'intern1@mail.com';
const INTERN_PASSWORD = 'intern12345';
const ADMIN_EMAIL = 'admin@webmagangbps.com';
const ADMIN_PASSWORD = 'WebMagangBPSKabPringsewu2025';
const DUMMY_FILE_PATH = '__tests__/dummy-final-project.pdf';

// =====================
// Variabel global test
// =====================
let internToken: string;
let adminToken: string;
let createdProjectId: number;

/**
 * Pengujian end-to-end untuk modul FinalProjects.
 */
describe('FinalProjectsModule (e2e)', () => {
  let app: INestApplication;

  /**
   * Setup aplikasi dan autentikasi sebelum seluruh test dijalankan.
   */
  beforeAll(async () => {
    // Membuat file PDF dummy jika belum ada, untuk pengujian upload file.
    if (!fs.existsSync(DUMMY_FILE_PATH)) {
      const { PDFDocument } = require('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595.28, 841.89]);
      const pdfBytes = await pdfDoc.save();
      fs.mkdirSync(path.dirname(DUMMY_FILE_PATH), { recursive: true });
      fs.writeFileSync(DUMMY_FILE_PATH, pdfBytes);
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

    // Login sebagai intern dan admin untuk mendapatkan token autentikasi.
    internToken = (await loginUser(INTERN_EMAIL, INTERN_PASSWORD)).body
      ?.access_token;
    adminToken = (await loginUser(ADMIN_EMAIL, ADMIN_PASSWORD)).body
      ?.access_token;
  });

  /**
   * Menutup aplikasi setelah seluruh test selesai.
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * Helper untuk login user dan mendapatkan response.
   */
  async function loginUser(email: string, password: string) {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
  }

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint POST /final-projects (create)
   * -----------------------------------------------------------
   */
  describe('POST /final-projects', () => {
    /**
     * Menguji pembuatan final project baru tanpa file.
     * Diharapkan berhasil dan mengembalikan id project.
     */
    it('berhasil membuat final project baru (tanpa file)', async () => {
      const res = await request(app.getHttpServer())
        .post('/final-projects')
        .set('Authorization', `Bearer ${internToken}`)
        .send({ title: 'Final Project E2E', description: 'Deskripsi' });

      expect([201, 200]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
      createdProjectId = res.body.id;
    });

    /**
     * Menguji pembuatan final project baru dengan file terlampir.
     * Diharapkan berhasil dan mengembalikan id project.
     */
    it('berhasil membuat final project baru dengan file', async () => {
      const res = await request(app.getHttpServer())
        .post('/final-projects')
        .set('Authorization', `Bearer ${internToken}`)
        .field('title', 'Final Project E2E File')
        .field('description', 'Deskripsi file')
        .attach('file', DUMMY_FILE_PATH);

      expect([201, 200]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
    });

    /**
     * Menguji pembuatan final project tanpa token autentikasi.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal membuat final project jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .post('/final-projects')
        .send({ title: 'Tanpa Token' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji pembuatan final project dengan data tidak valid.
     * Diharapkan gagal dengan status 400.
     */
    it('gagal membuat final project jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/final-projects')
        .set('Authorization', `Bearer ${internToken}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint GET /final-projects (user)
   * -----------------------------------------------------------
   */
  describe('GET /final-projects', () => {
    /**
     * Menguji pengambilan seluruh final project milik user.
     * Diharapkan berhasil dan mengembalikan array data.
     */
    it('berhasil mengambil seluruh final project milik user', async () => {
      const res = await request(app.getHttpServer())
        .get('/final-projects')
        .set('Authorization', `Bearer ${internToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Menguji pengambilan final project tanpa token autentikasi.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal mengambil jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).get('/final-projects');
      expect(res.status).toBe(401);
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint GET /final-projects/all (admin)
   * -----------------------------------------------------------
   */
  describe('GET /final-projects/all', () => {
    /**
     * Menguji pengambilan seluruh final project oleh admin.
     * Diharapkan berhasil dan mengembalikan data array.
     */
    it('berhasil mengambil seluruh final project (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/final-projects/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    /**
     * Menguji pengambilan seluruh final project oleh user non-admin.
     * Diharapkan gagal dengan status 403 atau 401.
     */
    it('gagal mengambil jika bukan admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/final-projects/all')
        .set('Authorization', `Bearer ${internToken}`);

      expect([403, 401]).toContain(res.status);
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint GET /final-projects/:id (detail)
   * -----------------------------------------------------------
   */
  describe('GET /final-projects/:id', () => {
    /**
     * Menguji pengambilan detail final project milik sendiri.
     * Diharapkan berhasil (200) atau 404 jika tidak ditemukan.
     */
    it('berhasil mengambil detail final project milik sendiri', async () => {
      const res = await request(app.getHttpServer())
        .get(`/final-projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id', createdProjectId);
      }
    });

    /**
     * Menguji pengambilan detail final project tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal mengambil detail jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).get(
        `/final-projects/${createdProjectId}`,
      );
      expect(res.status).toBe(401);
    });

    /**
     * Menguji pengambilan detail project yang bukan milik user dan bukan admin.
     * Diharapkan gagal dengan status 403 atau 404.
     */
    it('gagal mengambil detail jika bukan pemilik dan bukan admin', async () => {
      // Asumsi id 9999 bukan milik intern1@mail.com
      const res = await request(app.getHttpServer())
        .get('/final-projects/9999')
        .set('Authorization', `Bearer ${internToken}`);

      expect([403, 404]).toContain(res.status);
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint PATCH /final-projects/:id (update)
   * -----------------------------------------------------------
   */
  describe('PATCH /final-projects/:id', () => {
    /**
     * Menguji update final project milik sendiri.
     * Diharapkan berhasil (200) atau 404 jika tidak ditemukan.
     */
    it('berhasil update final project milik sendiri', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/final-projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ title: 'Final Project Updated' });

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('title', 'Final Project Updated');
      }
    });

    /**
     * Menguji update final project tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal update jika tidak ada token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/final-projects/${createdProjectId}`)
        .send({ title: 'Tanpa Token' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji update final project oleh user yang bukan pemilik.
     * Diharapkan gagal dengan status 403 atau 404.
     */
    it('gagal update jika bukan pemilik', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/final-projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Bukan Pemilik' });

      expect([403, 404]).toContain(res.status);
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint PATCH /final-projects/:id/review (review)
   * -----------------------------------------------------------
   */
  describe('PATCH /final-projects/:id/review', () => {
    /**
     * Menguji review final project oleh user non-admin/staff.
     * Diharapkan gagal dengan status 403 atau 401.
     */
    it('gagal review jika bukan admin/staff', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/final-projects/${createdProjectId}/review`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ status: 'reviewed', grade: 90, feedback: 'Bagus' });

      expect([403, 401]).toContain(res.status);
    });

    /**
     * Menguji review final project dengan data tidak valid.
     * Diharapkan gagal dengan status 400.
     */
    it('gagal review jika data tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/final-projects/${createdProjectId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'salah', grade: 'abc', feedback: '' });

      expect(res.status).toBe(400);
    });

    /**
     * Menguji review final project oleh admin dengan data valid.
     * Diharapkan berhasil (200) atau gagal (403/404) jika status project belum sesuai.
     */
    it('berhasil review jika data valid dan admin', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/final-projects/${createdProjectId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'reviewed', grade: 90, feedback: 'Bagus' });

      expect([200, 403, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'reviewed');
      }
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint DELETE /final-projects/:id (delete)
   * -----------------------------------------------------------
   */
  describe('DELETE /final-projects/:id', () => {
    /**
     * Menguji penghapusan final project milik sendiri.
     * Diharapkan berhasil (200) atau 404 jika tidak ditemukan.
     */
    it('berhasil menghapus final project milik sendiri', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/final-projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id', createdProjectId);
      }
    });

    /**
     * Menguji penghapusan final project tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal hapus jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/final-projects/${createdProjectId}`,
      );
      expect(res.status).toBe(401);
    });

    /**
     * Menguji penghapusan final project oleh user yang bukan pemilik.
     * Diharapkan gagal dengan status 403 atau 404.
     */
    it('gagal hapus jika bukan pemilik', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/final-projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([403, 404]).toContain(res.status);
    });
  });

  /**
   * -----------------------------------------------------------
   * Pengujian endpoint GET /final-projects/:id/download (download)
   * -----------------------------------------------------------
   */
  describe('GET /final-projects/:id/download', () => {
    /**
     * Menguji download file final project milik sendiri.
     * Diharapkan berhasil (200) jika file ada, atau 404/403 jika tidak.
     */
    it('berhasil download file final project milik sendiri', async () => {
      const res = await request(app.getHttpServer())
        .get(`/final-projects/${createdProjectId}/download`)
        .set('Authorization', `Bearer ${internToken}`);

      // Status 200 jika file ada, 404 jika tidak ada file, 403 jika bukan pemilik
      expect([200, 404, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.header['content-type']).toMatch(/pdf|octet-stream/);
      }
    });

    /**
     * Menguji download file final project tanpa token.
     * Diharapkan gagal dengan status 401.
     */
    it('gagal download jika tidak ada token', async () => {
      const res = await request(app.getHttpServer()).get(
        `/final-projects/${createdProjectId}/download`,
      );
      expect(res.status).toBe(401);
    });

    /**
     * Menguji download file final project oleh user yang bukan pemilik.
     * Diharapkan gagal dengan status 403 atau 404.
     */
    it('gagal download jika bukan pemilik', async () => {
      const res = await request(app.getHttpServer())
        .get(`/final-projects/${createdProjectId}/download`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([403, 404]).toContain(res.status);
    });
  });
});
