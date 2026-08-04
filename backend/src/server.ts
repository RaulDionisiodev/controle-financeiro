import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import gastoRoutes from './routes/gastoroutes.js';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'funciona' });
});

app.use(gastoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});