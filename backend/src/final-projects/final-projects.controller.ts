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
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FinalProjectsService } from './final-projects.service';
import { CreateFinalProjectDto } from './dto/create-final-project.dto';
import { UpdateFinalProjectDto } from './dto/update-final-project.dto';
import { ReviewFinalProjectDto } from './dto/review-final-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

/**
 * Controller untuk mengelola endpoint terkait Final Project.
 * Mengatur akses dan operasi CRUD untuk Final Project sesuai peran pengguna.
 */
@Controller('final-projects')
@UseGuards(AuthGuard('jwt'))
export class FinalProjectsController {
  constructor(private readonly finalProjectsService: FinalProjectsService) { }

  /**
   * Membuat Final Project baru oleh pengguna dengan peran Intern.
   * @param req Request yang berisi data user.
   * @param createFinalProjectDto Data Final Project yang akan dibuat.
   * @param file File yang diunggah (opsional).
   * @returns Data Final Project yang telah dibuat.
   */
  @Post()
  @Roles('Intern')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Request() req,
    @Body() createFinalProjectDto: CreateFinalProjectDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.finalProjectsService.create(userId, createFinalProjectDto, file);
  }

  /**
   * Mengambil seluruh Final Project milik user yang sedang login (Intern).
   * @param req Request yang berisi data user.
   * @returns Daftar Final Project milik user.
   */
  @Get()
  @Roles('Intern')
  @UseGuards(RolesGuard)
  findAllForUser(@Request() req) {
    const userId = req.user.userId;
    return this.finalProjectsService.findAllForUser(userId);
  }

  /**
   * Mengambil seluruh Final Project untuk admin atau staff dengan fitur paginasi.
   * @param query Query paginasi (page dan limit).
   * @returns Daftar Final Project sesuai paginasi.
   */
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Staff BPS')
  findAllForAdmin(@Query() query: PaginationQueryDto) {
    return this.finalProjectsService.findAllForAdmin(query.page, query.limit);
  }

  /**
   * Mengambil detail Final Project berdasarkan ID.
   * Admin dapat melihat semua, Intern hanya miliknya sendiri.
   * @param id ID Final Project.
   * @param req Request yang berisi data user.
   * @returns Detail Final Project.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.finalProjectsService.findOne(
      id,
      userRole === 'admin' ? undefined : userId,
    );
  }

  /**
   * Memperbarui Final Project milik user (Intern).
   * @param id ID Final Project yang akan diperbarui.
   * @param req Request yang berisi data user.
   * @param updateFinalProjectDto Data Final Project yang diperbarui.
   * @param file File baru yang diunggah (opsional).
   * @returns Data Final Project yang telah diperbarui.
   */
  @Patch(':id')
  @Roles('Intern')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateFinalProjectDto: UpdateFinalProjectDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.finalProjectsService.update(
      id,
      userId,
      updateFinalProjectDto,
      file,
    );
  }

  /**
   * Memberikan review terhadap Final Project (khusus Admin/Staff).
   * @param id ID Final Project yang akan direview.
   * @param req Request yang berisi data reviewer.
   * @param reviewDto Data review yang diberikan.
   * @returns Hasil review Final Project.
   */
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Staff BPS')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() reviewDto: ReviewFinalProjectDto,
  ) {
    const reviewerId = req.user.userId;
    return this.finalProjectsService.review(id, reviewerId, reviewDto);
  }

  /**
   * Menghapus Final Project milik user (Intern).
   * @param id ID Final Project yang akan dihapus.
   * @param req Request yang berisi data user.
   * @returns Status penghapusan Final Project.
   */
  @Delete(':id')
  @Roles('Intern')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.finalProjectsService.remove(id, userId);
  }
}
