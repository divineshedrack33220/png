import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
  kycDocuments: [{
    type: { type: String },
    front: { type: String },
    back: { type: String },
    selfie: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reason: { type: String }
  }],
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String, default: '' },
  plainPassword: { type: String, default: '' },
  tier: { type: Number, default: 1, min: 1, max: 3 },
  isLimited: { type: Boolean, default: true },
  balance: {
    USD: { type: Number, default: 0 },
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 }
  },
  bankAccounts: [{
    id: { type: String },
    name: { type: String },
    type: { type: String },
    last4: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  settings: {
    theme: { type: String, default: 'dark' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'English' },
    twoFactor: { type: Boolean, default: false },
    biometrics: { type: Boolean, default: false },
    loginNotifications: { type: Boolean, default: true },
    transactionAlerts: { type: Boolean, default: true },
    recoveryEmail: String,
    recoveryPhone: String
  },
  depositAddress: { type: String, unique: true, sparse: true },
  referralCode: { type: String, unique: true },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },
  lastLogin: Date,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
