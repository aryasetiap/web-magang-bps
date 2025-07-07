import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';

@Controller('internship-applications')
export class InternshipApplicationsController {
  constructor(private readonly internshipApplicationsService: InternshipApplicationsService) {}

  @Post()
  create(@Body() createInternshipApplicationDto: CreateInternshipApplicationDto) {
    return this.internshipApplicationsService.create(createInternshipApplicationDto);
  }

  @Get()
  findAll() {
    return this.internshipApplicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipApplicationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInternshipApplicationDto: UpdateInternshipApplicationDto) {
    return this.internshipApplicationsService.update(+id, updateInternshipApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.internshipApplicationsService.remove(+id);
  }
}
