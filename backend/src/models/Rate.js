import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema({
  pair: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  buy: { type: Number, required: true },
  sell: { type: Number, required: true },
  icon: { type: String, default: 'bitcoin' },
  color: { type: String, default: '#F7931A' },
  change: { type: Number, default: 0 },
  high24: { type: Number, default: 0 },
  low24: { type: Number, default: 0 },
  marketCap: { type: String, default: '-' },
  volume: { type: String, default: '-' },
  supply: { type: String, default: '-' },
  trend: [Number],
  type: { type: String, enum: ['crypto', 'fiat'], default: 'crypto' },
  favorite: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Rate', rateSchema);
