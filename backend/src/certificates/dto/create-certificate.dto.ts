import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCertificateDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  // Hapus semua field lain karena auto-generate
  // internName, predicate, templatePath akan di-generate otomatis
}
