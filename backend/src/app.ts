import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import gastoRoutes from './routes/gastoroutes.js';
import pinoHttpImport from 'pino-http';
import type { RequestHandler } from 'express';
import { openApiDocument } from './docs/openapi.js';
import { logger } from './config/logger.js';
import { Sentry } from './config/sentry.js';

const pinoHttp = pinoHttpImport as unknown as (options?: Record<string, unknown>) => RequestHandler;
export const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(gastoRoutes);

Sentry.setupExpressErrorHandler(app);