/**
 * Modul DTO untuk memperbarui data pengguna.
 *
 * Modul ini mendefinisikan struktur data yang digunakan saat melakukan update data pengguna.
 * Seluruh field bersifat opsional agar dapat digunakan untuk pembaruan sebagian data.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * Data Transfer Object (DTO) untuk memperbarui data pengguna.
 *
 * Kelas ini mewarisi seluruh properti dari CreateUserDto,
 * namun seluruh field bersifat opsional untuk keperluan update.
 *
 * @extends PartialType<CreateUserDto>
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
