import { Router } from 'express';
import { getTransactions, getTransaction, createTransaction, getTransactionSummary } from '../controllers/transactionController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getTransactions);
router.get('/summary', auth, getTransactionSummary);
router.get('/:id', auth, getTransaction);
router.post('/', auth, createTransaction);

export default router;
