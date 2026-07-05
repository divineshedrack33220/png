import { Router } from 'express';
import { claimDeposit } from '../controllers/depositController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/claim', auth, claimDeposit);

export default router;
