import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Perbaiki path
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateStatusDto } from './dto/update-certificate-status.dto';
import { CertificateStatus } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    async generateCertificate(dto: CreateCertificateDto, adminId: number) {
        // Validasi: hanya satu sertifikat per user
        const existing = await this.prisma.certificate.findUnique({ where: { userId: dto.userId } });
        if (existing) throw new BadRequestException('Intern sudah memiliki sertifikat.');

        // Ambil data user & final project
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        const finalProject = await this.prisma.finalProject.findFirst({
            where: { userId: dto.userId, status: 'accepted' },
        });
        if (!finalProject) throw new BadRequestException('Final project belum accepted.');

        // Format activityPeriod
        const start = user.activityStart;
        const end = user.activityEnd;
        let activityPeriod = '';
        if (start && end) {
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (
                startDate.getMonth() === endDate.getMonth() &&
                startDate.getFullYear() === endDate.getFullYear()
            ) {
                activityPeriod = `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;
            } else {
                activityPeriod = `${startDate.getDate()} ${startDate.toLocaleString('id-ID', { month: 'long' })} - ${endDate.getDate()} ${endDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;
            }
        }

        // Path template dan output
        const templatePath = 'uploads/certificate-templates/certificate-template.pdf';
        const outputPath = join('uploads/certificates/generated', `certificate-${dto.certificateNumber}.pdf`);

        // Baca template PDF
        if (!fs.existsSync(templatePath)) {
            throw new BadRequestException('Template sertifikat tidak ditemukan.');
        }
        const templateBytes = fs.readFileSync(templatePath);

        // Load dan isi PDF
        const pdfDoc = await PDFDocument.load(templateBytes);
        const form = pdfDoc.getForm();

        form.getTextField('certificateNumber').setText(dto.certificateNumber);
        form.getTextField('internName').setText(user.namaLengkap ?? user.name);
        form.getTextField('educationalStatus').setText(user.educationStatus ?? '');
        form.getTextField('institusi').setText(user.asalInstitusi ?? '');
        form.getTextField('predicate').setText(dto.predicate);
        form.getTextField('namaKegiatan').setText(user.activityType ?? '');
        form.getTextField('activityPeriod').setText(activityPeriod);
        form.getTextField('tglSertifikat').setText(
            new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        );
        form.getTextField('namaKepalaBPS').setText(dto.namaKepalaBPS);
        form.getTextField('nipKepalaBPS').setText(dto.nipKepalaBPS);

        form.flatten(); // Agar field tidak bisa diubah lagi

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        // Simpan certificate
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

        return await this.prisma.certificate.update({
            where: { id },
            data: {
                status: CertificateStatus.issued,
                issuedAt: new Date(),
                updatedBy: adminId,
            },
        });
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
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}