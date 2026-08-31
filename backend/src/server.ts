import 'dotenv/config';
import './config/sentry.js';
import { app } from './app.js';
import { logger } from './config/logger.js';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});