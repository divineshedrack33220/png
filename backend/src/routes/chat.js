import { Router } from 'express';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/admin.js';
import {
  getOrCreateConversation,
  getUserMessages,
  sendMessage,
  getOpenConversations,
  getAllConversations,
  getConversationMessages,
  adminSendMessage,
  closeConversation,
  getOpenCount
} from '../controllers/chatController.js';

const router = Router();

router.get('/conversation', auth, getOrCreateConversation);
router.get('/messages', auth, getUserMessages);
router.post('/messages', auth, sendMessage);

router.get('/admin/conversations', auth, adminOnly, getOpenConversations);
router.get('/admin/conversations/all', auth, adminOnly, getAllConversations);
router.get('/admin/conversations/count', auth, adminOnly, getOpenCount);
router.get('/admin/:id/messages', auth, adminOnly, getConversationMessages);
router.post('/admin/:id/messages', auth, adminOnly, adminSendMessage);
router.put('/admin/:id/close', auth, adminOnly, closeConversation);

export default router;
