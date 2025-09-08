/**
 * Unit Test UsersService
 * -------------------------------------------------
 * Pengujian seluruh fitur utama UsersService, termasuk create, getProfile,
 * updateProfile, findAll, findOne, update, dan remove.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { UsersService } from '../../src/users/users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Konstanta untuk data dummy yang sering digunakan
const DUMMY_USER_ID = 1;
const DUMMY_USER_NAME = 'Budi';
const DUMMY_USER_EMAIL = 'budi@mail.com';
const DUMMY_USER_PASSWORD = 'password123';
const DUMMY_HASHED_PASSWORD = 'hashedpass';
const DUMMY_ROLE_ID = 2;
const DUMMY_ROLE_NAME = 'Admin';
const DUMMY_PROFILE_PHOTO_OLD = 'old.jpg';
const DUMMY_PROFILE_PHOTO_NEW = 'new.jpg';

describe('UsersService', () => {
  /**
   * Inisialisasi variabel yang akan digunakan di seluruh test.
   */
  let service: UsersService;
  let prisma: any;
  let fsMock: any;

  /**
   * Setup sebelum setiap test dijalankan.
   * Membuat mock untuk prisma dan fs, serta UsersService instance.
   */
  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    fsMock = require('fs');
    fsMock.existsSync = jest.fn();
    fsMock.unlinkSync = jest.fn();

    service = new UsersService(prisma);
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(() => Promise.resolve(DUMMY_HASHED_PASSWORD));
  });

  /**
   * Membersihkan seluruh mock setelah setiap test.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Pengujian fitur create user baru.
   * Menguji skenario sukses dan gagal pada proses pembuatan user.
   */
  describe('create', () => {
    /**
     * Pengujian berhasil membuat user baru jika email dan role valid.
     */
    it('berhasil membuat user baru jika email dan role valid', async () => {
      /**
       * Test ini memastikan bahwa user dapat dibuat jika email belum terdaftar
       * dan role yang diberikan valid.
       */
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue({
        id: DUMMY_ROLE_ID,
        name: DUMMY_ROLE_NAME,
      });
      prisma.user.create.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: DUMMY_USER_NAME,
        email: DUMMY_USER_EMAIL,
        password: DUMMY_HASHED_PASSWORD,
        roleId: DUMMY_ROLE_ID,
      });

      const dto = {
        name: DUMMY_USER_NAME,
        email: DUMMY_USER_EMAIL,
        password: DUMMY_USER_PASSWORD,
        roleName: DUMMY_ROLE_NAME,
      };
      const result = await service.create(dto as any);

      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.create).toBeCalled();
    });

    /**
     * Pengujian gagal jika email sudah terdaftar.
     */
    it('gagal jika email sudah terdaftar', async () => {
      /**
       * Test ini memastikan bahwa error ConflictException dilempar
       * jika email sudah digunakan user lain.
       */
      prisma.user.findUnique.mockResolvedValue({
        id: DUMMY_USER_ID,
        email: DUMMY_USER_EMAIL,
      });
      const dto = {
        name: DUMMY_USER_NAME,
        email: DUMMY_USER_EMAIL,
        password: DUMMY_USER_PASSWORD,
        roleName: DUMMY_ROLE_NAME,
      };
      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    /**
     * Pengujian gagal jika role tidak ditemukan.
     */
    it('gagal jika role tidak ditemukan', async () => {
      /**
       * Test ini memastikan bahwa error NotFoundException dilempar
       * jika role yang diberikan tidak ada di database.
       */
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue(null);

      const dto = {
        name: DUMMY_USER_NAME,
        email: DUMMY_USER_EMAIL,
        password: DUMMY_USER_PASSWORD,
        roleName: DUMMY_ROLE_NAME,
      };
      await expect(service.create(dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Pengujian fitur getProfile user.
   * Menguji pengambilan profil user berdasarkan ID.
   */
  describe('getProfile', () => {
    /**
     * Pengujian berhasil mengambil profil user.
     */
    it('berhasil mengambil profil user', async () => {
      /**
       * Test ini memastikan bahwa profil user dapat diambil jika user ditemukan.
       */
      prisma.user.findUnique.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: DUMMY_USER_NAME,
      });
      const result = await service.getProfile(DUMMY_USER_ID);
      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(prisma.user.findUnique).toBeCalledWith({
        where: { id: DUMMY_USER_ID },
        select: expect.any(Object),
      });
    });

    /**
     * Pengujian gagal jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      /**
       * Test ini memastikan bahwa error NotFoundException dilempar
       * jika user tidak ditemukan.
       */
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile(DUMMY_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Pengujian fitur updateProfile user.
   * Menguji update profil user baik dengan maupun tanpa foto.
   */
  describe('updateProfile', () => {
    /**
     * Pengujian berhasil update profil user tanpa foto.
     */
    it('berhasil update profil user tanpa foto', async () => {
      /**
       * Test ini memastikan bahwa user dapat mengupdate profil tanpa mengganti foto.
       */
      prisma.user.findFirst.mockResolvedValue({
        id: DUMMY_USER_ID,
        profilePhoto: null,
      });
      prisma.user.update.mockResolvedValue({ id: DUMMY_USER_ID, name: 'Baru' });

      const dto = { name: 'Baru' };
      const result = await service.updateProfile(DUMMY_USER_ID, dto as any);

      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(prisma.user.findFirst).toBeCalledWith({
        where: { id: DUMMY_USER_ID, deletedAt: null },
        select: { profilePhoto: true },
      });
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Pengujian berhasil update profil user dengan foto baru.
     */
    it('berhasil update profil user dengan foto', async () => {
      /**
       * Test ini memastikan bahwa user dapat mengganti foto profil,
       * dan file foto lama dihapus jika ada.
       */
      prisma.user.findFirst.mockResolvedValue({
        id: DUMMY_USER_ID,
        profilePhoto: DUMMY_PROFILE_PHOTO_OLD,
      });
      fsMock.existsSync.mockReturnValue(true);
      prisma.user.update.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: 'Baru',
        profilePhoto: DUMMY_PROFILE_PHOTO_NEW,
      });

      const dto = { name: 'Baru' };
      const file = { path: DUMMY_PROFILE_PHOTO_NEW };
      const result = await service.updateProfile(
        DUMMY_USER_ID,
        dto as any,
        file as any,
      );

      expect(result).toHaveProperty('profilePhoto', DUMMY_PROFILE_PHOTO_NEW);
      expect(fsMock.unlinkSync).toBeCalledWith(
        expect.stringContaining(DUMMY_PROFILE_PHOTO_OLD),
      );
      expect(prisma.user.findFirst).toBeCalledWith({
        where: { id: DUMMY_USER_ID, deletedAt: null },
        select: { profilePhoto: true },
      });
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Pengujian gagal jika user tidak ditemukan saat update profil.
     */
    it('gagal jika user tidak ditemukan', async () => {
      /**
       * Test ini memastikan bahwa error NotFoundException dilempar
       * jika user tidak ditemukan saat update profil.
       */
      prisma.user.findUnique.mockResolvedValue(null);
      const dto = { name: 'Baru' };
      await expect(
        service.updateProfile(DUMMY_USER_ID, dto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pengujian fitur findAll user (paginasi).
   * Menguji pengambilan daftar user dengan paginasi.
   */
  describe('findAll', () => {
    /**
     * Pengujian berhasil mengambil daftar user dengan paginasi.
     */
    it('berhasil mengambil daftar user dengan paginasi', async () => {
      /**
       * Test ini memastikan bahwa daftar user dapat diambil dengan paginasi yang benar.
       */
      prisma.$transaction.mockResolvedValue([
        [
          { id: DUMMY_USER_ID, name: DUMMY_USER_NAME },
          { id: 2, name: 'Ani' },
        ],
        2,
      ]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result.meta).toHaveProperty('totalItems', 2);
      expect(prisma.$transaction).toBeCalled();
    });
  });

  /**
   * Pengujian fitur findOne user.
   * Menguji pengambilan detail user berdasarkan ID.
   */
  describe('findOne', () => {
    /**
     * Pengujian berhasil mengambil detail user.
     */
    it('berhasil mengambil detail user', async () => {
      /**
       * Test ini memastikan bahwa detail user dapat diambil jika user ditemukan.
       */
      prisma.user.findFirst.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: DUMMY_USER_NAME,
      });
      const result = await service.findOne(DUMMY_USER_ID);
      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(prisma.user.findFirst).toBeCalledWith({
        where: { id: DUMMY_USER_ID, deletedAt: null },
        select: expect.any(Object),
      });
    });

    /**
     * Pengujian gagal jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      /**
       * Test ini memastikan bahwa error NotFoundException dilempar
       * jika user tidak ditemukan.
       */
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.findOne(DUMMY_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Pengujian fitur update user.
   * Menguji update data user berdasarkan ID.
   */
  describe('update', () => {
    /**
     * Pengujian berhasil update user.
     */
    it('berhasil update user', async () => {
      /**
       * Test ini memastikan bahwa user dapat diupdate jika data valid.
       */
      prisma.user.update.mockResolvedValue({ id: DUMMY_USER_ID, name: 'Baru' });
      const dto = { name: 'Baru' };
      const result = await service.update(DUMMY_USER_ID, dto as any);
      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Pengujian gagal jika user tidak ditemukan (error P2025).
     */
    it('gagal jika user tidak ditemukan (P2025)', async () => {
      /**
       * Test ini memastikan bahwa error NotFoundException dilempar
       * jika user tidak ditemukan saat update (kode error P2025 dari Prisma).
       */
      const error = { code: 'P2025' };
      prisma.user.update.mockRejectedValue(error);

      const dto = { name: 'Baru' };
      await expect(service.update(DUMMY_USER_ID, dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Pengujian fitur remove user (soft delete).
   * Menguji proses soft delete user.
   */
  describe('remove', () => {
    /**
     * Pengujian berhasil soft delete user.
     */
    it('berhasil soft delete user', async () => {
      /**
       * Test ini memastikan bahwa user dapat dihapus secara soft delete,
       * yaitu hanya mengisi field deletedAt.
       */
      prisma.user.update.mockResolvedValue({
        id: DUMMY_USER_ID,
        deletedAt: expect.any(Date),
      });
      const result = await service.remove(DUMMY_USER_ID);
      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(prisma.user.update).toBeCalledWith({
        where: { id: DUMMY_USER_ID },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
