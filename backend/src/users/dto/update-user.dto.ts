import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO untuk memperbarui data pengguna.
 * 
 * Kelas ini mewarisi seluruh properti dari CreateUserDto,
 * namun seluruh field bersifat opsional untuk keperluan update.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
