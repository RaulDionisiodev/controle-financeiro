import express from 'express';
import cors from 'cors';
import gastoRoutes from './routes/gastoroutes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(gastoRoutes);