import { Request, Response, NextFunction } from 'express';
import {
  getLatestResults,
  createAiResult,
} from '@/services/core/resultsService.js';
import { AppError } from '@/utils/AppError.js';

export const listResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const data = await getLatestResults(Number.isFinite(limit) ? limit : 10);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

export const saveResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, preview, status } = req.body ?? {};
    const validTypes = ['SUMMARIZE', 'SENTIMENT', 'CSV'];
    if (!validTypes.includes(type)) {
      throw new AppError(
        `Invalid type. Expected one of: ${validTypes.join(', ')}.`,
        400
      );
    }

    const trimmedPreview = typeof preview === 'string' ? preview.trim() : '';

    if (!trimmedPreview) {
      throw new AppError('Preview is required.', 400);
    }

    if (trimmedPreview.length > 200) {
      throw new AppError('Preview must be <= 200 characters.', 400);
    }

    if (!['PENDING', 'SUCCESS', 'ERROR'].includes(status)) {
      throw new AppError('Invalid status.', 400);
    }

    const row = await createAiResult({ type, preview: trimmedPreview, status });

    res.status(201).json({ success: true, data: row });
  } catch (error) {
    next(error);
  }
};
