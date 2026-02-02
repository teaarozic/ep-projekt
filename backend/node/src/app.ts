import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '@/routes/authRoutes.js';
import projectRoutes from '@/routes/core/projectsRoutes.js';
import taskRoutes from '@/routes/core/tasksRoutes.js';
import { errorHandler } from '@/middleware/errorHandler.js';
import { log, logger } from '@/lib/logger.js';
import { setupSwagger } from '@/swagger.js';
import clientRoutes from '@/routes/core/clientsRoutes.js';
import userRoutes from '@/routes/core/usersRoutes.js';
import session, { SessionOptions } from 'express-session';
import passport from '@/config/passport.js';
import dotenv from 'dotenv';
import recentActivitiesRoutes from '@/routes/core/recentActivities.js';
import myTasksRoutes from '@/routes/core/myTasksRoutes.js';
import resultsRoutes from '@/routes/core/resultsRoutes.js';
import aiRoutes from '@/routes/core/aiRoutes.js';

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

app.use(helmet());
app.use((req, _res, next) => {
  log.info(`${req.method} ${req.originalUrl}`);
  next();
});
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

const sessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/core/clients', clientRoutes);
app.use('/api/core/users', userRoutes);
app.use('/api/core/dashboard', recentActivitiesRoutes);
app.use('/api/core/dashboard', myTasksRoutes);
app.use('/api/core/results', resultsRoutes);
app.use('/api/core/ai', aiRoutes);

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/v1/test-debug', (_req: Request, res: Response) => {
  log.debug('DEBUG TEST: Checking detailed debug output...');
  res.json({
    success: true,
    message: 'Debug log triggered. Check your terminal for output!',
  });
});

app.use('*', (req, res) => {
  logger.warn(`Unhandled route accessed: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});
app.use(errorHandler);

setupSwagger(app);

export default app;
