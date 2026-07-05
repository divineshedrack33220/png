import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  coin: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, default: 'bitcoin' },
  color: { type: String, default: '#F7931A' },
  balance: { type: Number, default: 0 },
  usdValue: { type: Number, default: 0 },
  address: { type: String, default: '' },
  trend: [Number]
}, { timestamps: true });

walletSchema.index({ userId: 1, coin: 1 }, { unique: true });

export default mongoose.model('Wallet', walletSchema);
