import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  internName?: string;

  @IsOptional()
  @IsEnum(['Sangat Baik', 'Baik', 'Cukup'], {
    message: 'Predikat harus berupa: Sangat Baik, Baik, atau Cukup',
  })
  predicate?: string;
}
