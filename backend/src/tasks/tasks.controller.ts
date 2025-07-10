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
  UseInterceptors, // 1. Impor UseInterceptors
  UploadedFile, // 2. Impor UploadedFile
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignTaskDto } from './dto/assign-task.dto';
import { FileInterceptor } from '@nestjs/platform-express'; // 3. Impor FileInterceptor

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('Admin', 'Staff BPS')
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    const creatorId = req.user.userId;
    return this.tasksService.create(creatorId, createTaskDto);
  }

  @Post(':id/assign')
  @Roles('Admin', 'Staff BPS')
  assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, assignTaskDto);
  }

  // 4. Endpoint untuk intern mengumpulkan tugas (upload file)
  @Post(':id/submissions')
  @Roles('Intern')
  @UseInterceptors(FileInterceptor('submissionFile')) // 'submissionFile' adalah nama field di form-data
  submitTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Request() req,
    @UploadedFile() file: Express.Multer.File, // Ambil file yang di-upload
  ) {
    const userId = req.user.userId;
    return this.tasksService.submitTask(userId, taskId, file);
  }

  @Get('my-tasks')
  @Roles('Intern')
  findMyTasks(@Request() req) {
    const userId = req.user.userId;
    return this.tasksService.findTasksForUser(userId);
  }

  @Get()
  @Roles('Admin', 'Staff BPS')
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
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
