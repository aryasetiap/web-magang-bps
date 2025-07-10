import {
  Controller,
  Patch,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionsService } from './submissions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Patch(':id/resubmit')
  @UseInterceptors(FileInterceptor('file'))
  async resubmit(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.submissionsService.resubmit(id, userId, file);
  }
}
