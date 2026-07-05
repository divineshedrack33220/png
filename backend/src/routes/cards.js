import { Router } from 'express';
import { getCards, getCard, freezeCard, changePin, updateCardSettings, blockCard, replaceCard } from '../controllers/cardController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getCards);
router.get('/:id', auth, getCard);
router.post('/:id/freeze', auth, freezeCard);
router.post('/:id/pin', auth, changePin);
router.put('/:id/settings', auth, updateCardSettings);
router.post('/:id/block', auth, blockCard);
router.post('/:id/replace', auth, replaceCard);

export default router;
