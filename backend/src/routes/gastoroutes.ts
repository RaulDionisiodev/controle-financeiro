import { Router } from 'express';
import { criar, listar } from '../controllers/gastoController.js';

const router = Router();

router.post('/gastos', criar);
router.get('/gastos', listar);

export default router;