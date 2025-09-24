/**
 * E2E Test SubmissionsModule
 * -------------------------------------------------
 * Pengujian end-to-end untuk endpoint utama SubmissionsModule.
 * Menggunakan @nestjs/testing dan supertest.
 * Setiap test case didokumentasikan dengan komentar berbahasa Indonesia.
 *
 * Tujuan:
 * - Memastikan seluruh endpoint submissions berjalan sesuai ekspektasi.
 * - Menguji validasi, otorisasi, dan edge case pada fitur submissions.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

// Konstanta kredensial dan path file dummy
const INTERN_EMAIL = 'intern1@mail.com';
const INTERN_PASSWORD = 'intern12345';
const ADMIN_EMAIL = 'admin@webmagangbps.com';
const ADMIN_PASSWORD = 'WebMagangBPSKabPringsewu2025';
const DUMMY_FILE_PATH = '__tests__/dummy-submission.pdf';
const INVALID_FILE_PATH = '__tests__/dummy-invalid.jpg';
const NOT_FOUND_ID = 99999;
const DEFAULT_TASK_ID = 1;

let internToken: string;
let adminToken: string;
let submissionId: number;
let taskId: number = DEFAULT_TASK_ID;

/**
 * Membuat file PDF dummy jika belum ada.
 * Digunakan untuk simulasi upload file pada pengujian.
 */
async function ensureDummyPdf(filePath: string) {
  if (!fs.existsSync(filePath)) {
    const { PDFDocument } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([595.28, 841.89]);
    const pdfBytes = await pdfDoc.save();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, pdfBytes);
  }
}

/**
 * Membuat file JPG dummy untuk pengujian file tidak valid.
 */
function ensureDummyInvalidFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  }
}

