/**
 * Modul CertificatesService
 * -----------------------------------------------
 * Modul ini menyediakan layanan untuk pembuatan, pengelolaan,
 * dan penerbitan sertifikat magang berbasis PDF pada aplikasi.
 * Menggunakan pdf-lib untuk manipulasi PDF dan Prisma untuk akses database.
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificateStatus } from '@prisma/client';
import * as fs from 'fs';
import { PDFDocument, PDFFont, PDFPage, rgb, Color } from 'pdf-lib';
import * as path from 'path';
import fontkit from '@pdf-lib/fontkit';

/**
 * Interface untuk opsi pada fungsi helper drawTextCentered.
 * Membantu styling dan penempatan teks pada PDF.
 */
interface DrawTextOptions {
  font: PDFFont;
  size: number;
  color?: Color;
  y: number;
  maxWidth?: number;
}

/**
 * Service untuk pengelolaan sertifikat magang.
 * Menyediakan fitur generate, upload, issue, dan query sertifikat.
 */
@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Menggambar teks secara horizontal rata tengah pada halaman PDF.
   * @param page Halaman PDF target.
   * @param text Teks yang akan digambar.
   * @param options Opsi styling dan posisi teks.
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

  /**
   * Membagi teks panjang menjadi beberapa baris agar tidak melebihi lebar maksimum.
   * @param text Teks yang akan dibagi.
   * @param font Font yang digunakan.
   * @param size Ukuran font.
   * @param maxWidth Lebar maksimum per baris.
   * @returns Array string, masing-masing adalah satu baris.
   */
  private splitTextToLines(
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

  /**
   * Mengubah string menjadi Title Case (huruf pertama tiap kata kapital).
   * @param str String yang akan diubah.
   * @returns String dalam format Title Case.
   */
  private toTitleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
    );
  }

  /**
   * Membuat dan menyimpan sertifikat magang dalam bentuk PDF,
   * serta menyimpan metadata ke database.
   * @param dto Data transfer object untuk pembuatan sertifikat.
   * @param adminId ID admin yang membuat sertifikat.
   * @returns Data sertifikat yang telah dibuat.
   * @throws BadRequestException, NotFoundException jika validasi gagal.
   */
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
          { month: 'long' },
        )} - ${endDate.getDate()} ${endDate.toLocaleString('id-ID', {
          month: 'long',
          year: 'numeric',
        })}`;
      }
    }

    // Sanitize certificateNumber untuk nama file
    const safeCertificateNumber = dto.certificateNumber.replace(
      /[/:*?"<>|\\]/g,
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

    // ===================== PENEMPATAN TEKS PADA TEMPLATE =====================

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

    const descriptiveText = `${this.toTitleCase(user.educationStatus ?? '')} dari ${user.asalInstitusi ?? ''}, telah menyelesaikan kegiatan ${this.toTitleCase(
      user.activityType ?? '',
    )} di Badan Pusat Statistik Kabupaten Pringsewu yang dilaksanakan pada periode ${activityPeriod}, dengan predikat kelulusan:`;

    const lines = this.splitTextToLines(
      descriptiveText,
      sourceSerif4Font,
      14,
      530,
    );
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
      color: rgb(1, 1, 1),
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

    // Nama Kepala BPS
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

    // Simpan PDF ke file
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

  /**
   * Mengunggah file sertifikat yang telah ditandatangani dan memperbarui status sertifikat.
   * @param id ID sertifikat.
   * @param filePath Path file sertifikat yang diunggah.
   * @param adminId ID admin yang mengunggah.
   * @returns Data sertifikat yang telah diperbarui.
   * @throws NotFoundException, BadRequestException jika validasi gagal.
   */
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

  /**
   * Menerbitkan sertifikat yang sudah ditandatangani dan memperbarui status user.
   * @param id ID sertifikat.
   * @param adminId ID admin yang menerbitkan.
   * @returns Data sertifikat yang telah diterbitkan.
   * @throws NotFoundException, BadRequestException jika validasi gagal.
   */
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

  /**
   * Mengambil data sertifikat berdasarkan userId.
   * @param userId ID user.
   * @returns Data sertifikat atau null jika tidak ditemukan.
   */
  async getCertificateByUser(userId: number) {
    return await this.prisma.certificate.findUnique({ where: { userId } });
  }

  /**
   * Mengambil data sertifikat berdasarkan id sertifikat.
   * @param id ID sertifikat.
   * @returns Data sertifikat atau null jika tidak ditemukan.
   */
  async getCertificateById(id: number) {
    return await this.prisma.certificate.findUnique({ where: { id } });
  }

  /**
   * Mengambil seluruh data sertifikat beserta data user terkait.
   * @returns Array data sertifikat.
   */
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
