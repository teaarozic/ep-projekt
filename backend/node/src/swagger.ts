import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { logger } from '@/lib/logger.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'REST API documentation for TaskFlow backend',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:4000/api/v1',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  logger.info('📘 Swagger docs available at /api-docs');
}
