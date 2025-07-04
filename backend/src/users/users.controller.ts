// src/users/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// 1. Impor semua yang kita butuhkan untuk keamanan
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // 2. Terapkan KEDUA guard di level controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // NOTE: Endpoint 'create' di sini mungkin tidak kita butuhkan karena
  // user dibuat melalui '/auth/register'. Bisa dihapus atau diberi peran Admin juga.
  @Post()
  @Roles('Admin') // Hanya Admin yang boleh membuat user secara manual
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('Admin') // 3. Tentukan peran 'Admin' untuk endpoint findAll
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('Admin') // Terapkan juga untuk findOne
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Admin') // Terapkan juga untuk update
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles('Admin') // Terapkan juga untuk delete
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
