import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { type, unreadOnly } = req.query;
    const filter = { userId: req.userId };
    if (type && type !== 'All') filter.type = type.toLowerCase();
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, message, type, action } = req.body;
    const notif = await Notification.create({
      userId: req.userId,
      title, message,
      type: type || 'system',
      action: action || null
    });
    res.status(201).json({ notification: notif });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
