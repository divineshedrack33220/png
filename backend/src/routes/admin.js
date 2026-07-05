import { Router } from 'express';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/admin.js';
import {
  getStats, getUsers, getUserDetail, updateUserRole, suspendUser, reviewKyc, deleteUser, updateUserBalance,
  getTransactions, updateTransactionStatus, batchUpdateTransactionStatus,
  getCards, updateCardStatus,
  getRates, updateRate, createRate, deleteRate,
  getGiftCards, updateGiftCard, createGiftCard, deleteGiftCard,
  sendNotification, getNotifications,
  getDepositClaims, reviewDepositClaim
} from '../controllers/adminController.js';

const router = Router();

router.use(auth, adminOnly);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/kyc', reviewKyc);
router.put('/users/:id/balance', updateUserBalance);
router.delete('/users/:id', deleteUser);

router.get('/transactions', getTransactions);
router.put('/transactions/:id/status', updateTransactionStatus);
router.post('/transactions/batch-status', batchUpdateTransactionStatus);

router.get('/cards', getCards);
router.put('/cards/:id/status', updateCardStatus);

router.get('/rates', getRates);
router.put('/rates/:id', updateRate);
router.post('/rates', createRate);
router.delete('/rates/:id', deleteRate);

router.get('/giftcards', getGiftCards);
router.put('/giftcards/:id', updateGiftCard);
router.post('/giftcards', createGiftCard);
router.delete('/giftcards/:id', deleteGiftCard);

router.get('/notifications', getNotifications);
router.post('/notifications', sendNotification);

router.get('/deposits', getDepositClaims);
router.put('/deposits/:id/status', reviewDepositClaim);

export default router;
