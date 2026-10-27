import { Router } from 'express';
import { register, login, adminLogin, getMe, logout } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator, adminLoginValidator } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/admin/login', adminLoginValidator, adminLogin);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
