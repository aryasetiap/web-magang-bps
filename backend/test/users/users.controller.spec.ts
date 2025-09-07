/**
 * Unit Test UsersController
 * -------------------------------------------------
 * Pengujian seluruh endpoint utama UsersController,
 * termasuk create, findAll, findOne, update, remove, dan updateProfile.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 *
 * Tujuan: Memastikan seluruh endpoint UsersController berjalan sesuai ekspektasi,
 * baik pada kondisi sukses maupun gagal.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { UpdateProfileDto } from '../../src/users/dto/update-profile.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Konstanta untuk data dummy yang sering digunakan
const DUMMY_USER_ID = 1;
const DUMMY_USER_NAME = 'Budi';
const DUMMY_USER_EMAIL = 'budi@mail.com';
const DUMMY_USER_PASSWORD = 'password123';
const DUMMY_USER_ROLE = 'Admin';
const DUMMY_UPDATED_NAME = 'Baru';
const DUMMY_PROFILE_PHOTO = 'profile.jpg';

const DUMMY_CREATE_USER_DTO: CreateUserDto = {
  name: DUMMY_USER_NAME,
  email: DUMMY_USER_EMAIL,
  password: DUMMY_USER_PASSWORD,
  roleName: DUMMY_USER_ROLE,
} as any;

const DUMMY_UPDATE_USER_DTO: UpdateUserDto = {
  name: DUMMY_UPDATED_NAME,
} as any;

const DUMMY_UPDATE_PROFILE_DTO: UpdateProfileDto = {
  name: DUMMY_UPDATED_NAME,
};

const DUMMY_PAGINATION_QUERY = { page: 1, limit: 10 };

describe('UsersController', () => {
  /**
   * Inisialisasi controller dan service mock sebelum setiap pengujian.
   */
  let controller: UsersController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  /**
   * Pengujian endpoint create user baru.
   * Memastikan pembuatan user berjalan sesuai ekspektasi,
   * baik pada kondisi sukses maupun gagal (email sudah terdaftar).
   */
  describe('create', () => {
    /**
     * Pengujian berhasil membuat user baru.
     * Memastikan service.create dipanggil dengan benar dan hasil sesuai.
     */
    it('berhasil membuat user baru', async () => {
      service.create.mockResolvedValue({
        id: DUMMY_USER_ID,
        ...DUMMY_CREATE_USER_DTO,
      });

      const result = await controller.create(DUMMY_CREATE_USER_DTO);

      expect(result).toEqual({ id: DUMMY_USER_ID, ...DUMMY_CREATE_USER_DTO });
      expect(service.create).toBeCalledWith(DUMMY_CREATE_USER_DTO);
    });

    /**
     * Pengujian gagal membuat user jika email sudah terdaftar.
     * Memastikan error ConflictException dilempar.
     */
    it('gagal jika email sudah terdaftar', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Email sudah terdaftar.'),
      );

      await expect(controller.create(DUMMY_CREATE_USER_DTO)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  /**
   * Pengujian endpoint findAll user (paginasi).
   * Memastikan pengambilan daftar user berjalan baik dan error ditangani.
   */
  describe('findAll', () => {
    /**
     * Pengujian berhasil mengambil daftar user.
     * Memastikan hasil dan parameter sesuai.
     */
    it('berhasil mengambil daftar user', async () => {
      const mockResult = {
        data: [{ id: DUMMY_USER_ID, name: DUMMY_USER_NAME }],
        meta: { totalItems: 1 },
      };
      service.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(DUMMY_PAGINATION_QUERY);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toBeCalledWith(DUMMY_PAGINATION_QUERY);
    });

    /**
     * Pengujian gagal mengambil daftar user jika terjadi error pada service.
     * Memastikan error dilempar ke atas.
     */
    it('gagal jika terjadi error pada service', async () => {
      service.findAll.mockRejectedValue(new Error('error'));

      await expect(controller.findAll(DUMMY_PAGINATION_QUERY)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint findOne user.
   * Memastikan detail user dapat diambil dan error jika user tidak ditemukan.
   */
  describe('findOne', () => {
    /**
     * Pengujian berhasil mengambil detail user.
     * Memastikan parameter dan hasil sesuai.
     */
    it('berhasil mengambil detail user', async () => {
      service.findOne.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: DUMMY_USER_NAME,
      });

      const result = await controller.findOne(DUMMY_USER_ID.toString());

      expect(result).toEqual({ id: DUMMY_USER_ID, name: DUMMY_USER_NAME });
      expect(service.findOne).toBeCalledWith(DUMMY_USER_ID);
    });

    /**
     * Pengujian gagal mengambil user jika user tidak ditemukan.
     * Memastikan error NotFoundException dilempar.
     */
    it('gagal jika user tidak ditemukan', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('User tidak ditemukan'),
      );

      await expect(
        controller.findOne(DUMMY_USER_ID.toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pengujian endpoint update user.
   * Memastikan update user berjalan baik dan error jika user tidak ditemukan.
   */
  describe('update', () => {
    /**
     * Pengujian berhasil update user.
     * Memastikan parameter dan hasil sesuai.
     */
    it('berhasil update user', async () => {
      service.update.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: DUMMY_UPDATED_NAME,
      });

      const result = await controller.update(
        DUMMY_USER_ID.toString(),
        DUMMY_UPDATE_USER_DTO,
      );

      expect(result).toEqual({ id: DUMMY_USER_ID, name: DUMMY_UPDATED_NAME });
      expect(service.update).toBeCalledWith(
        DUMMY_USER_ID,
        DUMMY_UPDATE_USER_DTO,
      );
    });

    /**
     * Pengujian gagal update user jika user tidak ditemukan.
     * Memastikan error NotFoundException dilempar.
     */
    it('gagal jika user tidak ditemukan', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('User tidak ditemukan'),
      );

      await expect(
        controller.update(DUMMY_USER_ID.toString(), DUMMY_UPDATE_USER_DTO),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pengujian endpoint remove user.
   * Memastikan user dapat dihapus dan error jika terjadi masalah pada service.
   */
  describe('remove', () => {
    /**
     * Pengujian berhasil menghapus user.
     * Memastikan parameter dan hasil sesuai.
     */
    it('berhasil menghapus user', async () => {
      service.remove.mockResolvedValue({
        id: DUMMY_USER_ID,
        deletedAt: expect.any(Date),
      });

      const result = await controller.remove(DUMMY_USER_ID.toString());

      expect(result).toHaveProperty('id', DUMMY_USER_ID);
      expect(service.remove).toBeCalledWith(DUMMY_USER_ID);
    });

    /**
     * Pengujian gagal menghapus user jika terjadi error pada service.
     * Memastikan error dilempar ke atas.
     */
    it('gagal jika terjadi error pada service', async () => {
      service.remove.mockRejectedValue(new Error('error'));

      await expect(controller.remove(DUMMY_USER_ID.toString())).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint updateProfile user.
   * Memastikan update profil user berjalan baik dan error jika user tidak ditemukan.
   */
  describe('updateProfile', () => {
    /**
     * Pengujian berhasil update profil user.
     * Memastikan parameter dan hasil sesuai.
     */
    it('berhasil update profil user', async () => {
      const req = { user: { id: DUMMY_USER_ID } };
      const file = { path: DUMMY_PROFILE_PHOTO };
      service.updateProfile.mockResolvedValue({
        id: DUMMY_USER_ID,
        name: DUMMY_UPDATED_NAME,
        profilePhoto: DUMMY_PROFILE_PHOTO,
      });

      const result = await controller.updateProfile(
        req as any,
        DUMMY_UPDATE_PROFILE_DTO,
        file as any,
      );

      expect(result).toEqual({
        id: DUMMY_USER_ID,
        name: DUMMY_UPDATED_NAME,
        profilePhoto: DUMMY_PROFILE_PHOTO,
      });
      expect(service.updateProfile).toBeCalledWith(
        DUMMY_USER_ID,
        DUMMY_UPDATE_PROFILE_DTO,
        file,
      );
    });

    /**
     * Pengujian gagal update profil user jika user tidak ditemukan.
     * Memastikan error NotFoundException dilempar.
     */
    it('gagal jika user tidak ditemukan', async () => {
      const req = { user: { id: DUMMY_USER_ID } };
      service.updateProfile.mockRejectedValue(
        new NotFoundException('User tidak ditemukan'),
      );

      await expect(
        controller.updateProfile(req as any, DUMMY_UPDATE_PROFILE_DTO),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
