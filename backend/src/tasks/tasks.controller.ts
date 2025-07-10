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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignTaskDto } from './dto/assign-task.dto';

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
