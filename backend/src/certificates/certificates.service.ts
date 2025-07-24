import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificateStatus, StatusInternship, User } from '@prisma/client';
import * as fs from 'fs';
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
  Color,
} from 'pdf-lib';
import * as path from 'path';
// Untuk CommonJS, pastikan @pdf-lib/fontkit terinstal
const fontkit = require('@pdf-lib/fontkit');

/**
 * Interface untuk opsi pada fungsi helper drawTextCentered.
 * Ini membuat pemanggilan fungsi lebih rapi.
 */
interface DrawTextOptions {
  font: PDFFont;
  size: number;
  color?: Color;
  y: number; // Posisi Y dari atas halaman
  maxWidth?: number;
}

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fungsi helper untuk menggambar teks di tengah halaman secara horizontal.
   * @param page Objek halaman PDF dari pdf-lib.
   * @param text Teks yang akan ditulis.
   * @param options Opsi untuk styling dan posisi (font, size, color, y, maxWidth).
   */
  private drawTextCentered(
    page: PDFPage,
    text: string,
    options: DrawTextOptions,
  ) {
    const { font, size, color = rgb(0, 0, 0), y, maxWidth } = options;
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    const effectiveWidth =
      maxWidth && maxWidth < textWidth ? maxWidth : textWidth;
    const x = (pageWidth - effectiveWidth) / 2;
    const yFromBottom = pageHeight - y;

    page.drawText(text, {
      x,
      y: yFromBottom,
      font,
      size,
      color,
      maxWidth,
      lineHeight: size * 1.2,
    });
  }

  async generateCertificate(dto: CreateCertificateDto, adminId: number) {
    const existing = await this.prisma.certificate.findUnique({
      where: { userId: dto.userId },
    });
    if (existing)
      throw new BadRequestException('Intern sudah memiliki sertifikat.');

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan.');

    const finalProject = await this.prisma.finalProject.findFirst({
      where: { userId: dto.userId, status: 'accepted' },
    });
    if (!finalProject)
      throw new BadRequestException('Final project belum accepted.');

    // Format periode aktivitas magang
    const start = user.activityStart;
    const end = user.activityEnd;
    let activityPeriod = '';
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        activityPeriod = `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString(
          'id-ID',
          { month: 'long', year: 'numeric' },
        )}`;
      } else {
        activityPeriod = `${startDate.getDate()} ${startDate.toLocaleString(
          'id-ID',
          {
            month: 'long',
          },
        )} - ${endDate.getDate()} ${endDate.toLocaleString('id-ID', {
          month: 'long',
          year: 'numeric',
        })}`;
      }
    }

    // Sanitize certificateNumber untuk nama file
    const safeCertificateNumber = dto.certificateNumber.replace(
      /[\/\\:*?"<>|]/g,
      '-',
    );
    const outputDir = 'uploads/certificates/generated';
    const outputPath = path.join(
      outputDir,
      `certificate-${safeCertificateNumber}.pdf`,
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load font files
    const fontDir = path.join(process.cwd(), 'src', 'assets', 'fonts');
    const fontMonotype = fs.readFileSync(
      path.join(fontDir, 'monotype-bold.ttf'),
    );
    const fontSourceSerif4 = fs.readFileSync(
      path.join(fontDir, 'SourceSerif4-Regular.ttf'),
    );
    const fontLora = fs.readFileSync(path.join(fontDir, 'lora-regular.ttf'));
    const fontNotoSerifGeorgian = fs.readFileSync(
      path.join(fontDir, 'notoserifgeorgian-regular.ttf'),
    );

    // Load template PDF
    const templatePath =
      'uploads/certificate-templates/certificate-template.pdf';
    if (!fs.existsSync(templatePath)) {
      throw new BadRequestException('Template sertifikat tidak ditemukan.');
    }
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.getPages()[0];

    // Embed fonts
    const monotypeFont = await pdfDoc.embedFont(fontMonotype);
    const sourceSerif4Font = await pdfDoc.embedFont(fontSourceSerif4);
    const loraFont = await pdfDoc.embedFont(fontLora);
    const notoSerifGeorgianFont = await pdfDoc.embedFont(fontNotoSerifGeorgian);

    // =======================================================================
    // KOORDINAT BARU BERDASARKAN TEMPLATE VISUAL
    // Posisi 'y' diukur dari ATAS halaman.
    // =======================================================================

    this.drawTextCentered(page, `Nomor: ${dto.certificateNumber}`, {
      y: 140,
      font: loraFont,
      size: 16,
    });

    this.drawTextCentered(page, user.namaLengkap ?? user.name, {
      y: 245,
      font: monotypeFont,
      size: 56,
      color: rgb(8 / 255, 36 / 255, 75 / 255),
    });

    // Helper function to capitalize the first letter of each word
    function toTitleCase(str: string): string {
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
      );
    }

    // Fungsi untuk membagi teks menjadi beberapa baris agar rata tengah
    function splitTextToLines(
      text: string,
      font: PDFFont,
      size: number,
      maxWidth: number,
    ): string[] {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testLineWidth = font.widthOfTextAtSize(testLine, size);
        if (testLineWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }

    const descriptiveText = `${toTitleCase(user.educationStatus ?? '')} dari ${user.asalInstitusi ?? ''}, telah menyelesaikan kegiatan ${toTitleCase(
      user.activityType ?? '',
    )} di Badan Pusat Statistik Kabupaten Pringsewu yang dilaksanakan pada periode ${activityPeriod}, dengan predikat kelulusan:`;

    const lines = splitTextToLines(descriptiveText, sourceSerif4Font, 14, 530);
    // Mulai dari y: 290, setiap baris turun 18px
    lines.forEach((line, idx) => {
      this.drawTextCentered(page, line, {
        y: 290 + idx * 18,
        font: sourceSerif4Font,
        size: 14,
        maxWidth: 530,
      });
    });

    // Predikat kelulusan di dalam kotak biru tua. Warnanya harus putih.
    this.drawTextCentered(page, dto.predicate, {
      y: 368,
      font: loraFont,
      size: 16,
      color: rgb(1, 1, 1), // Warna putih agar kontras
    });

    // Tanggal sertifikat, di atas nama kepala
    const tglSertifikatText = `Pringsewu, ${new Date().toLocaleDateString(
      'id-ID',
      { day: 'numeric', month: 'long', year: 'numeric' },
    )}`;
    this.drawTextCentered(page, tglSertifikatText, {
      y: 425,
      font: notoSerifGeorgianFont,
      size: 14,
    });

    // Nama Kepala BPS. Teks "Kepala Badan..." sudah ada di template.
    this.drawTextCentered(page, dto.namaKepalaBPS, {
      y: 530,
      font: loraFont,
      size: 14,
    });

    // NIP Kepala BPS
    this.drawTextCentered(page, `NIP. ${dto.nipKepalaBPS}`, {
      y: 548,
      font: loraFont,
      size: 14,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    // Simpan data sertifikat ke database
    return await this.prisma.certificate.create({
      data: {
        certificateNumber: dto.certificateNumber,
        userId: dto.userId,
        internName: user.namaLengkap ?? user.name,
        educationalStatus: user.educationStatus ?? '',
        institusi: user.asalInstitusi ?? '',
        predicate: dto.predicate,
        namaKegiatan: user.activityType ?? '',
        activityPeriod,
        tglSertifikat: new Date(),
        namaKepalaBPS: dto.namaKepalaBPS,
        nipKepalaBPS: dto.nipKepalaBPS,
        templatePath: outputPath,
        status: CertificateStatus.generated,
        generatedAt: new Date(),
        createdBy: adminId,
      },
    });
  }

  // ... (Sisa dari service tidak berubah)
  async uploadSignedCertificate(id: number, filePath: string, adminId: number) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Sertifikat tidak ditemukan.');
    if (cert.status !== CertificateStatus.generated)
      throw new BadRequestException('Sertifikat harus status generated.');

    return await this.prisma.certificate.update({
      where: { id },
      data: {
        signedFilePath: filePath,
        status: CertificateStatus.signed,
        signedAt: new Date(),
        updatedBy: adminId,
      },
    });
  }

  async issueCertificate(id: number, adminId: number) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Sertifikat tidak ditemukan.');
    if (cert.status !== CertificateStatus.signed)
      throw new BadRequestException('Sertifikat harus status signed.');

    // Update status sertifikat dan user.isGraduated
    const [updatedCert] = await this.prisma.$transaction([
      this.prisma.certificate.update({
        where: { id },
        data: {
          status: CertificateStatus.issued,
          issuedAt: new Date(),
          updatedBy: adminId,
        },
      }),
      this.prisma.user.update({
        where: { id: cert.userId },
        data: { isGraduated: true },
      }),
    ]);

    return updatedCert;
  }

  async getCertificateByUser(userId: number) {
    return await this.prisma.certificate.findUnique({ where: { userId } });
  }

  async getCertificateById(id: number) {
    return await this.prisma.certificate.findUnique({ where: { id } });
  }

  async getAllCertificates() {
    return this.prisma.certificate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            namaLengkap: true,
            asalInstitusi: true,
            isGraduated: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
