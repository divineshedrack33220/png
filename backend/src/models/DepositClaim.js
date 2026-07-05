import mongoose from 'mongoose';

const depositClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  address: { type: String, required: true },
  txHash: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

depositClaimSchema.index({ userId: 1, status: 1 });
depositClaimSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('DepositClaim', depositClaimSchema);
