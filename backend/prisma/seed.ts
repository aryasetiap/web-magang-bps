import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const staffBpsAccounts = [
  { nip: '197309131994031004', name: 'Eko Purnomo, SST., MM', username: 'eko.purnomo' },
  { nip: '197205201994031004', name: 'Erwansyah Yusup', username: 'erwansyah' },
  { nip: '197509032006041020', name: 'Tri Budi Setiawan', username: 'tri.bs' },
  { nip: '198405212007011001', name: 'Fazani', username: 'fazani' },
  { nip: '197008032007012004', name: 'Agistin Nafta', username: 'agustin.nafta' },
  { nip: '198002022009011010', name: 'Saifu Rohmatullah', username: 'saifu.rohmatullah' },
  { nip: '198810132010122005', name: 'Resty Sopiyono, SST, M.E.K.K.', username: 'sresty' },
  { nip: '197205231995121001', name: 'Syamsul Bahri, S.Si', username: 'bahri.syamsul' },
  { nip: '197007112003121003', name: 'Andi Stiawan, SP', username: 'andi.stiawan' },
  { nip: '198207182005022001', name: 'Dewi Yuliana S., S.T.', username: 'dewiyuliana' },
  { nip: '198506202007012005', name: 'Fithriyah, SST', username: 'fitriyah' },
  { nip: '198309022009022008', name: 'Arum Pratiwi, SST', username: 'arump' },
  { nip: '198702162009022009', name: 'Nisalasi Ikhsan Nurfathillah, SST', username: 'nisalasi' },
  { nip: '198902082010121005', name: 'Ahmad Rifki Febrianto, SST, M.EKK', username: 'arifki' },
  { nip: '198005262011011005', name: 'Muhamad Zaenuri, S.P.', username: 'muh.zaenuri' },
  { nip: '198908092013112001', name: 'Dinny Pravitasari, SST, M.S.E.', username: 'dinnypravita' },
  { nip: '198410012011011013', name: 'Surachman Budiarto, S.Si', username: 'budi.surachman' },
  { nip: '199405092016022001', name: 'Fanisa Dwita Hanggarani, SST', username: 'fanisa' },
  { nip: '199404202017012001', name: 'Annisa Fauziatul Mardiyah, SST', username: 'annisa.mardiyah' },
  { nip: '199707132019122001', name: 'Sela Anisada, S.Tr.Stat.', username: 'sela.anisada' },
  { nip: '199910302022012002', name: 'Esa Anindika Sari, S.Tr.Stat.', username: 'esa.anindika' },
  { nip: '199911292022012002', name: 'Miftahul Husna, S.Tr.Stat.', username: 'miftahul.husna' },
  { nip: '200006222023021004', name: 'Ahmad Rifjayansyah, S.Tr.Stat.', username: 'ahmadrifjayansyah' },
  { nip: '199304242024211005', name: 'Riki Afrianto, A.Md.', username: 'rikiafrianto-pppk' },
  { nip: '200002092023022003', name: 'Ayu Setianingsih, A.Md.Stat.', username: 'ayusetianingsih' },
  { nip: '200001262023022001', name: 'Dini Alfitri Zahra, A.Md.Stat.', username: 'dinialfitrizahra' },
  { nip: '198605302009111001', name: 'Singgih Adiwijaya, S.E., M.M.', username: 'singgih.adiwijaya' },
  { nip: '198512212012122002', name: 'Diah Hadianing Putri, S.Si', username: 'diah.hp' },
  { nip: '198905052011012013', name: 'Fitri Nurjanah, S.E., M.M.', username: 'fitri.nurjanah' },
  { nip: '199902142022012004', name: 'Eklesia Valentia, A.Md.Kb.N.', username: 'eklesia.valentia' },
];

const adminAccounts = [
  { id: 0, name: 'Admin', email: 'admin@webmagangbps.com', password: 'WebMagangBPSKabPringsewu2025' },
  { id: 1, name: 'AdminArya', email: 'adminarya@webmagangbps.com', password: 'WebMagangBPSKabPringsewu2025' },
  { id: 2, name: 'AdminDivany', email: 'admindivany@webmagangbps.com', password: 'WebMagangBPSKabPringsewu2025' },
];

const interns = [
  {
    id: 1001,
    name: 'Intern Satu',
    email: 'intern1@mail.com',
    password: 'intern12345',
    namaLengkap: 'Intern Satu',
    asalInstitusi: 'Unila',
    jurusanProdi: 'Statistika',
    educationStatus: 'mahasiswa',
    activityType: 'Magang',
    activityStart: new Date('2025-07-01'),
    activityEnd: new Date('2025-08-01'),
  },
  {
    id: 1002,
    name: 'Intern Dua',
    email: 'intern2@mail.com',
    password: 'intern12345',
    namaLengkap: 'Intern Dua',
    asalInstitusi: 'ITERA',
    jurusanProdi: 'Matematika',
    educationStatus: 'mahasiswa',
    activityType: 'Magang',
    activityStart: new Date('2025-07-01'),
    activityEnd: new Date('2025-08-01'),
  },
  {
    id: 1003,
    name: 'Intern Tiga',
    email: 'intern3@mail.com',
    password: 'intern12345',
    namaLengkap: 'Intern Tiga',
    asalInstitusi: 'Polinela',
    jurusanProdi: 'Teknik Informatika',
    educationStatus: 'mahasiswa',
    activityType: 'Magang',
    activityStart: new Date('2025-07-01'),
    activityEnd: new Date('2025-08-01'),
  },
];

