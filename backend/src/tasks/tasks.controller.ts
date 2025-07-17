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
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignTaskDto } from './dto/assign-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GradeSubmissionDto } from '../submissions/dto/grade-submission.dto'; // 1. Impor DTO baru kita

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('Admin', 'Staff BPS')
  @UseInterceptors(FileInterceptor('file')) // Tambahkan ini
  create(
    @Request() req,
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFile() file: Express.Multer.File, // Tambahkan ini
  ) {
    const creatorId = req.user.userId;
    return this.tasksService.create(creatorId, createTaskDto, file); // Tambahkan file
  }

  @Post(':id/assign')
  @Roles('Admin', 'Staff BPS')
  assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, assignTaskDto);
  }

  @Post(':id/submissions')
  @Roles('Intern')
  @UseInterceptors(FileInterceptor('submissionFile'))
  async submitTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string, // Tambahkan ini
  ) {
    const userId = req.user.userId;
    return this.tasksService.submitTask(userId, taskId, file, description);
  }

  @Get(':id/submissions')
  @Roles('Admin', 'Staff BPS')
  findSubmissionsForTask(@Param('id', ParseIntPipe) taskId: number) {
    return this.tasksService.findSubmissionsForTask(taskId);
  }

  // 2. Endpoint untuk menilai hasil submission
  @Patch('submissions/:submissionId/grade')
  @Roles('Admin', 'Staff BPS')
  gradeSubmission(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @Request() req,
  ) {
    const graderId = req.user.userId;
    return this.tasksService.gradeSubmission(
      submissionId,
      gradeSubmissionDto,
      graderId,
    );
  }

  @Get('my-tasks')
  @Roles('Intern')
  findMyTasks(@Request() req) {
    const userId = req.user.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    return this.tasksService.findTasksForUser(userId, page, limit);
  }

  @Get()
  @Roles('Admin', 'Staff BPS')
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Staff BPS', 'Intern')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    const task = await this.tasksService.findOne(id);

    // Jika role intern, cek apakah dia di-assign ke task ini
    if (user.role === 'Intern') {
      const assigned = await this.tasksService.isUserAssignedToTask(
        id,
        user.userId,
      );
      if (!assigned) {
        throw new ForbiddenException('Anda tidak berhak mengakses tugas ini.');
      }
    }
    return task;
  }

  @Patch(':id')
  @Roles('Admin', 'Staff BPS')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles('Admin', 'Staff BPS')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
