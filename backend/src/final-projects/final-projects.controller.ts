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

@Controller('final-projects')
@UseGuards(AuthGuard('jwt'))
export class FinalProjectsController {
  constructor(private readonly finalProjectsService: FinalProjectsService) {}

  // Create final project (Intern)
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
  findAllForUser(@Request() req) {
    const userId = req.user.userId;
    return this.finalProjectsService.findAllForUser(userId);
  }

  // Get all final projects for admin (Admin/Staff)
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Staff BPS') // Perbaiki nama role
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
    const userRole = req.user.role;

    // Admin can see all, intern can only see their own
    return this.finalProjectsService.findOne(
      id,
      userRole === 'admin' ? undefined : userId,
    );
  }

  // Update final project (Intern)
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

  // Review final project (Admin/Staff)
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Staff BPS') // Perbaiki nama role
  review(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() reviewDto: ReviewFinalProjectDto,
  ) {
    const reviewerId = req.user.userId;
    return this.finalProjectsService.review(id, reviewerId, reviewDto);
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
