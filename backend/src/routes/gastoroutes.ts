import { Router } from 'express';
import { criar } from '../controllers/gastoController.js';

const router = Router();

router.post('/gastos', criar);

export default router;