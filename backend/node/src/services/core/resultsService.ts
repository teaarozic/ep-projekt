import { prisma } from '@/lib/prisma.js';

export async function getLatestResults(limit = 10) {
  const rows = await prisma.aiResult.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      preview: true,
      status: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    preview: r.preview,
    timeStamp: r.createdAt.toISOString(),
    status: r.status,
  }));
}

export async function createAiResult(args: {
  type: 'SUMMARIZE' | 'SENTIMENT' | 'CSV';
  preview: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
}) {
  const row = await prisma.aiResult.create({
    data: {
      type: args.type,
      preview: args.preview,
      status: args.status,
    },
    select: {
      id: true,
      type: true,
      preview: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    id: row.id,
    type: row.type,
    preview: row.preview,
    status: row.status,
    timeStamp: row.createdAt.toISOString(),
  };
}
