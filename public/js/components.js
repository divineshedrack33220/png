function createIcon(name, size) {
  if (size === undefined) size = 24;
  var map = {
    home: 'ph-house',
    'home-filled': 'ph-fill ph-house',
    history: 'ph-clock-counter-clockwise',
    'history-filled': 'ph-fill ph-clock-counter-clockwise',
    cards: 'ph-credit-card',
    'cards-filled': 'ph-fill ph-credit-card',
    rates: 'ph-chart-line',
    'rates-filled': 'ph-fill ph-chart-line',
    profile: 'ph-user',
    'profile-filled': 'ph-fill ph-user',
    arrow_left: 'ph-caret-left',
    bell: 'ph-bell',
    eye: 'ph-eye',
    'eye-off': 'ph-eye-slash',
    plus: 'ph-plus',
    send: 'ph-paper-plane-tilt',
    repeat: 'ph-arrows-clockwise',
    chevron_right: 'ph-caret-right',
    chevron_down: 'ph-caret-down',
    x: 'ph-x',
    check: 'ph-check',
    alert: 'ph-warning-circle',
    filter: 'ph-funnel',
    search: 'ph-magnifying-glass',
    mail: 'ph-envelope',
    lock: 'ph-lock-key',
    user: 'ph-user',
    phone: 'ph-phone',
    sun: 'ph-sun',
    moon: 'ph-moon',
    shield: 'ph-shield-check',
    'shield-check': 'ph-shield-check',
    bank: 'ph-bank',
    users: 'ph-users',
    headphones: 'ph-headphones',
    log_out: 'ph-sign-out',
    arrow_down: 'ph-arrow-down',
    arrow_up: 'ph-arrow-up',
    copy: 'ph-copy',
    qr: 'ph-qr-code',
    message_circle: 'ph-chat-circle-text',
    globe: 'ph-globe',
    image: 'ph-image',
    camera: 'ph-camera',
    gift: 'ph-gift',
    bitcoin: 'ph-currency-btc',
    ethereum: 'ph-coin',
    solana: 'ph-currency-circle-dollar',
    tether: 'ph-currency-dollar',
    fingerprint: 'ph-fingerprint',
    face_id: 'ph-scan',
    info: 'ph-info',
    'alert-triangle': 'ph-warning',
    'refresh-cw': 'ph-arrow-clockwise',
    share: 'ph-share-fat',
    'file-text': 'ph-file-text',
    tv: 'ph-television',
    zap: 'ph-lightning',
    activity: 'ph-activity',
    grid: 'ph-squares-four',
    'credit-card': 'ph-credit-card',
    forex: 'ph-arrows-left-right',
    circle: 'ph-circle',
    'shopping-bag': 'ph-shopping-bag',
    'fork-knife': 'ph-fork-knife',
    car: 'ph-car',
    'play-circle': 'ph-play-circle',
    'dots-three': 'ph-dots-three',
    thermometer: 'ph-thermometer',
    wifi: 'ph-wifi',
    'nfc': 'ph-nfc',
    key: 'ph-key',
    ban: 'ph-prohibit',
    freeze: 'ph-snowflake',
    replace: 'ph-arrow-u-up-left',
    receipt: 'ph-receipt',
    'chart-bar': 'ph-chart-bar',
    'piggy-bank': 'ph-piggy-bank',
    'trend-up': 'ph-trend-up',
    'trend-down': 'ph-trend-down',
    'apple-logo': 'ph-apple-logo',
    'game-controller': 'ph-game-controller',
    'music-note': 'ph-music-note',
    'coffee': 'ph-coffee',
    'paper-plane': 'ph-paper-plane-tilt',
    'user-plus': 'ph-user-plus',
    'star': 'ph-star',
    'gear': 'ph-gear',
    'shield': 'ph-shield',
    'lock': 'ph-lock-key',
    'fingerprint': 'ph-fingerprint',
    'scan': 'ph-scan',
    'clock': 'ph-clock',
    'chat-circle': 'ph-chat-circle',
    'ticket': 'ph-ticket',
    'arrows-clockwise': 'ph-arrows-clockwise',
    'arrow-down-left': 'ph-arrow-down-left',
    'arrow-up-right': 'ph-arrow-up-right',
    'currency-dollar': 'ph-currency-dollar',
    'identification-card': 'ph-identification-card',
    'download-simple': 'ph-download-simple',
    'devices': 'ph-devices',
    'pencil_simple': 'ph-pencil-simple',
    'calendar': 'ph-calendar',
    'map-pin': 'ph-map-pin',
    'at': 'ph-at',
    'arrow-down-right': 'ph-arrow-down-right',
    'arrows-down-up': 'ph-arrows-down-up',
    'chart-line-up': 'ph-chart-line-up',
    'coins': 'ph-coins',
    'magnifying-glass': 'ph-magnifying-glass',
    'star-fill': 'ph-fill ph-star',
    'caret-right': 'ph-caret-right',
    'warning': 'ph-warning',
    'trash': 'ph-trash'
  };
  var cls = map[name];
  if (!cls) return '';
  return '<i class="ph ' + cls + '" style="font-size:' + size + 'px"></i>';
}

function el(tag, attrs, children) {
  if (attrs === undefined) attrs = {};
  if (children === undefined) children = [];
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') { element.className = value; }
    else if (key === 'htmlFor') { element.setAttribute('for', value); }
    else if (key.startsWith('on') && typeof value === 'function') { element.addEventListener(key.slice(2).toLowerCase(), value); }
    else if (key === 'style' && typeof value === 'object') { Object.assign(element.style, value); }
    else if (key === 'dataset') { Object.assign(element.dataset, value); }
    else if (value !== false && value !== null && value !== undefined) {
      if (typeof value === 'boolean') { if (value) element.setAttribute(key, ''); }
      else { element.setAttribute(key, value); }
    }
  }
  if (typeof children === 'string') { element.textContent = children; }
  else if (Array.isArray(children)) {
    children.forEach(function(child) {
      if (typeof child === 'string') { element.appendChild(document.createTextNode(child)); }
      else if (child instanceof Node) { element.appendChild(child); }
    });
  }
  return element;
}

