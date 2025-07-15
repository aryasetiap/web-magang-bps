import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  Query,
} from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

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

  // Hanya Admin yang bisa akses semua data
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.internshipApplicationsService.findAll(paginationQuery);
  }

  // Hanya Intern yang bisa akses pengajuan miliknya sendiri
  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Intern')
  async getMyApplication(@Request() req) {
    const userId = req.user.userId;
    return {
      data: await this.internshipApplicationsService.findByUser(userId),
    };
  }

  // Hanya Admin yang bisa akses detail aplikasi tertentu
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findOne(@Param('id') id: string) {
    return this.internshipApplicationsService.findOne(+id);
  }

  // Hanya Admin yang bisa update status aplikasi
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
}
