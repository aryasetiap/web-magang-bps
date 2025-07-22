import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateStatusDto } from './dto/update-certificate-status.dto';
import { CertificateStatus } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import * as path from 'path';

@Injectable()
/**
 * Service untuk mengelola pembuatan, penandatanganan, dan penerbitan sertifikat magang.
 */
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Membuat dan menghasilkan file sertifikat PDF berdasarkan data user dan final project.
     * @param dto Data pembuatan sertifikat
     * @param adminId ID admin yang membuat sertifikat
     * @throws BadRequestException Jika user sudah memiliki sertifikat atau final project belum diterima
     * @throws NotFoundException Jika user tidak ditemukan
     * @returns Data sertifikat yang telah dibuat
     */
    async generateCertificate(dto: CreateCertificateDto, adminId: number) {
        const existing = await this.prisma.certificate.findUnique({ where: { userId: dto.userId } });
        if (existing) throw new BadRequestException('Intern sudah memiliki sertifikat.');

        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        const finalProject = await this.prisma.finalProject.findFirst({
            where: { userId: dto.userId, status: 'accepted' },
        });
        if (!finalProject) throw new BadRequestException('Final project belum accepted.');

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
                activityPeriod = `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;
            } else {
                activityPeriod = `${startDate.getDate()} ${startDate.toLocaleString('id-ID', { month: 'long' })} - ${endDate.getDate()} ${endDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;
            }
        }

        // Sanitize certificateNumber untuk nama file
        const safeCertificateNumber = dto.certificateNumber.replace(/[\/\\:*?"<>|]/g, '-');
        const outputDir = 'uploads/certificates/generated';
        const outputPath = path.join(outputDir, `certificate-${safeCertificateNumber}.pdf`);

        // Pastikan folder output ada
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const templatePath = 'uploads/certificate-templates/certificate-template.pdf';

        if (!fs.existsSync(templatePath)) {
            throw new BadRequestException('Template sertifikat tidak ditemukan.');
        }
        const templateBytes = fs.readFileSync(templatePath);

        // Mengisi field pada template PDF sesuai data
        const pdfDoc = await PDFDocument.load(templateBytes);
        const form = pdfDoc.getForm();

        form.getTextField('NOMOR').setText(`NOMOR: ${dto.certificateNumber}`);
        form.getTextField('internName').setText(user.namaLengkap ?? user.name);
        form.getTextField('keterangan').setText(
            `${user.educationStatus ?? ''} dari ${user.asalInstitusi ?? ''}, telah menyelesaikan kegiatan ${user.activityType ?? ''} yang dilaksanakan sejak tanggal ${activityPeriod} dengan predikat kelulusan:`
        );
        form.getTextField('predicate').setText(dto.predicate);
        form.getTextField('tempatTanggal').setText(
            `Pringsewu, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
        );
        form.getTextField('namaKepalaBPS').setText(dto.namaKepalaBPS);
        form.getTextField('nipKepalaBPS').setText(dto.nipKepalaBPS);

        form.flatten();

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
     * @param id ID sertifikat
     * @param filePath Path file sertifikat yang sudah ditandatangani
     * @param adminId ID admin yang mengunggah file
     * @throws NotFoundException Jika sertifikat tidak ditemukan
     * @throws BadRequestException Jika status sertifikat belum generated
     * @returns Data sertifikat yang telah diperbarui
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
     * Menerbitkan sertifikat yang sudah ditandatangani.
     * @param id ID sertifikat
     * @param adminId ID admin yang menerbitkan
     * @throws NotFoundException Jika sertifikat tidak ditemukan
     * @throws BadRequestException Jika status sertifikat belum signed
     * @returns Data sertifikat yang telah diterbitkan
     */
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

    /**
     * Mengambil data sertifikat berdasarkan user ID.
     * @param userId ID user
     * @returns Data sertifikat milik user
     */
    async getCertificateByUser(userId: number) {
        return await this.prisma.certificate.findUnique({ where: { userId } });
    }

    /**
     * Mengambil data sertifikat berdasarkan ID sertifikat.
     * @param id ID sertifikat
     * @returns Data sertifikat
     */
    async getCertificateById(id: number) {
        return await this.prisma.certificate.findUnique({ where: { id } });
    }

    /**
     * Mengambil seluruh data sertifikat beserta informasi user terkait.
     * @returns Daftar sertifikat beserta data user
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
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
