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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Lindungi semua endpoint di controller ini
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('Admin', 'Staff BPS') // Hanya Admin dan Staff BPS yang bisa membuat tugas
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    const creatorId = req.user.userId; // Ambil ID user dari token
    return this.tasksService.create(creatorId, createTaskDto);
  }

  // Method di bawah ini bisa kita implementasikan nanti
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