/**
 * Fungsi untuk membuat role jika belum ada di database.
 * @returns {Promise<void>}
 */
async function seedRoles(): Promise<void> {
  const rolesToCreate = [
    { name: 'Intern' },
    { name: 'Staff BPS' },
    { name: 'Admin' },
  ];

  for (const roleData of rolesToCreate) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: { name: roleData.name },
    });
    console.log(`Role '${roleData.name}' berhasil dibuat/ditemukan.`);
  }
}

/**
 * Fungsi untuk melakukan seeding akun Staff BPS.
 * Password di-hash dari NIP.
 * @param staffRoleId ID role Staff BPS
 * @returns {Promise<void>}
 */
async function seedStaffBpsAccounts(staffRoleId: number | undefined): Promise<void> {
  if (typeof staffRoleId !== 'number') throw new Error('Staff roleId is undefined');
  for (const staff of staffBpsAccounts) {
    const email = `${staff.username}@bps.go.id`;
    const passwordHash = await bcrypt.hash(staff.nip, 10);

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: staff.name,
        email,
        password: passwordHash,
        roleId: staffRoleId, // sudah pasti number
        isEmailVerified: true,
      },
    });
    console.log(`Akun Staff BPS '${staff.name}' (${email}) berhasil dibuat/ditemukan.`);
  }
}

/**
 * Fungsi untuk melakukan seeding akun Admin.
 * Password di-hash dari password default.
 * @param adminRoleId ID role Admin
 * @returns {Promise<void>}
 */
async function seedAdminAccounts(adminRoleId: number | undefined): Promise<void> {
  if (typeof adminRoleId !== 'number') throw new Error('Admin roleId is undefined');
  for (const admin of adminAccounts) {
    const passwordHash = await bcrypt.hash(admin.password, 10);

    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        password: passwordHash,
        roleId: adminRoleId,
        isEmailVerified: true,
      },
    });
    console.log(`Akun Admin '${admin.name}' (${admin.email}) berhasil dibuat/ditemukan.`);
  }
}

/**
 * Fungsi untuk melakukan seeding akun Intern.
 * Password di-hash dari password default.
 * @param internRoleId ID role Intern
 * @returns {Promise<void>}
 */
async function seedInternAccounts(internRoleId: number | undefined): Promise<void> {
  if (typeof internRoleId !== 'number') throw new Error('Intern roleId is undefined');
  for (const intern of interns) {
    await prisma.user.upsert({
      where: { email: intern.email },
      update: {},
      create: {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        password: await bcrypt.hash(intern.password, 10),
        roleId: internRoleId, // sudah pasti number
        isEmailVerified: true,
        namaLengkap: intern.namaLengkap,
        asalInstitusi: intern.asalInstitusi,
        jurusanProdi: intern.jurusanProdi,
        educationStatus: intern.educationStatus,
        activityType: intern.activityType,
        activityStart: intern.activityStart,
        activityEnd: intern.activityEnd,
      },
    });
    console.log(`Akun Intern '${intern.name}' (${intern.email}) berhasil dibuat/ditemukan.`);
  }
}

/**
 * Fungsi untuk melakukan seeding data aplikasi magang untuk setiap intern.
 * @returns {Promise<void>}
 */
async function seedInternshipApplications(): Promise<void> {
  for (const intern of interns) {
    await prisma.internshipApplication.upsert({
      where: { userId: intern.id },
      update: {},
      create: {
        userId: intern.id,
        status: 'pending',
        transcriptPath: 'uploads/transcript/dummy.pdf',
        requestLetterPath: 'uploads/requestLetter/dummy.pdf',
        startDate: intern.activityStart,
        endDate: intern.activityEnd,
      },
    });
    console.log(`Internship Application untuk '${intern.name}' berhasil dibuat/ditemukan.`);
  }
}

/**
 * Fungsi untuk melakukan seeding logbook dummy untuk setiap intern.
 * @returns {Promise<void>}
 */
async function seedLogbooks(): Promise<void> {
  for (const intern of interns) {
    for (let i = 0; i < 3; i++) {
      await prisma.logbook.create({
        data: {
          userId: intern.id,
          logDate: new Date(2025, 6, i + 1),
          content: `Kegiatan hari ke-${i + 1} oleh ${intern.name}`,
          status: i === 2 ? 'submitted' : 'draft',
        },
      });
    }
    console.log(`3 Logbook untuk '${intern.name}' berhasil dibuat.`);
  }
}

