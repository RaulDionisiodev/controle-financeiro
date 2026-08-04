import { Router } from 'express';
import { criar, listar, mensagem, atualizar, deletar } from '../controllers/gastoController.js';

const router = Router();

router.post('/gastos', criar);
router.get('/gastos', listar);
router.get('/gastos/mensagem', mensagem);
router.put('/gastos/:id', atualizar);
router.delete('/gastos/:id', deletar);

export default router;