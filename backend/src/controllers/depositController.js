import DepositClaim from '../models/DepositClaim.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const DEPOSIT_ADDRESS = 'bc1qpch9s36nxu6n7v6hjrmg3s56672alhmttk5k2k';

export const claimDeposit = async (req, res) => {
  try {
    const { amount, txHash } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit is $100' });
    }

    const claim = await DepositClaim.create({
      userId: req.user._id,
      amount: Math.round(amount * 100) / 100,
      address: DEPOSIT_ADDRESS,
      txHash: txHash || ''
    });

    res.status(201).json({ claim, message: 'Deposit claim submitted. Awaiting confirmation.' });
  } catch (err) {
    console.error('Claim deposit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPendingClaims = async (req, res) => {
  try {
    const claims = await DepositClaim.find({ status: 'pending' })
      .populate('userId', 'name email balance')
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    console.error('Get pending claims error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const claims = await DepositClaim.find(filter)
      .populate('userId', 'name email balance')
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    console.error('Get all claims error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reviewClaim = async (req, res) => {
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
    console.error('Review claim error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
