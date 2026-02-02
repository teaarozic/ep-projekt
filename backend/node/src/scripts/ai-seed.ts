import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger.js';

const prisma = new PrismaClient();

async function main() {
  await prisma.aiResult.deleteMany();

  await prisma.aiResult.createMany({
    data: [
      {
        type: 'SUMMARIZE',
        preview: 'Summary of user report...',
        status: 'SUCCESS',
      },
      {
        type: 'SENTIMENT',
        preview: 'Positive (0.81): Great results!',
        status: 'SUCCESS',
      },
      {
        type: 'CSV',
        preview: 'Processed 243 rows from dataset',
        status: 'SUCCESS',
      },
      {
        type: 'SUMMARIZE',
        preview: 'Short report on project efficiency...',
        status: 'SUCCESS',
      },
      {
        type: 'SENTIMENT',
        preview: 'Negative (-0.43): Poor quality...',
        status: 'SUCCESS',
      },
      {
        type: 'CSV',
        preview: 'Detected missing values in 2 columns',
        status: 'SUCCESS',
      },
      {
        type: 'SUMMARIZE',
        preview: 'Brief summary: trends are positive.',
        status: 'SUCCESS',
      },
      {
        type: 'SENTIMENT',
        preview: 'Neutral (0.02): "Okay experience."',
        status: 'SUCCESS',
      },
      {
        type: 'CSV',
        preview: 'Aggregated averages computed.',
        status: 'SUCCESS',
      },
      { type: 'CSV', preview: 'Pending: file too large', status: 'PENDING' },
    ],
  });

  logger.info('✅ Seeded AI results successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    logger.error('Prisma seed failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
