import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
