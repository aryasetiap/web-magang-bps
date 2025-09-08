/**
 * -------------------------------------------------
 * E2E Test untuk AppModule (NestJS)
 * -------------------------------------------------
 * File ini berisi pengujian end-to-end untuk endpoint utama AppModule (root '/').
 * Pengujian dilakukan menggunakan @nestjs/testing dan supertest.
 * Setiap bagian penting diberikan docstring berbahasa Indonesia untuk memperjelas tujuan pengujian.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Konstanta untuk response yang diharapkan
const ROOT_ENDPOINT = '/';
const EXPECTED_STATUS_OK = 200;
const EXPECTED_HELLO_MESSAGE = 'Hello World!';

describe('AppModule (e2e)', () => {
  let app: INestApplication;

  /**
   * Setup aplikasi NestJS sebelum seluruh pengujian dijalankan.
   * Tujuan: Membuat instance aplikasi yang siap diuji.
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * Teardown aplikasi setelah seluruh pengujian selesai.
   * Tujuan: Membersihkan resource aplikasi agar tidak terjadi memory leak.
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * -------------------------------------------------
   * Pengujian Endpoint GET /
   * -------------------------------------------------
   * Tujuan: Memastikan endpoint root ('/') mengembalikan response dan status code yang sesuai.
   */
  describe('GET /', () => {
    /**
     * Pengujian response sukses pada endpoint root.
     * Tujuan: Memastikan response status 200 dan pesan yang dikembalikan adalah 'Hello World!'.
     */
    it('seharusnya mengembalikan pesan hello dengan status 200 OK', async () => {
      const response = await request(app.getHttpServer()).get(ROOT_ENDPOINT);
      expect(response.status).toBe(EXPECTED_STATUS_OK);
      expect(response.text).toBe(EXPECTED_HELLO_MESSAGE);
    });

    // Tidak ada pengujian error khusus karena endpoint root hanya mengembalikan pesan statis.
  });

  // Tidak ada endpoint lain yang perlu diuji pada AppModule saat ini.
});
