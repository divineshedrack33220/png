import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './src/config/db.js';
import { seedIfEmpty } from './src/seed/seed.js';
import { fetchLiveRates } from './src/controllers/rateController.js';

import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import transactionRoutes from './src/routes/transactions.js';
import cardRoutes from './src/routes/cards.js';
import walletRoutes from './src/routes/wallets.js';
import rateRoutes from './src/routes/rates.js';
import depositRoutes from './src/routes/deposits.js';
import notificationRoutes from './src/routes/notifications.js';
import giftCardRoutes from './src/routes/giftcards.js';
import adminRoutes from './src/routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(join(__dirname, '..', 'public'), {
  maxAge: '1s',
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/deposits', depositRoutes);

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

async function start() {
  await connectDB();
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Coinexs running on http://localhost:${PORT}`);
  });
  fetchLiveRates();
  setInterval(fetchLiveRates, 60000);
}
start();
