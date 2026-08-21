import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import gastoRoutes from './routes/gastoroutes.js';
import { openApiDocument } from './docs/openapi.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(gastoRoutes);