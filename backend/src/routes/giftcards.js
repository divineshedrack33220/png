import { Router } from 'express';
import { getGiftCards } from '../controllers/giftCardController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getGiftCards);

export default router;
