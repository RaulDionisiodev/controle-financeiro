import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'funciona' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});