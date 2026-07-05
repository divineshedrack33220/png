import { Router } from 'express';
import { getNotifications, markAsRead, markAllRead, createNotification, deleteNotification } from '../controllers/notificationController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getNotifications);
router.post('/', auth, createNotification);
router.post('/read-all', auth, markAllRead);
router.post('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

export default router;
