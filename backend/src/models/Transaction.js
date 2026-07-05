import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['debit', 'credit', 'pending'], required: true },
  category: { type: String, enum: ['bitcoin', 'withdrawal', 'deposit', 'transfer', 'refund', 'payment', 'exchange', 'swap', 'giftcard', 'billpay'], required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  date: { type: Date, default: Date.now },
  counterparty: { type: String, default: '' },
  fee: { type: Number, default: 0 },
  txHash: { type: String, default: '' },
  notes: { type: String, default: '' },
  destinationAddress: { type: String, default: '' },
  cryptoCurrency: { type: String, default: '' },
  cryptoAmount: { type: Number, default: 0 }
}, { timestamps: true });

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Transaction', transactionSchema);
