import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Card from '../models/Card.js';
import Wallet from '../models/Wallet.js';
import Rate from '../models/Rate.js';
import GiftCard from '../models/GiftCard.js';
import Notification from '../models/Notification.js';
import DepositClaim from '../models/DepositClaim.js';

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalTransactions, pendingKyc, suspendedUsers, recentUsers, recentTransactions] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Transaction.countDocuments(),
      User.countDocuments({ kycStatus: 'pending' }),
      User.countDocuments({ isSuspended: true }),
      User.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('name email username role kycStatus createdAt balance'),
      Transaction.find().sort({ date: -1 }).limit(10).populate('userId', 'name email username')
    ]);

    const volumeResult = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'debit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = volumeResult.length > 0 ? volumeResult[0].total : 0;

    const creditResult = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeposits = creditResult.length > 0 ? creditResult[0].total : 0;

    const activeCards = await Card.countDocuments({ status: 'active' });

    res.json({
      stats: {
        totalUsers,
        totalTransactions,
        totalVolume,
        totalDeposits,
        pendingKyc,
        suspendedUsers,
        activeCards
      },
      recentUsers,
      recentTransactions
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '', kyc = '' } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status === 'suspended') query.isSuspended = true;
    if (status === 'active') query.isSuspended = false;
    if (kyc) query.kycStatus = kyc;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password -__v');

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin getUsers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [transactions, cards, wallets] = await Promise.all([
      Transaction.find({ userId: user._id }).sort({ date: -1 }).limit(20),
      Card.find({ userId: user._id }),
      Wallet.find({ userId: user._id })
    ]);

    res.json({ user, transactions, cards, wallets });
  } catch (err) {
    console.error('Admin getUserDetail error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, message: 'Role updated' });
  } catch (err) {
    console.error('Admin updateUserRole error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { suspend, reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      isSuspended: suspend,
      suspensionReason: reason || ''
    }, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, message: suspend ? 'User suspended' : 'User unsuspended' });
  } catch (err) {
    console.error('Admin suspendUser error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reviewKyc = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const kycStatus = action === 'approve' ? 'verified' : 'rejected';
    const update = { kycStatus };
    if (action === 'reject') {
      update.$push = { kycDocuments: { $each: [{ status: 'rejected', reason, reviewedAt: new Date() }] } };
    } else {
      update.$push = { kycDocuments: { $each: [{ status: 'approved', reviewedAt: new Date() }] } };
      const userDoc = await User.findById(req.params.id);
      if (userDoc) {
        const hasSsnDoc = userDoc.kycDocuments.some(d => d.type === 'ssn');
        if (hasSsnDoc && userDoc.tier < 2) update.tier = 2;
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, message: action === 'approve' ? 'KYC approved' : 'KYC rejected' });
  } catch (err) {
    console.error('Admin reviewKyc error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Admin deleteUser error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type = '', status = '', userId = '' } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email username');

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin getTransactions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const transaction = await Transaction.findById(req.params.id).populate('userId', 'name email');
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    if (status === 'completed' && transaction.cryptoCurrency) {
      const user = await User.findById(transaction.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (transaction.fee > 0) {
        user.balance.USD = Math.max(0, (user.balance.USD || 0) - transaction.fee);
        await user.save();
      } else {
        const cryptoKey = transaction.cryptoCurrency === 'USDT' ? 'USD' : transaction.cryptoCurrency;
        const deductAmount = transaction.cryptoAmount || transaction.amount;
        user.balance[cryptoKey] = Math.max(0, (user.balance[cryptoKey] || 0) - deductAmount);
        await user.save();
      }
    }

    transaction.status = status;
    transaction.type = status === 'completed' ? 'debit' : (status === 'failed' ? 'pending' : transaction.type);
    await transaction.save();

    res.json({ transaction, message: 'Status updated' });
  } catch (err) {
    console.error('Admin updateTransactionStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const batchUpdateTransactionStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });
    if (!['completed', 'failed'].includes(status)) return res.status(400).json({ error: 'Status must be completed or failed' });
    const result = await Transaction.updateMany(
      { _id: { $in: ids }, status: 'pending' },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    res.json({ modifiedCount: result.modifiedCount, message: result.modifiedCount + ' transactions updated' });
  } catch (err) {
    console.error('Admin batchUpdateTransactionStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCards = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Card.countDocuments(query);
    const cards = await Card.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email username');

    res.json({ cards, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin getCards error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCardStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'frozen', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const card = await Card.findByIdAndUpdate(req.params.id, {
      status,
      isFrozen: status === 'frozen'
    }, { returnDocument: 'after' }).populate('userId', 'name email');
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json({ card, message: 'Card status updated' });
  } catch (err) {
    console.error('Admin updateCardStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRates = async (req, res) => {
  try {
    const rates = await Rate.find().sort({ pair: 1 });
    res.json({ rates });
  } catch (err) {
    console.error('Admin getRates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateRate = async (req, res) => {
  try {
    const { buy, sell, change, high24, low24 } = req.body;
    const update = {};
    if (buy !== undefined) update.buy = buy;
    if (sell !== undefined) update.sell = sell;
    if (change !== undefined) update.change = change;
    if (high24 !== undefined) update.high24 = high24;
    if (low24 !== undefined) update.low24 = low24;
    update.lastUpdated = new Date();

    const rate = await Rate.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    res.json({ rate, message: 'Rate updated' });
  } catch (err) {
    console.error('Admin updateRate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createRate = async (req, res) => {
  try {
    const { pair, name, buy, sell, icon, color, type } = req.body;
    if (!pair || !name || buy === undefined || sell === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await Rate.findOne({ pair });
    if (existing) return res.status(409).json({ error: 'Rate pair already exists' });

    const rate = await Rate.create({ pair, name, buy, sell, icon: icon || 'coins', color: color || '#0052FF', type: type || 'crypto' });
    res.status(201).json({ rate });
  } catch (err) {
    console.error('Admin createRate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteRate = async (req, res) => {
  try {
    const rate = await Rate.findByIdAndDelete(req.params.id);
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    res.json({ message: 'Rate deleted' });
  } catch (err) {
    console.error('Admin deleteRate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find().sort({ brand: 1 });
    res.json({ giftCards });
  } catch (err) {
    console.error('Admin getGiftCards error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateGiftCard = async (req, res) => {
  try {
    const { isActive, denominations } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (denominations) update.denominations = denominations;

    const giftCard = await GiftCard.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    if (!giftCard) return res.status(404).json({ error: 'Gift card not found' });
    res.json({ giftCard, message: 'Gift card updated' });
  } catch (err) {
    console.error('Admin updateGiftCard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createGiftCard = async (req, res) => {
  try {
    const { brand, icon, color, denominations } = req.body;
    if (!brand || !denominations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await GiftCard.findOne({ brand });
    if (existing) return res.status(409).json({ error: 'Brand already exists' });

    const giftCard = await GiftCard.create({ brand, icon: icon || 'gift', color: color || '#0052FF', denominations });
    res.status(201).json({ giftCard });
  } catch (err) {
    console.error('Admin createGiftCard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteGiftCard = async (req, res) => {
  try {
    const giftCard = await GiftCard.findByIdAndDelete(req.params.id);
    if (!giftCard) return res.status(404).json({ error: 'Gift card not found' });
    res.json({ message: 'Gift card deleted' });
  } catch (err) {
    console.error('Admin deleteGiftCard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    if (userId) {
      const notification = await Notification.create({ userId, title, message, type: type || 'system' });
      return res.status(201).json({ notification });
    }

    const users = await User.find({ isDeleted: false }).select('_id');
    const notifications = users.map(u => ({ userId: u._id, title, message, type: type || 'system' }));
    await Notification.insertMany(notifications);
    res.status(201).json({ message: 'Notification sent to all users', count: users.length });
  } catch (err) {
    console.error('Admin sendNotification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email username');
    res.json({ notifications, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin getNotifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserBalance = async (req, res) => {
  try {
    const { currency, amount, operation } = req.body;
    if (!['USD', 'BTC', 'ETH'].includes(currency)) return res.status(400).json({ error: 'Invalid currency' });
    if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'Amount must be a positive number' });
    if (!['set', 'add', 'subtract'].includes(operation)) return res.status(400).json({ error: 'Operation must be set, add, or subtract' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (operation === 'set') user.balance[currency] = amount;
    else if (operation === 'add') user.balance[currency] = (user.balance[currency] || 0) + amount;
    else if (operation === 'subtract') user.balance[currency] = Math.max(0, (user.balance[currency] || 0) - amount);

    await user.save();
    res.json({ balance: user.balance, message: 'Balance updated' });
  } catch (err) {
    console.error('Admin updateUserBalance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDepositClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const claims = await DepositClaim.find(filter)
      .populate('userId', 'name email balance')
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    console.error('Admin getDepositClaims error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reviewDepositClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be confirmed or rejected' });
    }

    const claim = await DepositClaim.findById(id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.status !== 'pending') return res.status(400).json({ error: 'Claim already reviewed' });

    claim.status = status;
    claim.adminNote = adminNote || '';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    if (status === 'confirmed') {
      const user = await User.findById(claim.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.balance.USD = (user.balance.USD || 0) + claim.amount;
      await user.save();

      await Transaction.create({
        userId: claim.userId,
        type: 'credit',
        category: 'deposit',
        title: 'Crypto Deposit (Verified)',
        amount: claim.amount,
        currency: 'USD',
        status: 'completed',
        date: new Date(),
        counterparty: 'BTC Deposit',
        txHash: claim.txHash || '',
        notes: 'Deposit claim verified by admin'
      });
    }

    res.json({ claim, message: status === 'confirmed' ? 'Deposit confirmed and balance updated' : 'Deposit claim rejected' });
  } catch (err) {
    console.error('Admin reviewDepositClaim error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
