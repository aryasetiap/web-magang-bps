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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FinalProjectsService } from './final-projects.service';
import { CreateFinalProjectDto } from './dto/create-final-project.dto';
import { UpdateFinalProjectDto } from './dto/update-final-project.dto';
import { ReviewFinalProjectDto } from './dto/review-final-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  finalProjectStorage,
  finalProjectFileFilter,
  finalProjectLimits,
} from './multer-config';

@Controller('final-projects')
@UseGuards(AuthGuard('jwt'))
export class FinalProjectsController {
  constructor(private readonly finalProjectsService: FinalProjectsService) {}

  // Create final project (Intern)
  @Post()
  @Roles('Intern')
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: finalProjectStorage,
      fileFilter: finalProjectFileFilter,
      limits: finalProjectLimits,
    }),
  )
  create(
    @Request() req,
    @Body() createFinalProjectDto: CreateFinalProjectDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.finalProjectsService.create(
      userId,
      createFinalProjectDto,
      file,
    );
  }

  // Get all final projects for current user (Intern)
  @Get()
  @Roles('Intern')
  @UseGuards(RolesGuard)
  findByUser(@Request() req) {
    const userId = req.user.userId;
    return this.finalProjectsService.findByUser(userId);
  }

  // Get all final projects for admin (Admin/Staff)
  @Get('all')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  findAllForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.finalProjectsService.findAllForAdmin(
      Number(page),
      Number(limit),
    );
  }

  // Get final project by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    const userRole = req.user.role?.name || req.user.role;

    // Admin can see all, intern can only see their own
    if (
      userRole.toLowerCase() === 'admin' ||
      userRole.toLowerCase() === 'staff bps'
    ) {
      return this.finalProjectsService.findOne(id);
    } else {
      return this.finalProjectsService.findOne(id, userId);
    }
  }

  // Update final project (Intern)
  @Patch(':id')
  @Roles('Intern')
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: finalProjectStorage,
      fileFilter: finalProjectFileFilter,
      limits: finalProjectLimits,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateFinalProjectDto: UpdateFinalProjectDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.finalProjectsService.update(
      id,
      userId,
      updateFinalProjectDto,
      file,
    );
  }

  // Review final project (Admin/Staff)
  @Patch(':id/review')
  @Roles('Admin', 'Staff BPS')
  @UseGuards(RolesGuard)
  review(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() reviewFinalProjectDto: ReviewFinalProjectDto,
  ) {
    const reviewerId = req.user.userId;
    return this.finalProjectsService.review(
      id,
      reviewerId,
      reviewFinalProjectDto,
    );
  }

  // Delete final project (Intern)
  @Delete(':id')
  @Roles('Intern')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.finalProjectsService.remove(id, userId);
  }
}
