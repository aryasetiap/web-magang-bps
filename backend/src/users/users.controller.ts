import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Controller untuk endpoint terkait user.
 * Mengatur pembuatan, pembacaan, pembaruan, dan penghapusan user,
 * serta pembaruan profil user.
 */
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Membuat user baru.
   * Hanya dapat diakses oleh Admin.
   * @param createUserDto Data user yang akan dibuat
   * @returns Data user yang berhasil dibuat
   */
  @Post()
  @Roles('Admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Mengambil daftar seluruh user dengan opsi paginasi.
   * Hanya dapat diakses oleh Admin.
   * @param paginationQuery Parameter paginasi (opsional)
   * @returns Daftar user
   */
  @Get()
  @Roles('Admin')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  /**
   * Mengambil detail user berdasarkan ID.
   * Hanya dapat diakses oleh Admin.
   * @param id ID user
   * @returns Data user
   */
  @Get(':id')
  @Roles('Admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /**
   * Memperbarui data user berdasarkan ID.
   * Hanya dapat diakses oleh Admin.
   * @param id ID user
   * @param updateUserDto Data yang akan diperbarui
   * @returns Data user yang telah diperbarui
   */
  @Patch(':id')
  @Roles('Admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  /**
   * Menghapus user berdasarkan ID.
   * Hanya dapat diakses oleh Admin.
   * @param id ID user
   * @returns Hasil penghapusan user
   */
  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Memperbarui profil user yang sedang login, termasuk foto profil.
   * @param req Request yang berisi data user dari JWT
   * @param updateProfileDto Data profil yang akan diperbarui
   * @param profilePhoto File foto profil (opsional)
   * @returns Data user yang telah diperbarui
   */
  @Patch('profile')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  updateProfile(
    @Req() req,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profilePhoto?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto, profilePhoto);
  }
}
