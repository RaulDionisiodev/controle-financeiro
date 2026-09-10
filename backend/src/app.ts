import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import gastoRoutes from './routes/gastoroutes.js';
import pinoHttpImport from 'pino-http';
import type { RequestHandler } from 'express';
import { openApiDocument } from './docs/openapi.js';
import { logger } from './config/logger.js';
import { Sentry } from './config/sentry.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import { requireAuth } from './middlewares/auth.js';

const pinoHttp = pinoHttpImport as unknown as (options?: Record<string, unknown>) => RequestHandler;
export const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(authRoutes);
app.use(requireAuth, gastoRoutes);

Sentry.setupExpressErrorHandler(app);