function iconButton(iconName, size, onClick) {
  if (size === undefined) size = 24;
  var btn = el('button', { className: 'btn-icon', 'aria-label': iconName.replace(/_/g, ' ') });
  btn.innerHTML = createIcon(iconName, size);
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

/* ===== Skeletons ===== */
function skeletonHome() {
  return '<div class="skeleton" style="height:240px;width:100%;border-radius:0 0 var(--radius-xl) var(--radius-xl)" aria-hidden="true">' +
    '<div style="padding:24px 16px">' +
    '<div class="skeleton skeleton-circle" style="width:40px;height:40px;margin-bottom:16px"></div>' +
    '<div class="skeleton skeleton-text" style="width:40%"></div>' +
    '<div class="skeleton skeleton-text-lg" style="width:60%;margin-bottom:24px"></div>' +
    '<div style="display:flex;gap:24px;justify-content:center">' +
    '<div class="skeleton skeleton-circle" style="width:56px;height:56px"></div>'.repeat(3) +
    '</div></div></div>' +
    '<div class="skeleton skeleton-card" style="margin:16px;height:200px" aria-hidden="true"></div>'.repeat(2);
}

function skeletonList(count) {
  if (count === undefined) count = 4;
  var html = '<div aria-hidden="true">';
  for (var i = 0; i < count; i++) {
    html += '<div class="skeleton-row"><div class="skeleton skeleton-circle" style="width:40px;height:40px;flex-shrink:0"></div><div style="flex:1"><div class="skeleton skeleton-text" style="width:60%"></div><div class="skeleton skeleton-text-sm"></div></div><div class="skeleton skeleton-text" style="width:50px"></div></div>';
  }
  return html + '</div>';
}

function skeletonCard() {
  return '<div class="skeleton skeleton-card" style="height:180px" aria-hidden="true"></div>';
}

function skeletonGrid() {
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px" aria-hidden="true">';
  for (var i = 0; i < 4; i++) {
    html += '<div class="skeleton skeleton-rect" style="height:100px"></div>';
  }
  return html + '</div>';
}

/* ===== Haptic ===== */
function haptic(type) {
  var patterns = { light: [10], medium: [20], heavy: [30], success: [10, 50, 10], error: [50, 50, 50], click: [5] };
  try { if (navigator.vibrate && patterns[type]) navigator.vibrate(patterns[type]); } catch (e) {}
}

/* ===== Toast with Actions ===== */
function showToast(message, type, options) {
  if (type === undefined) type = 'info';
  if (options === undefined) options = {};
  var container = document.getElementById('toast-container');
  if (!container) return;

  haptic(type === 'error' ? 'error' : type === 'success' ? 'success' : 'light');

  // Clear stale toasts
  var existing = container.querySelectorAll('.toast');
  existing.forEach(function(t) { t.remove(); });

  var toast = el('div', { className: 'toast toast-' + type + ' toast-enter', role: 'alert', 'aria-live': 'assertive' });
  var iconMap = { success: 'check', error: 'x', info: 'info', warning: 'alert-triangle' };
  var iconWrapper = el('div', { style: { width: '20px', height: '20px', flexShrink: '0' } });
  iconWrapper.innerHTML = createIcon(iconMap[type] || 'info', 20);
  toast.appendChild(iconWrapper);

  var msgSpan = el('span', { style: { flex: '1', fontSize: '14px' } }, message);
  toast.appendChild(msgSpan);

  if (options.action) {
    var actionBtn = el('button', {
      className: 'toast-action-btn',
      onClick: function() {
        toast.remove();
        if (typeof options.action === 'function') options.action();
      }
    }, options.actionLabel || 'Retry');
    toast.appendChild(actionBtn);
  }

  container.appendChild(toast);
  setTimeout(function() {
    toast.className = 'toast toast-' + type + ' toast-leave';
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 250);
  }, options.duration || 3500);
}

/* ===== Empty State ===== */
function emptyState(iconName, title, description, action) {
  var container = el('div', { className: 'empty-state' });
  var iconWrap = el('div', { className: 'empty-state-icon' });
  iconWrap.innerHTML = createIcon(iconName || 'info', 32);
  container.appendChild(iconWrap);
  container.appendChild(el('div', { className: 'empty-state-title' }, title || 'Nothing here'));
  if (description) container.appendChild(el('div', { className: 'empty-state-desc' }, description));
  if (action) {
    var btn = el('button', {
      className: 'btn btn-primary mt-16',
      onClick: action.onClick
    }, action.label || 'Retry');
    container.appendChild(btn);
  }
  return container;
}

/* ===== Error State ===== */
function errorState(message, onRetry) {
  return emptyState('alert-triangle', 'Something went wrong', message || 'Please try again.', onRetry ? { label: 'Retry', onClick: onRetry } : null);
}

/* ===== Nav ===== */
function createNav() {
  var nav = document.getElementById('bottom-nav');
  if (!nav) return;
  var tabs = [
    { route: '/home', label: 'Home', icon: 'home', iconFilled: 'home-filled' },
    { route: '/history', label: 'History', icon: 'history', iconFilled: 'history-filled' },
    { route: '/cards', label: 'Cards', icon: 'cards', iconFilled: 'cards-filled' },
    { route: '/rates', label: 'Rates', icon: 'rates', iconFilled: 'rates-filled' },
    { route: '/profile', label: 'Profile', icon: 'profile', iconFilled: 'profile-filled' }
  ];
  nav.innerHTML = '';
  tabs.forEach(function(tab) {
    var item = el('button', {
      className: 'nav-item',
      'data-route': tab.route,
      'aria-label': tab.label + ' tab',
      onClick: function() { haptic('light'); navigate(tab.route); },
      onKeyDown: function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); haptic('light'); navigate(tab.route); } }
    });
    var iconWrapper = el('div', { className: 'nav-icon' });
    iconWrapper.innerHTML = createIcon(tab.icon, 24);
    item.appendChild(iconWrapper);
    item.appendChild(el('div', { className: 'nav-label' }, tab.label));
    nav.appendChild(item);
  });
}

function updateNav(route) {
  var items = document.querySelectorAll('.nav-item');
  items.forEach(function(item) {
    var r = item.dataset.route;
    var isActive = r === route && ['/home', '/history', '/cards', '/rates', '/profile'].includes(route);
    item.classList.toggle('active', isActive);
    var iconWrapper = item.querySelector('.nav-icon');
    if (iconWrapper) {
      var tabs = { '/home': 'home', '/history': 'history', '/cards': 'cards', '/rates': 'rates', '/profile': 'profile' };
      var tab = tabs[r];
      iconWrapper.innerHTML = createIcon(isActive ? tab + '-filled' : tab, 24);
    }
  });
}

function showNav(show) {
  var nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = show ? 'flex' : 'none';
}

/* ===== Avatar ===== */
function avatarImg(src, alt, size) {
  if (alt === undefined) alt = 'Avatar';
  if (size === undefined) size = 40;
  var wrapper = el('div', { className: 'home-avatar', style: { width: size + 'px', height: size + 'px' } });
  var img = el('img', {
    src: src,
    alt: alt,
    style: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }
  });
  wrapper.appendChild(img);
  return wrapper;
}

