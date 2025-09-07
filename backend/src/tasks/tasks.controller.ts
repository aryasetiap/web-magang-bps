/**
 * Modul controller untuk mengelola endpoint terkait tugas (tasks).
 * Menyediakan endpoint CRUD, assignment, submission, dan penilaian tugas.
 * Seluruh endpoint diamankan dengan JWT dan Role-based Guard.
 */

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
import { GradeSubmissionDto } from '../submissions/dto/grade-submission.dto';

/**
 * Controller untuk mengelola endpoint terkait tugas (tasks).
 * Seluruh endpoint diamankan dengan JWT dan Role-based Guard.
 */
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  /**
   * Konstruktor TasksController.
   * @param tasksService Service untuk operasi terkait tugas.
   */
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Membuat tugas baru.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @param req Request yang berisi data user.
   * @param createTaskDto Data tugas yang akan dibuat.
   * @param file File yang diunggah (opsional).
   * @returns Data tugas yang berhasil dibuat.
   */
  @Post()
  @Roles('Admin', 'Staff BPS')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Request() req: { user: { userId: number } },
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const creatorId = req.user.userId;
    return this.tasksService.create(creatorId, createTaskDto, file);
  }

  /**
   * Meng-assign tugas ke user tertentu.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @param id ID tugas.
   * @param assignTaskDto Data assignment tugas.
   * @returns Data assignment tugas.
   */
  @Post(':id/assign')
  @Roles('Admin', 'Staff BPS')
  assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, assignTaskDto);
  }

  /**
   * Mengirimkan submission tugas oleh intern.
   * @param taskId ID tugas.
   * @param req Request yang berisi data user.
   * @param file File submission yang diunggah.
   * @param description Deskripsi submission.
   * @returns Data submission yang berhasil dikirim.
   */
  @Post(':id/submissions')
  @Roles('Intern')
  @UseInterceptors(FileInterceptor('submissionFile'))
  async submitTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Request() req: { user: { userId: number } },
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
  ) {
    const userId = req.user.userId;
    return this.tasksService.submitTask(userId, taskId, file, description);
  }

  /**
   * Mendapatkan seluruh submission untuk suatu tugas.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @param taskId ID tugas.
   * @returns Daftar submission untuk tugas tertentu.
   */
  @Get(':id/submissions')
  @Roles('Admin', 'Staff BPS')
  findSubmissionsForTask(@Param('id', ParseIntPipe) taskId: number) {
    return this.tasksService.findSubmissionsForTask(taskId);
  }

  /**
   * Memberikan penilaian pada submission tugas.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @param submissionId ID submission.
   * @param gradeSubmissionDto Data penilaian.
   * @param req Request yang berisi data user.
   * @returns Data submission yang telah dinilai.
   */
  @Patch('submissions/:submissionId/grade')
  @Roles('Admin', 'Staff BPS')
  gradeSubmission(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @Request() req: { user: { userId: number } },
  ) {
    const graderId = req.user.userId;
    return this.tasksService.gradeSubmission(
      submissionId,
      gradeSubmissionDto,
      graderId,
    );
  }

  /**
   * Mendapatkan daftar tugas yang di-assign ke intern yang sedang login.
   * @param req Request yang berisi data user dan query pagination.
   * @returns Daftar tugas yang di-assign ke user.
   */
  @Get('my-tasks')
  @Roles('Intern')
  findMyTasks(
    @Request()
    req: {
      user: { userId: number };
      query: { page?: string; limit?: string };
    },
  ) {
    const userId = req.user.userId;
    const page = Number(req.query?.page) || 1;
    const limit = Number(req.query?.limit) || 10;
    return this.tasksService.findTasksForUser(userId, page, limit);
  }

  /**
   * Mendapatkan seluruh tugas.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @returns Daftar seluruh tugas.
   */
  @Get()
  @Roles('Admin', 'Staff BPS')
  findAll() {
    return this.tasksService.findAll();
  }

  /**
   * Mendapatkan detail satu tugas berdasarkan ID.
   * Intern hanya dapat mengakses tugas yang sudah di-assign ke dirinya.
   * @param id ID tugas.
   * @param req Request yang berisi data user.
   * @returns Data detail tugas.
   * @throws ForbiddenException jika intern tidak di-assign ke tugas.
   */
  @Get(':id')
  @Roles('Admin', 'Staff BPS', 'Intern')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; role: string } },
  ) {
    const { userId, role } = req.user;
    const task = await this.tasksService.findOne(id);

    if (role === 'Intern') {
      const assigned = await this.tasksService.isUserAssignedToTask(id, userId);
      if (!assigned) {
        throw new ForbiddenException('Anda tidak berhak mengakses tugas ini.');
      }
    }
    return task;
  }

  /**
   * Memperbarui data tugas.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @param id ID tugas.
   * @param updateTaskDto Data tugas yang diperbarui.
   * @returns Data tugas yang telah diperbarui.
   */
  @Patch(':id')
  @Roles('Admin', 'Staff BPS')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  /**
   * Menghapus tugas berdasarkan ID.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * @param id ID tugas.
   * @returns Data tugas yang telah dihapus.
   */
  @Delete(':id')
  @Roles('Admin', 'Staff BPS')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
