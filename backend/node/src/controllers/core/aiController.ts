import type {
  Request,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { AppError } from '@/utils/AppError.js';
import { createAiResult } from '@/services/core/resultsService.js';
import { prisma } from '@/lib/prisma.js';

interface DjangoErrorResponse {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

interface DjangoSummaryResponse {
  original: string;
  summary: string;
  meta?: Record<string, unknown>;
}

interface DjangoCsvResponse {
  success: boolean;
  fileName: string;
  rows: number;
  columns: number;
  columnNames: string[];
  numericSummary: Record<string, { min: number; max: number; avg: number }>;
  error?: string;
}

interface DjangoSentimentResponse {
  polarity: number;
  tone: string;
}

type FetchResponse = globalThis.Response;
type RequestInit = globalThis.RequestInit;
type AiType = 'SUMMARIZE' | 'SENTIMENT' | 'CSV';
type AiKey = 'summarize' | 'sentiment' | 'csv';

const mapTypeToKey: Record<AiType, AiKey> = {
  SUMMARIZE: 'summarize',
  SENTIMENT: 'sentiment',
  CSV: 'csv',
};

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeoutMs = 15000
): Promise<FetchResponse> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Request timed out')),
      timeoutMs
    );

    fetch(url, options)
      .then((res) => {
        clearTimeout(timer);
        resolve(res as FetchResponse);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const summarizeText = async (
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) => {
  try {
    const { text } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim()) {
      throw new AppError('Text is required', 400);
    }

    const djangoUrl = process.env.DJANGO_API_URL;
    const serviceKey = process.env.DJANGO_SERVICE_KEY;
    if (!djangoUrl || !serviceKey) {
      throw new AppError('Server misconfiguration', 500);
    }

    const url = `${djangoUrl}/summarize/`;

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Key': serviceKey,
        },
        body: JSON.stringify({ text }),
      },
      15000
    );

    if (!response.ok) {
      let errMsg = response.statusText;
      let errJson: DjangoErrorResponse | null = null;

      try {
        errJson = (await response.json()) as DjangoErrorResponse;
      } catch {
        errJson = null;
      }

      if (typeof errJson?.error === 'string') errMsg = errJson.error;
      else if (typeof errJson?.message === 'string') errMsg = errJson.message;

      if (response.status >= 400 && response.status < 500) {
        throw new AppError(errMsg, response.status);
      }

      throw new AppError(`AI service error: ${errMsg}`, response.status);
    }

    const data = (await response.json()) as DjangoSummaryResponse;
    const summary = data.summary ?? '';
    const preview = summary.slice(0, 200);

    const result = await createAiResult({
      type: 'SUMMARIZE',
      preview,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      data: { ...data, resultId: result.id },
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeSentiment = async (
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) => {
  try {
    const { text } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim()) {
      throw new AppError('Text is required', 400);
    }

    const djangoUrl = process.env.DJANGO_API_URL;
    const serviceKey = process.env.DJANGO_SERVICE_KEY;
    if (!djangoUrl || !serviceKey) {
      throw new AppError('Server misconfiguration', 500);
    }

    const url = `${djangoUrl}/sentiment/`;

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Key': serviceKey,
        },
        body: JSON.stringify({ text }),
      },
      15000
    );

    if (!response.ok) {
      let errMsg = response.statusText;
      let errJson: DjangoErrorResponse | null = null;

      try {
        errJson = (await response.json()) as DjangoErrorResponse;
      } catch {
        errJson = null;
      }

      if (typeof errJson?.error === 'string') errMsg = errJson.error;

      if (response.status >= 400 && response.status < 500) {
        throw new AppError(errMsg, response.status);
      }

      throw new AppError(`AI service error: ${errMsg}`, response.status);
    }

    const data = (await response.json()) as DjangoSentimentResponse;
    const preview = text.slice(0, 200);

    const result = await createAiResult({
      type: 'SENTIMENT',
      preview,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      data: {
        polarity: data.polarity,
        tone: data.tone,
        resultId: result.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeCsv = async (
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError('CSV file is required', 400);
    }

    const djangoUrl = process.env.DJANGO_API_URL;
    const serviceKey = process.env.DJANGO_SERVICE_KEY;

    if (!djangoUrl || !serviceKey) {
      throw new AppError('Server misconfiguration', 500);
    }

    const response = await fetch(`${djangoUrl}/csv/`, {
      method: 'POST',
      headers: {
        'X-Service-Key': serviceKey,
      },
      body: (() => {
        const form = new FormData();
        form.append('file', new Blob([req.file.buffer]), req.file.originalname);
        return form;
      })(),
    });

    const data = (await response.json()) as DjangoCsvResponse;

    if (!response.ok) {
      throw new AppError(
        data.error || 'CSV processing failed',
        response.status
      );
    }

    const preview =
      `File ${data.fileName}: ${data.rows} rows, ${data.columns} columns`.slice(
        0,
        200
      );

    const result = await createAiResult({
      type: 'CSV',
      preview,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      data: {
        ...data,
        resultId: result.id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAiStats = async (
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) => {
  try {
    const rows = await prisma.aiResult.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    const result: Record<AiKey, number> = {
      summarize: 0,
      sentiment: 0,
      csv: 0,
    };

    rows.forEach((row) => {
      const type = row.type as AiType;
      const key = mapTypeToKey[type];
      result[key] = row._count.type;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
