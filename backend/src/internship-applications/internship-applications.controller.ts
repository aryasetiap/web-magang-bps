// src/internship-applications/internship-applications.controller.ts

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

@Controller('internship-applications')
export class InternshipApplicationsController {
  constructor(
    private readonly internshipApplicationsService: InternshipApplicationsService,
  ) {}

  // Endpoint untuk membuat pendaftaran baru
  @Post()
  @UseGuards(AuthGuard('jwt')) // 1. Lindungi endpoint ini, hanya user login yang bisa mendaftar
  @UseInterceptors(
    // 2. Gunakan interceptor untuk menangani beberapa field file
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'transcript', maxCount: 1 },
      { name: 'requestLetter', maxCount: 1 },
    ]),
  )
  create(
    @UploadedFiles() // 3. Ambil file yang sudah di-upload oleh Multer
    files: {
      cv?: Express.Multer.File[];
      transcript?: Express.Multer.File[];
      requestLetter?: Express.Multer.File[];
    },
    @Request() req, // 4. Ambil data user dari token
    @Body() createInternshipApplicationDto: CreateInternshipApplicationDto,
  ) {
    // 5. Kirim semua data ke service untuk diproses
    const userId = req.user.userId;
    return this.internshipApplicationsService.create(
      userId,
      createInternshipApplicationDto,
      files,
    );
  }

  // (Method lainnya akan kita implementasikan nanti)
  @Get()
  findAll() {
    return this.internshipApplicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipApplicationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInternshipApplicationDto: UpdateInternshipApplicationDto,
  ) {
    return this.internshipApplicationsService.update(
      +id,
      updateInternshipApplicationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.internshipApplicationsService.remove(+id);
  }
}
