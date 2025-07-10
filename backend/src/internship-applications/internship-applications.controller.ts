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
  Query, // 1. Impor Query
} from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'; // 2. Impor DTO Paginasi

@Controller('internship-applications')
export class InternshipApplicationsController {
  constructor(
    private readonly internshipApplicationsService: InternshipApplicationsService,
  ) {}

  // ... (method create tetap sama)
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

  // 3. Modifikasi method findAll
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.internshipApplicationsService.findAll(paginationQuery);
  }

  // ... (method findOne, updateStatus, dll. tetap sama)
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
}
