import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LogbooksService } from './logbooks.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * Controller untuk mengelola entri logbook.
 * Seluruh endpoint dilindungi oleh JWT AuthGuard.
 */
@Controller('logbooks')
@UseGuards(AuthGuard('jwt'))
export class LogbooksController {
  constructor(private readonly logbooksService: LogbooksService) { }

  /**
   * Membuat entri logbook baru untuk user yang sedang login.
   * @param req Request yang berisi data user.
   * @param createLogbookDto Data untuk membuat logbook baru.
   * @returns Logbook yang berhasil dibuat.
   */
  @Post()
  create(@Request() req, @Body() createLogbookDto: CreateLogbookDto) {
    const userId = req.user.userId;
    return this.logbooksService.create(userId, createLogbookDto);
  }

  /**
   * Mengambil semua logbook milik user yang sedang login.
   * @param req Request yang berisi data user.
   * @returns Daftar logbook milik user.
   */
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.logbooksService.findAll(userId);
  }

  /**
   * Mengambil semua logbook untuk admin dengan fitur paginasi.
   * Hanya dapat diakses oleh user dengan peran admin.
   * @param page Halaman yang ingin diambil (default: 1).
   * @param limit Jumlah data per halaman (default: 20).
   * @returns Daftar logbook seluruh user.
   */
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllLogbooks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.logbooksService.findAllForAdmin(Number(page), Number(limit));
  }

  /**
   * Mengambil satu logbook milik user yang sedang login berdasarkan ID.
   * @param req Request yang berisi data user.
   * @param id ID logbook yang ingin diambil.
   * @returns Data logbook yang ditemukan.
   */
  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    return this.logbooksService.findOne(userId, id);
  }

  /**
   * Memperbarui logbook milik user yang sedang login.
   * @param req Request yang berisi data user.
   * @param id ID logbook yang ingin diperbarui.
   * @param updateLogbookDto Data pembaruan logbook.
   * @returns Logbook yang telah diperbarui.
   */
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogbookDto: UpdateLogbookDto,
  ) {
    const userId = req.user.userId;
    return this.logbooksService.update(userId, id, updateLogbookDto);
  }

  /**
   * Menghapus logbook milik user yang sedang login berdasarkan ID.
   * @param req Request yang berisi data user.
   * @param id ID logbook yang ingin dihapus.
   * @returns Hasil penghapusan logbook.
   */
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    return this.logbooksService.remove(userId, id);
  }
}
