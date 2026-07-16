import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';
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
import chatRoutes from './src/routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { default: User } = await import('./src/models/User.js');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;
  socket.join('user:' + user._id.toString());

  if (user.role === 'admin' || user.role === 'superadmin') {
    socket.join('admin');
  }

  socket.on('chat:join', (conversationId) => {
    socket.join('conv:' + conversationId);
  });

  socket.on('chat:leave', (conversationId) => {
    socket.leave('conv:' + conversationId);
  });

  socket.on('chat:typing', (data) => {
    if (user.role === 'admin' || user.role === 'superadmin') {
      io.to('user:' + data.userId).emit('chat:typing', { conversationId: data.conversationId, isTyping: true });
    } else {
      io.to('admin').emit('chat:typing', { conversationId: data.conversationId, userId: user._id, isTyping: true });
    }
  });

  socket.on('chat:stop_typing', (data) => {
    if (user.role === 'admin' || user.role === 'superadmin') {
      io.to('user:' + data.userId).emit('chat:stop_typing', { conversationId: data.conversationId });
    } else {
      io.to('admin').emit('chat:stop_typing', { conversationId: data.conversationId, userId: user._id });
    }
  });

  socket.on('disconnect', () => {});
});

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
app.use('/api/chat', chatRoutes);

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

async function start() {
  await connectDB();
  await seedIfEmpty();
  httpServer.listen(PORT, () => {
    console.log(`Coinexs running on http://localhost:${PORT}`);
  });
  fetchLiveRates();
  setInterval(fetchLiveRates, 60000);
}
start();
