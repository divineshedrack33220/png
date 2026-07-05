import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const getTransactions = async (req, res) => {
  try {
    const { type, status, sort, search, limit = 50, skip = 0 } = req.query;

    const filter = { userId: req.userId };
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { date: -1 };
    if (sort === 'oldest') sortObj = { date: 1 };
    if (sort === 'amount_high') sortObj = { amount: -1 };
    if (sort === 'amount_low') sortObj = { amount: 1 };

    const transactions = await Transaction.find(filter)
      .sort(sortObj)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Transaction.countDocuments(filter);

    const summary = await Transaction.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ transactions, total, summary });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ transaction: tx });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { type, category, title, amount, currency, counterparty, fee, notes } = req.body;

    if (!type || !category || !title || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tx = await Transaction.create({
      userId: req.userId,
      type, category, title, amount,
      currency: currency || 'USD',
      counterparty: counterparty || '',
      fee: fee || 0,
      notes: notes || '',
      status: 'completed',
      date: new Date()
    });

    const user = await User.findById(req.userId);
    if (type === 'credit') {
      user.balance.USD = (user.balance.USD || 0) + amount;
    } else if (type === 'debit') {
      user.balance.USD = (user.balance.USD || 0) - amount;
    }
    await user.save();

    res.status(201).json({ transaction: tx });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransactionSummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: { type: '$type', status: '$status' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
