import { Router } from 'express';
import { criar, listar, mensagem } from '../controllers/gastoController.js';

const router = Router();

router.post('/gastos', criar);
router.get('/gastos', listar);
router.get('/gastos/mensagem', mensagem);

export default router;