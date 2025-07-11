import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificatesService {
  private readonly templatePath =
    './uploads/certificate-templates/certificate-template.pdf';
  private readonly outputDir = './uploads/certificates/generated';

  constructor(private prisma: PrismaService) {
    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const dirs = [
      './uploads/certificate-templates',
      './uploads/certificates/generated',
      './uploads/certificates/signed',
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generate certificate berdasarkan final project yang accepted
  async generate(
    generatedById: number,
    createCertificateDto: CreateCertificateDto,
  ) {
    // 1. Check if user already has a certificate
    const existingCertificate = await this.prisma.certificate.findUnique({
      where: { userId: createCertificateDto.userId },
    });

    if (existingCertificate) {
      throw new BadRequestException('User sudah memiliki sertifikat');
    }

    // 2. Check if user exists and is an intern
    const user = await this.prisma.user.findUnique({
      where: { id: createCertificateDto.userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role.name !== 'Intern') {
      throw new BadRequestException(
        'Hanya intern yang bisa dibuatkan sertifikat',
      );
    }

    // 3. Check if intern has accepted final project
    const finalProject = await this.prisma.finalProject.findFirst({
      where: {
        userId: createCertificateDto.userId,
        status: 'accepted',
      },
    });

    if (!finalProject) {
      throw new BadRequestException(
        'Intern belum memiliki final project yang diterima',
      );
    }

    // 4. Check if final project has grade
    if (!finalProject.grade) {
      throw new BadRequestException(
        'Final project belum memiliki nilai (grade)',
      );
    }

    // 5. Auto-calculate predicate based on grade
    const predicate = this.calculatePredicate(finalProject.grade); // Sekarang safe karena sudah dicek

    // 6. Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    // 7. Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        certificateNumber,
        internName: user.name,
        predicate,
        status: 'generated',
        userId: createCertificateDto.userId,
        generatedById,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        generatedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // 8. Generate PDF dari template
    const templatePath = await this.fillPdfTemplate(certificate, finalProject);

    // 9. Update certificate dengan template path
    await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: { templatePath },
    });

    return { ...certificate, templatePath };
  }

  // Helper: Fill PDF template dengan data certificate
  private async fillPdfTemplate(
    certificate: any,
    finalProject: any,
  ): Promise<string> {
    // Check if template exists
    if (!fs.existsSync(this.templatePath)) {
      throw new NotFoundException(
        `Template PDF tidak ditemukan di: ${this.templatePath}`,
      );
    }

    // Read the existing PDF template
    const existingPdfBytes = fs.readFileSync(this.templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Try to get the form from the PDF
    const form = pdfDoc.getForm();
    const hasForm = form.getFields().length > 0;

    if (hasForm) {
      // Option A: Fill form fields if they exist
      await this.fillFormFields(form, certificate, finalProject);
    } else {
      // Option B: Add text overlay if no form fields
      await this.addTextOverlay(firstPage, certificate, finalProject);
    }

    // Generate output filename
    const fileName = `certificate-${certificate.certificateNumber}.pdf`;
    const outputPath = path.join(this.outputDir, fileName);

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return outputPath;
  }

  // Helper: Fill form fields in PDF
  private async fillFormFields(form: any, certificate: any, finalProject: any) {
    try {
      // Field mapping berdasarkan hasil check-template
      // Template Anda memiliki field: internName, predicate, certificateNumber, grade
      // Field mapping yang diperluas (jika ada field tanggal di template)
      const fieldMapping = {
        // Field yang exact match dengan template
        internName: certificate.internName,
        predicate: certificate.predicate,
        certificateNumber: certificate.certificateNumber,
        grade: finalProject.grade?.toString() || 'N/A',
        date: new Date().toLocaleDateString('id-ID'), // Jika ada field 'date'
        issueDate: new Date().toLocaleDateString('id-ID'), // Jika ada field 'issueDate'
        currentDate: new Date().toLocaleDateString('id-ID'), // Jika ada field 'currentDate'
      };

      // Get all available fields in the PDF
      const availableFields = form.getFields();
      console.log(
        'Available form fields:',
        availableFields.map((field) => field.getName()),
      );

      // Fill available fields
      let filledCount = 0;
      for (const [fieldName, value] of Object.entries(fieldMapping)) {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(value);
            filledCount++;
            console.log(`✅ Filled field: ${fieldName} = ${value}`);
          }
        } catch (error) {
          console.log(`❌ Field not found: ${fieldName}`);
        }
      }

      console.log(
        `📋 Successfully filled ${filledCount} out of ${Object.keys(fieldMapping).length} fields`,
      );

      // Flatten the form to prevent further editing
      form.flatten();

      return filledCount;
    } catch (error) {
      console.error('Error filling form fields:', error);
      throw new BadRequestException(
        'Gagal mengisi form fields di template PDF',
      );
    }
  }

  // Helper: Add text overlay if no form fields
  private async addTextOverlay(page: any, certificate: any, finalProject: any) {
    try {
      // Get page dimensions
      const { width, height } = page.getSize();

      // Add text overlays - adjust positions sesuai dengan template Anda
      page.drawText(certificate.internName, {
        x: width * 0.5 - certificate.internName.length * 5, // Center horizontally
        y: height * 0.6, // Adjust vertical position
        size: 18,
        color: rgb(0, 0, 0),
      });

      page.drawText(certificate.predicate, {
        x: width * 0.5 - certificate.predicate.length * 4,
        y: height * 0.5,
        size: 16,
        color: rgb(0, 0, 0),
      });

      page.drawText(certificate.certificateNumber, {
        x: width * 0.1,
        y: height * 0.1,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(`Nilai: ${finalProject.grade}`, {
        x: width * 0.1,
        y: height * 0.15,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(new Date().toLocaleDateString('id-ID'), {
        x: width * 0.7,
        y: height * 0.2,
        size: 12,
        color: rgb(0, 0, 0),
      });
    } catch (error) {
      console.error('Error adding text overlay:', error);
      throw new BadRequestException(
        'Gagal menambahkan text overlay ke template PDF',
      );
    }
  }

  // Helper: Calculate predicate based on grade
  private calculatePredicate(grade: number): string {
    if (!grade) return 'Tidak Tersedia';
    if (grade >= 85) return 'Sangat Baik';
    if (grade >= 75) return 'Baik';
    if (grade >= 65) return 'Cukup';
    return 'Kurang';
  }

  // Helper: Generate unique certificate number
  private generateCertificateNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `CERT-${year}-${month}${day}-${random}`;
  }

  // Download generated PDF for admin to sign offline
  async downloadForSigning(id: number) {
    const certificate = await this.findOne(id);

    if (certificate.status !== 'generated') {
      throw new ForbiddenException(
        'Certificate belum di-generate atau sudah diproses',
      );
    }

    if (!certificate.templatePath || !fs.existsSync(certificate.templatePath)) {
      throw new NotFoundException('File template sertifikat tidak ditemukan');
    }

    return {
      filePath: certificate.templatePath,
      fileName: `certificate-${certificate.certificateNumber}-for-signing.pdf`,
    };
  }

  // Upload signed certificate PDF (Admin only)
  async uploadSigned(id: number, file: Express.Multer.File) {
    const certificate = await this.findOne(id);

    if (certificate.status === 'issued') {
      throw new ForbiddenException(
        'Sertifikat yang sudah diterbitkan tidak dapat diubah',
      );
    }

    // Delete old signed file if exists
    if (
      certificate.signedFilePath &&
      fs.existsSync(certificate.signedFilePath)
    ) {
      fs.unlinkSync(certificate.signedFilePath);
    }

    return this.prisma.certificate.update({
      where: { id },
      data: {
        signedFilePath: file.path,
        status: 'signed',
        signedAt: new Date(),
      },
    });
  }

  // Issue certificate to intern (Admin only)
  async issue(id: number) {
    const certificate = await this.findOne(id);

    if (certificate.status !== 'signed') {
      throw new ForbiddenException(
        'Hanya sertifikat yang sudah signed yang dapat diterbitkan',
      );
    }

    return this.prisma.certificate.update({
      where: { id },
      data: {
        status: 'issued',
        issuedAt: new Date(),
      },
    });
  }

  // Get all certificates for admin
  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.certificate.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          generatedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.certificate.count(),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // Get certificate for current user (Intern)
  async findByUser(userId: number) {
    return this.prisma.certificate.findUnique({
      where: { userId },
      include: {
        generatedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  // Get certificate by ID
  async findOne(id: number, userId?: number) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        generatedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Sertifikat tidak ditemukan');
    }

    if (userId && certificate.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke sertifikat ini',
      );
    }

    return certificate;
  }

  // Download certificate PDF (Intern only)
  async downloadCertificate(id: number, userId: number) {
    const certificate = await this.findOne(id, userId);

    if (certificate.status !== 'issued') {
      throw new ForbiddenException('Sertifikat belum diterbitkan');
    }

    if (
      !certificate.signedFilePath ||
      !fs.existsSync(certificate.signedFilePath)
    ) {
      throw new NotFoundException('File sertifikat tidak ditemukan');
    }

    return {
      filePath: certificate.signedFilePath,
      fileName: `Sertifikat_${certificate.certificateNumber}.pdf`,
    };
  }

  // Update certificate (Admin only)
  async update(id: number, updateCertificateDto: UpdateCertificateDto) {
    const certificate = await this.findOne(id);

    if (certificate.status === 'issued') {
      throw new ForbiddenException(
        'Sertifikat yang sudah diterbitkan tidak dapat diubah',
      );
    }

    return this.prisma.certificate.update({
      where: { id },
      data: {
        internName: updateCertificateDto.internName,
        predicate: updateCertificateDto.predicate,
        updatedAt: new Date(),
      },
    });
  }

  // Delete certificate (Admin only)
  async remove(id: number) {
    const certificate = await this.findOne(id);

    // Delete associated files
    if (certificate.templatePath && fs.existsSync(certificate.templatePath)) {
      fs.unlinkSync(certificate.templatePath);
    }
    if (
      certificate.signedFilePath &&
      fs.existsSync(certificate.signedFilePath)
    ) {
      fs.unlinkSync(certificate.signedFilePath);
    }

    return this.prisma.certificate.delete({
      where: { id },
    });
  }

  // Check template PDF untuk testing
  async checkTemplate() {
    try {
      if (!fs.existsSync(this.templatePath)) {
        return {
          success: false,
          message: `Template PDF tidak ditemukan di: ${this.templatePath}`,
          templateExists: false,
        };
      }

      const existingPdfBytes = fs.readFileSync(this.templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      return {
        success: true,
        templateExists: true,
        templatePath: this.templatePath,
        hasFormFields: fields.length > 0,
        fieldCount: fields.length,
        fieldNames: fields.map((field) => ({
          name: field.getName(),
          type: field.constructor.name,
        })),
        pageInfo: {
          pageCount: pages.length,
          firstPageSize: { width, height },
        },
        recommendation:
          fields.length > 0
            ? 'Template memiliki form fields, system akan mengisi fields otomatis'
            : 'Template tidak memiliki form fields, system akan menggunakan text overlay',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error loading template: ${error.message}`,
        templateExists: fs.existsSync(this.templatePath),
      };
    }
  }
}
