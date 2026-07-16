import Conversation from '../models/Conversation.js';
import ChatMessage from '../models/ChatMessage.js';

export const getOrCreateConversation = async (req, res) => {
  try {
    let conversation = await Conversation.findOne({ userId: req.userId, status: 'open' });
    if (!conversation) {
      conversation = await Conversation.create({ userId: req.userId });
    }
    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ userId: req.userId, status: 'open' });
    if (!conversation) return res.json({ messages: [], conversation: null });

    const messages = await ChatMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json({ messages, conversation });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message text required' });

    let conversation = await Conversation.findOne({ userId: req.userId, status: 'open' });
    if (!conversation) {
      conversation = await Conversation.create({ userId: req.userId });
    }

    const message = await ChatMessage.create({
      conversationId: conversation._id,
      senderId: req.userId,
      senderRole: req.user.role === 'admin' || req.user.role === 'superadmin' ? 'admin' : 'user',
      text: text.trim()
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: text.trim(),
      lastMessageAt: new Date()
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('chat:new_message', {
        conversationId: conversation._id,
        message: {
          _id: message._id,
          senderId: message.senderId,
          senderRole: message.senderRole,
          text: message.text,
          createdAt: message.createdAt
        }
      });
    }

    res.status(201).json({ message, conversation });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOpenConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ status: 'open' })
      .populate('userId', 'name email avatar')
      .sort({ lastMessageAt: -1 });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllConversations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const conversations = await Conversation.find(filter)
      .populate('userId', 'name email avatar')
      .sort({ lastMessageAt: -1 });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('userId', 'name email avatar');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = await ChatMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

    await ChatMessage.updateMany(
      { conversationId: conversation._id, senderRole: 'user', read: false },
      { read: true }
    );

    res.json({ messages, conversation });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const adminSendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message text required' });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const message = await ChatMessage.create({
      conversationId: conversation._id,
      senderId: req.userId,
      senderRole: 'admin',
      text: text.trim()
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
      adminId: req.userId
    });

    const io = req.app.get('io');
    if (io) {
      io.to('user:' + conversation.userId.toString()).emit('chat:new_message', {
        conversationId: conversation._id,
        message: {
          _id: message._id,
          senderId: message.senderId,
          senderRole: message.senderRole,
          text: message.text,
          createdAt: message.createdAt
        }
      });
    }

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const closeConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const io = req.app.get('io');
    if (io) {
      io.to('user:' + conversation.userId.toString()).emit('chat:closed', {
        conversationId: conversation._id
      });
    }

    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOpenCount = async (req, res) => {
  try {
    const count = await Conversation.countDocuments({ status: 'open' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
