import { Router } from 'express';
import { loginGoogle, me, logout } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/auth/google', loginGoogle);
router.get('/auth/me', requireAuth, me);
router.post('/auth/logout', logout);

export default router;