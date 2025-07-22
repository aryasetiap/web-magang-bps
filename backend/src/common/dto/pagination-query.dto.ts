import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO untuk query parameter paginasi.
 * 
 * Digunakan untuk mengambil data dengan paginasi pada endpoint API.
 * Properti `page` dan `limit` bersifat opsional, dengan nilai default
 * masing-masing 1 dan 10 jika tidak diberikan pada query.
 */
export class PaginationQueryDto {
  /**
   * Nomor halaman yang ingin diambil.
   * Default: 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /**
   * Jumlah data per halaman.
   * Default: 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  constructor() {
    this.page = 1;
    this.limit = 10;
  }
}