/* ===== Transaction Row ===== */
function createTransactionRow(tx) {
  var row = el('div', { className: 'transaction-row', dataset: { id: tx.id }, role: 'button', tabindex: '0', 'aria-label': tx.title });
  var iconMap = { 'arrow-up': 'arrow_up', 'arrow-down': 'arrow_down', send: 'send', refresh: 'refresh-cw', tv: 'tv', bitcoin: 'bitcoin', repeat: 'repeat' };
  var iconName = iconMap[tx.icon] || 'arrow_up';

  var icon = el('div', { className: 'tx-icon', style: { background: tx.color + '20', color: tx.color } });
  icon.innerHTML = createIcon(iconName, 20);

  var info = el('div', { className: 'tx-info' });
  info.appendChild(el('div', { className: 'tx-title' }, tx.title));
  var d = new Date(tx.date);
  info.appendChild(el('div', { className: 'tx-date' }, d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })));

  var amount = el('div', { className: 'tx-amount' });
  var prefix = tx.type === 'credit' ? '+' : '-';
  amount.appendChild(el('div', { className: 'tx-value' }, prefix + formatCurrency(tx.amount)));
  var statusEl = el('div', { className: 'tx-status' });
  if (tx.status === 'pending') {
    statusEl.className = 'tx-status badge badge-pending';
    statusEl.textContent = 'Pending';
  } else if (tx.status === 'completed') {
    statusEl.className = 'tx-status badge badge-success';
    statusEl.textContent = 'Completed';
  } else {
    statusEl.className = 'tx-status badge badge-danger';
    statusEl.textContent = 'Failed';
  }
  amount.appendChild(statusEl);

  row.appendChild(icon);
  row.appendChild(info);
  row.appendChild(amount);

  // Keyboard support
  row.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      row.click();
    }
  });

  return row;
}

/* ===== Pagination Dots ===== */
function createPaginationDots(count, activeIndex) {
  if (activeIndex === undefined) activeIndex = 0;
  var container = el('div', { className: 'onboarding-pagination', 'aria-hidden': 'true' });
  for (var i = 0; i < count; i++) {
    container.appendChild(el('div', { className: 'onboarding-dot' + (i === activeIndex ? ' active' : '') }));
  }
  return container;
}

/* ===== Toggle ===== */
function createToggle(onChange, initial) {
  if (initial === undefined) initial = false;
  var toggle = el('button', {
    className: 'toggle' + (initial ? ' active' : ''),
    'aria-label': 'Toggle',
    'aria-checked': initial ? 'true' : 'false',
    role: 'switch',
    onClick: function() {
      toggle.classList.toggle('active');
      var isActive = toggle.classList.contains('active');
      toggle.setAttribute('aria-checked', isActive ? 'true' : 'false');
      if (onChange) onChange(isActive);
      haptic('light');
    }
  });
  return toggle;
}

/* ===== Formatting ===== */
var CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', BRL: 'R$' };
var CURRENCY_LOCALES = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', NGN: 'en-NG', BRL: 'pt-BR' };

function getUserCurrency() {
  return (typeof Store !== 'undefined' && Store.user && Store.user.settings && Store.user.settings.currency) || 'USD';
}

