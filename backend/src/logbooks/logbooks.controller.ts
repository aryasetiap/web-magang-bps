/**
 * Modul Controller Logbooks
 * -----------------------------------------------
 * Modul ini berisi controller untuk mengelola entri logbook.
 * Seluruh endpoint dilindungi oleh JWT AuthGuard.
 * Terdapat endpoint khusus admin untuk melihat seluruh logbook dan ekspor PDF.
 */

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
  Res,
} from '@nestjs/common';
import { LogbooksService } from './logbooks.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Response } from 'express';

/**
 * Controller untuk mengelola entri logbook.
 * Seluruh endpoint dilindungi oleh JWT AuthGuard.
 */
@Controller('logbooks')
@UseGuards(AuthGuard('jwt'))
export class LogbooksController {
  /**
   * Konstruktor LogbooksController
   * @param logbooksService Service untuk logbook
   */
  constructor(private readonly logbooksService: LogbooksService) {}

  /**
   * Membuat entri logbook baru untuk user yang sedang login.
   * @param req Request yang berisi data user.
   * @param createLogbookDto Data untuk membuat logbook baru.
   * @returns Logbook yang berhasil dibuat.
   */
  @Post()
  create(
    @Request() req: { user: { userId: number } },
    @Body() createLogbookDto: CreateLogbookDto,
  ) {
    const userId = req.user.userId;
    return this.logbooksService.create(userId, createLogbookDto);
  }

  /**
   * Mengambil semua logbook milik user yang sedang login.
   * @param req Request yang berisi data user.
   * @returns Daftar logbook milik user.
   */
  @Get()
  findAll(@Request() req: { user: { userId: number } }) {
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
  findOne(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
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
    @Request() req: { user: { userId: number } },
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
  remove(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    return this.logbooksService.remove(userId, id);
  }

  /**
   * Mengekspor logbook satu intern ke PDF (khusus admin).
   * @param userId ID intern yang logbook-nya akan diekspor.
   * @param startDate Tanggal awal periode logbook.
   * @param endDate Tanggal akhir periode logbook.
   * @param req Request yang berisi data admin.
   * @param res Response object untuk mengirim file PDF.
   * @returns File PDF logbook.
   */
  @Get(':userId/report')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async exportUserLogbookReport(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: { user: { name?: string } },
    @Res() res: Response,
  ) {
    const adminName = req.user?.name || 'Admin';
    const pdfBuffer = await this.logbooksService.exportUserLogbookReport(
      userId,
      { startDate, endDate },
      adminName,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="logbook-intern-${userId}.pdf"`,
    });
    res.end(pdfBuffer);
  }
}
