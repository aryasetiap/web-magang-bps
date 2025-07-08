// src/internship-applications/internship-applications.controller.ts (Versi Final yang Benar)

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('internship-applications')
export class InternshipApplicationsController {
  constructor(
    private readonly internshipApplicationsService: InternshipApplicationsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'transcript', maxCount: 1 },
      { name: 'requestLetter', maxCount: 1 },
    ]),
  )
  create(
    // [PERBAIKAN] Deklarasi parameter yang benar tanpa validasi di sini.
    // Semua validasi file sekarang ditangani oleh service.
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      transcript?: Express.Multer.File[];
      requestLetter?: Express.Multer.File[];
    },
    @Request() req,
    @Body() createInternshipApplicationDto: CreateInternshipApplicationDto,
  ) {
    const userId = req.user.userId;
    return this.internshipApplicationsService.create(
      userId,
      createInternshipApplicationDto,
      files,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findAll() {
    return this.internshipApplicationsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findOne(@Param('id') id: string) {
    return this.internshipApplicationsService.findOne(+id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  updateStatus(
    @Param('id') id: string,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    const adminId = req.user.userId;
    return this.internshipApplicationsService.updateStatus(
      +id,
      adminId,
      updateApplicationStatusDto,
    );
  }

  // Method di bawah ini tidak lagi diperlukan karena sudah ada updateStatus yang lebih spesifik.
  // Anda bisa menghapusnya untuk membuat kode lebih bersih.
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateInternshipApplicationDto: UpdateInternshipApplicationDto,
  // ) {
  //   return this.internshipApplicationsService.update(
  //     +id,
  //     updateInternshipApplicationDto,
  //   );
  // }

  // Endpoint Delete ini belum kita implementasikan di service,
  // jadi kita beri komentar untuk sementara.
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.internshipApplicationsService.remove(+id);
  // }
}
