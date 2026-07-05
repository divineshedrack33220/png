import { Router } from 'express';
import { register, login, forgotPassword, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', auth, getMe);

export default router;
