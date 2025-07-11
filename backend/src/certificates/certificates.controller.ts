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
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { UploadCertificateDto } from './dto/upload-certificate.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  certificateStorage,
  certificateFileFilter,
  certificateLimits,
} from './multer-config';

@Controller('certificates')
@UseGuards(AuthGuard('jwt'))
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // Check template PDF (Admin only) - untuk testing
  @Get('check-template')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  async checkTemplate() {
    return this.certificatesService.checkTemplate();
  }

  // Generate certificate (Admin/Staff) - Otomatis dari final project
  @Post('generate')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  generate(@Request() req, @Body() createCertificateDto: CreateCertificateDto) {
    const generatedById = req.user.userId;
    return this.certificatesService.generate(
      generatedById,
      createCertificateDto,
    );
  }

  // Download PDF for signing (Admin/Staff) - Admin download untuk tanda tangan offline
  @Get(':id/download-for-signing')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  async downloadForSigning(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, fileName } =
      await this.certificatesService.downloadForSigning(id);

    const file = createReadStream(filePath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }

  // Upload signed certificate PDF (Admin/Staff)
  @Patch(':id/upload')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: certificateStorage,
      fileFilter: certificateFileFilter,
      limits: certificateLimits,
    }),
  )
  uploadSigned(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadCertificateDto: UploadCertificateDto,
  ) {
    return this.certificatesService.uploadSigned(id, file);
  }

  // Issue certificate to intern (Admin/Staff)
  @Patch(':id/issue')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  issue(@Param('id', ParseIntPipe) id: number) {
    return this.certificatesService.issue(id);
  }

  // Get certificate for current user (Intern)
  @Get()
  @Roles('Intern')
  @UseGuards(RolesGuard)
  findByUser(@Request() req) {
    const userId = req.user.userId;
    return this.certificatesService.findByUser(userId);
  }

  // Get all certificates for admin (Admin/Staff)
  @Get('all')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  findAllForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.certificatesService.findAllForAdmin(
      Number(page),
      Number(limit),
    );
  }

  // Download certificate PDF (Intern)
  @Get(':id/download')
  @Roles('Intern')
  @UseGuards(RolesGuard)
  async downloadCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const userId = req.user.userId;
    const { filePath, fileName } =
      await this.certificatesService.downloadCertificate(id, userId);

    const file = createReadStream(filePath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }

  // Get certificate by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    const userRole = req.user.role?.name || req.user.role;

    // Admin can see all, intern can only see their own
    if (
      userRole.toLowerCase() === 'admin' ||
      userRole.toLowerCase() === 'staff bps'
    ) {
      return this.certificatesService.findOne(id);
    } else {
      return this.certificatesService.findOne(id, userId);
    }
  }

  // Update certificate (Admin/Staff)
  @Patch(':id')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    return this.certificatesService.update(id, updateCertificateDto);
  }

  // Delete certificate (Admin/Staff)
  @Delete(':id')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificatesService.remove(id);
  }
}
