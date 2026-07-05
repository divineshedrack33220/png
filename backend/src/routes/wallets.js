import { Router } from 'express';
import { getWallets, getWallet, getWalletByCoin, withdrawCrypto } from '../controllers/walletController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getWallets);
router.get('/coin/:coin', auth, getWalletByCoin);
router.get('/:id', auth, getWallet);
router.post('/withdraw', auth, withdrawCrypto);

export default router;
