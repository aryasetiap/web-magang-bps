import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fungsi utama untuk melakukan proses seeding data role ke database.
 * Fungsi ini akan memastikan setiap role pada daftar rolesToCreate
 * tersedia di database, dengan menggunakan metode upsert.
 */
async function main(): Promise<void> {
  console.log('Memulai proses seeding...');

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

  console.log('Proses seeding selesai.');
}

main()
  .catch((e) => {
    // Menangani error yang terjadi selama proses seeding
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Menutup koneksi Prisma setelah proses selesai
    await prisma.$disconnect();
  });