function formatCurrency(amount, currency) {
  if (currency === undefined) currency = getUserCurrency();
  var locale = CURRENCY_LOCALES[currency] || 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function formatCurrencyCompact(amount, currency) {
  if (currency === undefined) currency = getUserCurrency();
  var sym = CURRENCY_SYMBOLS[currency] || '$';
  if (amount >= 1e12) return sym + (amount / 1e12).toFixed(1) + 'T';
  if (amount >= 1e9) return sym + (amount / 1e9).toFixed(1) + 'B';
  if (amount >= 1e6) return sym + (amount / 1e6).toFixed(1) + 'M';
  if (amount >= 1e3) return sym + (amount / 1e3).toFixed(1) + 'K';
  return sym + amount.toFixed(2);
}

function formatDate(dateStr) {
  var d = new Date(dateStr);
  var locale = CURRENCY_LOCALES[getUserCurrency()] || 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function groupBy(list, keyFn) {
  var map = {};
  list.forEach(function(item) {
    var key = keyFn(item);
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return map;
}

/* ===== Modal ===== */
function openModal(contentFn, options) {
  if (options === undefined) options = {};
  var root = document.getElementById('modal-root');
  if (!root) return null;

  var backdrop = el('div', { className: 'modal-backdrop' });
  var sheet = el('div', { className: 'modal-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' });

  var closeModal = function() {
    backdrop.classList.remove('open');
    sheet.classList.remove('open');
    setTimeout(function() {
      root.innerHTML = '';
      document.body.classList.remove('modal-open');
      // Restore focus
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    }, 300);
  };

  backdrop.addEventListener('click', closeModal);

  // Close on Escape
  var escHandler = function(e) {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', escHandler);

  var content = contentFn(closeModal);
  if (content) sheet.appendChild(content);

  root.appendChild(backdrop);
  root.appendChild(sheet);

  document.body.classList.add('modal-open');
  requestAnimationFrame(function() {
    backdrop.classList.add('open');
    sheet.classList.add('open');
    // Focus first focusable element
    var firstFocusable = sheet.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  });

  return {
    closeModal: function() {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
}

/* ===== Translations ===== */
var TRANSLATIONS = {
  English: {
    'wallet_balance': 'Wallet Balance', 'keep_up_good_work': 'Keep up the good work',
    'send_money': 'Send Money', 'receive': 'Receive', 'swap': 'Swap',
    'add_money': 'Add Money', 'withdraw': 'Withdraw', 'convert': 'Convert',
    'transaction_history': 'Transaction History', 'view_all': 'View All',
    'money_in': 'Money In', 'money_out': 'Money Out',
    'recent_transactions': 'Recent Transactions', 'no_transactions': 'No transactions yet',
    'crypto': 'Crypto', 'giftcards': 'Gift Cards', 'rewards': 'Rewards',
    'personal_info': 'Personal Info', 'bank_account': 'Bank Account', 'security': 'Security',
    'language': 'Language', 'currency': 'Default Currency', 'refer_and_earn': 'Refer and Earn',
    'theme': 'Theme', 'notification': 'Notification',
    'account_verification': 'Account Verification', 'help_center': 'Help Center',
    'terms_of_service': 'Terms of Service', 'privacy_policy': 'Privacy Policy',
    'remove_account': 'Remove Account', 'log_out': 'Log Out',
    'full_name': 'Full Name', 'email': 'Email', 'phone': 'Phone',
    'date_of_birth': 'Date of Birth', 'address': 'Address', 'username': 'Username',
    'change_pin': 'Change PIN', 'change_password': 'Change Password',
    'biometric_login': 'Biometric Login', 'biometric_desc': 'Use fingerprint or face ID',
    'two_factor': 'Two-Factor Auth', 'two_factor_desc': 'Add extra security layer',
    'login_activity': 'Login Activity', 'active_devices': 'Active Devices',
    'recovery_email': 'Recovery Email', 'recovery_phone': 'Recovery Phone',
    'not_set': 'Not set', 'verified': 'Verified',
    'you_pay': 'You Pay', 'you_receive': 'You Receive',
    'swap_now': 'Swap Now', 'swap_completed': 'Swap completed successfully!',
    'insufficient_balance': 'Insufficient balance', 'enter_valid_amount': 'Enter a valid amount',
    'balance': 'Balance',
    'total_referrals': 'Total Referrals', 'total_earned': 'Total Earned',
    'no_referrals': 'No referrals yet', 'share_code': 'Share Code',
    'referral_code_copied': 'Referral code copied!',
    'gift_card_store': 'Gift Card Store', 'buy_now': 'Buy Now',
    'card_locked': 'Card Locked', 'card_gated_msg': 'You need at least $1,000 in your wallet to access your virtual card.',
    'fund_wallet': 'Fund Wallet',
    'search': 'Search', 'all': 'All', 'favorites': 'Favorites',
    'market_cap': 'Market Cap', 'volume_24h': '24h Volume',
    'top_gainers': 'Top Gainers', 'top_losers': 'Top Losers',
    'from': 'From', 'to': 'To', 'convert_to': 'Convert To',
    'available': 'Available', 'send_to': 'Send to',
    'quick_amounts': 'Quick amounts',
    'deposit_address': 'Deposit Address', 'copy_address': 'Copy Address',
    'minimum_deposit': 'Minimum deposit',
    'linked_accounts': 'Linked Accounts', 'add_bank': '+ Add Bank Account',
    'set_default': 'Set as Default', 'remove': 'Remove',
    'are_you_sure': 'Are you sure?',
    'delete_confirm': 'Type DELETE to confirm',
    'back': 'Back', 'cancel': 'Cancel', 'save': 'Save',
    'apply': 'Apply', 'confirm': 'Confirm', 'done': 'Done',
    'loading': 'Loading...', 'error': 'Error',
    'copied': 'Copied!', 'updated': 'updated',
    'welcome_back': 'Welcome back', 'hello': 'Hello',
    'overview': 'Overview', 'details': 'Details',
    'recent_activity': 'Recent Activity',
    'total_balance': 'Total Balance',
    'upgrade': 'Upgrade', 'locked': 'Locked',
    'no_results': 'No results found',
    'faq': 'FAQ', 'contact_support': 'Contact Support',
    'categories': 'Categories',
    'quick_actions': 'Quick Actions',
    'bill_pay': 'Bill Pay',
    'your_referral_code': 'Your Referral Code',
    'give_5_get_5': 'Give $5, Get $5',
    'referral_desc': 'Invite friends to Coinexs. When they sign up and make their first deposit, you both earn $5.',
    'pending_rewards': 'Pending Rewards',
    'recent_referrals': 'Recent Referrals',
    'friends': 'Friends',
    'settings': 'Settings',
    'instant_value': 'Instant value for every giftcard', 'zero_fees': 'Zero fees on your first trade',
    'crypto_fingertips': 'Crypto at your fingertips', 'tap_add_money': 'Tap Add Money to fund your wallet.',
    'unlock_card': 'Unlock Your Virtual Card', 'fund_min_amount': 'Fund your wallet with at least $1,000 to unlock your virtual card.',
    'card_holder': 'CARD HOLDER', 'expires': 'EXPIRES', 'cvv': 'CVV',
    'card_frozen': 'Card Frozen', 'frozen': 'Frozen', 'active': 'Active',
    'tap_to_unfreeze': 'Tap card to unfreeze',
    'spending_limits': 'Spending Limits', 'daily': 'Daily', 'monthly': 'Monthly',
    'per_transaction': 'Per Transaction',
    'online_payments': 'Online Payments', 'atm_withdrawals': 'ATM Withdrawals',
    'contactless_payments': 'Contactless Payments', 'international_payments': 'International Payments',
    'report_lost': 'Report Lost / Stolen',
    'filter_transactions': 'Filter Transactions', 'received': 'Received', 'sent': 'Sent',
    'this_week': 'This Week', 'this_month': 'This Month', 'earlier': 'Earlier',
    'no_transactions_found': 'No transactions found', 'try_adjusting': 'Try adjusting your search or filters',
    'live_chat': 'Live Chat', 'email_support': 'Email Support', 'phone_support': 'Phone Support',
    'airtime': 'Airtime', 'data': 'Data', 'cable_tv': 'Cable TV', 'electricity': 'Electricity',
  },
  Spanish: {
    'wallet_balance': 'Saldo de la billetera', 'keep_up_good_work': 'Sigue así',
    'send_money': 'Enviar dinero', 'receive': 'Recibir', 'swap': 'Intercambiar',
    'add_money': 'Agregar dinero', 'withdraw': 'Retirar', 'convert': 'Convertir',
    'transaction_history': 'Historial de transacciones', 'view_all': 'Ver todo',
    'money_in': 'Dinero recibido', 'money_out': 'Dinero enviado',
    'recent_transactions': 'Transacciones recientes', 'no_transactions': 'Sin transacciones aún',
    'crypto': 'Cripto', 'giftcards': 'Tarjetas de regalo', 'rewards': 'Recompensas',
    'personal_info': 'Información personal', 'bank_account': 'Cuenta bancaria', 'security': 'Seguridad',
    'language': 'Idioma', 'currency': 'Moneda predeterminada', 'refer_and_earn': 'Referir y ganar',
    'theme': 'Tema', 'notification': 'Notificación',
    'account_verification': 'Verificación de cuenta', 'help_center': 'Centro de ayuda',
    'terms_of_service': 'Términos de servicio', 'privacy_policy': 'Política de privacidad',
    'remove_account': 'Eliminar cuenta', 'log_out': 'Cerrar sesión',
    'full_name': 'Nombre completo', 'email': 'Correo electrónico', 'phone': 'Teléfono',
    'date_of_birth': 'Fecha de nacimiento', 'address': 'Dirección', 'username': 'Nombre de usuario',
    'change_pin': 'Cambiar PIN', 'change_password': 'Cambiar contraseña',
    'biometric_login': 'Inicio biométrico', 'biometric_desc': 'Usar huella dactilar o Face ID',
    'two_factor': 'Autenticación de dos factores', 'two_factor_desc': 'Agregar capa de seguridad extra',
    'login_activity': 'Actividad de inicio de sesión', 'active_devices': 'Dispositivos activos',
    'recovery_email': 'Correo de recuperación', 'recovery_phone': 'Teléfono de recuperación',
    'not_set': 'No configurado', 'verified': 'Verificado',
    'you_pay': 'Tú pagas', 'you_receive': 'Tú recibes',
    'swap_now': 'Intercambiar ahora', 'swap_completed': '¡Intercambio completado con éxito!',
    'insufficient_balance': 'Saldo insuficiente', 'enter_valid_amount': 'Ingresa un monto válido',
    'balance': 'Saldo',
    'total_referrals': 'Total de referidos', 'total_earned': 'Total ganado',
    'no_referrals': 'Sin referidos aún', 'share_code': 'Compartir código',
    'referral_code_copied': '¡Código de referido copiado!',
    'gift_card_store': 'Tienda de tarjetas de regalo', 'buy_now': 'Comprar ahora',
    'card_locked': 'Tarjeta bloqueada', 'card_gated_msg': 'Necesitas al menos $1,000 en tu billetera para acceder a tu tarjeta virtual.',
    'fund_wallet': 'Recargar billetera',
    'search': 'Buscar', 'all': 'Todos', 'favorites': 'Favoritos',
    'market_cap': 'Capitalización', 'volume_24h': 'Volumen 24h',
    'top_gainers': 'Mayores subidas', 'top_losers': 'Mayores bajadas',
    'from': 'De', 'to': 'A', 'convert_to': 'Convertir a',
    'available': 'Disponible', 'send_to': 'Enviar a',
    'quick_amounts': 'Montos rápidos',
    'deposit_address': 'Dirección de depósito', 'copy_address': 'Copiar dirección',
    'minimum_deposit': 'Depósito mínimo',
    'linked_accounts': 'Cuentas vinculadas', 'add_bank': '+ Agregar cuenta bancaria',
    'set_default': 'Establecer como predeterminada', 'remove': 'Eliminar',
    'are_you_sure': '¿Estás seguro?',
    'delete_confirm': 'Escribe DELETE para confirmar',
    'back': 'Atrás', 'cancel': 'Cancelar', 'save': 'Guardar',
    'apply': 'Aplicar', 'confirm': 'Confirmar', 'done': 'Listo',
    'loading': 'Cargando...', 'error': 'Error',
    'copied': '¡Copiado!', 'updated': 'actualizado',
    'hello': 'Hola', 'welcome_back': 'Bienvenido de nuevo',
    'overview': 'Resumen', 'details': 'Detalles',
    'recent_activity': 'Actividad reciente',
    'total_balance': 'Saldo total',
    'upgrade': 'Mejorar', 'locked': 'Bloqueado',
    'no_results': 'No se encontraron resultados',
    'faq': 'Preguntas frecuentes', 'contact_support': 'Contactar soporte',
    'categories': 'Categorías',
    'quick_actions': 'Acciones rápidas',
    'bill_pay': 'Pago de facturas',
    'your_referral_code': 'Tu código de referido',
    'give_5_get_5': 'Da $5, Recibe $5',
    'referral_desc': 'Invita amigos a Coinexs. Cuando se registren y hagan su primer depósito, ambos ganan $5.',
    'pending_rewards': 'Recompensas pendientes',
    'recent_referrals': 'Referidos recientes',
    'friends': 'Amigos',
    'settings': 'Configuración',
    'instant_value': 'Valor instantáneo para cada tarjeta de regalo', 'zero_fees': 'Sin comisiones en tu primer trade',
    'crypto_fingertips': 'Cripto al alcance de tu mano', 'tap_add_money': 'Toca Agregar dinero para recargar tu billetera.',
    'unlock_card': 'Desbloquea tu tarjeta virtual', 'fund_min_amount': 'Recarga tu billetera con al menos $1,000 para desbloquear tu tarjeta virtual.',
    'card_holder': 'TITULAR', 'expires': 'VENCE', 'cvv': 'CVV',
    'card_frozen': 'Tarjeta congelada', 'frozen': 'Congelada', 'active': 'Activa',
    'tap_to_unfreeze': 'Toca la tarjeta para descongelar',
    'spending_limits': 'Límites de gasto', 'daily': 'Diario', 'monthly': 'Mensual',
    'per_transaction': 'Por transacción',
    'online_payments': 'Pagos en línea', 'atm_withdrawals': 'Retiros en cajero',
    'contactless_payments': 'Pagos sin contacto', 'internional_payments': 'Pagos internacionales',
    'report_lost': 'Reportar pérdida / robo',
    'filter_transactions': 'Filtrar transacciones', 'received': 'Recibido', 'sent': 'Enviado',
    'this_week': 'Esta semana', 'this_month': 'Este mes', 'earlier': 'Antes',
    'no_transactions_found': 'No se encontraron transacciones', 'try_adjusting': 'Intenta ajustar tu búsqueda o filtros',
    'live_chat': 'Chat en vivo', 'email_support': 'Soporte por correo', 'phone_support': 'Soporte por teléfono',
    'airtime': 'Tiempo aéreo', 'data': 'Datos', 'cable_tv': 'TV por cable', 'electricity': 'Electricidad',
  },
  French: {
    'wallet_balance': 'Solde du portefeuille', 'keep_up_good_work': 'Continuez comme ça',
    'send_money': 'Envoyer de l\'argent', 'receive': 'Recevoir', 'swap': 'Échanger',
    'add_money': 'Ajouter de l\'argent', 'withdraw': 'Retirer', 'convert': 'Convertir',
    'transaction_history': 'Historique des transactions', 'view_all': 'Tout voir',
    'money_in': 'Argent reçu', 'money_out': 'Argent envoyé',
    'recent_transactions': 'Transactions récentes', 'no_transactions': 'Aucune transaction',
    'crypto': 'Crypto', 'giftcards': 'Cartes cadeaux', 'rewards': 'Récompenses',
    'personal_info': 'Informations personnelles', 'bank_account': 'Compte bancaire',
    'security': 'Sécurité', 'language': 'Langue', 'currency': 'Devise par défaut',
    'refer_and_earn': 'Parrainer et gagner', 'theme': 'Thème',
    'notification': 'Notification',
    'account_verification': 'Vérification du compte', 'help_center': 'Centre d\'aide',
    'terms_of_service': 'Conditions d\'utilisation', 'privacy_policy': 'Politique de confidentialité',
    'remove_account': 'Supprimer le compte', 'log_out': 'Déconnexion',
    'full_name': 'Nom complet', 'email': 'E-mail', 'phone': 'Téléphone',
    'date_of_birth': 'Date de naissance', 'address': 'Adresse', 'username': 'Nom d\'utilisateur',
    'change_pin': 'Changer le PIN', 'change_password': 'Changer le mot de passe',
    'biometric_login': 'Connexion biométrique', 'biometric_desc': 'Utiliser empreinte ou Face ID',
    'two_factor': 'Authentification à deux facteurs', 'two_factor_desc': 'Ajouter une couche de sécurité',
    'login_activity': 'Activité de connexion', 'active_devices': 'Appareils actifs',
    'recovery_email': 'E-mail de récupération', 'recovery_phone': 'Téléphone de récupération',
    'not_set': 'Non défini', 'verified': 'Vérifié',
    'you_pay': 'Vous payez', 'you_receive': 'Vous recevez',
    'swap_now': 'Échanger maintenant', 'swap_completed': 'Échange réussi !',
    'insufficient_balance': 'Solde insuffisant', 'enter_valid_amount': 'Entrez un montant valide',
    'balance': 'Solde',
    'total_referrals': 'Total des parrainages', 'total_earned': 'Total gagné',
    'no_referrals': 'Aucun parrainage', 'share_code': 'Partager le code',
    'referral_code_copied': 'Code de parrainage copié !',
    'gift_card_store': 'Boutique de cartes cadeaux', 'buy_now': 'Acheter',
    'card_locked': 'Carte bloquée', 'card_gated_msg': 'Vous avez besoin d\'au moins 1 000 $ pour accéder à votre carte virtuelle.',
    'fund_wallet': 'Alimenter le portefeuille',
    'search': 'Rechercher', 'all': 'Tout', 'favorites': 'Favoris',
    'market_cap': 'Capitalisation', 'volume_24h': 'Volume 24h',
    'top_gainers': 'Plus forte hausse', 'top_losers': 'Plus forte baisse',
    'from': 'De', 'to': 'À', 'convert_to': 'Convertir en',
    'available': 'Disponible', 'send_to': 'Envoyer à',
    'quick_amounts': 'Montants rapides',
    'deposit_address': 'Adresse de dépôt', 'copy_address': 'Copier l\'adresse',
    'minimum_deposit': 'Dépôt minimum',
    'linked_accounts': 'Comptes liés', 'add_bank': '+ Ajouter un compte bancaire',
    'set_default': 'Définir par défaut', 'remove': 'Supprimer',
    'are_you_sure': 'Êtes-vous sûr ?',
    'delete_confirm': 'Tapez SUPPRIMER pour confirmer',
    'back': 'Retour', 'cancel': 'Annuler', 'save': 'Enregistrer',
    'apply': 'Appliquer', 'confirm': 'Confirmer', 'done': 'Terminé',
    'loading': 'Chargement...', 'error': 'Erreur',
    'copied': 'Copié !', 'updated': 'mis à jour',
    'hello': 'Bonjour', 'welcome_back': 'Bienvenue',
    'overview': 'Aperçu', 'details': 'Détails',
    'recent_activity': 'Activité récente',
    'total_balance': 'Solde total',
    'upgrade': 'Passer au supérieur', 'locked': 'Verrouillé',
    'no_results': 'Aucun résultat trouvé',
    'faq': 'FAQ', 'contact_support': 'Contacter le support',
    'categories': 'Catégories',
    'quick_actions': 'Actions rapides', 'bill_pay': 'Paiement de factures',
    'your_referral_code': 'Votre code de parrainage',
    'give_5_get_5': 'Donnez 5 $, recevez 5 $',
    'referral_desc': 'Invitez des amis sur Coinexs. Quand ils s\'inscrivent et font leur premier dépôt, vous gagnez tous les deux 5 $.',
    'pending_rewards': 'Récompenses en attente',
    'recent_referrals': 'Parrainages récents',
    'friends': 'Amis',
    'settings': 'Paramètres',
    'instant_value': 'Valeur instantanée pour chaque carte cadeau', 'zero_fees': 'Zéro frais sur votre premier trade',
    'crypto_fingertips': 'La crypto à portée de main', 'tap_add_money': 'Appuyez sur Ajouter pour alimenter votre portefeuille.',
    'unlock_card': 'Débloquez votre carte virtuelle', 'fund_min_amount': 'Alimentez votre portefeuille avec au moins 1 000 $ pour débloquer votre carte virtuelle.',
    'card_holder': 'TITULAIRE', 'expires': 'EXPIRE', 'cvv': 'CVV',
    'card_frozen': 'Carte gelée', 'frozen': 'Gelée', 'active': 'Active',
    'tap_to_unfreeze': 'Appuyez sur la carte pour dégeler',
    'spending_limits': 'Limites de dépenses', 'daily': 'Journalier', 'monthly': 'Mensuel',
    'per_transaction': 'Par transaction',
    'online_payments': 'Paiements en ligne', 'atm_withdrawals': 'Retraits ATM',
    'contactless_payments': 'Paiements sans contact', 'international_payments': 'Paiements internationaux',
    'report_lost': 'Signaler perte / vol',
    'filter_transactions': 'Filtrer les transactions', 'received': 'Reçu', 'sent': 'Envoyé',
    'this_week': 'Cette semaine', 'this_month': 'Ce mois-ci', 'earlier': 'Plus tôt',
    'no_transactions_found': 'Aucune transaction trouvée', 'try_adjusting': 'Essayez d\'ajuster votre recherche ou filtres',
    'live_chat': 'Chat en direct', 'email_support': 'Support par e-mail', 'phone_support': 'Support par téléphone',
    'airtime': 'Crédit téléphonique', 'data': 'Données', 'cable_tv': 'Télévision', 'electricity': 'Électricité',
  },
  German: {
    'wallet_balance': 'Guthaben', 'keep_up_good_work': 'Machen Sie so weiter',
    'send_money': 'Geld senden', 'receive': 'Empfangen', 'swap': 'Tauschen',
    'add_money': 'Geld aufladen', 'withdraw': 'Abheben', 'convert': 'Umwandeln',
    'transaction_history': 'Transaktionsverlauf', 'view_all': 'Alle anzeigen',
    'money_in': 'Eingehend', 'money_out': 'Ausgehend',
    'recent_transactions': 'Letzte Transaktionen', 'no_transactions': 'Keine Transaktionen',
    'crypto': 'Krypto', 'giftcards': 'Geschenkkarten', 'rewards': 'Belohnungen',
    'personal_info': 'Persönliche Daten', 'bank_account': 'Bankverbindung',
    'security': 'Sicherheit', 'language': 'Sprache', 'currency': 'Standardwährung',
    'refer_and_earn': 'Freunde einladen', 'theme': 'Design',
    'notification': 'Benachrichtigung',
    'account_verification': 'Kontoüberprüfung', 'help_center': 'Hilfezentrum',
    'terms_of_service': 'Nutzungsbedingungen', 'privacy_policy': 'Datenschutzrichtlinie',
    'remove_account': 'Konto löschen', 'log_out': 'Abmelden',
    'full_name': 'Vollständiger Name', 'email': 'E-Mail', 'phone': 'Telefon',
    'date_of_birth': 'Geburtsdatum', 'address': 'Adresse', 'username': 'Benutzername',
    'change_pin': 'PIN ändern', 'change_password': 'Passwort ändern',
    'biometric_login': 'Biometrische Anmeldung', 'biometric_desc': 'Fingerabdruck oder Face ID',
    'two_factor': 'Zwei-Faktor-Authentifizierung', 'two_factor_desc': 'Zusätzliche Sicherheitsschicht',
    'login_activity': 'Anmeldeaktivität', 'active_devices': 'Aktive Geräte',
    'recovery_email': 'Wiederherstellungs-E-Mail', 'recovery_phone': 'Wiederherstellungs-Telefon',
    'not_set': 'Nicht eingestellt', 'verified': 'Verifiziert',
    'you_pay': 'Sie zahlen', 'you_receive': 'Sie erhalten',
    'swap_now': 'Jetzt tauschen', 'swap_completed': 'Tausch erfolgreich!',
    'insufficient_balance': 'Unzureichendes Guthaben', 'enter_valid_amount': 'Geben Sie einen gültigen Betrag ein',
    'balance': 'Guthaben',
    'total_referrals': 'Gesamte Weiterempfehlungen', 'total_earned': 'Gesamt verdient',
    'no_referrals': 'Noch keine Weiterempfehlungen', 'share_code': 'Code teilen',
    'referral_code_copied': 'Empfehlungscode kopiert!',
    'gift_card_store': 'Geschenkkarten-Shop', 'buy_now': 'Jetzt kaufen',
    'card_locked': 'Karte gesperrt', 'card_gated_msg': 'Sie benötigen mindestens 1.000 $, um auf Ihre virtuelle Karte zuzugreifen.',
    'fund_wallet': 'Guthaben aufladen',
    'search': 'Suchen', 'all': 'Alle', 'favorites': 'Favoriten',
    'market_cap': 'Marktkapitalisierung', 'volume_24h': '24h Volumen',
    'top_gainers': 'Top-Gewinner', 'top_losers': 'Top-Verlierer',
    'from': 'Von', 'to': 'An', 'convert_to': 'Umwandeln in',
    'available': 'Verfügbar', 'send_to': 'Senden an',
    'quick_amounts': 'Schnellbeträge',
    'deposit_address': 'Einzahlungsadresse', 'copy_address': 'Adresse kopieren',
    'minimum_deposit': 'Mindesteinzahlung',
    'linked_accounts': 'Verknüpfte Konten', 'add_bank': '+ Bankverbindung hinzufügen',
    'set_default': 'Als Standard festlegen', 'remove': 'Entfernen',
    'are_you_sure': 'Sind Sie sicher?',
    'delete_confirm': 'LÖSCHEN eingeben zum Bestätigen',
    'back': 'Zurück', 'cancel': 'Abbrechen', 'save': 'Speichern',
    'apply': 'Anwenden', 'confirm': 'Bestätigen', 'done': 'Fertig',
    'loading': 'Laden...', 'error': 'Fehler',
    'copied': 'Kopiert!', 'updated': 'aktualisiert',
    'hello': 'Hallo', 'welcome_back': 'Willkommen zurück',
    'overview': 'Übersicht', 'details': 'Details',
    'recent_activity': 'Letzte Aktivität',
    'total_balance': 'Gesamtguthaben',
    'upgrade': 'Upgrade', 'locked': 'Gesperrt',
    'no_results': 'Keine Ergebnisse gefunden',
    'faq': 'FAQ', 'contact_support': 'Support kontaktieren',
    'categories': 'Kategorien',
    'quick_actions': 'Schnellaktionen', 'bill_pay': 'Rechnung bezahlen',
    'your_referral_code': 'Ihr Empfehlungscode',
    'give_5_get_5': 'Gib 5 $, erhalte 5 $',
    'referral_desc': 'Laden Sie Freunde zu Coinexs ein. Wenn sie sich anmelden und ihre erste Einzahlung tätigen, erhalten Sie beide 5 $.',
    'pending_rewards': 'Ausstehende Belohnungen',
    'recent_referrals': 'Letzte Weiterempfehlungen',
    'friends': 'Freunde',
    'settings': 'Einstellungen',
    'instant_value': 'Sofortiger Wert für jede Geschenkkarte', 'zero_fees': 'Keine Gebühren beim ersten Trade',
    'crypto_fingertips': 'Krypto auf Knopfdruck', 'tap_add_money': 'Tippen Sie auf Aufladen, um Ihr Guthaben zu füllen.',
    'unlock_card': 'Entsperren Sie Ihre virtuelle Karte', 'fund_min_amount': 'Laden Sie Ihr Guthaben mit mindestens 1.000 $ auf, um Ihre virtuelle Karte freizuschalten.',
    'card_holder': 'KARTENINHABER', 'expires': 'ABLAUF', 'cvv': 'CVV',
    'card_frozen': 'Karte eingefroren', 'frozen': 'Eingefroren', 'active': 'Aktiv',
    'tap_to_unfreeze': 'Tippen Sie auf die Karte zum Auftauen',
    'spending_limits': 'Ausgabelimits', 'daily': 'Täglich', 'monthly': 'Monatlich',
    'per_transaction': 'Pro Transaktion',
    'online_payments': 'Online-Zahlungen', 'atm_withdrawals': 'Bargeldabhebungen',
    'contactless_payments': 'Kontaktlose Zahlungen', 'international_payments': 'Internationale Zahlungen',
    'report_lost': 'Verlust / Diebstahl melden',
    'filter_transactions': 'Transaktionen filtern', 'received': 'Empfangen', 'sent': 'Gesendet',
    'this_week': 'Diese Woche', 'this_month': 'Diesen Monat', 'earlier': 'Früher',
    'no_transactions_found': 'Keine Transaktionen gefunden', 'try_adjusting': 'Versuchen Sie Ihre Suche oder Filter anzupassen',
    'live_chat': 'Live-Chat', 'email_support': 'E-Mail-Support', 'phone_support': 'Telefon-Support',
    'airtime': 'Guthaben', 'data': 'Daten', 'cable_tv': 'Kabel-TV', 'electricity': 'Strom',
  },
  Portuguese: {
    'wallet_balance': 'Saldo da carteira', 'keep_up_good_work': 'Continue assim',
    'send_money': 'Enviar dinheiro', 'receive': 'Receber', 'swap': 'Trocar',
    'add_money': 'Adicionar dinheiro', 'withdraw': 'Retirar', 'convert': 'Converter',
    'transaction_history': 'Histórico de transações', 'view_all': 'Ver tudo',
    'money_in': 'Entrada', 'money_out': 'Saída',
    'recent_transactions': 'Transações recentes', 'no_transactions': 'Sem transações',
    'crypto': 'Cripto', 'giftcards': 'Cartões presente', 'rewards': 'Recompensas',
    'personal_info': 'Informações pessoais', 'bank_account': 'Conta bancária',
    'security': 'Segurança', 'language': 'Idioma', 'currency': 'Moeda padrão',
    'refer_and_earn': 'Indique e ganhe', 'theme': 'Tema',
    'notification': 'Notificação',
    'account_verification': 'Verificação de conta', 'help_center': 'Central de ajuda',
    'terms_of_service': 'Termos de serviço', 'privacy_policy': 'Política de privacidade',
    'remove_account': 'Remover conta', 'log_out': 'Sair',
    'full_name': 'Nome completo', 'email': 'E-mail', 'phone': 'Telefone',
    'date_of_birth': 'Data de nascimento', 'address': 'Endereço', 'username': 'Nome de usuário',
    'change_pin': 'Alterar PIN', 'change_password': 'Alterar senha',
    'biometric_login': 'Login biométrico', 'biometric_desc': 'Usar impressão digital ou Face ID',
    'two_factor': 'Autenticação de dois fatores', 'two_factor_desc': 'Adicionar camada extra de segurança',
    'login_activity': 'Atividade de login', 'active_devices': 'Dispositivos ativos',
    'recovery_email': 'E-mail de recuperação', 'recovery_phone': 'Telefone de recuperação',
    'not_set': 'Não definido', 'verified': 'Verificado',
    'you_pay': 'Você paga', 'you_receive': 'Você recebe',
    'swap_now': 'Trocar agora', 'swap_completed': 'Troca concluída com sucesso!',
    'insufficient_balance': 'Saldo insuficiente', 'enter_valid_amount': 'Digite um valor válido',
    'balance': 'Saldo',
    'total_referrals': 'Total de indicações', 'total_earned': 'Total ganho',
    'no_referrals': 'Nenhuma indicação ainda', 'share_code': 'Compartilhar código',
    'referral_code_copied': 'Código de indicação copiado!',
    'gift_card_store': 'Loja de cartões presente', 'buy_now': 'Comprar agora',
    'card_locked': 'Cartão bloqueado', 'card_gated_msg': 'Você precisa de pelo menos R$ 1.000 para acessar seu cartão virtual.',
    'fund_wallet': 'Recarregar carteira',
    'search': 'Pesquisar', 'all': 'Todos', 'favorites': 'Favoritos',
    'market_cap': 'Capitalização', 'volume_24h': 'Volume 24h',
    'top_gainers': 'Maiores altas', 'top_losers': 'Maiores baixas',
    'from': 'De', 'to': 'Para', 'convert_to': 'Converter para',
    'available': 'Disponível', 'send_to': 'Enviar para',
    'quick_amounts': 'Valores rápidos',
    'deposit_address': 'Endereço de depósito', 'copy_address': 'Copiar endereço',
    'minimum_deposit': 'Depósito mínimo',
    'linked_accounts': 'Contas vinculadas', 'add_bank': '+ Adicionar conta bancária',
    'set_default': 'Definir como padrão', 'remove': 'Remover',
    'are_you_sure': 'Tem certeza?',
    'delete_confirm': 'Digite DELETE para confirmar',
    'back': 'Voltar', 'cancel': 'Cancelar', 'save': 'Salvar',
    'apply': 'Aplicar', 'confirm': 'Confirmar', 'done': 'Concluído',
    'loading': 'Carregando...', 'error': 'Erro',
    'copied': 'Copiado!', 'updated': 'atualizado',
    'hello': 'Olá', 'welcome_back': 'Bem-vindo',
    'overview': 'Visão geral', 'details': 'Detalhes',
    'recent_activity': 'Atividade recente',
    'total_balance': 'Saldo total',
    'upgrade': 'Fazer upgrade', 'locked': 'Bloqueado',
    'no_results': 'Nenhum resultado encontrado',
    'faq': 'Perguntas frequentes', 'contact_support': 'Falar com suporte',
    'categories': 'Categorias',
    'quick_actions': 'Ações rápidas', 'bill_pay': 'Pagar contas',
    'your_referral_code': 'Seu código de indicação',
    'give_5_get_5': 'Indique R$ 5, ganhe R$ 5',
    'referral_desc': 'Convide amigos para o Coinexs. Quando eles se cadastrarem e fizerem o primeiro depósito, vocês dois ganham R$ 5.',
    'pending_rewards': 'Recompensas pendentes',
    'recent_referrals': 'Indicações recentes',
    'friends': 'Amigos',
    'settings': 'Configurações',
    'instant_value': 'Valor instantâneo para cada cartão presente', 'zero_fees': 'Zero taxas na primeira troca',
    'crypto_fingertips': 'Cripto ao alcance da mão', 'tap_add_money': 'Toque em Adicionar para recarregar sua carteira.',
    'unlock_card': 'Desbloqueie seu cartão virtual', 'fund_min_amount': 'Recarregue sua carteira com pelo menos R$ 1.000 para desbloquear seu cartão virtual.',
    'card_holder': 'TITULAR', 'expires': 'VALIDADE', 'cvv': 'CVV',
    'card_frozen': 'Cartão congelado', 'frozen': 'Congelado', 'active': 'Ativo',
    'tap_to_unfreeze': 'Toque no cartão para descongelar',
    'spending_limits': 'Limites de gasto', 'daily': 'Diário', 'monthly': 'Mensal',
    'per_transaction': 'Por transação',
    'online_payments': 'Pagamentos online', 'atm_withdrawals': 'Saques no caixa',
    'contactless_payments': 'Pagamentos sem contato', 'international_payments': 'Pagamentos internacionais',
    'report_lost': 'Reportar perda / roubo',
    'filter_transactions': 'Filtrar transações', 'received': 'Recebido', 'sent': 'Enviado',
    'this_week': 'Esta semana', 'this_month': 'Este mês', 'earlier': 'Antes',
    'no_transactions_found': 'Nenhuma transação encontrada', 'try_adjusting': 'Tente ajustar sua pesquisa ou filtros',
    'live_chat': 'Chat ao vivo', 'email_support': 'Suporte por e-mail', 'phone_support': 'Suporte por telefone',
    'airtime': 'Crédito', 'data': 'Dados', 'cable_tv': 'TV a cabo', 'electricity': 'Eletricidade',
  }
};

function t(key) {
  var lang = (typeof Store !== 'undefined' && Store.user && Store.user.settings && Store.user.settings.language) || 'English';
  if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];
  if (TRANSLATIONS['English'] && TRANSLATIONS['English'][key]) return TRANSLATIONS['English'][key];
  return key;
}

function getLocale() {
  var cur = getUserCurrency();
  return CURRENCY_LOCALES[cur] || 'en-US';
}

function applyLanguage() {
  var lang = (typeof Store !== 'undefined' && Store.user && Store.user.settings && Store.user.settings.language) || 'English';
  var langCodes = { English: 'en', Spanish: 'es', French: 'fr', German: 'de', Portuguese: 'pt' };
  document.documentElement.setAttribute('lang', langCodes[lang] || 'en');
}