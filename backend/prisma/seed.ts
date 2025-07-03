// prisma/seed.ts - The Single Source of Truth

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Memulai proses seeding...`);

  const rolesToCreate = [
    { name: 'Mahasiswa' },
    { name: 'Staff BPS' },
    { name: 'Admin' },
  ];

  for (const roleData of rolesToCreate) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: { name: roleData.name },
    });
    console.log(`Role '${role.name}' berhasil dibuat/ditemukan.`);
  }

  console.log(`Proses seeding selesai.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
