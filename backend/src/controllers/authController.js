import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Card from '../models/Card.js';
import Wallet from '../models/Wallet.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: existing.email === email ? 'Email already registered' : 'Username taken' });
    }

    const referralCode = username.toUpperCase() + crypto.randomBytes(3).toString('hex').toUpperCase();
    const depositAddress = 'bc1q' + crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name, username, email, password, phone, plainPassword: password,
      referralCode, depositAddress,
      avatar: '',
      balance: { USD: 0, BTC: 0, ETH: 0 }
    });

    await Card.create({
      userId: user._id,
      cardNumber: '4532' + Math.random().toString().slice(2, 6) + Math.random().toString().slice(2, 6) + Math.random().toString().slice(2, 6),
      last4: '4242',
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      holder: name.toUpperCase(),
      expiry: '12/28',
      tier: 'Bronze',
      spending: { thisMonth: 0, lastMonth: 0, categories: [], trend: Array(8).fill(0) }
    });

    await Wallet.insertMany([
      { userId: user._id, coin: 'BTC', name: 'Bitcoin', icon: 'bitcoin', color: '#F7931A', balance: 0, usdValue: 0, address: 'bc1q' + Math.random().toString(36).slice(2, 12), trend: [1,1,1,1,1,1,1,1] },
      { userId: user._id, coin: 'ETH', name: 'Ethereum', icon: 'ethereum', color: '#627EEA', balance: 0, usdValue: 0, address: '0x' + Math.random().toString(16).slice(2, 14), trend: [1,1,1,1,1,1,1,1] },
      { userId: user._id, coin: 'USDT', name: 'Tether', icon: 'tether', color: '#26A17B', balance: 0, usdValue: 0, address: 'T' + Math.random().toString(36).slice(2, 14), trend: [1,1,1,1,1,1,1,1] }
    ]);

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { login: loginField, password } = req.body;

    if (!loginField || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: loginField.toLowerCase() }, { username: loginField.toLowerCase() }]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ error: 'Account has been deleted' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account with that email' });

    res.json({ password: user.plainPassword || 'N/A' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
