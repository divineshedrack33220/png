const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function api(endpoint, options = {}) {
  const token = localStorage.getItem('coinexs_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const opts = { ...options };
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(API_BASE + endpoint, { ...opts, headers: { ...headers, ...opts.headers } });
      const data = await res.json();
      if (!res.ok) {
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw new ApiError(data.error || 'Request failed', res.status);
      }
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      throw new ApiError(err.message || 'Network error', 0);
    }
  }
}

function getAvatar(name) {
  if (!name) name = 'U';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#0052FF','#059669','#7C3AED','#D97706','#DC2626','#2563EB','#0891B2','#4F46E5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bg = colors[Math.abs(hash) % colors.length];
  return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22' + encodeURIComponent(bg) + '%22 width=%22100%22 height=%22100%22 rx=%2250%22/%3E%3Ctext x=%2250%22 y=%2258%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22 font-weight=%22bold%22 font-family=%22sans-serif%22%3E' + encodeURIComponent(initials) + '%3C/text%3E%3C/svg%3E';
}

const Store = {
  user: null,
  transactions: [],
  rates: [],
  cards: [],
  notifications: [],
  wallets: [],
  walletsLoaded: false,
  giftCards: [],
  giftCardsLoaded: false,

  billProviders: {
    airtime: [
      { name: 'T-Mobile', icon: 'phone', color: '#E20074' },
      { name: 'AT&T', icon: 'phone', color: '#009FDB' },
      { name: 'Verizon', icon: 'phone', color: '#CD040B' }
    ],
    data: [
      { name: 'T-Mobile', icon: 'wifi', color: '#E20074' },
      { name: 'AT&T', icon: 'wifi', color: '#009FDB' },
      { name: 'Verizon', icon: 'wifi', color: '#CD040B' }
    ],
    cable: [
      { name: 'Xfinity', icon: 'tv', color: '#E6E6E6' },
      { name: 'Spectrum', icon: 'tv', color: '#0078D4' },
      { name: 'Dish', icon: 'tv', color: '#00A5E0' }
    ],
    electricity: [
      { name: 'ConEdison', icon: 'zap', color: '#FF6600' },
      { name: 'National Grid', icon: 'zap', color: '#00529B' },
      { name: 'Pacific Gas', icon: 'zap', color: '#C41230' }
    ]
  },

  support: {
    faqs: [
      { q: 'How do I deposit crypto?', a: 'Go to your wallet, select a cryptocurrency, and copy the deposit address. Send funds from any external wallet to this address. Deposits typically arrive within 10-30 minutes.' },
      { q: 'What are the fees?', a: 'Coinexs charges zero fees on crypto deposits. Withdrawal fees vary by network. Card transactions have a 1.5% fee. Currency conversion uses real-time interbank rates.' },
      { q: 'How do I get a virtual card?', a: 'Navigate to the Cards tab and fund your wallet with at least $1,000 to unlock your virtual card.' },
      { q: 'Is my money safe?', a: 'Yes. Coinexs uses bank-grade encryption, 2FA, and cold storage for crypto assets. USD balances are FDIC insured up to $250,000.' },
      { q: 'How do I enable 2FA?', a: 'Go to Profile > Settings > Security and toggle on Two-Factor Authentication.' },
      { q: 'How long do withdrawals take?', a: 'Crypto withdrawals are processed within minutes. USD withdrawals to bank accounts take 1-3 business days via ACH.' }
    ]
  },

  onFirstVisit: !localStorage.getItem('coinexs_visited'),
  setOnboarded() {
    localStorage.setItem('coinexs_visited', 'true');
    this.onFirstVisit = false;
  },
  isLoggedIn() {
    return !!localStorage.getItem('coinexs_token');
  },
  login(token) {
    localStorage.setItem('coinexs_token', token);
  },
  logout() {
    localStorage.removeItem('coinexs_token');
    this.user = null;
    this.transactions = [];
    this.rates = [];
    this.cards = [];
    this.notifications = [];
    this.wallets = [];
    this.giftCards = [];
  },
  async forgotPassword(email) {
    return api('/auth/forgot-password', { method: 'POST', body: { email } });
  },
  getTheme() {
    return localStorage.getItem('coinexs_theme') || 'dark';
  },
  get userSafe() {
    return this.user || { name: '', username: '', email: '', avatar: '', role: 'user', kycStatus: 'none', isSuspended: false, tier: 1, balance: { USD: 0, BTC: 0, ETH: 0 }, isLimited: true, phone: '', dateOfBirth: '', address: '', bankAccounts: [], settings: { theme: 'dark', currency: 'USD', language: 'English' }, referralCode: '', referralCount: 0, referralEarnings: 0 };
  },
  setTheme(theme) {
    localStorage.setItem('coinexs_theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  },

  async fetchUser() {
    const data = await api('/users/profile');
    this.user = data.user;
    return this.user;
  },

  async fetchTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await api('/transactions' + (query ? '?' + query : ''));
    this.transactions = data.transactions;
    return data;
  },

  async fetchTransaction(id) {
    return await api('/transactions/' + id);
  },

  async createTransaction(txData) {
    const data = await api('/transactions', { method: 'POST', body: JSON.stringify(txData) });
    return data.transaction;
  },
  async withdrawCrypto(walletId, address, amount) {
    return await api('/wallets/withdraw', { method: 'POST', body: JSON.stringify({ walletId, address, amount }) });
  },
  async submitKycDocument(docType, front, back, selfie) {
    const data = await api('/users/kyc', { method: 'POST', body: JSON.stringify({ docType, front, back, selfie }) });
    if (data.user) this.user = data.user;
    return data;
  },
  async getTierInfo() {
    return await api('/users/tier-info');
  },

  async fetchRates(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await api('/rates' + (query ? '?' + query : ''));
    this.rates = data.rates;
    return this.rates;
  },

  async toggleFavorite(pair) {
    return await api('/rates/' + encodeURIComponent(pair) + '/favorite', { method: 'POST' });
  },

  async fetchCards() {
    const data = await api('/cards');
    this.cards = data.cards;
    return this.cards;
  },

  async freezeCard(id) {
    const data = await api('/cards/' + id + '/freeze', { method: 'POST' });
    this.cards = this.cards.map(c => c._id === id ? data.card : c);
    return data;
  },

  async changeCardPin(id, currentPin, newPin) {
    return await api('/cards/' + id + '/pin', { method: 'POST', body: JSON.stringify({ currentPin, newPin }) });
  },

  async updateCardSettings(id, settings) {
    const data = await api('/cards/' + id + '/settings', { method: 'PUT', body: JSON.stringify(settings) });
    this.cards = this.cards.map(c => c._id === id ? data.card : c);
    return data;
  },

  async blockCard(id, reason) {
    const data = await api('/cards/' + id + '/block', { method: 'POST', body: JSON.stringify({ reason }) });
    this.cards = this.cards.map(c => c._id === id ? data.card : c);
    return data;
  },

  async replaceCard(id, reason) {
    const data = await api('/cards/' + id + '/replace', { method: 'POST', body: JSON.stringify({ reason }) });
    this.cards = this.cards.map(c => c._id === id ? data.card : c);
    return data;
  },

  async fetchWallets() {
    const data = await api('/wallets');
    this.wallets = data.wallets;
    this.walletsLoaded = true;
    return this.wallets;
  },

  async fetchNotifications() {
    const data = await api('/notifications');
    this.notifications = data.notifications;
    return { notifications: this.notifications, unreadCount: data.unreadCount };
  },

  async markNotificationRead(id) {
    return await api('/notifications/' + id + '/read', { method: 'POST' });
  },

  async markAllNotificationsRead() {
    return await api('/notifications/read-all', { method: 'POST' });
  },

  async fetchGiftCards() {
    const data = await api('/giftcards');
    this.giftCards = data.giftCards;
    this.giftCardsLoaded = true;
    return this.giftCards;
  },

  async updateProfile(updates) {
    const data = await api('/users/profile', { method: 'PUT', body: JSON.stringify(updates) });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async updateEmail(email) {
    const data = await api('/users/email', { method: 'PUT', body: JSON.stringify({ email }) });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async updateUsername(username) {
    const data = await api('/users/username', { method: 'PUT', body: JSON.stringify({ username }) });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async changePassword(currentPassword, newPassword) {
    return await api('/users/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
  },

  async updateSettings(settings) {
    const data = await api('/users/settings', { method: 'PUT', body: JSON.stringify(settings) });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async addBankAccount(bankData) {
    const data = await api('/users/bank', { method: 'POST', body: JSON.stringify(bankData) });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async removeBankAccount(bankId) {
    const data = await api('/users/bank/' + bankId, { method: 'DELETE' });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async setDefaultBank(bankId) {
    const data = await api('/users/bank/' + bankId + '/default', { method: 'PUT' });
    if (data.user) this.user = data.user;
    return this.user;
  },

  async deleteAccount(confirm) {
    return await api('/users/delete', { method: 'POST', body: JSON.stringify({ confirm }) });
  },

  async register(userData) {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    this.login(data.token);
    this.user = data.user;
    return data;
  },

  async loginWithCredentials(loginField, password) {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ login: loginField, password }) });
    this.login(data.token);
    this.user = data.user;
    return data;
  },

  async loadAll() {
    if (!this.isLoggedIn()) return;
    try {
      await Promise.all([
        this.fetchUser(),
        this.fetchTransactions(),
        this.fetchRates(),
        this.fetchCards(),
        this.fetchWallets(),
        this.fetchNotifications(),
        this.fetchGiftCards()
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  },

  async adminGetStats() { return await api('/admin/stats'); },
  async adminGetUsers(params) { const q = new URLSearchParams(params).toString(); return await api('/admin/users' + (q ? '?' + q : '')); },
  async adminGetUserDetail(id) { return await api('/admin/users/' + id); },
  async adminUpdateUserRole(id, role) { return await api('/admin/users/' + id + '/role', { method: 'PUT', body: JSON.stringify({ role }) }); },
  async adminSuspendUser(id, suspend, reason) { return await api('/admin/users/' + id + '/suspend', { method: 'PUT', body: JSON.stringify({ suspend, reason }) }); },
  async adminReviewKyc(id, action, reason) { return await api('/admin/users/' + id + '/kyc', { method: 'PUT', body: JSON.stringify({ action, reason }) }); },
  async adminUpdateUserBalance(id, currency, amount, operation) { return await api('/admin/users/' + id + '/balance', { method: 'PUT', body: JSON.stringify({ currency, amount, operation }) }); },
  async adminDeleteUser(id) { return await api('/admin/users/' + id, { method: 'DELETE' }); },
  async adminGetTransactions(params) { const q = new URLSearchParams(params).toString(); return await api('/admin/transactions' + (q ? '?' + q : '')); },
  async adminUpdateTransactionStatus(id, status) { return await api('/admin/transactions/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }); },
  async adminBatchUpdateTransactionStatus(ids, status) { return await api('/admin/transactions/batch-status', { method: 'POST', body: JSON.stringify({ ids, status }) }); },
  async adminGetCards(params) { const q = new URLSearchParams(params).toString(); return await api('/admin/cards' + (q ? '?' + q : '')); },
  async adminUpdateCardStatus(id, status) { return await api('/admin/cards/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }); },
  async adminGetRates() { return await api('/admin/rates'); },
  async adminUpdateRate(id, data) { return await api('/admin/rates/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async adminCreateRate(data) { return await api('/admin/rates', { method: 'POST', body: JSON.stringify(data) }); },
  async adminDeleteRate(id) { return await api('/admin/rates/' + id, { method: 'DELETE' }); },
  async adminGetGiftCards() { return await api('/admin/giftcards'); },
  async adminUpdateGiftCard(id, data) { return await api('/admin/giftcards/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async adminCreateGiftCard(data) { return await api('/admin/giftcards', { method: 'POST', body: JSON.stringify(data) }); },
  async adminDeleteGiftCard(id) { return await api('/admin/giftcards/' + id, { method: 'DELETE' }); },
  async adminGetNotifications(params) { const q = new URLSearchParams(params).toString(); return await api('/admin/notifications' + (q ? '?' + q : '')); },
  async adminSendNotification(data) { return await api('/admin/notifications', { method: 'POST', body: JSON.stringify(data) }); },
  async claimDeposit(amount, txHash) { return await api('/deposits/claim', { method: 'POST', body: JSON.stringify({ amount, txHash }) }); },
  async adminGetDepositClaims(status) { const q = status ? '?status=' + status : ''; return await api('/admin/deposits' + q); },
  async adminReviewDepositClaim(id, status, adminNote) { return await api('/admin/deposits/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status, adminNote }) }); }
};

const state = {
  currentRoute: '',
  previousRoute: '',
  balanceVisible: true,
  loading: false,
  theme: Store.getTheme(),
  direction: 'forward',
  params: {}
};

function initStore() {
  Store.setTheme(state.theme);
}

function simulateDelay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateNetwork() {
  return simulateDelay(300 + Math.random() * 400);
}

/* ─── Polling Utility ─── */

const Poller = {
  _timers: {},
  start(id, fn, interval = 10000) {
    this.stop(id);
    fn();
    this._timers[id] = setInterval(fn, interval);
  },
  stop(id) {
    if (this._timers[id]) { clearInterval(this._timers[id]); delete this._timers[id]; }
  },
  stopAll() {
    Object.keys(this._timers).forEach(k => this.stop(k));
  }
};
