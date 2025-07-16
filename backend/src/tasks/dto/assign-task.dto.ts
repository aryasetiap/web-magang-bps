import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignTaskDto {
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      // Jika dikirim sebagai array (beberapa field internIds di form-data)
      return value.map(Number);
    }
    if (typeof value === 'string') {
      // Jika dikirim sebagai string "1,2,3"
      return value.split(',').map((v) => Number(v.trim()));
    }
    return [];
  })
  @IsArray({ message: 'internIds harus berupa array.' })
  @ArrayNotEmpty({ message: 'Pilih setidaknya satu intern untuk ditugaskan.' })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds: number[];
}