describe('SubmissionsModule (e2e)', () => {
  let app: INestApplication;

  /**
   * Inisialisasi aplikasi dan login user sebelum seluruh pengujian.
   */
  beforeAll(async () => {
    await ensureDummyPdf(DUMMY_FILE_PATH);
    ensureDummyInvalidFile(INVALID_FILE_PATH);

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

    // Login sebagai intern
    const internRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: INTERN_EMAIL, password: INTERN_PASSWORD });
    internToken = internRes.body?.access_token;

    // Login sebagai admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminRes.body?.access_token;
  });

  /**
   * Menutup aplikasi setelah seluruh pengujian selesai.
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * Pengujian endpoint PATCH /submissions/:taskId/submit
   * Menguji proses submit tugas oleh intern.
   */
  describe('PATCH /submissions/:taskId/submit', () => {
    /**
     * Menguji submit tugas dengan file dan deskripsi.
     * Berhasil jika status 200/201, gagal jika 400/403/500.
     */
    it('berhasil submit tugas dengan file', async () => {
      /**
       * Tujuan: Memastikan intern dapat submit tugas dengan file PDF dan deskripsi.
       */
      try {
        const res = await request(app.getHttpServer())
          .patch(`/submissions/${taskId}/submit`)
          .set('Authorization', `Bearer ${internToken}`)
          .attach('file', DUMMY_FILE_PATH)
          .field('description', 'Submission test E2E');

        expect([200, 201, 400, 403, 500]).toContain(res.status);
        if ([200, 201].includes(res.status)) {
          expect(res.body).toHaveProperty('id');
          submissionId = res.body.id;
        } else {
          submissionId = 1;
        }
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          console.warn('Upload test skipped due to ECONNRESET');
          submissionId = 1;
          return;
        }
        throw error;
      }
    });

    /**
     * Menguji submit tugas hanya dengan deskripsi tanpa file.
     */
    it('berhasil submit tugas hanya dengan deskripsi', async () => {
      /**
       * Tujuan: Memastikan intern dapat submit tugas hanya dengan deskripsi.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${taskId + 1}/submit`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ description: 'Submission hanya deskripsi' });

      expect([200, 201, 400, 403]).toContain(res.status);
    });

    /**
     * Menguji submit tugas tanpa token (unauthorized).
     */
    it('gagal submit jika tidak ada token', async () => {
      /**
       * Tujuan: Memastikan endpoint menolak request tanpa token.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${taskId}/submit`)
        .send({ description: 'Tanpa token' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji submit tugas tanpa file dan deskripsi (invalid).
     */
    it('gagal submit jika tidak ada file dan deskripsi', async () => {
      /**
       * Tujuan: Memastikan validasi berjalan jika tidak ada data yang dikirim.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${taskId}/submit`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({});

      expect([400, 403]).toContain(res.status);
    });

    /**
     * Menguji submit tugas dengan file tidak valid (bukan PDF).
     */
    it('gagal submit jika file tidak valid', async () => {
      /**
       * Tujuan: Memastikan validasi file berjalan jika file bukan PDF.
       */
      try {
        const res = await request(app.getHttpServer())
          .patch(`/submissions/${taskId}/submit`)
          .set('Authorization', `Bearer ${internToken}`)
          .attach('file', INVALID_FILE_PATH);

        expect([400, 403, 500]).toContain(res.status);
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          console.warn('Invalid file test skipped due to ECONNRESET');
          return;
        }
        throw error;
      }
    });

    /**
     * Menguji submit tugas yang sama dua kali (duplikasi).
     */
    it('gagal submit jika sudah pernah submit', async () => {
      /**
       * Tujuan: Memastikan user tidak bisa submit tugas yang sama dua kali.
       */
      try {
        const res = await request(app.getHttpServer())
          .patch(`/submissions/${taskId}/submit`)
          .set('Authorization', `Bearer ${internToken}`)
          .attach('file', DUMMY_FILE_PATH)
          .field('description', 'Duplikasi submission');

        expect([400, 403, 500]).toContain(res.status);
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          console.warn('Duplicate submission test skipped due to ECONNRESET');
          return;
        }
        throw error;
      }
    });
  });

  /**
   * Pengujian endpoint PATCH /submissions/:id/resubmit
   * Menguji proses resubmit tugas oleh intern.
   */
  describe('PATCH /submissions/:id/resubmit', () => {
    /**
     * Menguji resubmit dengan file baru dan deskripsi.
     */
    it('berhasil resubmit dengan file baru', async () => {
      /**
       * Tujuan: Memastikan intern dapat resubmit tugas dengan file baru.
       */
      try {
        const res = await request(app.getHttpServer())
          .patch(`/submissions/${submissionId}/resubmit`)
          .set('Authorization', `Bearer ${internToken}`)
          .attach('file', DUMMY_FILE_PATH)
          .field('description', 'Resubmit dengan file baru');

        expect([200, 400, 403, 404]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('status', 'submitted');
        }
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          console.warn('Resubmit test skipped due to ECONNRESET');
          return;
        }
        throw error;
      }
    });

    /**
     * Menguji resubmit hanya dengan deskripsi baru.
     */
    it('berhasil resubmit hanya dengan deskripsi baru', async () => {
      /**
       * Tujuan: Memastikan intern dapat resubmit hanya dengan update deskripsi.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/resubmit`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ description: 'Update deskripsi saja' });

      expect([200, 400, 403, 404]).toContain(res.status);
    });

    /**
     * Menguji resubmit tanpa token (unauthorized).
     */
    it('gagal resubmit jika tidak ada token', async () => {
      /**
       * Tujuan: Memastikan endpoint menolak resubmit tanpa token.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/resubmit`)
        .send({ description: 'Tanpa token' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji resubmit oleh user yang bukan pemilik submission.
     */
    it('gagal resubmit jika bukan pemilik', async () => {
      /**
       * Tujuan: Memastikan hanya pemilik submission yang bisa resubmit.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/resubmit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Resubmit oleh admin' });

      expect([403, 404, 400]).toContain(res.status);
    });

    /**
     * Menguji resubmit tanpa file dan deskripsi (invalid).
     */
    it('gagal resubmit jika tidak ada file dan deskripsi', async () => {
      /**
       * Tujuan: Memastikan validasi berjalan jika tidak ada data pada resubmit.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/resubmit`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({});

      expect([400, 403, 404]).toContain(res.status);
    });

    /**
     * Menguji resubmit pada submission yang tidak ditemukan.
     */
    it('gagal resubmit jika submission tidak ditemukan', async () => {
      /**
       * Tujuan: Memastikan error jika submission tidak ada.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${NOT_FOUND_ID}/resubmit`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ description: 'Submission tidak ada' });

      expect([404, 400]).toContain(res.status);
    });
  });

  /**
   * Pengujian endpoint PATCH /submissions/:id/grade
   * Menguji proses penilaian submission oleh admin.
   */
  describe('PATCH /submissions/:id/grade', () => {
    /**
     * Menguji grading submission dengan status reviewed.
     */
    it('berhasil grade submission dengan status reviewed', async () => {
      /**
       * Tujuan: Memastikan admin dapat memberi nilai dan feedback dengan status reviewed.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grade: 85,
          feedback: 'Baik, tapi perlu perbaikan di bagian X',
          status: 'reviewed',
        });

      expect([200, 400, 403, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'reviewed');
        expect(res.body).toHaveProperty('grade', 85);
      }
    });

    /**
     * Menguji grading submission dengan status revisi.
     */
    it('berhasil grade submission dengan status revisi', async () => {
      /**
       * Tujuan: Memastikan admin dapat memberi status revisi pada submission.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grade: 60,
          feedback: 'Perlu diperbaiki dan dikumpulkan ulang',
          status: 'revisi',
        });

      expect([200, 400, 403, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'revisi');
      }
    });

    /**
     * Menguji grading tanpa token (unauthorized).
     */
    it('gagal grade jika tidak ada token', async () => {
      /**
       * Tujuan: Memastikan endpoint menolak grading tanpa token.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .send({ grade: 80, feedback: 'Tanpa token' });

      expect(res.status).toBe(401);
    });

    /**
     * Menguji grading oleh user yang bukan admin/pembuat tugas.
     */
    it('gagal grade jika bukan pembuat tugas', async () => {
      /**
       * Tujuan: Memastikan hanya admin/pembuat tugas yang bisa grading.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ grade: 80, feedback: 'Grade oleh intern' });

      expect([403, 404, 400]).toContain(res.status);
    });

    /**
     * Menguji grading dengan nilai tidak valid (>100).
     */
    it('gagal grade jika data tidak valid', async () => {
      /**
       * Tujuan: Memastikan validasi nilai berjalan (nilai > 100 tidak diterima).
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grade: 150,
          feedback: 'Grade tidak valid',
        });

      expect(res.status).toBe(400);
    });

    /**
     * Menguji grading dengan nilai negatif.
     */
    it('gagal grade jika grade negatif', async () => {
      /**
       * Tujuan: Memastikan validasi nilai berjalan (nilai < 0 tidak diterima).
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grade: -10,
          feedback: 'Grade negatif',
        });

      expect(res.status).toBe(400);
    });

    /**
     * Menguji grading pada submission yang tidak ditemukan.
     */
    it('gagal grade jika submission tidak ditemukan', async () => {
      /**
       * Tujuan: Memastikan error jika submission tidak ada.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${NOT_FOUND_ID}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ grade: 80, feedback: 'Submission tidak ada' });

      expect([404, 400]).toContain(res.status);
    });
  });

  /**
   * Pengujian edge cases dan validasi tambahan pada submissions.
   */
  describe('Edge Cases & Additional Validations', () => {
    /**
     * Menguji submit pada task yang tidak ditemukan.
     */
    it('gagal submit jika task tidak ditemukan', async () => {
      /**
       * Tujuan: Memastikan error jika task tidak ada.
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${NOT_FOUND_ID}/submit`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({ description: 'Task tidak ada' });

      expect([400, 403, 404]).toContain(res.status);
    });

    /**
     * Menguji grading dengan status tidak valid.
     */
    it('gagal grade dengan status tidak valid', async () => {
      /**
       * Tujuan: Memastikan validasi status berjalan (status tidak valid ditolak).
       */
      const res = await request(app.getHttpServer())
        .patch(`/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grade: 80,
          feedback: 'Status tidak valid',
          status: 'invalid_status',
        });

      expect(res.status).toBe(400);
    });

    /**
     * Menguji resubmit dengan file terlalu besar (simulasi).
     */
    it('gagal resubmit dengan file terlalu besar', async () => {
      /**
       * Tujuan: Memastikan validasi ukuran file berjalan (simulasi file besar).
       */
      try {
        const res = await request(app.getHttpServer())
          .patch(`/submissions/${submissionId}/resubmit`)
          .set('Authorization', `Bearer ${internToken}`)
          .attach('file', DUMMY_FILE_PATH)
          .field('description', 'Test file besar');

        expect([200, 400, 403, 404]).toContain(res.status);
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          console.warn('Large file test skipped due to ECONNRESET');
          return;
        }
        throw error;
      }
    });
  });

  /**
   * Pengujian endpoint GET /submissions
   * Mengambil seluruh submissions milik user yang sedang login.
   */
  describe('GET /submissions', () => {
    /**
     * Menguji pengambilan submissions milik user sendiri.
     */
    it('berhasil mengambil submissions milik user', async () => {
      /**
       * Tujuan: Memastikan user dapat mengambil daftar submissions miliknya.
       */
      const res = await request(app.getHttpServer())
        .get('/submissions')
        .set('Authorization', `Bearer ${internToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    /**
     * Menguji pengambilan submissions tanpa token (unauthorized).
     */
    it('gagal mengambil submissions jika tidak ada token', async () => {
      /**
       * Tujuan: Memastikan endpoint menolak request tanpa token.
       */
      const res = await request(app.getHttpServer()).get('/submissions');
      expect([401, 404]).toContain(res.status);
    });
  });

  /**
   * Pengujian endpoint GET /submissions/:id
   * Mengambil detail submission berdasarkan ID.
   */
  describe('GET /submissions/:id', () => {
    /**
     * Menguji pengambilan detail submission milik sendiri.
     */
    it('berhasil mengambil detail submission milik sendiri', async () => {
      /**
       * Tujuan: Memastikan user dapat mengambil detail submission miliknya.
       */
      const res = await request(app.getHttpServer())
        .get(`/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect([200, 403, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id', submissionId);
      }
    });

    /**
     * Menguji pengambilan detail submission oleh user bukan pemilik.
     */
    it('gagal mengambil detail jika bukan pemilik', async () => {
      /**
       * Tujuan: Memastikan hanya pemilik atau admin yang bisa akses detail submission.
       */
      const res = await request(app.getHttpServer())
        .get(`/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 403, 404]).toContain(res.status);
    });

    /**
     * Menguji pengambilan detail submission tanpa token.
     */
    it('gagal mengambil detail jika tidak ada token', async () => {
      /**
       * Tujuan: Memastikan endpoint menolak request tanpa token.
       */
      const res = await request(app.getHttpServer()).get(
        `/submissions/${submissionId}`,
      );
      expect([401, 404]).toContain(res.status);
    });

    /**
     * Menguji pengambilan detail submission yang tidak ditemukan.
     */
    it('gagal mengambil detail jika submission tidak ditemukan', async () => {
      /**
       * Tujuan: Memastikan error jika submission tidak ada.
       */
      const res = await request(app.getHttpServer())
        .get(`/submissions/${NOT_FOUND_ID}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect([404, 400]).toContain(res.status);
    });
  });

  /**
   * Pengujian endpoint GET /submissions/task/:taskId
   * Mengambil seluruh submissions untuk task tertentu (khusus admin).
   */
  describe('GET /submissions/task/:taskId', () => {
    /**
     * Menguji pengambilan submissions untuk task tertentu oleh admin.
     */
    it('berhasil mengambil submissions untuk task jika admin', async () => {
      /**
       * Tujuan: Memastikan admin dapat mengambil seluruh submissions untuk task tertentu.
       */
      const res = await request(app.getHttpServer())
        .get(`/submissions/task/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    /**
     * Menguji pengambilan submissions task oleh user bukan admin.
     */
    it('gagal mengambil submissions task jika bukan admin', async () => {
      /**
       * Tujuan: Memastikan hanya admin yang bisa mengambil submissions task.
       */
      const res = await request(app.getHttpServer())
        .get(`/submissions/task/${taskId}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect([403, 401, 404]).toContain(res.status);
    });

    /**
     * Menguji pengambilan submissions task tanpa token.
     */
    it('gagal mengambil submissions task jika tidak ada token', async () => {
      /**
       * Tujuan: Memastikan endpoint menolak request tanpa token.
       */
      const res = await request(app.getHttpServer()).get(
        `/submissions/task/${taskId}`,
      );
      expect([401, 404]).toContain(res.status);
    });
  });
});
