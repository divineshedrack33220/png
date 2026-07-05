import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cardNumber: { type: String, required: true },
  last4: { type: String, required: true },
  cvv: { type: String, required: true },
  holder: { type: String, required: true },
  expiry: { type: String, required: true },
  type: { type: String, default: 'Virtual' },
  tier: { type: String, default: 'Bronze' },
  status: { type: String, enum: ['active', 'frozen', 'blocked', 'inactive'], default: 'active' },
  isFrozen: { type: Boolean, default: false },
  color: { type: String, default: 'linear-gradient(135deg, #1E3A5F, #0B1220)' },
  limits: {
    daily: { type: Number, default: 5000 },
    monthly: { type: Number, default: 25000 },
    perTx: { type: Number, default: 2500 }
  },
  settings: {
    onlinePayments: { type: Boolean, default: true },
    atmWithdrawals: { type: Boolean, default: false },
    contactless: { type: Boolean, default: true },
    international: { type: Boolean, default: false }
  },
  spending: {
    thisMonth: { type: Number, default: 0 },
    lastMonth: { type: Number, default: 0 },
    categories: [{
      name: String,
      amount: Number,
      color: String,
      percent: Number
    }],
    trend: [Number]
  },
  pin: { type: String, select: false },
  isDefault: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Card', cardSchema);
