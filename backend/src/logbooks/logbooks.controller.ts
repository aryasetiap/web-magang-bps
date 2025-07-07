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
} from '@nestjs/common';
import { LogbooksService } from './logbooks.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('logbooks')
@UseGuards(AuthGuard('jwt')) // Lindungi semua endpoint di controller ini
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

  // Mendapatkan detail satu logbook spesifik milik user yang sedang login
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
