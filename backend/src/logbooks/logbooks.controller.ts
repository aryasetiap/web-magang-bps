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
  ParseIntPipe, // Impor untuk validasi parameter ID
  Query,
} from '@nestjs/common';
import { LogbooksService } from './logbooks.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('logbooks')
@UseGuards(AuthGuard('jwt'))
export class LogbooksController {
  constructor(private readonly logbooksService: LogbooksService) {}

  // Membuat entri logbook baru
  @Post()
  create(@Request() req, @Body() createLogbookDto: CreateLogbookDto) {
    const userId = req.user.userId;
    return this.logbooksService.create(userId, createLogbookDto);
  }

  // Mendapatkan semua logbook milik user yang sedang login
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.logbooksService.findAll(userId);
  }

  // PASTIKAN INI DULU
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllLogbooks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.logbooksService.findAllForAdmin(Number(page), Number(limit));
  }

  // BARU INI
  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    return this.logbooksService.findOne(userId, id);
  }

  // Mengupdate logbook milik user yang sedang login
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogbookDto: UpdateLogbookDto,
  ) {
    const userId = req.user.userId;
    return this.logbooksService.update(userId, id, updateLogbookDto);
  }

  // Menghapus logbook milik user yang sedang login
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    return this.logbooksService.remove(userId, id);
  }
}
