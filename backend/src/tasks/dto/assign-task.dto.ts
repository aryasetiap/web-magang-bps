import { IsInt, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignTaskDto {
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value.split(',').map((v) => Number(v.trim()));
      }
      return [Number(value)];
    }
    return [];
  })
  @ArrayNotEmpty({ message: 'Pilih setidaknya satu intern untuk ditugaskan.' })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds: number[];
}
