import { apiClient } from '@/lib/apiClient';
import { API_PATHS } from '@/constants/apiPaths';
import { logger } from '@/utils/logger';

export interface AiResult {
  id: number;
  type: 'SUMMARIZE' | 'SENTIMENT' | 'CSV';
  preview: string;
  timeStamp: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
}

interface SummarizeResponse {
  original: string;
  summary: string;
  meta: {
    strategy: string;
    original_words: number;
    summary_words: number;
  };
}

interface SentimentResponse {
  polarity: number;
  tone: 'Positive' | 'Neutral' | 'Negative';
  resultId: number;
}

export interface CsvResponse {
  fileName: string;
  rows: number;
  columns: number;
  columnNames: string[];
  numericSummary: Record<string, { min: number; max: number; avg: number }>;
  resultId: number;
}

export const aiService = {
  async getResults(): Promise<AiResult[]> {
    try {
      return await apiClient.get(API_PATHS.core.results);
    } catch (error) {
      logger.error('Failed to load AI results:', error);
      throw new Error('Unable to load previous AI results.');
    }
  },

  async summarizeText(text: string): Promise<SummarizeResponse> {
    try {
      return await apiClient.post(API_PATHS.core.ai.summarize, { text });
    } catch (error) {
      logger.error('Summarize text failed:', error);
      throw new Error('Unable to summarize the provided text.');
    }
  },

  async analyzeSentiment(text: string): Promise<SentimentResponse> {
    try {
      return await apiClient.post(API_PATHS.core.ai.sentiment, { text });
    } catch (error) {
      logger.error('Sentiment analysis failed:', error);
      throw new Error('Unable to analyze sentiment.');
    }
  },

  async analyzeCsv(file: File): Promise<CsvResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      return await apiClient.postForm(API_PATHS.core.ai.csv, formData);
    } catch (error) {
      logger.error('CSV analysis failed:', error);
      throw new Error('Unable to analyze CSV file.');
    }
  },
};
