/* eslint-disable promise/catch-or-return */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 12);

  await prisma.user.upsert({
    create: {
      enabled: true,
      isAdmin: true,
      password: hashedPassword,
      username: 'admin',
    },
    update: {},
    where: { username: 'admin' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
