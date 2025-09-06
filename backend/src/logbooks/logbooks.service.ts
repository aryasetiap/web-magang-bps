import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StatusLogbook, Logbook, User } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import PdfPrinter from 'pdfmake';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * Service untuk mengelola entri logbook.
 */
@Injectable()
export class LogbooksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Memverifikasi apakah user adalah pemilik logbook tertentu.
   * @param userId ID user yang sedang login
   * @param logbookId ID logbook yang akan diverifikasi
   * @throws NotFoundException jika logbook tidak ditemukan
   * @throws ForbiddenException jika user bukan pemilik logbook
   * @returns Data logbook yang diverifikasi
   */
  private async verifyOwnership(userId: number, logbookId: number) {
    const logbook = await this.prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!logbook) {
      throw new NotFoundException(
        `Logbook dengan ID ${logbookId} tidak ditemukan.`,
      );
    }

    if (logbook.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki izin untuk mengakses logbook ini.',
      );
    }
    return logbook;
  }

  /**
   * Membuat entri logbook baru untuk user tertentu.
   * @param userId ID user yang membuat logbook
   * @param createLogbookDto Data logbook yang akan dibuat
   * @throws BadRequestException jika sudah ada logbook di tanggal yang sama
   * @returns Data logbook yang berhasil dibuat
   */
  async create(userId: number, createLogbookDto: CreateLogbookDto) {
    const existing = await this.prisma.logbook.findFirst({
      where: {
        userId: userId,
        logDate: new Date(createLogbookDto.logDate),
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Anda sudah mengisi logbook untuk tanggal ini.',
      );
    }

    return this.prisma.logbook.create({
      data: {
        userId: userId,
        logDate: new Date(createLogbookDto.logDate),
        content: createLogbookDto.content,
      },
    });
  }

  /**
   * Mengambil semua logbook milik user tertentu.
   * @param userId ID user yang ingin diambil logbook-nya
   * @returns Daftar logbook milik user
   */
  findAll(userId: number) {
    return this.prisma.logbook.findMany({
      where: { userId: userId },
      orderBy: { logDate: 'desc' },
    });
  }

  /**
   * Mengambil satu logbook berdasarkan ID setelah verifikasi kepemilikan.
   * @param userId ID user yang sedang login
   * @param id ID logbook yang ingin diambil
   * @throws NotFoundException atau ForbiddenException jika tidak berhak
   * @returns Data logbook yang ditemukan
   */
  async findOne(userId: number, id: number) {
    return this.verifyOwnership(userId, id);
  }

  /**
   * Memperbarui data logbook setelah verifikasi kepemilikan.
   * @param userId ID user yang sedang login
   * @param id ID logbook yang ingin diperbarui
   * @param updateLogbookDto Data baru untuk logbook
   * @returns Data logbook yang telah diperbarui
   */
  async update(userId: number, id: number, updateLogbookDto: UpdateLogbookDto) {
    await this.verifyOwnership(userId, id);

    const data: {
      logDate?: Date;
      content?: string;
      status?: StatusLogbook;
    } = {};

    if (updateLogbookDto.logDate) {
      data.logDate = new Date(updateLogbookDto.logDate);
    }
    if (updateLogbookDto.content) {
      data.content = updateLogbookDto.content;
    }
    if (updateLogbookDto.status) {
      data.status = updateLogbookDto.status as StatusLogbook;
    }

    return this.prisma.logbook.update({
      where: { id: id },
      data,
    });
  }

  /**
   * Menghapus logbook setelah verifikasi kepemilikan.
   * @param userId ID user yang sedang login
   * @param id ID logbook yang ingin dihapus
   * @returns Data logbook yang telah dihapus
   */
  async remove(userId: number, id: number) {
    await this.verifyOwnership(userId, id);

    return this.prisma.logbook.delete({
      where: { id: id },
    });
  }

  /**
   * Mengambil semua logbook untuk admin dengan paginasi.
   * @param page Halaman yang ingin diambil (default: 1)
   * @param limit Jumlah data per halaman (default: 20)
   * @returns Objek berisi data logbook, total data, halaman saat ini, dan halaman terakhir
   */
  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total]: [{ user: User }[], number] = await Promise.all([
      this.prisma.logbook.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { user: true },
      }),
      this.prisma.logbook.count(),
    ]);
    // Menghilangkan field password pada data user
    const filteredData = data.map((item) => ({
      ...item,
      user: {
        ...item.user,
        password: undefined,
      },
    }));
    return {
      data: filteredData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * Export logbook satu intern ke PDF.
   * @param userId ID intern
   * @param filter {startDate, endDate}
   * @param adminName Nama admin pencetak
   * @returns Buffer PDF
   */
  async exportUserLogbookReport(
    userId: number,
    filter: { startDate?: string; endDate?: string },
    adminName: string,
  ): Promise<Buffer> {
    const where: Record<string, unknown> = { userId };
    if (filter.startDate && filter.endDate) {
      where.logDate = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate),
      };
    }
    const logbooks: Logbook[] = await this.prisma.logbook.findMany({
      where,
      orderBy: { logDate: 'asc' },
    });
    const user: User | null = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const headerImagePath = path.resolve(
      process.cwd(),
      'src/assets/header_report/header_report.png',
    );
    const headerImageBase64 = fs.existsSync(headerImagePath)
      ? fs.readFileSync(headerImagePath).toString('base64')
      : null;

    const tableBody: (string | number)[][] = [
      ['No', 'Tanggal', 'Status', 'Aktivitas'],
      ...logbooks.map((l, i) => [
        i + 1,
        l.logDate ? new Date(l.logDate).toLocaleDateString('id-ID') : '-',
        l.status,
        l.content,
      ]),
    ];

    const content = [
      {
        text: `Rekap Logbook Intern: ${user?.name || '-'}`,
        style: 'header',
      },
      {
        text: `Institusi: ${user?.asalInstitusi || '-'}`,
        alignment: 'center',
        style: 'normal',
      },
      {
        text: `Periode: ${filter.startDate || '-'} s/d ${filter.endDate || '-'}`,
        alignment: 'center',
        style: 'normal',
      },
      {
        text: `Dicetak oleh: ${adminName} | Tanggal: ${new Date().toLocaleString('id-ID')}`,
        margin: [0, 0, 0, 20],
        alignment: 'center',
        style: 'normal',
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
      },
    ] as Content[];

    const docDefinition: TDocumentDefinitions = {
      header: (
        currentPage: number,
        pageCount: number,
        pageSize: { width: number },
      ) => {
        if (headerImageBase64) {
          return {
            image: `data:image/png;base64,${headerImageBase64}`,
            fit: [pageSize.width - 80, 80] as [number, number],
            alignment: 'center',
            margin: [0, 20, 0, 10],
          };
        }
        return null;
      },
      content: content,
      pageMargins: [40, 120, 40, 60],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: 'center',
        },
      },
      defaultStyle: { font: 'Helvetica' },
    };

    const fonts = {
      Helvetica: {
        normal: 'src/assets/fonts/Helvetica-Regular.ttf',
        bold: 'src/assets/fonts/Helvetica-Bold.ttf',
        italics: 'src/assets/fonts/Helvetica-Oblique.ttf',
        bolditalics: 'src/assets/fonts/Helvetica-BoldOblique.ttf',
      },
    };
    const printer = new PdfPrinter(fonts);
    const pdfDoc: PDFKit.PDFDocument =
      printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
