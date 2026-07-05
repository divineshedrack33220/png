import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Card from '../models/Card.js';
import Wallet from '../models/Wallet.js';
import Notification from '../models/Notification.js';
import Rate from '../models/Rate.js';
import GiftCard from '../models/GiftCard.js';

export async function seedIfEmpty() {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) await mongoose.connect(process.env.MONGODB_URI);
  const userCount = await User.countDocuments().maxTimeMS(5000);
  if (userCount > 0) { console.log('Data exists, skipping seed'); return; }
  await seedInternal();
}

async function seedInternal() {
  try {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Card.deleteMany({});
    await Wallet.deleteMany({});
    await Notification.deleteMany({});
    await Rate.deleteMany({});
    await GiftCard.deleteMany({});

    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      username: 'admin',
      email: 'admin@coinexs.com',
      password: 'admin123',
      phone: '+1 (555) 000-0000',
      role: 'admin',
      kycStatus: 'verified',
      tier: 3,
      isLimited: false,
      plainPassword: 'admin123',
      kycDocuments: [{ type: 'ssn', front: '000-00-0000', status: 'approved', submittedAt: new Date(), reviewedAt: new Date() }],
      depositAddress: 'cxadmin000000000001',
      balance: { USD: 10000, BTC: 0.5, ETH: 5 },
      referralCode: 'ADMIN00',
      bankAccounts: [
        { id: 'BANK000', name: 'Admin Bank', type: 'Checking', last4: '0000', isDefault: true }
      ],
      settings: { theme: 'dark', currency: 'USD', language: 'English' }
    });

    console.log('Admin user created:', admin.username);

    const user = await User.create({
      name: 'John Miller',
      username: 'johnmiller',
      email: 'john.miller@gmail.com',
      password: 'password123',
      phone: '+1 (555) 123-4567',
      dateOfBirth: 'January 15, 1990',
      address: '123 Main St, New York, NY 10001',
      role: 'user',
      kycStatus: 'verified',
      plainPassword: 'password123',
      kycDocuments: [
        { type: 'ssn', front: '123-45-6789', status: 'approved', submittedAt: new Date('2026-07-03T09:00:00'), reviewedAt: new Date('2026-07-03T10:00:00') }
      ],
      tier: 2,
      isLimited: true,
      depositAddress: 'cxjohnmiller00001',
      balance: { USD: 350.62, BTC: 0.0012, ETH: 0.05 },
      referralCode: 'JOHN50',
      referralCount: 3,
      referralEarnings: 45.00,
      bankAccounts: [
        { id: 'BANK001', name: 'Chase Bank', type: 'Checking', last4: '7890', isDefault: true },
        { id: 'BANK002', name: 'Bank of America', type: 'Savings', last4: '3456', isDefault: false }
      ],
      settings: {
        theme: 'dark',
        currency: 'USD',
        language: 'English',
        twoFactor: false,
        biometrics: false,
        loginNotifications: true,
        transactionAlerts: true,
        recoveryEmail: 'john.miller@gmail.com',
        recoveryPhone: '+1 (555) 123-4567'
      }
    });

    console.log('User created:', user.username);

    await Card.create({
      userId: user._id,
      cardNumber: '4532914278654242',
      last4: '4242',
      cvv: '847',
      holder: 'JOHN MILLER',
      expiry: '12/28',
      type: 'Virtual',
      tier: 'Bronze',
      status: 'active',
      isFrozen: false,
      limits: { daily: 5000, monthly: 25000, perTx: 2500 },
      settings: { onlinePayments: true, atmWithdrawals: false, contactless: true, international: false },
      spending: {
        thisMonth: 1247.50,
        lastMonth: 2180.00,
        categories: [
          { name: 'Shopping', amount: 520.00, color: '#0052FF', percent: 42 },
          { name: 'Food & Drink', amount: 340.00, color: '#059669', percent: 27 },
          { name: 'Transport', amount: 187.50, color: '#D97706', percent: 15 },
          { name: 'Entertainment', amount: 200.00, color: '#7C3AED', percent: 16 }
        ],
        trend: [120, 180, 95, 210, 155, 280, 190, 245]
      },
      pin: '1234'
    });

    console.log('Card created');

    await Wallet.insertMany([
      { userId: user._id, coin: 'BTC', name: 'Bitcoin', icon: 'bitcoin', color: '#F7931A', balance: 0.0012, usdValue: 54.24, address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', trend: [1,2,1,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10] },
      { userId: user._id, coin: 'ETH', name: 'Ethereum', icon: 'ethereum', color: '#627EEA', balance: 0.05, usdValue: 122.50, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', trend: [1,1,2,1,2,2,3,5,4,6,5,7,6,8,7,9,8,10] },
      { userId: user._id, coin: 'USDT', name: 'Tether', icon: 'tether', color: '#26A17B', balance: 173.88, usdValue: 173.88, address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', trend: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] }
    ]);

    console.log('Wallets created');

    const transactions = [
      { userId: user._id, type: 'credit', category: 'deposit', title: 'Crypto Deposit', amount: 500, currency: 'USD', status: 'completed', date: new Date('2026-07-04T10:30:00'), counterparty: 'External Wallet' },
      { userId: user._id, type: 'debit', category: 'payment', title: 'Online Purchase', amount: 89.99, currency: 'USD', status: 'completed', date: new Date('2026-07-04T08:15:00'), counterparty: 'Amazon' },
      { userId: user._id, type: 'debit', category: 'transfer', title: 'Sent to Alice', amount: 150, currency: 'USD', status: 'completed', date: new Date('2026-07-03T16:45:00'), counterparty: 'alice' },
      { userId: user._id, type: 'credit', category: 'refund', title: 'Refund', amount: 34.50, currency: 'USD', status: 'completed', date: new Date('2026-07-03T12:00:00'), counterparty: 'Netflix' },
      { userId: user._id, type: 'pending', category: 'withdrawal', title: 'Withdrawal to Bank', amount: 200, currency: 'USD', status: 'pending', date: new Date('2026-07-02T14:30:00'), counterparty: 'Chase Bank ****7890' },
      { userId: user._id, type: 'debit', category: 'bitcoin', title: 'Bought BTC', amount: 120, currency: 'USD', status: 'completed', date: new Date('2026-07-02T10:00:00'), counterparty: 'BTC Purchase' },
      { userId: user._id, type: 'credit', category: 'deposit', title: 'Crypto Deposit', amount: 350, currency: 'USD', status: 'completed', date: new Date('2026-07-01T09:20:00'), counterparty: 'External Wallet' },
      { userId: user._id, type: 'debit', category: 'exchange', title: 'ETH to USDT Swap', amount: 75, currency: 'USD', status: 'completed', date: new Date('2026-06-30T18:00:00'), counterparty: 'Swap' },
      { userId: user._id, type: 'debit', category: 'payment', title: 'Grocery Store', amount: 67.23, currency: 'USD', status: 'completed', date: new Date('2026-06-29T11:45:00'), counterparty: 'Whole Foods' },
      { userId: user._id, type: 'credit', category: 'deposit', title: 'Top Up', amount: 100, currency: 'USD', status: 'completed', date: new Date('2026-06-28T08:30:00'), counterparty: 'Bank Transfer' }
    ];

    await Transaction.insertMany(transactions);
    console.log('Transactions created:', transactions.length);

    await Notification.insertMany([
      { userId: user._id, title: 'Payment Received', message: 'You received $500.00 from external wallet', type: 'transaction', read: false, action: { label: 'View', route: '/history' } },
      { userId: user._id, title: 'Card Transaction', message: 'Your card was charged $89.99 at Amazon', type: 'transaction', read: false, action: { label: 'View', route: '/history' } },
      { userId: user._id, title: 'Security Alert', message: 'New login from Chrome on Windows', type: 'security', read: false, action: { label: 'Verify', route: '/security' } },
      { userId: user._id, title: 'Promotion', message: 'Earn 5% cashback on all crypto deposits this week!', type: 'promotion', read: true },
      { userId: user._id, title: 'Account Update', message: 'Your KYC verification is pending review', type: 'system', read: true }
    ]);

    console.log('Notifications created');

    await Rate.insertMany([
      { pair: 'BTC/USD', name: 'Bitcoin', buy: 45200, sell: 44800, icon: 'bitcoin', color: '#F7931A', change: 2.34, high24: 45800, low24: 43900, marketCap: '887.4B', volume: '28.3B', supply: '19.6M BTC', trend: [1,2,1,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10], type: 'crypto', favorite: false },
      { pair: 'ETH/USD', name: 'Ethereum', buy: 2450, sell: 2420, icon: 'ethereum', color: '#627EEA', change: 1.87, high24: 2490, low24: 2380, marketCap: '294.1B', volume: '14.7B', supply: '120.2M ETH', trend: [1,1,2,1,2,2,3,5,4,6,5,7,6,8,7,9,8,10], type: 'crypto', favorite: true },
      { pair: 'USDT/USD', name: 'Tether', buy: 1.00, sell: 0.99, icon: 'tether', color: '#26A17B', change: 0.01, high24: 1.001, low24: 0.998, marketCap: '91.2B', volume: '52.1B', supply: '91.2B USDT', trend: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], type: 'crypto', favorite: false },
      { pair: 'SOL/USD', name: 'Solana', buy: 142.50, sell: 140.00, icon: 'solana', color: '#9945FF', change: 5.12, high24: 145.20, low24: 135.80, marketCap: '63.4B', volume: '3.8B', supply: '444.5M SOL', trend: [1,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10,9,11], type: 'crypto', favorite: false },
      { pair: 'XRP/USD', name: 'XRP', buy: 0.62, sell: 0.61, icon: 'bitcoin', color: '#00AAE4', change: -1.23, high24: 0.64, low24: 0.60, marketCap: '34.1B', volume: '1.2B', supply: '54.8B XRP', trend: [9,8,9,7,8,6,7,5,6,4,5,3,4,2,3,1,2,1], type: 'crypto', favorite: false },
      { pair: 'DOGE/USD', name: 'Dogecoin', buy: 0.082, sell: 0.080, icon: 'bitcoin', color: '#C2A633', change: -3.45, high24: 0.086, low24: 0.079, marketCap: '11.7B', volume: '890M', supply: '142.8B DOGE', trend: [8,7,6,7,5,6,4,5,3,4,2,3,1,2,1,1,1,1], type: 'crypto', favorite: false },
      { pair: 'GBP/USD', name: 'British Pound', buy: 1.28, sell: 1.27, icon: 'coins', color: '#0052FF', change: 0.15, high24: 1.282, low24: 1.274, marketCap: '-', volume: '-', supply: '-', trend: [1,1,2,2,1,1,2,2,1,1,2,2,1,1,2,2,1,1], type: 'fiat', favorite: false },
      { pair: 'EUR/USD', name: 'Euro', buy: 1.09, sell: 1.08, icon: 'coins', color: '#003399', change: 0.08, high24: 1.092, low24: 1.086, marketCap: '-', volume: '-', supply: '-', trend: [1,2,2,1,2,3,2,3,2,3,3,2,3,3,2,3,3,3], type: 'fiat', favorite: false },
      { pair: 'USDC/USD', name: 'USD Coin', buy: 1.00, sell: 0.99, icon: 'circle', color: '#2775CA', change: 0.00, high24: 1.001, low24: 0.999, marketCap: '32.8B', volume: '5.4B', supply: '32.8B USDC', trend: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], type: 'crypto', favorite: false },
      { pair: 'ADA/USD', name: 'Cardano', buy: 0.58, sell: 0.57, icon: 'bitcoin', color: '#0033AD', change: 4.21, high24: 0.60, low24: 0.55, marketCap: '20.5B', volume: '680M', supply: '35.4B ADA', trend: [1,2,2,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10], type: 'crypto', favorite: false },
      { pair: 'AVAX/USD', name: 'Avalanche', buy: 38.40, sell: 37.80, icon: 'bitcoin', color: '#E84142', change: 3.67, high24: 39.20, low24: 36.90, marketCap: '14.3B', volume: '520M', supply: '372.4M AVAX', trend: [1,2,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10,9], type: 'crypto', favorite: true },
      { pair: 'DOT/USD', name: 'Polkadot', buy: 7.82, sell: 7.68, icon: 'bitcoin', color: '#E6007A', change: -0.94, high24: 8.01, low24: 7.62, marketCap: '10.8B', volume: '340M', supply: '1.4B DOT', trend: [5,6,5,4,5,4,3,4,3,2,3,2,1,2,1,2,1,1], type: 'crypto', favorite: false }
    ]);

    console.log('Rates created');

    await GiftCard.insertMany([
      { brand: 'Amazon', icon: 'shopping-bag', color: '#FF9900', denominations: [25, 50, 100, 200] },
      { brand: 'Apple', icon: 'apple-logo', color: '#000000', denominations: [25, 50, 100, 200] },
      { brand: 'Google Play', icon: 'play-circle', color: '#00C853', denominations: [10, 25, 50, 100] },
      { brand: 'Steam', icon: 'game-controller', color: '#1B2838', denominations: [20, 50, 100] },
      { brand: 'Netflix', icon: 'tv', color: '#E50914', denominations: [25, 50, 100] },
      { brand: 'Spotify', icon: 'music-note', color: '#1DB954', denominations: [10, 30, 60] },
      { brand: 'Uber', icon: 'car', color: '#000000', denominations: [25, 50, 100] },
      { brand: 'PlayStation', icon: 'game-controller', color: '#003087', denominations: [20, 50, 100] },
      { brand: 'Xbox', icon: 'game-controller', color: '#107C10', denominations: [25, 50, 100] },
      { brand: 'Starbucks', icon: 'coffee', color: '#00704A', denominations: [10, 25, 50] }
    ]);

    console.log('Gift cards created');

    console.log('\n--- Seed Complete ---');
    console.log('Admin credentials:');
    console.log('  Email/Username: admin@coinexs.com');
    console.log('  Password: admin123');
    console.log('\nUser credentials:');
    console.log('  Email/Username: john.miller@gmail.com');
    console.log('  Password: password123');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

// Run directly: node backend/src/seed/seed.js
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  console.log('Running seed script directly');
  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('MongoDB connected for seeding');
    try {
      await seedInternal();
    } catch (e) { console.error('Seed failed:', e); process.exit(1); }
    await mongoose.disconnect();
    process.exit(0);
  });
}
