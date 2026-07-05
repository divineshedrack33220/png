import { Router } from 'express';
import {
  getProfile, updateProfile, updateEmail, updateUsername,
  changePassword, updateSettings, addBankAccount,
  removeBankAccount, setDefaultBank, deleteAccount,
  submitKycDocument, getTierInfo
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/email', auth, updateEmail);
router.put('/username', auth, updateUsername);
router.put('/password', auth, changePassword);
router.put('/settings', auth, updateSettings);
router.post('/bank', auth, addBankAccount);
router.delete('/bank/:bankId', auth, removeBankAccount);
router.put('/bank/:bankId/default', auth, setDefaultBank);
router.post('/delete', auth, deleteAccount);
router.post('/kyc', auth, submitKycDocument);
router.get('/tier-info', auth, getTierInfo);

export default router;