/**
 * Fungsi untuk melakukan seeding tugas dan assignment ke intern.
 * @param staffRoleId ID role Staff BPS
 * @returns {Promise<any[]>} Daftar tugas yang telah dibuat
 */
async function seedTasksAndAssignments(staffRoleId: number | undefined): Promise<any[]> {
  const staffList = await prisma.user.findMany({ where: { roleId: staffRoleId }, take: 3 });
  const tasks: any[] = [];
  for (let i = 0; i < 3; i++) {
    const task = await prisma.task.create({
      data: {
        title: `Tugas ${i + 1}`,
        description: `Deskripsi tugas ${i + 1}`,
        deadline: new Date(`2025-08-0${i + 1}`),
        createdBy: staffList[i % staffList.length].id,
      },
    });
    tasks.push(task);
    await prisma.taskAssignment.createMany({
      data: interns.map((intern) => ({
        taskId: task.id,
        userId: intern.id,
      })),
      skipDuplicates: true,
    });
  }
  console.log('3 Tasks dan assignment ke semua intern berhasil dibuat.');
  return tasks;
}

/**
 * Fungsi untuk melakukan seeding submission tugas oleh intern.
 * @param tasks Daftar tugas yang telah dibuat
 * @returns {Promise<void>}
 */
async function seedSubmissions(tasks: any[]): Promise<void> {
  for (const task of tasks) {
    for (const intern of interns) {
      await prisma.submission.create({
        data: {
          taskId: task.id,
          userId: intern.id,
          filePath: 'uploads/submissions/dummy.pdf',
          status: 'submitted',
          description: `Submission tugas ${task.title} oleh ${intern.name}`,
        },
      });
    }
  }
  console.log('Submissions dummy berhasil dibuat.');
}

/**
 * Fungsi untuk melakukan seeding final project untuk setiap intern.
 * @param staffList Daftar staff yang akan menjadi reviewer
 * @returns {Promise<void>}
 */
async function seedFinalProjects(staffList: any[]): Promise<void> {
  for (const intern of interns) {
    await prisma.finalProject.create({
      data: {
        userId: intern.id,
        title: `Final Project ${intern.name}`,
        description: `Deskripsi final project ${intern.name}`,
        filePath: 'uploads/final-projects/dummy.pdf',
        status: 'accepted',
        grade: 90 + interns.indexOf(intern),
        feedback: 'Good job!',
        submittedAt: new Date('2025-08-10'),
        reviewedAt: new Date('2025-08-15'),
        reviewedById: staffList[0].id,
      },
    });
  }
  console.log('Final Project dummy berhasil dibuat.');
}

/**
 * Fungsi untuk melakukan seeding sertifikat untuk setiap intern.
 * @param adminId ID admin yang membuat dan mengupdate sertifikat
 * @returns {Promise<void>}
 */
async function seedCertificates(adminId: number): Promise<void> {
  for (const intern of interns) {
    await prisma.certificate.create({
      data: {
        certificateNumber: `CERT-2025-000${intern.id}-BPSPringsewu`,
        userId: intern.id,
        internName: intern.namaLengkap,
        educationalStatus: intern.educationStatus,
        institusi: intern.asalInstitusi,
        predicate: 'Sangat Baik',
        namaKegiatan: intern.activityType,
        activityPeriod: '1 Juli - 1 Agustus 2025',
        tglSertifikat: new Date('2025-08-20'),
        namaKepalaBPS: 'Drs. Budi Santoso, M.Si',
        nipKepalaBPS: '19650101 199001 1 001',
        templatePath: 'uploads/certificate-templates/certificate-template.pdf',
        status: 'issued',
        generatedAt: new Date('2025-08-20'),
        signedAt: new Date('2025-08-21'),
        issuedAt: new Date('2025-08-22'),
        createdBy: adminId,
        updatedBy: adminId,
      },
    });
  }
  console.log('Certificate dummy berhasil dibuat.');
}

/**
 * Fungsi utama untuk menjalankan seluruh proses seeding database.
 * Meliputi pembuatan role, akun user, data dummy magang, tugas, logbook, submission, final project, dan sertifikat.
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  console.log('Memulai proses seeding...');

  await seedRoles();

  const staffRole = await prisma.role.findUnique({ where: { name: 'Staff BPS' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const internRole = await prisma.role.findUnique({ where: { name: 'Intern' } });

  await seedStaffBpsAccounts(staffRole?.id);
  await seedAdminAccounts(adminRole?.id);
  await seedInternAccounts(internRole?.id);
  await seedInternshipApplications();
  await seedLogbooks();

  const tasks = await seedTasksAndAssignments(staffRole?.id);
  await seedSubmissions(tasks);

  const staffList = await prisma.user.findMany({ where: { roleId: staffRole?.id }, take: 3 });
  await seedFinalProjects(staffList);

  await seedCertificates(adminAccounts[0].id);

  console.log('Proses seeding selesai.');
}

// Menjalankan fungsi utama dan menangani error serta menutup koneksi Prisma
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
