import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @IsArray({ message: 'internIds harus berupa array.' })
  @ArrayNotEmpty({ message: 'Pilih setidaknya satu intern untuk ditugaskan.' })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds: number[];
}
