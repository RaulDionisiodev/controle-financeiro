import { Router } from 'express';
import { criar, listar, mensagem, atualizar, deletar } from '../controllers/gastoController.js';
import { validarBody } from '../middlewares/validate.js';
import { gastoSchema } from '../schemas/gastoSchema.js';

const router = Router();

router.post('/gastos', validarBody(gastoSchema), criar);
router.get('/gastos', listar);
router.get('/gastos/mensagem', mensagem);
router.put('/gastos/:id', validarBody(gastoSchema), atualizar);
router.delete('/gastos/:id', deletar);

export default router;