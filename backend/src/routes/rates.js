import { Router } from 'express';
import { getRates, getRate, updateRate, toggleFavorite } from '../controllers/rateController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getRates);
router.get('/:pair', auth, getRate);
router.put('/:pair', auth, updateRate);
router.post('/:pair/favorite', auth, toggleFavorite);

export default router;
