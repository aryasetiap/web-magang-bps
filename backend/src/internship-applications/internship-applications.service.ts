import { Injectable } from '@nestjs/common';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';

@Injectable()
export class InternshipApplicationsService {
  create(createInternshipApplicationDto: CreateInternshipApplicationDto) {
    return 'This action adds a new internshipApplication';
  }

  findAll() {
    return `This action returns all internshipApplications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} internshipApplication`;
  }

  update(id: number, updateInternshipApplicationDto: UpdateInternshipApplicationDto) {
    return `This action updates a #${id} internshipApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} internshipApplication`;
  }
}
