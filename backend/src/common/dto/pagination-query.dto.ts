/**
 * Modul DTO untuk parameter query paginasi.
 *
 * Berisi definisi kelas PaginationQueryDto yang digunakan untuk
 * mengambil data dengan paginasi pada endpoint API.
 *
 * @module PaginationQueryDto
 */

import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk parameter query paginasi.
 *
 * Digunakan pada endpoint API yang mendukung paginasi.
 * Properti `page` dan `limit` bersifat opsional, dengan nilai default
 * masing-masing 1 dan 10 jika tidak diberikan pada query.
 */
export class PaginationQueryDto {
  /**
   * Nomor halaman yang ingin diambil.
   * Default: 1
   *
   * @type {number}
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /**
   * Jumlah data per halaman.
   * Default: 10
   *
   * @type {number}
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  /**
   * Membuat instance PaginationQueryDto dengan nilai default.
   *
   * @constructor
   */
  constructor() {
    // Nilai default sudah diinisialisasi pada deklarasi properti.
  }
}
