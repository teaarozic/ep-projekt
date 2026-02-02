import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger.js';

const db = new PrismaClient();

async function main() {
  await db.$transaction(async (tx) => {
    await tx.task.deleteMany();
    await tx.project.deleteMany();
    await tx.user.deleteMany();

    const userHashed = await bcrypt.hash('secret123', 10);
    const user = await tx.user.create({
      data: {
        email: 'test@example.com',
        password: userHashed,
        role: 'USER',
      },
    });

    const saHashed = await bcrypt.hash('Qsd1234', 10);
    await tx.user.create({
      data: {
        email: 'sa@qsd.ba',
        password: saHashed,
        role: 'SA',
      },
    });

    const project1 = await tx.project.create({
      data: { name: 'QLearnIT Backend Setup', userId: user.id },
    });

    const project2 = await tx.project.create({
      data: { name: 'Frontend Integration', userId: user.id },
    });

    await tx.task.createMany({
      data: [
        {
          title: 'Init Express server',
          done: true,
          projectId: project1.id,
          userId: user.id,
        },
        {
          title: 'Configure Prisma',
          done: false,
          projectId: project1.id,
          userId: user.id,
        },
        {
          title: 'Build API endpoints',
          done: false,
          projectId: project1.id,
          userId: user.id,
        },
        {
          title: 'Connect React frontend',
          done: false,
          projectId: project2.id,
          userId: user.id,
        },
        {
          title: 'Add login page',
          done: false,
          projectId: project2.id,
          userId: user.id,
        },
      ],
      skipDuplicates: true,
    });

    logger.info('Seed data inserted successfully.');
  });

  const projects = await db.project.findMany({ include: { tasks: true } });
  logger.info('Projects & tasks seeded:', {
    count: projects.length,
  });
}

main()
  .catch((err) => {
    logger.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
