import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
  brand: { type: String, required: true, unique: true },
  icon: { type: String, default: 'gift' },
  color: { type: String, default: '#0052FF' },
  denominations: [Number],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('GiftCard', giftCardSchema);
