const BTC_DEPOSIT_ADDRESS = 'bc1qpch9s36nxu6n7v6hjrmg3s56672alhmttk5k2k';

function initApp() {
  initStore();
  createNav();
  registerRoutes();
  initRouter();
  applyLanguage();

  if (Store.isLoggedIn()) {
    Store.loadAll().then(() => {
      applyLanguage();
      requestNotificationPermission();
      Poller.start('rates', () => Store.fetchRates(), 30000);
      setTimeout(() => showTooltipWalkthrough(), 2000);
    }).catch(err => {
      console.error('Failed to load initial data:', err);
      if (err.status === 401) {
        Store.logout();
        navigate('/auth');
      }
    });
  }
}

function ensureUser() {
  if (Store.user) return Promise.resolve(Store.user);
  if (!Store.isLoggedIn()) { navigate('/auth'); return Promise.resolve(null); }
  return Store.fetchUser().catch(err => {
    if (err.status === 401) { Store.logout(); navigate('/auth'); }
    return null;
  });
}

function authGuard() {
  if (Store.user) return true;
  if (!Store.isLoggedIn()) { navigate('/auth'); return false; }
  Store.fetchUser().then(() => refreshPage()).catch(err => {
    if (err.status === 401) { Store.logout(); navigate('/auth'); }
  });
  return false;
}

function refreshPage() {
  const app = document.getElementById('app');
  if (!app) return;
  const path = state.currentRoute;
  const handler = routes[path];
  if (handler) {
    app.innerHTML = '';
    try {
      const result = handler();
      if (result instanceof Node) app.appendChild(result);
    } catch (err) {
      console.error('refreshPage error:', err);
    }
  }
}

function registerRoutes() {
  registerRoute('/splash', renderSplash);
  registerRoute('/onboarding', renderOnboarding);
  registerRoute('/auth', renderAuth);
  registerRoute('/signup', renderSignup);
  registerRoute('/login', renderLogin);
  registerRoute('/forgot-password', renderForgotPassword);
  registerRoute('/home', () => renderHome());
  registerRoute('/history', () => renderHistory());
  registerRoute('/cards', () => renderCards());
  registerRoute('/rates', () => renderRates());
  registerRoute('/profile', () => renderProfile());
  registerRoute('/notifications', () => renderNotifications());
  registerRoute('/verification', () => renderVerification());
  registerRoute('/send', () => renderSend());
  registerRoute('/receive', () => renderReceive());
  registerRoute('/gift-cards', () => renderGiftCards());
  registerRoute('/crypto-wallet', () => renderCryptoWallet());
  registerRoute('/bill-pay', () => renderBillPay());
  registerRoute('/support', () => renderSupport());
  registerRoute('/referral', () => renderReferral());
  registerRoute('/swap', () => renderSwap());
  registerRoute('/remove-account', () => renderRemoveAccount());
  registerRoute('/personal-info', () => renderPersonalInfo());
  registerRoute('/bank-account', () => renderBankAccount());
  registerRoute('/security', () => renderSecurity());

  registerRoute('/admin/login', () => typeof renderAdminLogin === 'function' ? renderAdminLogin() : navigate('/home'));
  registerRoute('/admin', () => typeof renderAdminDashboard === 'function' ? renderAdminDashboard() : navigate('/home'));
  registerRoute('/admin/users', () => typeof renderAdminUsers === 'function' ? renderAdminUsers() : navigate('/home'));
  registerRoute('/admin/transactions', () => typeof renderAdminTransactions === 'function' ? renderAdminTransactions() : navigate('/home'));
  registerRoute('/admin/cards', () => typeof renderAdminCards === 'function' ? renderAdminCards() : navigate('/home'));
  registerRoute('/admin/rates', () => typeof renderAdminRates === 'function' ? renderAdminRates() : navigate('/home'));
  registerRoute('/admin/giftcards', () => typeof renderAdminGiftCards === 'function' ? renderAdminGiftCards() : navigate('/home'));
  registerRoute('/admin/kyc', () => typeof renderAdminKyc === 'function' ? renderAdminKyc() : navigate('/home'));
  registerRoute('/admin/notifications', () => typeof renderAdminNotifications === 'function' ? renderAdminNotifications() : navigate('/home'));
  registerRoute('/admin/deposits', () => typeof renderAdminDeposits === 'function' ? renderAdminDeposits() : navigate('/home'));
  registerRoute('/admin/users/:id', () => typeof renderAdminUserDetail === 'function' ? renderAdminUserDetail(state.params.id) : navigate('/home'));
}

function renderSplash() {
  showNav(false);

  const screen = el('div', { className: 'splash-screen' });
  const logo = el('div', { className: 'splash-logo' });
  const logoImg = el('img', { className: 'splash-wordmark-img', alt: 'Coinexs' });
  logoImg.src = document.documentElement.getAttribute('data-theme') === 'dark' ? 'assets/images/logo-wordmark-dark.png' : 'assets/images/logo-wordmark-light.png';
  logo.appendChild(logoImg);
  const observer = new MutationObserver(() => {
    logoImg.src = document.documentElement.getAttribute('data-theme') === 'dark' ? 'assets/images/logo-wordmark-dark.png' : 'assets/images/logo-wordmark-light.png';
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  screen.appendChild(logo);
  screen.appendChild(el('div', { className: 'splash-tagline' }, 'Your Money, Without Borders'));

  setTimeout(() => logo.classList.add('loaded'), 600);
  setTimeout(() => {
    if (Store.onFirstVisit) {
      navigate('/onboarding');
    } else {
      navigate('/auth');
    }
  }, 2500);

  return screen;
}

function renderOnboarding() {
  const screen = el('div', { className: 'onboarding-screen' });

  const carousel = el('div', { className: 'onboarding-carousel', id: 'onboarding-carousel' });

  const slides = [
    {
      title: 'Fast & Secure Payments',
      desc: 'Send and receive money instantly with bank-grade security. Your transactions are protected end-to-end.',
      icon: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" fill="var(--primary-light)"/><path d="M40 50h40v30H40z" fill="var(--primary)" opacity="0.3"/><path d="M35 45h50v5H35z" fill="var(--primary)"/><circle cx="60" cy="65" r="8" fill="var(--primary)"/><path d="M60 30v10M50 35l10-10 10 10" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    {
      title: 'Buy Crypto & Gift Cards',
      desc: 'Trade Bitcoin, Ethereum, and more. Purchase gift cards for Amazon, iTunes, Steam, and hundreds of brands.',
      icon: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" fill="var(--primary-light)"/><circle cx="60" cy="55" r="18" fill="var(--warning)" opacity="0.3"/><text x="60" y="62" text-anchor="middle" fill="var(--warning)" font-size="14" font-weight="bold">₿</text><rect x="38" y="78" width="44" height="16" rx="3" fill="var(--primary)"/><text x="60" y="90" text-anchor="middle" fill="white" font-size="8">GIFT CARDS</text></svg>`
    },
    {
      title: 'Global Virtual Cards',
      desc: 'Create virtual cards for online spending. Works everywhere Visa is accepted. Set limits and stay in control.',
      icon: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" fill="var(--primary-light)"/><rect x="25" y="45" width="70" height="45" rx="6" fill="var(--primary)"/><rect x="25" y="55" width="70" height="6" fill="rgba(255,255,255,0.3)"/><text x="85" y="77" fill="rgba(255,255,255,0.5)" font-size="10" font-weight="bold">VISA</text><circle cx="40" cy="70" r="8" fill="#ffd700" opacity="0.5"/></svg>`
    }
  ];

  slides.forEach((slide, i) => {
    const slideEl = el('div', { className: 'onboarding-slide', dataset: { index: i } });
    const ill = el('div', { className: 'onboarding-illustration' });
    ill.innerHTML = slide.icon;
    slideEl.appendChild(ill);
    slideEl.appendChild(el('div', { className: 'onboarding-title' }, slide.title));
    slideEl.appendChild(el('div', { className: 'onboarding-desc' }, slide.desc));
    carousel.appendChild(slideEl);
  });

  screen.appendChild(carousel);

  const paginationContainer = el('div', { className: 'onboarding-pagination', id: 'onboarding-pagination' });
  for (let i = 0; i < 3; i++) {
    paginationContainer.appendChild(el('div', { className: 'onboarding-dot' + (i === 0 ? ' active' : '') }));
  }
  screen.appendChild(paginationContainer);

  const footer = el('div', { className: 'onboarding-footer' });
  const cta = el('button', {
    className: 'btn btn-primary w-full',
    style: { display: 'none', height: '52px' },
    id: 'onboarding-cta',
    onClick: () => {
      Store.setOnboarded();
      navigate('/auth');
    }
  }, 'Get Started');
  footer.appendChild(cta);
  screen.appendChild(footer);

  requestAnimationFrame(() => {
    const carouselEl = document.getElementById('onboarding-carousel');
    const dots = document.querySelectorAll('.onboarding-dot');
    const ctaBtn = document.getElementById('onboarding-cta');

    if (carouselEl) {
      let slideIndex = 0;
      carouselEl.addEventListener('scroll', () => {
        const newIndex = Math.round(carouselEl.scrollLeft / carouselEl.offsetWidth);
        if (newIndex !== slideIndex) {
          slideIndex = newIndex;
          dots.forEach((dot, i) => dot.classList.toggle('active', i === slideIndex));
          if (ctaBtn) {
            ctaBtn.style.display = slideIndex === 2 ? 'flex' : 'none';
          }
        }
      }, { passive: true });
    }
  });

  return screen;
}

function renderAuth() {
  const screen = el('div', { className: 'auth-screen' });

  const logo = el('div', { className: 'auth-logo' });
  const logoImg = el('img', { className: 'auth-wordmark-img', alt: 'Coinexs' });
  logoImg.src = document.documentElement.getAttribute('data-theme') === 'dark' ? 'assets/images/logo-wordmark-dark-240.png' : 'assets/images/logo-wordmark-light-240.png';
  logo.appendChild(logoImg);
  const observer = new MutationObserver(() => {
    logoImg.src = document.documentElement.getAttribute('data-theme') === 'dark' ? 'assets/images/logo-wordmark-dark-240.png' : 'assets/images/logo-wordmark-light-240.png';
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  screen.appendChild(logo);

  screen.appendChild(el('h1', { className: 'auth-heading' }, 'Welcome to Coinexs'));
  screen.appendChild(el('p', { className: 'auth-subheading' }, 'Sign in to access your wallet'));

  const ctas = el('div', { className: 'auth-ctas' });
  ctas.appendChild(el('button', {
    className: 'btn btn-primary w-full',
    style: { height: '52px' },
    onClick: () => navigate('/signup', { direction: 'forward' })
  }, 'Create Account'));
  ctas.appendChild(el('button', {
    className: 'btn btn-secondary w-full',
    style: { height: '52px' },
    onClick: () => navigate('/login', { direction: 'forward' })
  }, 'Sign In'));
  screen.appendChild(ctas);

  screen.appendChild(el('div', { className: 'auth-footer' }, 'By continuing, you agree to our Terms of Service and Privacy Policy'));

  return screen;
}

function renderSignup() {
  const page = el('div', {});

  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/auth', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Create Account'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const form = el('div', { className: 'form-page' });

  const errors = {};

  function showError(fieldId, msg) {
    const existing = document.getElementById('error-' + fieldId);
    if (existing) existing.remove();
    if (!msg) return;
    const err = el('div', { id: 'error-' + fieldId, style: { fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }, role: 'alert' }, msg);
    const field = document.getElementById(fieldId);
    if (field) {
      field.parentNode.after(err);
      field.parentNode.style.borderColor = 'var(--danger)';
    }
  }

  function clearErrors() {
    form.querySelectorAll('[id^="error-"]').forEach(e => e.remove());
    form.querySelectorAll('.input-wrapper').forEach(w => w.style.borderColor = '');
  }

  function validateField(id, value, rules) {
    let msg = '';
    if (rules.required && !value.trim()) msg = rules.label + ' is required';
    else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = 'Enter a valid email';
    else if (rules.minLen && value.length < rules.minLen) msg = rules.label + ' must be at least ' + rules.minLen + ' characters';
    else if (rules.match && value !== rules.match()) msg = 'Passwords do not match';
    showError(id, msg);
    return !msg;
  }

  function createField(icon, placeholder, type, extra) {
    if (type === undefined) type = 'text';
    if (extra === undefined) extra = {};
    const wrapper = el('div', { className: 'input-wrapper' });
    const iconWrap = el('div', { className: 'input-icon' });
    iconWrap.innerHTML = createIcon(icon, 20);
    wrapper.appendChild(iconWrap);
    const input = el('input', Object.assign({ type: type, placeholder: placeholder }, extra));
    if (type === 'tel') wrapper.classList.add('has-prefix');
    wrapper.appendChild(input);
    if (type === 'tel') {
      const prefix = el('div', { className: 'input-prefix' }, '+1');
      wrapper.insertBefore(prefix, input);
    }
    return wrapper;
  }

  const nameWrapper = createField('user', 'John Miller', 'text', { id: 'signup-name', autocomplete: 'name', 'aria-label': 'Full Name' });
  const emailWrapper = createField('mail', 'john.miller@gmail.com', 'email', { id: 'signup-email', autocomplete: 'email', 'aria-label': 'Email' });
  const phoneWrapper = createField('phone', '(555) 123-4567', 'tel', { id: 'signup-phone', autocomplete: 'tel', 'aria-label': 'Phone' });

  const passWrapper = el('div', { className: 'input-wrapper' });
  const lockIcon = el('div', { className: 'input-icon' });
  lockIcon.innerHTML = createIcon('lock', 20);
  passWrapper.appendChild(lockIcon);
  const passInput = el('input', { type: 'password', placeholder: 'Password', id: 'signup-password', autocomplete: 'new-password', 'aria-label': 'Password' });
  passWrapper.appendChild(passInput);
  const passAction = el('button', { className: 'input-action', 'aria-label': 'Toggle password visibility', type: 'button' });
  passAction.innerHTML = createIcon('eye', 20);
  passAction.addEventListener('click', () => {
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    passAction.innerHTML = createIcon(isPass ? 'eye-off' : 'eye', 20);
  });
  passWrapper.appendChild(passAction);

  const confirmWrapper = el('div', { className: 'input-wrapper' });
  const lockIcon2 = el('div', { className: 'input-icon' });
  lockIcon2.innerHTML = createIcon('lock', 20);
  confirmWrapper.appendChild(lockIcon2);
  const confirmInput = el('input', { type: 'password', placeholder: 'Confirm Password', id: 'signup-confirm', autocomplete: 'new-password', 'aria-label': 'Confirm Password' });
  confirmWrapper.appendChild(confirmInput);
  const confirmAction = el('button', { className: 'input-action', 'aria-label': 'Toggle password visibility', type: 'button' });
  confirmAction.innerHTML = createIcon('eye', 20);
  confirmAction.addEventListener('click', () => {
    const isPass = confirmInput.type === 'password';
    confirmInput.type = isPass ? 'text' : 'password';
    confirmAction.innerHTML = createIcon(isPass ? 'eye-off' : 'eye', 20);
  });
  confirmWrapper.appendChild(confirmAction);

  const strengthBars = el('div', { className: 'password-strength' });
  for (let i = 0; i < 4; i++) {
    strengthBars.appendChild(el('div', { className: 'password-strength-bar' }));
  }
  const strengthLabel = el('div', { className: 'password-strength-label' }, 'Weak');

  passInput.addEventListener('input', () => {
    const val = passInput.value;
    let strength = 0;
    if (val.length >= 6) strength++;
    if (val.length >= 10) strength++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
    if (/\d/.test(val) || /[^A-Za-z0-9]/.test(val)) strength++;
    const labels = ['Weak', 'Medium', 'Strong', 'Very Strong'];
    const classes = ['weak', 'medium', 'strong', 'very-strong'];
    const bars = strengthBars.querySelectorAll('.password-strength-bar');
    bars.forEach((bar, i) => {
      bar.className = 'password-strength-bar' + (i < strength ? ' active ' + classes[Math.min(strength - 1, classes.length - 1)] : '');
    });
    strengthLabel.textContent = labels[Math.max(0, strength - 1)] || 'Weak';
  });

  const checkboxGroup = el('div', { className: 'checkbox-group' });
  const checkCustom = el('div', { className: 'checkbox-custom', id: 'signup-terms', role: 'checkbox', 'aria-checked': 'false', 'aria-label': 'I agree to the Terms & Privacy Policy' });
  checkCustom.innerHTML = createIcon('check', 14);
  let checked = false;
  checkCustom.addEventListener('click', () => {
    checked = !checked;
    checkCustom.classList.toggle('checked', checked);
    checkCustom.setAttribute('aria-checked', checked ? 'true' : 'false');
  });
  checkboxGroup.appendChild(checkCustom);
  checkboxGroup.appendChild(el('span', { className: 'checkbox-label' }, 'I agree to the Terms & Privacy Policy'));

  form.appendChild(el('label', { className: 'form-label', htmlFor: 'signup-name' }, 'Full Name'));
  form.appendChild(nameWrapper);
  form.appendChild(el('label', { className: 'form-label', htmlFor: 'signup-email' }, 'Email'));
  form.appendChild(emailWrapper);
  form.appendChild(el('label', { className: 'form-label', htmlFor: 'signup-phone' }, 'Phone'));
  form.appendChild(phoneWrapper);
  form.appendChild(el('label', { className: 'form-label', htmlFor: 'signup-password' }, 'Password'));
  form.appendChild(passWrapper);
  form.appendChild(strengthBars);
  form.appendChild(strengthLabel);
  form.appendChild(el('label', { className: 'form-label', htmlFor: 'signup-confirm' }, 'Confirm Password'));
  form.appendChild(confirmWrapper);
  form.appendChild(checkboxGroup);
  form.appendChild(el('button', {
    className: 'btn btn-primary w-full mt-16',
    style: { height: '52px' },
    id: 'signup-submit',
    onClick: async () => {
      clearErrors();
      const name = document.getElementById('signup-name');
      const email = document.getElementById('signup-email');
      const pass = document.getElementById('signup-password');
      const confirm = document.getElementById('signup-confirm');
      if (!name || !email || !pass || !confirm) return;

      const valid = [
        validateField('signup-name', name.value, { required: true, label: 'Full name' }),
        validateField('signup-email', email.value, { required: true, email: true, label: 'Email' }),
        validateField('signup-password', pass.value, { required: true, minLen: 8, label: 'Password' }),
        validateField('signup-confirm', confirm.value, { required: true, label: 'Password confirmation', match: () => pass.value })
      ].every(Boolean);

      if (!valid) {
        haptic('error');
        showToast('Please fix the errors in the form', 'error');
        return;
      }
      if (!checked) {
        showToast('Please agree to the Terms & Privacy Policy', 'error');
        return;
      }

      haptic('success');
      const btn = document.getElementById('signup-submit');
      btn.innerHTML = '<div class="spinner spinner-sm"></div>';
      btn.disabled = true;

      try {
        const username = name.value.trim().toLowerCase().replace(/\s+/g, '');
        await Store.register({
          name: name.value.trim(),
          username,
          email: email.value.trim(),
          password: pass.value
        });
        await Store.loadAll();
        showToast('Account created! Welcome to Coinexs.', 'success');
        navigate('/home');
        setTimeout(() => showTooltipWalkthrough(), 1500);
      } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
        btn.innerHTML = 'Create Account';
        btn.disabled = false;
      }
    }
  }, 'Create Account'));
  form.appendChild(el('div', { className: 'form-footer' }, 'Already have an account? ', el('button', {
    className: 'form-footer-link',
    onClick: () => navigate('/login', { direction: 'forward' })
  }, 'Sign In')));

  page.appendChild(form);
  return page;
}

function renderLogin() {
  const page = el('div', {});

  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/auth', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Welcome Back'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const form = el('div', { className: 'form-page', id: 'login-form' });

  const emailWrapper = el('div', { className: 'input-wrapper' });
  const userIcon = el('div', { className: 'input-icon' });
  userIcon.innerHTML = createIcon('user', 20);
  emailWrapper.appendChild(userIcon);
  const emailInput = el('input', { type: 'text', placeholder: 'Email or Phone', id: 'login-email', autocomplete: 'username', 'aria-label': 'Email or Phone', required: true });
  emailWrapper.appendChild(emailInput);
  form.appendChild(el('label', { className: 'form-label', htmlFor: 'login-email' }, 'Email or Phone'));
  form.appendChild(emailWrapper);

  const passWrapper = el('div', { className: 'input-wrapper' });
  const lockIcon = el('div', { className: 'input-icon' });
  lockIcon.innerHTML = createIcon('lock', 20);
  passWrapper.appendChild(lockIcon);
  const passInput = el('input', { type: 'password', placeholder: 'Password', id: 'login-password', autocomplete: 'current-password', 'aria-label': 'Password', required: true });
  passWrapper.appendChild(passInput);
  const passAction = el('button', { className: 'input-action', 'aria-label': 'Toggle visibility', type: 'button' });
  passAction.innerHTML = createIcon('eye', 20);
  passAction.addEventListener('click', () => {
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    passAction.innerHTML = createIcon(isPass ? 'eye-off' : 'eye', 20);
  });
  passWrapper.appendChild(passAction);
  form.appendChild(el('label', { className: 'form-label', htmlFor: 'login-password' }, 'Password'));
  form.appendChild(passWrapper);

  form.appendChild(el('button', {
    className: 'form-link',
    style: { background: 'none', border: 'none', marginTop: '8px' },
    onClick: () => navigate('/forgot-password', { direction: 'forward' })
  }, 'Forgot Password?'));

  const loginBtn = el('button', {
    className: 'btn btn-primary w-full mt-16',
    style: { height: '52px' },
    id: 'login-btn',
    onClick: async () => {
      const email = document.getElementById('login-email');
      const pass = document.getElementById('login-password');
      if (!email || !pass) return;

      if (!email.value.trim() || !pass.value.trim()) {
        haptic('error');
        form.style.animation = 'shake 400ms ease';
        form.addEventListener('animationend', () => form.style.animation = '', { once: true });
        showToast('Please enter your credentials', 'error');
        return;
      }

      const btn = document.getElementById('login-btn');
      btn.innerHTML = '<div class="spinner spinner-sm"></div>';
      btn.disabled = true;
      haptic('success');

      try {
        await Store.loginWithCredentials(email.value.trim(), pass.value.trim());
        await Store.loadAll();
        showToast('Welcome back, ' + (Store.user ? Store.user.name.split(' ')[0] : 'there') + '!', 'success');
        navigate('/home');
        setTimeout(() => showTooltipWalkthrough(), 1500);
      } catch (err) {
        showToast(err.message || 'Login failed', 'error');
        btn.innerHTML = 'Sign In';
        btn.disabled = false;
      }
    }
  }, 'Sign In');
  form.appendChild(loginBtn);

  form.appendChild(el('div', { className: 'form-divider' }, 'or'));

  const faceIdBtn = el('button', {
    className: 'btn btn-outline w-full',
    style: { height: '52px', justifyContent: 'center', gap: '8px' },
    onClick: () => showToast('Biometric authentication not available on this device.', 'info')
  });
  faceIdBtn.innerHTML = createIcon('face_id', 20) + ' Use Face ID';
  form.appendChild(faceIdBtn);

  form.appendChild(el('div', { className: 'form-footer' }, "Don't have an account? ", el('button', {
    className: 'form-footer-link',
    onClick: () => navigate('/signup', { direction: 'forward' })
  }, 'Create Account')));

  page.appendChild(form);
  return page;
}

function renderForgotPassword() {
  const page = el('div', {});

  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/login', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Reset Password'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const form = el('div', { className: 'form-page' });
  form.appendChild(el('p', { className: 'text-center text-sm text-secondary mb-16' }, "Enter your email and we'll send you a reset link."));

  const emailWrapper = el('div', { className: 'input-wrapper' });
  const mailIcon = el('div', { className: 'input-icon' });
  mailIcon.innerHTML = createIcon('mail', 20);
  emailWrapper.appendChild(mailIcon);
  emailWrapper.appendChild(el('input', { type: 'email', placeholder: 'Email address' }));
  form.appendChild(emailWrapper);

  const ctaBtn = el('button', {
    className: 'btn btn-primary w-full mt-16',
    style: { height: '52px' },
    id: 'reset-btn',
    onClick: async () => {
      const container = document.getElementById('reset-container');
      if (!container) return;

      const emailInput = container.parentElement.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email) {
        showToast('Please enter your email', 'error');
        return;
      }

      ctaBtn.disabled = true;
      ctaBtn.textContent = 'Looking up...';

      try {
        const data = await Store.forgotPassword(email);
        container.innerHTML = '';
        const success = el('div', { className: 'success-state' });
        const iconWrap = el('div', { style: { width: '64px', height: '64px' } });
        iconWrap.innerHTML = createIcon('lock', 64);
        iconWrap.style.color = 'var(--primary)';
        success.appendChild(iconWrap);
        success.appendChild(el('div', { className: 'text-xl font-bold' }, 'Your Password'));

        const pwWrap = el('div', { style: { background: 'var(--surface)', padding: '16px', borderRadius: '12px', margin: '16px 0', fontFamily: 'monospace', fontSize: '18px', wordBreak: 'break-all' } });
        pwWrap.textContent = data.password;
        success.appendChild(pwWrap);

        success.appendChild(el('button', {
          className: 'btn btn-primary w-full',
          style: { marginBottom: '8px' },
          onClick: () => {
            navigator.clipboard.writeText(data.password);
            showToast('Password copied!', 'success');
          }
        }, 'Copy Password'));

        success.appendChild(el('button', {
          className: 'btn btn-ghost w-full',
          onClick: () => navigate('/login', { direction: 'reverse' })
        }, 'Back to Login'));
        container.appendChild(success);
      } catch (err) {
        container.innerHTML = '';
        const error = el('div', { className: 'success-state' });
        error.appendChild(el('div', { className: 'text-xl font-bold', style: { color: 'var(--danger)' } }, 'Account Not Found'));
        error.appendChild(el('div', { className: 'text-sm text-secondary' }, 'No account found with that email address.'));
        error.appendChild(el('button', {
          className: 'btn btn-ghost mt-16',
          onClick: () => navigate('/register', { direction: 'forward' })
        }, 'Create Account'));
        container.appendChild(error);
      } finally {
        ctaBtn.disabled = false;
        ctaBtn.textContent = 'Send Reset Link';
      }
    }
  }, 'Send Reset Link');

  form.appendChild(ctaBtn);

  const container = el('div', { id: 'reset-container' });
  form.appendChild(container);

  page.appendChild(form);
  return page;
}

function renderHome() {
  if (!Store.isLoggedIn()) {
    navigate('/auth');
    return el('div', {});
  }

  if (!Store.user) {
    Store.loadAll().then(() => {
      const app = document.getElementById('app');
      if (app && state.currentRoute === '/home') { app.innerHTML = ''; app.appendChild(renderHome()); }
    }).catch((err) => {
      if (err && err.status === 401) navigate('/auth');
    });
    const loading = el('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' } });
    loading.innerHTML = '<div class="spinner spinner-lg"></div>';
    return loading;
  }

  const page = el('div', { className: 'home-page' });

  const hero = el('div', { className: 'home-hero' });
  const topRow = el('div', { className: 'home-top-row' });
  const userSection = el('div', { className: 'home-user' });
  const avatarWrap = el('div', { className: 'home-avatar' });
  const avatarImgEl = el('img', { src: Store.user.avatar || getAvatar(Store.user.name), alt: Store.user.name, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } });
  avatarWrap.appendChild(avatarImgEl);
  avatarWrap.appendChild(el('div', { className: 'home-avatar-online' }));
  userSection.appendChild(avatarWrap);
  const greeting = el('div', {});
  greeting.appendChild(el('div', { style: { color: 'white', fontSize: '16px' } }, 'Hello ' + Store.user.name.split(' ')[0] + ' 👋'));
  greeting.appendChild(el('div', { style: { color: 'white', fontSize: '12px', opacity: '0.8' } }, t('keep_up_good_work')));
  userSection.appendChild(greeting);
  topRow.appendChild(userSection);

  const notifBtn = el('button', {
    className: 'home-notification',
    onClick: () => navigate('/notifications'),
    'aria-label': 'Notifications'
  });
  notifBtn.innerHTML = createIcon('bell', 24);
  const unreadNotifs = Store.notifications ? Store.notifications.filter(n => !n.read) : [];
  if (unreadNotifs.length > 0) {
    notifBtn.appendChild(el('div', { className: 'home-notification-badge', 'aria-label': unreadNotifs.length + ' unread' }));
  }
  topRow.appendChild(notifBtn);
  hero.appendChild(topRow);

  const wallet = el('div', { className: 'home-wallet' });
  const labelRow = el('div', { className: 'home-wallet-label' });
  labelRow.appendChild(el('span', {}, t('wallet_balance')));
  const eyeBtn = el('button', { style: { background: 'none', border: 'none', padding: '0', display: 'flex', color: 'rgba(255,255,255,0.9)' }, 'aria-label': 'Toggle visibility' });
  eyeBtn.innerHTML = createIcon('eye', 16);
  eyeBtn.addEventListener('click', () => {
    state.balanceVisible = !state.balanceVisible;
    eyeBtn.innerHTML = createIcon(state.balanceVisible ? 'eye' : 'eye-off', 16);
    const balanceEl = document.getElementById('home-balance');
    if (balanceEl) balanceEl.textContent = state.balanceVisible ? formatCurrency(Store.user.balance.USD) : '••••••';
  });
  labelRow.appendChild(eyeBtn);
  wallet.appendChild(labelRow);

  const amountRow = el('div', { className: 'home-wallet-amount' });
  const balanceEl = el('div', { className: 'home-balance', id: 'home-balance' }, formatCurrency(0));
  amountRow.appendChild(balanceEl);
  const currFlags = { USD: '\u{1F1FA}\u{1F1F8}', EUR: '\u{1F1EA}\u{1F1FA}', GBP: '\u{1F1EC}\u{1F1E7}', NGN: '\u{1F1F3}\u{1F1EC}', BRL: '\u{1F1E7}\u{1F1F7}' };
  const currCode = getUserCurrency();
  const currPill = el('button', { className: 'home-currency-pill' }, (currFlags[currCode] || '') + ' ' + currCode);
  const chevron = el('span', { style: { display: 'flex' } });
  chevron.innerHTML = createIcon('chevron_down', 12);
  currPill.appendChild(chevron);
  amountRow.appendChild(currPill);
  wallet.appendChild(amountRow);
  hero.appendChild(wallet);

  if (BTC_DEPOSIT_ADDRESS) {
    const addrCard = el('div', { style: { margin: '12px auto 0', maxWidth: '320px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '14px 18px', textAlign: 'center' } });
    const addrLabel = el('div', { style: { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' } }, 'Your Deposit Address');
    addrCard.appendChild(addrLabel);
    const addrRow = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } });
    const addrText = el('span', { style: { fontSize: '15px', fontWeight: '500', color: 'white', fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', letterSpacing: '0.3px', backdropFilter: 'blur(4px)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }, onClick: () => {
      navigator.clipboard.writeText(BTC_DEPOSIT_ADDRESS);
      showToast('Deposit address copied', 'success');
    } }, BTC_DEPOSIT_ADDRESS);
    addrRow.appendChild(addrText);
    const copyBtn = el('button', { style: { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0 }, onClick: () => {
      navigator.clipboard.writeText(BTC_DEPOSIT_ADDRESS);
      showToast('Deposit address copied', 'success');
    } });
    copyBtn.innerHTML = createIcon('copy', 16);
    addrRow.appendChild(copyBtn);
    addrCard.appendChild(addrRow);
    hero.appendChild(addrCard);
  }

  const actions = el('div', { className: 'home-actions' });
  const actionBtns = [
    { label: 'Add Money', icon: 'plus', route: null, modal: 'addMoney' },
    { label: 'Send', icon: 'send', route: '/send' },
    { label: 'Swap', icon: 'repeat', route: '/swap' }
  ];
  actionBtns.forEach(a => {
    const wrapper = el('div', { className: 'home-action-btn' });
    const circle = el('button', { className: 'home-action-circle' });
    circle.innerHTML = createIcon(a.icon, 24);
    circle.addEventListener('click', () => {
      if (a.route) navigate(a.route);
      else if (a.modal === 'addMoney') modalAddMoney();
      else if (a.modal === 'withdraw') modalWithdraw();
      else if (a.modal === 'convert') modalConvert();
    });
    wrapper.appendChild(circle);
    wrapper.appendChild(el('div', { className: 'home-action-label' }, a.label));
    actions.appendChild(wrapper);
  });
  hero.appendChild(actions);
  page.appendChild(hero);

  const quickActions = el('div', { className: 'home-quick-actions' });
  const qaHeader = el('div', { className: 'home-qa-header' });
  qaHeader.appendChild(el('div', { className: 'home-qa-title' }, 'Quick Actions'));
  quickActions.appendChild(qaHeader);

  const grid = el('div', { className: 'home-qa-grid' });
  const qaItems = [
    { label: t('crypto'), icon: 'bitcoin', color: '#F7931A', route: '/crypto-wallet' },
    { label: t('giftcards'), icon: 'gift', color: '#8B5CF6', route: '/gift-cards' },
    { label: t('swap'), icon: 'repeat', color: '#3B82F6', route: '/swap' },
    { label: t('rewards'), icon: 'gift', color: '#EC4899', route: '/referral' }
  ];
  qaItems.forEach(item => {
    const elItem = el('button', { className: 'home-qa-item', onClick: () => { if (item.route) navigate(item.route); } });
    const iconWrap = el('div', { className: 'home-qa-icon', style: { color: item.color } });
    iconWrap.innerHTML = createIcon(item.icon, 24);
    elItem.appendChild(iconWrap);
    elItem.appendChild(el('div', { className: 'home-qa-label' }, item.label));
    grid.appendChild(elItem);
  });
  quickActions.appendChild(grid);
  page.appendChild(quickActions);

  const promo = el('div', { className: 'home-promo' });
  
  const carousel = el('div', { className: 'home-promo-carousel', id: 'home-promo-carousel' });

  const promoSlides = [
    { title: 'Instant value for every giftcard', sub: 'High rates. Smooth payouts.' },
    { title: 'Zero fees on your first trade', sub: 'Start saving from day one.' },
    { title: 'Crypto at your fingertips', sub: 'BTC, ETH, USDT — all in one place.' }
  ];

  promoSlides.forEach((slide, slideIndex) => {
    const slideEl = el('div', { className: 'home-promo-slide', dataset: { anim: slideIndex } });

    const text = el('div', { className: 'home-promo-text' });
    text.appendChild(el('div', { className: 'home-promo-title' }, slide.title));
    text.appendChild(el('div', { className: 'home-promo-sub' }, slide.sub));
    slideEl.appendChild(text);

    var visual;
    if (slideIndex === 0) {
      // Giftcard stack — Lottie animated cards
      visual = el('div', { className: 'home-promo-visual lottie-wrap' });
      visual.innerHTML = '<lottie-player src="https://assets-v2.lottiefiles.com/a/aa65a7c0-1186-11ee-8903-4714c53ec90f/0ZzoJgGeMI.json" background="transparent" speed="1" loop autoplay mode="normal"></lottie-player>';
    } else if (slideIndex === 1) {
      // Coin stack — Lottie animated coin
      visual = el('div', { className: 'home-promo-visual lottie-wrap' });
      visual.innerHTML = '<lottie-player src="https://assets-v2.lottiefiles.com/a/b643b03a-8cbb-11ef-a36c-03d33e73750f/QBs644OtHz.json" background="transparent" speed="1" loop autoplay mode="normal"></lottie-player>';
    } else {
      // Crypto icons — Lottie animated bitcoin
      visual = el('div', { className: 'home-promo-visual lottie-wrap' });
      visual.innerHTML = '<lottie-player src="https://assets-v2.lottiefiles.com/a/e3fe795c-1150-11ee-9dff-ebde4d00e27b/Xoqz0DC2NT.json" background="transparent" speed="1" loop autoplay mode="normal"></lottie-player>';
    }

    slideEl.appendChild(visual);
    carousel.appendChild(slideEl);
  });

  promo.appendChild(carousel);

  // Pagination dots
  const dots = el('div', { className: 'home-promo-dots' });
  promoSlides.forEach((_, i) => {
    dots.appendChild(el('div', { className: 'home-promo-dot' + (i === 0 ? ' active' : '') }));
  });
  promo.appendChild(dots);

  page.appendChild(promo);

  // Carousel with autoplay
  requestAnimationFrame(() => {
    const el = document.getElementById('home-promo-carousel');
    const dotEls = document.querySelectorAll('.home-promo-dot');
    if (!el || !dotEls.length) return;

    let autoTimer;
    let index = 0;
    const total = dotEls.length;

    function goTo(i) {
      if (i < 0) i = total - 1;
      if (i >= total) i = 0;
      index = i;
      el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
      dotEls.forEach((d, j) => d.classList.toggle('active', j === index));
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => goTo(index + 1), 3800);
    }

    function stopAuto() {
      clearInterval(autoTimer);
    }

    // Sync dots on manual scroll
    let ticking;
    el.addEventListener('scroll', () => {
      cancelAnimationFrame(ticking);
      ticking = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.offsetWidth);
        if (i !== index) {
          index = i;
          dotEls.forEach((d, j) => d.classList.toggle('active', j === index));
        }
      });
    }, { passive: true });

    // Pause on interaction, resume after
    el.addEventListener('touchstart', stopAuto, { passive: true });
    el.addEventListener('touchend', startAuto, { passive: true });
    el.addEventListener('scrollend', startAuto);

    startAuto();
  });

  const txSection = el('div', { className: 'home-transactions' });
  const txHeader = el('div', { className: 'home-tx-header' });
  txHeader.appendChild(el('div', { className: 'home-tx-title' }, t('recent_transactions')));
  txHeader.appendChild(el('button', {
    className: 'home-tx-all',
    onClick: () => navigate('/history')
  }, t('view_all')));
  txSection.appendChild(txHeader);

  const txList = el('div', { className: 'stagger-enter' });
  const recentTxns = Store.transactions.slice(0, 3);
  if (recentTxns.length === 0) {
    txList.appendChild(emptyState('history', t('no_transactions'), 'Tap Add Money to fund your wallet.', { label: 'Add Money', onClick: () => modalAddMoney() }));
  } else {
    recentTxns.forEach(tx => {
      txList.appendChild(createTransactionRow(tx));
    });
  }
  txSection.appendChild(txList);
  page.appendChild(txSection);

  const fab = el('button', { className: 'fab-chat', 'aria-label': 'Chat support' });
  fab.innerHTML = createIcon('message_circle', 24);
  fab.style.color = 'white';
  fab.addEventListener('click', () => navigate('/support'));
  page.appendChild(fab);

  requestAnimationFrame(() => {
    animateBalance(document.getElementById('home-balance'), Store.user.balance.USD);
  });

  return page;
}

function modalHistoryFilter() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Filter Transactions'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const sections = [
      { title: 'Type', options: ['All', 'Credit', 'Debit', 'Pending'] },
      { title: 'Status', options: ['All', 'Completed', 'Pending', 'Failed'] },
      { title: 'Sort By', options: ['Newest First', 'Oldest First', 'Highest Amount', 'Lowest Amount'] }
    ];

    let selected = { type: 'All', status: 'All', sort: 'Newest First' };

    const content = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' } });
    const selects = {};

    sections.forEach(sec => {
      const section = el('div', {});
      section.appendChild(el('div', { style: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, sec.title));
      const options = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } });
      selects[sec.title] = sec.options[0];
      sec.options.forEach(opt => {
        const chip = el('button', { className: 'chip', onClick: () => {
          selects[sec.title] = opt;
          options.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          haptic('light');
        }}, opt);
        if (opt === sec.options[0]) chip.classList.add('active');
        options.appendChild(chip);
      });
      section.appendChild(options);
      content.appendChild(section);
    });
    body.appendChild(content);

    const footer = el('div', { className: 'modal-footer', style: { display: 'flex', gap: '12px' } });
    footer.appendChild(el('button', { className: 'btn btn-secondary', style: { flex: '1', height: '48px' }, onClick: () => {
      selects.type = 'All';
      selects.status = 'All';
      selects.sort = 'Newest First';
      content.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      content.querySelectorAll('.chip').forEach((c, i) => { if (i < 3) c.classList.add('active'); });
      haptic('light');
      showToast('Filters reset', 'info');
    }}, 'Reset'));
    footer.appendChild(el('button', { className: 'btn btn-primary', style: { flex: '1', height: '48px' }, onClick: () => {
      haptic('success');
      showToast('Filters applied', 'success');
      close();
    }}, 'Apply'));
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function renderHistory() {
  const page = el('div', { className: 'history-page' });

  const header = el('div', { className: 'page-header' });
  header.appendChild(el('div', { className: 'page-header-left' }));
  header.appendChild(el('div', { className: 'page-header-center' }, 'History'));
  const right = el('div', { className: 'page-header-right' });
  right.appendChild(iconButton('filter', 24, () => modalHistoryFilter()));
  header.appendChild(right);
  page.appendChild(header);

  const allTx = Store.transactions.slice();
  const totalCredit = allTx.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit = allTx.filter(t => t.type === 'debit' || t.type === 'pending').reduce((s, t) => s + t.amount, 0);

  const summary = el('div', { className: 'history-summary' });
  const creditCard = el('div', { className: 'history-summary-card credit-card' });
  creditCard.appendChild(el('div', { className: 'history-summary-label' }, t('money_in')));
  const creditAmt = el('div', { className: 'history-summary-amount' });
  creditAmt.textContent = formatCurrency(0);
  creditCard.appendChild(creditAmt);
  creditCard.appendChild(el('div', { className: 'history-summary-sub' }, allTx.filter(t => t.type === 'credit').length + ' transactions'));
  summary.appendChild(creditCard);
  const debitCard = el('div', { className: 'history-summary-card debit-card' });
  debitCard.appendChild(el('div', { className: 'history-summary-label' }, t('money_out')));
  const debitAmt = el('div', { className: 'history-summary-amount' });
  debitAmt.textContent = formatCurrency(0);
  debitCard.appendChild(debitAmt);
  debitCard.appendChild(el('div', { className: 'history-summary-sub' }, allTx.filter(t => t.type !== 'credit').length + ' transactions'));
  summary.appendChild(debitCard);
  page.appendChild(summary);

  requestAnimationFrame(() => {
    animateCounter(creditAmt, totalCredit);
    animateCounter(debitAmt, totalDebit);
  });

  const searchWrap = el('div', { className: 'history-search', style: { padding: '0 16px 12px' } });
  const searchInner = el('div', { className: 'input-wrapper' });
  const searchIcon = el('div', { className: 'input-icon' });
  searchIcon.innerHTML = createIcon('search', 20);
  searchInner.appendChild(searchIcon);
  const searchInput = el('input', { type: 'text', placeholder: 'Search transactions...', id: 'history-search' });
  searchInner.appendChild(searchInput);
  searchWrap.appendChild(searchInner);
  page.appendChild(searchWrap);

  let activeFilter = 'all';
  let activeStatus = 'all';
  const filters = el('div', { className: 'history-filters' });
  const filterPills = [
    { key: 'all', label: 'All' },
    { key: 'credit', label: 'Received' },
    { key: 'debit', label: 'Sent' },
    { key: 'pending', label: 'Pending' }
  ];
  filterPills.forEach((f, i) => {
    const pill = el('button', { className: 'history-filter-pill' + (i === 0 ? ' active' : ''), onClick: () => {
      activeFilter = f.key;
      filters.querySelectorAll('.history-filter-pill').forEach((p, j) => p.classList.toggle('active', filterPills[j].key === f.key));
      renderList();
    }}, f.label);
    filters.appendChild(pill);
  });
  page.appendChild(filters);

  const statusFilters = el('div', { className: 'history-filters', style: { paddingBottom: '8px' } });
  const statusPills = [
    { key: 'all', label: 'All Status' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending' }
  ];
  statusPills.forEach((f, i) => {
    const pill = el('button', { className: 'history-filter-pill' + (i === 0 ? ' active' : ''), onClick: () => {
      activeStatus = f.key;
      statusFilters.querySelectorAll('.history-filter-pill').forEach((p, j) => p.classList.toggle('active', statusPills[j].key === f.key));
      renderList();
    }}, f.label);
    statusFilters.appendChild(pill);
  });
  page.appendChild(statusFilters);

  const listContainer = el('div', { id: 'history-list' });
  page.appendChild(listContainer);

  function getRelativeTime(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return diffMin + 'm ago';
    if (diffHr < 24) return diffHr + 'h ago';
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return diffDay + 'd ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getDateGroup(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffDay === 0) return 'Today';
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return 'This Week';
    if (diffDay < 30) return 'This Month';
    return 'Earlier';
  }

  function renderList() {
    listContainer.innerHTML = '';
    const query = (searchInput.value || '').toLowerCase();
    let filtered = allTx.filter(tx => {
      if (activeFilter === 'credit' && tx.type !== 'credit') return false;
      if (activeFilter === 'debit' && tx.type !== 'debit') return false;
      if (activeFilter === 'pending' && tx.status !== 'pending') return false;
      if (activeStatus !== 'all' && tx.status !== activeStatus) return false;
      if (query && !tx.title.toLowerCase().includes(query) && !tx.category.toLowerCase().includes(query) && !tx.id.toLowerCase().includes(query)) return false;
      return true;
    });

    if (!filtered.length) {
      const empty = el('div', { style: { textAlign: 'center', padding: '48px 24px' } });
      const emptyIcon = el('div', { style: { color: 'var(--text-muted)', marginBottom: '12px' } });
      emptyIcon.innerHTML = createIcon('search', 48);
      empty.appendChild(emptyIcon);
      empty.appendChild(el('div', { style: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' } }, 'No transactions found'));
      empty.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-muted)' } }, 'Try adjusting your search or filters'));
      listContainer.appendChild(empty);
      return;
    }

    const groups = {};
    filtered.forEach(tx => {
      const group = getDateGroup(tx.date);
      if (!groups[group]) groups[group] = [];
      groups[group].push(tx);
    });

    const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
    groupOrder.forEach(groupName => {
      const txs = groups[groupName];
      if (!txs || !txs.length) return;

      const section = el('div', { className: 'history-section' });
      const sectionHeader = el('div', { className: 'history-section-header' });
      sectionHeader.appendChild(el('div', { className: 'history-section-title' }, groupName));
      sectionHeader.appendChild(el('div', { className: 'history-section-date' }, txs.length + ' transaction' + (txs.length > 1 ? 's' : '')));
      section.appendChild(sectionHeader);

      const list = el('div', { className: 'stagger-enter' });
      txs.forEach(tx => {
        const row = createTransactionRow(tx);
        const timeEl = row.querySelector('.tx-date');
        if (timeEl) timeEl.textContent = getRelativeTime(tx.date);
        list.appendChild(row);
      });
      section.appendChild(list);
      listContainer.appendChild(section);
    });
  }

  searchInput.addEventListener('input', renderList);
  renderList();

  return page;
}

function renderCards() {
  if (!authGuard()) return el('div', {});

  const page = el('div', { className: 'cards-page' });

  const header = el('div', { className: 'page-header' });
  header.appendChild(el('div', { className: 'page-header-left' }));
  header.appendChild(el('div', { className: 'page-header-center' }, 'Card'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const balance = Store.user?.balance?.USD ?? 0;
  const minRequired = 1000;

  if (balance < minRequired) {
    const gap = minRequired - balance;

    const upgradeScreen = el('div', { className: 'cards-upgrade-screen' });

    const upgradeVisual = el('div', { className: 'cards-upgrade-visual' });
    const lockedCard = el('div', { className: 'cards-locked-card' });
    lockedCard.innerHTML = '<div class="cards-locked-card-inner"><div class="cards-locked-card-chip"></div><div class="cards-locked-card-text">VISA</div></div><div class="cards-locked-overlay">' + createIcon('lock', 32) + '</div>';
    upgradeVisual.appendChild(lockedCard);
    upgradeScreen.appendChild(upgradeVisual);

    upgradeScreen.appendChild(el('div', { className: 'cards-upgrade-title' }, 'Unlock Your Virtual Card'));
    upgradeScreen.appendChild(el('div', { className: 'cards-upgrade-desc' }, 'Fund your wallet with at least ' + formatCurrency(1000) + ' to get access to a premium virtual card for global spending.'));

    const progressSection = el('div', { className: 'cards-upgrade-progress' });
    const progressBar = el('div', { className: 'cards-upgrade-bar-outer' });
    let lastPct = Math.min((balance / minRequired) * 100, 100);
    progressBar.appendChild(el('div', { className: 'cards-upgrade-bar-fill', id: 'cards-progress-fill', style: { width: lastPct + '%' } }));
    progressSection.appendChild(progressBar);
    const progressLabel = el('div', { className: 'cards-upgrade-bar-label', id: 'cards-progress-label' });
    progressLabel.textContent = formatCurrency(balance) + ' / ' + formatCurrency(minRequired);
    progressSection.appendChild(progressLabel);
    upgradeScreen.appendChild(progressSection);

    const benefits = el('div', { className: 'cards-upgrade-benefits' });
    const benefitList = [
      { icon: 'globe', text: 'Spend globally anywhere Visa is accepted' },
      { icon: 'shield-check', text: 'Bank-grade security & instant freeze' },
      { icon: 'trend-up', text: 'Real-time spending insights & limits' },
      { icon: 'repeat', text: 'Free currency conversion at interbank rates' }
    ];
    benefitList.forEach(b => {
      const item = el('div', { className: 'cards-upgrade-benefit' });
      const iconWrap = el('div', { className: 'cards-upgrade-benefit-icon' });
      iconWrap.innerHTML = createIcon(b.icon, 18);
      item.appendChild(iconWrap);
      item.appendChild(el('div', { className: 'cards-upgrade-benefit-text' }, b.text));
      benefits.appendChild(item);
    });
    upgradeScreen.appendChild(benefits);

    const fundBtn = el('button', {
      className: 'btn btn-primary w-full',
      style: { height: '52px', marginTop: '8px' },
      onClick: () => modalAddMoney()
    }, 'Add Funds to Unlock');
    upgradeScreen.appendChild(fundBtn);

    page.appendChild(upgradeScreen);

    Poller.start('cards-poll', async () => {
      try {
        await Store.fetchUser();
        const newBal = Store.user?.balance?.USD ?? 0;
        const pct = Math.min((newBal / minRequired) * 100, 100);
        const fill = document.getElementById('cards-progress-fill');
        const label = document.getElementById('cards-progress-label');
        if (fill) fill.style.width = pct + '%';
        if (label) label.textContent = formatCurrency(newBal) + ' / ' + formatCurrency(minRequired);
        if (newBal >= minRequired) {
          Poller.stop('cards-poll');
          navigate('/cards');
        }
      } catch (e) { /* ignore polling errors */ }
    }, 15000);
    currentCleanup = () => Poller.stop('cards-poll');

    return page;
  }

  const card = Store.cards?.[0];
  if (!card) {
    return el('div', { className: 'cards-page' },
      el('div', { style: { padding: '40px 20px', textAlign: 'center', color: '#94a3b8' } }, 'No card available yet. Please contact support.')
    );
  }

  const gradients = {
    deepblue: 'linear-gradient(135deg, #1e3a5f, #0052FF)',
    purple: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    teal: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    lightblue: 'linear-gradient(135deg, #0284c7, #38bdf8)'
  };

  const colorOptions = ['deepblue', 'purple', 'teal', 'lightblue'];

  const cardVisual = el('div', { className: 'cards-visual-container' });

  const cardScene = el('div', { className: 'card-scene' });

  const cardFlipper = el('div', { className: 'card-flipper' });

  // --- FRONT ---
  const cardFront = el('div', { className: 'card-face card-front', style: { background: gradients[card.color] || gradients.deepblue } });

  const frontTop = el('div', { className: 'card-front-top' });
  const chipEl = el('div', { className: 'card-chip' });
  const contactlessIcon = el('div', { className: 'card-contactless' });
  contactlessIcon.innerHTML = createIcon('wifi', 16);
  const chipRight = el('div', { className: 'card-chip-right' });
  chipRight.appendChild(chipEl);
  chipRight.appendChild(contactlessIcon);
  frontTop.appendChild(chipRight);
  frontTop.appendChild(el('div', { className: 'card-visa' }, 'VISA'));
  cardFront.appendChild(frontTop);

  const frontMid = el('div', { className: 'card-front-mid' });
  const cardNumber = el('div', { className: 'card-number', id: 'card-number-display' }, '•••• •••• •••• ' + card.last4);
  frontMid.appendChild(cardNumber);
  cardFront.appendChild(frontMid);

  const frontBottom = el('div', { className: 'card-front-bottom' });
  const holderCol = el('div', { className: 'card-holder-col' });
  holderCol.appendChild(el('div', { className: 'card-field-label' }, 'CARD HOLDER'));
  holderCol.appendChild(el('div', { className: 'card-field-value' }, card.holder));
  frontBottom.appendChild(holderCol);
  const expiryCol = el('div', { className: 'card-expiry-col' });
  expiryCol.appendChild(el('div', { className: 'card-field-label' }, 'EXPIRES'));
  expiryCol.appendChild(el('div', { className: 'card-field-value' }, card.expiry));
  frontBottom.appendChild(expiryCol);
  cardFront.appendChild(frontBottom);

  const frozenOverlay = el('div', { className: 'card-frozen-overlay' + (card.isFrozen ? ' visible' : '') });
  frozenOverlay.innerHTML = '<div class="card-frozen-icon">' + createIcon('freeze', 48) + '</div><div class="card-frozen-text">Card Frozen</div>';
  cardFront.appendChild(frozenOverlay);

  const shimmerEl = el('div', { className: 'card-shimmer' });
  cardFront.appendChild(shimmerEl);

  cardFlipper.appendChild(cardFront);

  // --- BACK ---
  const cardBack = el('div', { className: 'card-face card-back', style: { background: gradients[card.color] || gradients.deepblue } });

  const magStripe = el('div', { className: 'card-mag-stripe' });
  cardBack.appendChild(magStripe);

  const sigStrip = el('div', { className: 'card-sig-strip' });
  const cvvBox = el('div', { className: 'card-cvv-box' });
  cvvBox.appendChild(el('div', { className: 'card-cvv-label' }, 'CVV'));
  cvvBox.appendChild(el('div', { className: 'card-cvv-value', id: 'card-cvv-display' }, '•••'));
  sigStrip.appendChild(cvvBox);
  cardBack.appendChild(sigStrip);

  const backInfo = el('div', { className: 'card-back-info' });
  backInfo.appendChild(el('div', { className: 'card-back-text' }, 'This card is issued by Coinexs Inc. pursuant to a license from Visa. Use of this card is subject to the card agreement.'));
  backInfo.appendChild(el('div', { className: 'card-back-text' }, 'Valid Thru ' + card.expiry + '  •  ' + card.last4));
  cardBack.appendChild(backInfo);

  cardFlipper.appendChild(cardBack);
  cardScene.appendChild(cardFlipper);
  cardVisual.appendChild(cardScene);

  page.appendChild(cardVisual);

  // Color selector
  const colorSelector = el('div', { className: 'cards-color-selector' });
  let selectedColor = card.color || 'deepblue';
  colorOptions.forEach(c => {
    const dot = el('button', {
      className: 'cards-color-option cards-color-' + c + (c === selectedColor ? ' selected' : ''),
      'aria-label': c
    });
    dot.addEventListener('click', () => {
      haptic('light');
      document.querySelectorAll('.cards-color-option').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      selectedColor = c;
      document.querySelectorAll('.card-face').forEach(face => {
        face.style.background = gradients[c];
      });
    });
    colorSelector.appendChild(dot);
  });
  page.appendChild(colorSelector);

  // Tap to flip
  cardScene.addEventListener('click', () => {
    haptic('light');
    const isFlipped = cardFlipper.classList.toggle('flipped');
    if (isFlipped) {
      const cvvEl = document.getElementById('card-cvv-display');
      if (cvvEl) cvvEl.textContent = card.cvv;
    }
  });

  // Tilt effect on desktop
  requestAnimationFrame(() => {
    createTiltEffect(cardScene, { max: 12, perspective: 1200 });
  });

  // --- Card Status Badge ---
  const statusRow = el('div', { className: 'cards-status-row' });
  const statusBadge = el('div', { className: 'cards-status-badge cards-status-' + (card.isFrozen ? 'frozen' : 'active') });
  const statusIcon = el('span', { className: 'cards-status-dot' });
  statusBadge.appendChild(statusIcon);
  statusBadge.appendChild(document.createTextNode(card.isFrozen ? 'Frozen' : 'Active'));
  statusRow.appendChild(statusBadge);
  if (card.isFrozen) {
    statusRow.appendChild(el('div', { className: 'cards-status-hint' }, 'Tap card to unfreeze'));
  }
  page.appendChild(statusRow);

  // --- Card Actions Grid ---
  const actionsSection = el('div', { className: 'cards-section' });
  actionsSection.appendChild(el('div', { className: 'cards-section-title' }, 'Quick Actions'));

  const actionsGrid = el('div', { className: 'cards-actions-grid' });

  const actions = [
    { icon: card.isFrozen ? 'wifi' : 'freeze', label: card.isFrozen ? 'Unfreeze' : 'Freeze', color: card.isFrozen ? '#10B981' : '#EF4444', action: async () => {
      haptic('medium');
      try {
        await Store.freezeCard(card._id);
        card.isFrozen = !card.isFrozen;
        const frozenOv = document.querySelector('.card-frozen-overlay');
        const statusBadgeEl = document.querySelector('.cards-status-badge');
        if (frozenOv) frozenOv.classList.toggle('visible', card.isFrozen);
        if (statusBadgeEl) {
          statusBadgeEl.className = 'cards-status-badge cards-status-' + (card.isFrozen ? 'frozen' : 'active');
          statusBadgeEl.childNodes[1].textContent = card.isFrozen ? 'Frozen' : 'Active';
        }
        showToast(card.isFrozen ? 'Card frozen successfully' : 'Card unfrozen successfully', card.isFrozen ? 'info' : 'success');
        sendLocalNotification(card.isFrozen ? 'Card Frozen' : 'Card Unfrozen', card.isFrozen ? 'Your virtual card has been frozen.' : 'Your virtual card is now active.');
      } catch (err) { showToast(err.message || 'Failed', 'error'); }
    }},
    { icon: 'key', label: 'Change PIN', color: '#8B5CF6', action: () => modalChangePin() },
    { icon: 'replace', label: 'Replace Card', color: '#F59E0B', action: () => modalReplaceCard() },
    { icon: 'shield-check', label: 'Lock Card', color: '#0052FF', action: () => modalLockCard() }
  ];

  actions.forEach(a => {
    const item = el('button', { className: 'cards-action-item', onClick: a.action });
    const iconWrap = el('div', { className: 'cards-action-icon', style: { background: a.color + '15', color: a.color } });
    iconWrap.innerHTML = createIcon(a.icon, 22);
    item.appendChild(iconWrap);
    item.appendChild(el('div', { className: 'cards-action-label' }, a.label));
    actionsGrid.appendChild(item);
  });
  actionsSection.appendChild(actionsGrid);
  page.appendChild(actionsSection);

  // --- Spending Limits ---
  const limitsSection = el('div', { className: 'cards-section' });
  limitsSection.appendChild(el('div', { className: 'cards-section-title' }, 'Spending Limits'));

  const limitsContainer = el('div', { className: 'cards-limits' });

  const limits = [
    { label: 'Daily', used: card.limits.daily.used, max: card.limits.daily.max, color: '#0052FF' },
    { label: 'Monthly', used: card.limits.monthly.used, max: card.limits.monthly.max, color: '#8B5CF6' },
    { label: 'Per Transaction', used: 0, max: card.limits.perTx.max, color: '#10B981' }
  ];

  limits.forEach(l => {
    const item = el('div', { className: 'cards-limit-item' });
    const topRow = el('div', { className: 'cards-limit-top' });
    topRow.appendChild(el('div', { className: 'cards-limit-label' }, l.label));
    topRow.appendChild(el('div', { className: 'cards-limit-values' }, formatCurrency(l.used) + ' / ' + formatCurrency(l.max)));
    item.appendChild(topRow);

    const progressOuter = el('div', { className: 'cards-limit-bar' });
    const progressInner = el('div', { className: 'cards-limit-fill', style: { width: Math.min((l.used / l.max) * 100, 100) + '%', background: l.color } });
    progressOuter.appendChild(progressInner);
    item.appendChild(progressOuter);

    const pct = Math.round((l.used / l.max) * 100);
    if (pct > 80) {
      item.appendChild(el('div', { className: 'cards-limit-warning' }, '⚠ ' + (100 - pct) + '% remaining'));
    }
    limitsContainer.appendChild(item);
  });
  limitsSection.appendChild(limitsContainer);
  page.appendChild(limitsSection);

  // --- Spending Insights ---
  const spendSection = el('div', { className: 'cards-section' });
  spendSection.appendChild(el('div', { className: 'cards-section-title' }, 'Spending'));

  const spendSummary = el('div', { className: 'cards-spend-summary' });
  const thisMonthEl = el('div', { className: 'cards-spend-card' });
  thisMonthEl.appendChild(el('div', { className: 'cards-spend-label' }, 'This Month'));
  const thisMonthVal = el('div', { className: 'cards-spend-amount' });
  thisMonthVal.appendChild(document.createTextNode(formatCurrency(card.spending.thisMonth)));
  thisMonthEl.appendChild(thisMonthVal);
  spendSummary.appendChild(thisMonthEl);

  const lastMonthEl = el('div', { className: 'cards-spend-card' });
  lastMonthEl.appendChild(el('div', { className: 'cards-spend-label' }, 'Last Month'));
  lastMonthEl.appendChild(el('div', { className: 'cards-spend-amount' }, formatCurrency(card.spending.lastMonth)));
  spendSummary.appendChild(lastMonthEl);

  const diff = card.spending.thisMonth - card.spending.lastMonth;
  const diffPct = Math.round((diff / card.spending.lastMonth) * 100);
  const trendEl = el('div', { className: 'cards-spend-trend ' + (diff > 0 ? 'up' : 'down') });
  trendEl.innerHTML = createIcon(diff > 0 ? 'trend-up' : 'trend-down', 14) + ' ' + (diff > 0 ? '+' : '') + diffPct + '% vs last month';
  spendSummary.appendChild(trendEl);
  spendSection.appendChild(spendSummary);

  // Mini sparkline chart
  const chartEl = el('div', { className: 'cards-spend-chart' });
  const trend = card.spending.trend;
  const chartW = 280, chartH = 48;
  const maxVal = Math.max(...trend);
  const minVal = Math.min(...trend);
  const range = maxVal - minVal || 1;
  const points = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * chartW;
    const y = chartH - ((v - minVal) / range) * (chartH - 8) - 4;
    return x + ',' + y;
  }).join(' ');
  const fillPoints = '0,' + chartH + ' ' + points + ' ' + chartW + ',' + chartH;
  chartEl.innerHTML = '<svg width="100%" height="' + chartH + '" viewBox="0 0 ' + chartW + ' ' + chartH + '" preserveAspectRatio="none"><defs><linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0.02"/></linearGradient></defs><polygon points="' + fillPoints + '" fill="url(#spendGrad)"/><polyline points="' + points + '" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  spendSection.appendChild(chartEl);

  // Category breakdown
  const catSection = el('div', { className: 'cards-categories' });
  card.spending.categories.forEach(cat => {
    const catItem = el('div', { className: 'cards-cat-item' });
    const catLeft = el('div', { className: 'cards-cat-left' });
    const catIcon = el('div', { className: 'cards-cat-icon', style: { background: cat.color + '15', color: cat.color } });
    catIcon.innerHTML = createIcon(cat.icon, 18);
    catLeft.appendChild(catIcon);
    catLeft.appendChild(el('div', { className: 'cards-cat-name' }, cat.name));
    catItem.appendChild(catLeft);
    catItem.appendChild(el('div', { className: 'cards-cat-amount' }, formatCurrency(cat.amount)));
    catSection.appendChild(catItem);
  });
  spendSection.appendChild(catSection);
  page.appendChild(spendSection);

  // --- Card Settings ---
  const settingsSection = el('div', { className: 'cards-section' });
  settingsSection.appendChild(el('div', { className: 'cards-section-title' }, 'Settings'));

  const settings = [
    { label: 'Online Payments', icon: 'globe', key: 'onlinePayments' },
    { label: 'ATM Withdrawals', icon: 'bank', key: 'atmWithdrawals' },
    { label: 'Contactless Payments', icon: 'wifi', key: 'contactless' },
    { label: 'International Payments', icon: 'nfc', key: 'international' }
  ];

  settings.forEach(s => {
    const row = el('div', { className: 'cards-settings-row' });
    const left = el('div', { className: 'cards-settings-left' });
    const iconWrap = el('div', { className: 'cards-settings-icon' });
    iconWrap.innerHTML = createIcon(s.icon, 20);
    left.appendChild(iconWrap);
    left.appendChild(el('div', { className: 'cards-settings-label' }, s.label));
    row.appendChild(left);
    row.appendChild(createToggle(async (on) => {
      haptic('light');
      card.settings[s.key] = on;
      try { await Store.updateCardSettings(card._id, { settings: { [s.key]: on } }); } catch(e) { card.settings[s.key] = !on; showToast(e.message || 'Failed to update setting', 'error'); return; }
      showToast(s.label + (on ? ' enabled' : ' disabled'), 'success');
    }, card.settings[s.key]));
    settingsSection.appendChild(row);
  });
  page.appendChild(settingsSection);

  // --- Danger Zone ---
  const dangerSection = el('div', { className: 'cards-section cards-danger-zone' });
  const reportRow = el('div', { className: 'cards-settings-row', onClick: () => modalReportCard() });
  const reportLeft = el('div', { className: 'cards-settings-left' });
  const reportIcon = el('div', { className: 'cards-settings-icon', style: { color: 'var(--danger)' } });
  reportIcon.innerHTML = createIcon('ban', 20);
  reportLeft.appendChild(reportIcon);
  reportLeft.appendChild(el('div', { className: 'cards-settings-label', style: { color: 'var(--danger)' } }, 'Report Lost / Stolen'));
  reportRow.appendChild(reportLeft);
  const chevDiv = el('div', { style: { color: 'var(--text-muted)' } });
  chevDiv.innerHTML = createIcon('chevron_right', 20);
  reportRow.appendChild(chevDiv);
  dangerSection.appendChild(reportRow);
  page.appendChild(dangerSection);

  return page;
}

function renderRates() {
  const page = el('div', { className: 'rates-page' });

  /* Header */
  const header = el('div', { className: 'page-header' });
  header.appendChild(el('div', { className: 'page-header-left' }));
  header.appendChild(el('div', { className: 'page-header-center' }, 'Rates'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  /* Search bar */
  const searchBar = el('div', { className: 'rates-search' });
  const searchIcon = el('span', { className: 'rates-search-icon' });
  searchIcon.innerHTML = createIcon('magnifying-glass', 18);
  const searchInput = el('input', { type: 'text', className: 'rates-search-input', placeholder: t('search'), 'aria-label': 'Search coins' });
  searchBar.appendChild(searchIcon);
  searchBar.appendChild(searchInput);
  page.appendChild(searchBar);

  /* Filter chips */
  const filters = el('div', { className: 'rates-filters' });
  let activeFilter = 'All';
  const filterLabels = { All: t('all'), Favorites: t('favorites') };
  const filterOptions = ['All', 'Crypto', 'Fiat', 'Favorites'];
  filterOptions.forEach(f => {
    const chip = el('button', {
      className: 'rates-filter-chip' + (f === 'All' ? ' active' : ''),
      onClick: () => {
        activeFilter = f;
        filters.querySelectorAll('.rates-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        haptic('light');
        renderCoinList();
      }
    }, filterLabels[f] || f);
    filters.appendChild(chip);
  });
  page.appendChild(filters);

  /* Market overview bar */
  const mktBar = el('div', { className: 'rates-mkt-bar' });
  const mktItems = [
    { label: 'Market Cap', value: formatCurrencyCompact(1.72e12) },
    { label: '24h Vol', value: formatCurrencyCompact(84.2e9) },
    { label: 'BTC Dom', value: '51.4%' }
  ];
  mktItems.forEach(m => {
    const item = el('div', { className: 'rates-mkt-item' });
    item.appendChild(el('div', { className: 'rates-mkt-label' }, m.label));
    item.appendChild(el('div', { className: 'rates-mkt-value' }, m.value));
    mktBar.appendChild(item);
  });
  page.appendChild(mktBar);

  /* Top Gainers / Losers horizontal scroll */
  const allRates = Store.rates.filter(r => r.type === 'crypto');
  const gainers = [...allRates].sort((a, b) => b.change - a.change).slice(0, 4);
  const losers = [...allRates].sort((a, b) => a.change - b.change).slice(0, 4);

  function renderCarousel(title, items, isGainer) {
    const section = el('div', { className: 'rates-carousel-section' });
    section.appendChild(el('div', { className: 'rates-carousel-title' }, title));
    const scroll = el('div', { className: 'rates-carousel-scroll' });
    items.forEach(rate => {
      const card = el('div', { className: 'rates-carousel-card', onClick: () => openCoinDetail(rate) });
      const top = el('div', { className: 'rates-carousel-top' });
      const icon = el('div', { className: 'rates-carousel-icon', style: { background: rate.color + '20', color: rate.color } });
      icon.innerHTML = createIcon(rate.icon, 20);
      top.appendChild(icon);
      top.appendChild(el('div', { className: 'rates-carousel-code' }, rate.pair.split('/')[0]));
      card.appendChild(top);
      card.appendChild(el('div', { className: 'rates-carousel-price' }, formatCompact(rate.buy)));
      const changeEl = el('div', {
        className: 'rates-carousel-change ' + (isGainer ? 'up' : 'down')
      });
      changeEl.innerHTML = createIcon(isGainer ? 'trend-up' : 'trend-down', 14);
      changeEl.appendChild(document.createTextNode(' ' + (isGainer ? '+' : '') + rate.change.toFixed(2) + '%'));
      card.appendChild(changeEl);
      scroll.appendChild(card);
    });
    section.appendChild(scroll);
    return section;
  }

  page.appendChild(renderCarousel(t('top_gainers'), gainers, true));
  page.appendChild(renderCarousel(t('top_losers'), losers, false));

  /* Coin list header */
  const listHeader = el('div', { className: 'rates-list-header' });
  listHeader.appendChild(el('div', { className: 'rates-lh-pair' }, 'Pair'));
  listHeader.appendChild(el('div', { className: 'rates-lh-price' }, 'Price'));
  listHeader.appendChild(el('div', { className: 'rates-lh-change' }, '24h'));
  listHeader.appendChild(el('div', { className: 'rates-lh-spark' }, 'Chart'));
  page.appendChild(listHeader);

  /* Coin list container */
  const listContainer = el('div', { className: 'rates-list' });
  page.appendChild(listContainer);

  function formatPrice(price) {
    const sym = CURRENCY_SYMBOLS[getUserCurrency()] || '$';
    if (price >= 1000) return sym + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (price >= 1) return sym + price.toFixed(2);
    return sym + price.toFixed(4);
  }

  function formatCompact(val) {
    if (!val || val === '-') return '-';
    const sym = CURRENCY_SYMBOLS[getUserCurrency()] || '$';
    return sym + val;
  }

  function renderCoinList() {
    listContainer.innerHTML = '';
    const q = (searchInput.value || '').toLowerCase();
    let filtered = Store.rates.filter(r => {
      if (q && !r.pair.toLowerCase().includes(q) && !(r.name || '').toLowerCase().includes(q)) return false;
      if (activeFilter === 'Crypto' && r.type !== 'crypto') return false;
      if (activeFilter === 'Fiat' && r.type !== 'fiat') return false;
      if (activeFilter === 'Favorites' && !r.favorite) return false;
      return true;
    });

    if (!filtered.length) {
      const empty = el('div', { className: 'rates-empty' });
      empty.innerHTML = createIcon('magnifying-glass', 48);
      empty.appendChild(el('div', { className: 'rates-empty-text' }, 'No coins found'));
      listContainer.appendChild(empty);
      return;
    }

    filtered.forEach(rate => {
      const row = el('div', { className: 'rates-row', onClick: () => openCoinDetail(rate) });

      /* Pair + icon */
      const pairCell = el('div', { className: 'rates-row-pair' });
      const iconCircle = el('div', { className: 'rates-row-icon', style: { background: rate.color + '20', color: rate.color } });
      iconCircle.innerHTML = createIcon(rate.icon, 22);
      pairCell.appendChild(iconCircle);
      const pairText = el('div', { className: 'rates-row-pair-text' });
      pairText.appendChild(el('div', { className: 'rates-row-symbol' }, rate.pair.split('/')[0]));
      pairText.appendChild(el('div', { className: 'rates-row-name' }, rate.name || rate.pair));
      pairCell.appendChild(pairText);
      row.appendChild(pairCell);

      /* Price */
      row.appendChild(el('div', { className: 'rates-row-price' }, formatPrice(rate.buy)));

      /* Change */
      const changeEl = el('div', {
        className: 'rates-row-change ' + (rate.change >= 0 ? 'up' : 'down')
      }, (rate.change >= 0 ? '+' : '') + rate.change.toFixed(2) + '%');
      row.appendChild(changeEl);

      /* Sparkline */
      const sparkCell = el('div', { className: 'rates-row-spark' });
      const trend = rate.trend || [1, 2, 3, 4, 5, 4, 3, 2];
      const isUp = trend[trend.length - 1] >= trend[0];
      const sw = 64, sh = 28;
      const max = Math.max(...trend);
      const min = Math.min(...trend);
      const range = max - min || 1;
      const gradId = 'sg' + Math.random().toString(36).slice(2, 8);
      const pts = trend.map((v, i) => {
        const x = (i / (trend.length - 1)) * sw;
        const y = sh - ((v - min) / range) * sh;
        return x + ',' + y;
      }).join(' ');
      const areaPts = pts + ' ' + sw + ',' + sh + ' 0,' + sh;
      sparkCell.innerHTML = '<svg width="' + sw + '" height="' + sh + '" viewBox="0 0 ' + sw + ' ' + sh + '"><defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + (isUp ? 'var(--success)' : 'var(--danger)') + '" stop-opacity="0.3"/><stop offset="100%" stop-color="' + (isUp ? 'var(--success)' : 'var(--danger)') + '" stop-opacity="0.02"/></linearGradient></defs><polygon points="' + areaPts + '" fill="url(#' + gradId + ')"/><polyline points="' + pts + '" fill="none" stroke="' + (isUp ? 'var(--success)' : 'var(--danger)') + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      row.appendChild(sparkCell);

      /* Chevron */
      const chevron = el('div', { className: 'rates-row-chevron' });
      chevron.innerHTML = createIcon('caret-right', 16);
      row.appendChild(chevron);

      listContainer.appendChild(row);
    });
  }

  renderCoinList();
  searchInput.addEventListener('input', renderCoinList);

  /* Converter */
  const converter = el('div', { className: 'rates-converter' });
  converter.appendChild(el('div', { className: 'converter-title' }, 'Convert'));

  /* From row */
  const fromRow = el('div', { className: 'converter-from-row' });
  const fromLabel = el('div', { className: 'converter-label' }, 'From');
  fromRow.appendChild(fromLabel);
  const fromSelect = el('select', { className: 'converter-select', 'aria-label': 'From currency' });
  Store.rates.forEach(r => {
    const opt = el('option', { value: r.pair }, r.pair.split('/')[0] + ' — ' + (r.name || r.pair));
    fromSelect.appendChild(opt);
  });
  fromSelect.value = 'BTC/USD';
  const fromInput = el('input', { type: 'number', className: 'converter-input-lg', placeholder: '0.00', value: '1', 'aria-label': 'Amount' });
  fromRow.appendChild(fromSelect);
  fromRow.appendChild(fromInput);
  converter.appendChild(fromRow);

  /* Swap button */
  const swapRow = el('div', { className: 'converter-swap-row' });
  const swapLine = el('div', { className: 'converter-swap-line' });
  swapRow.appendChild(swapLine);
  const swapBtnEl = el('button', { className: 'converter-swap-btn', 'aria-label': 'Swap currencies' });
  swapBtnEl.innerHTML = createIcon('arrows-down-up', 18);
  let swapped = false;
  swapBtnEl.addEventListener('click', () => {
    swapped = !swapped;
    swapBtnEl.classList.toggle('swapped', swapped);
    const tmp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmp;
    const tmpV = fromInput.value;
    fromInput.value = toOutput.value;
    toOutput.value = tmpV;
    updateConverterRate();
  });
  swapRow.appendChild(swapBtnEl);
  const swapLine2 = el('div', { className: 'converter-swap-line' });
  swapRow.appendChild(swapLine2);
  converter.appendChild(swapRow);

  /* To row */
  const toRow = el('div', { className: 'converter-from-row' });
  const toLabel = el('div', { className: 'converter-label' }, 'To');
  toRow.appendChild(toLabel);
  const toSelect = el('select', { className: 'converter-select', 'aria-label': 'To currency' });
  Store.rates.forEach(r => {
    const opt = el('option', { value: r.pair }, r.pair.split('/')[0] + ' — ' + (r.name || r.pair));
    toSelect.appendChild(opt);
  });
  toSelect.value = 'ETH/USD';
  const toOutput = el('div', { className: 'converter-output-lg' }, '0.0066');
  toRow.appendChild(toSelect);
  toRow.appendChild(toOutput);
  converter.appendChild(toRow);

  /* Rate info */
  const rateInfo = el('div', { className: 'converter-rate-info' });
  rateInfo.innerHTML = createIcon('info', 14);
  rateInfo.appendChild(document.createTextNode(' 1 BTC = 18.85 ETH'));
  converter.appendChild(rateInfo);

  function updateConverterRate() {
    const from = Store.rates.find(r => r.pair === fromSelect.value);
    const to = Store.rates.find(r => r.pair === toSelect.value);
    if (!from || !to) return;
    const val = parseFloat(fromInput.value) || 0;
    const rate = from.buy / to.buy;
    const result = val * rate;
    toOutput.textContent = result < 0.01 ? result.toFixed(8) : result.toFixed(4);
    rateInfo.innerHTML = '';
    rateInfo.innerHTML = createIcon('info', 14);
    rateInfo.appendChild(document.createTextNode(' 1 ' + from.pair.split('/')[0] + ' = ' + rate.toFixed(6) + ' ' + to.pair.split('/')[0]));
  }
  fromSelect.addEventListener('change', updateConverterRate);
  toSelect.addEventListener('change', updateConverterRate);
  fromInput.addEventListener('input', updateConverterRate);

  page.appendChild(converter);

  /* Coin detail modal */
  function openCoinDetail(rate) {
    haptic('light');
    const modal = document.getElementById('modal');
    if (!modal) return;
    modal.innerHTML = '';
    modal.className = 'modal open';

    const backdrop = el('div', { className: 'modal-backdrop', onClick: closeModal });
    modal.appendChild(backdrop);

    const sheet = el('div', { className: 'modal-sheet rates-detail-sheet' });

    /* Handle */
    const handle = el('div', { className: 'modal-handle' });
    sheet.appendChild(handle);

    /* Close button */
    const closeBtn = el('button', { className: 'modal-close', 'aria-label': 'Close', onClick: closeModal });
    closeBtn.innerHTML = createIcon('x', 20);
    sheet.appendChild(closeBtn);

    /* Coin header */
    const coinHead = el('div', { className: 'rates-detail-head' });
    const coinIcon = el('div', { className: 'rates-detail-icon', style: { background: rate.color + '20', color: rate.color } });
    coinIcon.innerHTML = createIcon(rate.icon, 32);
    coinHead.appendChild(coinIcon);
    coinHead.appendChild(el('div', { className: 'rates-detail-name' }, rate.name || rate.pair));
    coinHead.appendChild(el('div', { className: 'rates-detail-pair' }, rate.pair));
    sheet.appendChild(coinHead);

    /* Price */
    const priceBlock = el('div', { className: 'rates-detail-price' });
    priceBlock.appendChild(el('div', { className: 'rates-detail-price-val' }, formatPrice(rate.buy)));
    const chEl = el('div', { className: 'rates-detail-change ' + (rate.change >= 0 ? 'up' : 'down') });
    chEl.innerHTML = createIcon(rate.change >= 0 ? 'trend-up' : 'trend-down', 16);
    chEl.appendChild(document.createTextNode(' ' + (rate.change >= 0 ? '+' : '') + rate.change.toFixed(2) + '% (24h)'));
    priceBlock.appendChild(chEl);
    sheet.appendChild(priceBlock);

    /* Large sparkline */
    const largeSpark = el('div', { className: 'rates-detail-spark' });
    const trend = rate.trend || [1, 2, 3, 4, 5, 4, 3, 2];
    const isUp = trend[trend.length - 1] >= trend[0];
    const lw = 320, lh = 120;
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    const lGradId = 'lg' + Math.random().toString(36).slice(2, 8);
    const pts = trend.map((v, i) => {
      const x = (i / (trend.length - 1)) * lw;
      const y = lh - ((v - min) / range) * lh;
      return x + ',' + y;
    }).join(' ');
    const areaPts = pts + ' ' + lw + ',' + lh + ' 0,' + lh;
    largeSpark.innerHTML = '<svg width="100%" height="' + lh + '" viewBox="0 0 ' + lw + ' ' + lh + '" preserveAspectRatio="none"><defs><linearGradient id="' + lGradId + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + (isUp ? 'var(--success)' : 'var(--danger)') + '" stop-opacity="0.25"/><stop offset="100%" stop-color="' + (isUp ? 'var(--success)' : 'var(--danger)') + '" stop-opacity="0.01"/></linearGradient></defs><polygon points="' + areaPts + '" fill="url(#' + lGradId + ')"/><polyline points="' + pts + '" fill="none" stroke="' + (isUp ? 'var(--success)' : 'var(--danger)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    sheet.appendChild(largeSpark);

    /* Stats grid */
    const stats = el('div', { className: 'rates-detail-stats' });
    const statItems = [
      { label: '24h High', value: formatPrice(rate.high24), icon: 'arrow-up-right' },
      { label: '24h Low', value: formatPrice(rate.low24), icon: 'arrow-down-right' },
      { label: 'Market Cap', value: rate.marketCap, icon: 'chart-bar' },
      { label: '24h Volume', value: rate.volume, icon: 'chart-line-up' },
      { label: 'Circulating Supply', value: rate.supply, icon: 'coins' },
      { label: 'Buy Price', value: formatPrice(rate.buy), icon: 'arrow-up-right' }
    ];
    stats.appendChild(el('div', { className: 'rates-detail-stats-title' }, 'Market Data'));
    statItems.forEach(s => {
      const row = el('div', { className: 'rates-detail-stat-row' });
      const left = el('div', { className: 'rates-detail-stat-left' });
      const sIcon = el('div', { className: 'rates-detail-stat-icon' });
      sIcon.innerHTML = createIcon(s.icon, 16);
      left.appendChild(sIcon);
      left.appendChild(el('div', { className: 'rates-detail-stat-label' }, s.label));
      row.appendChild(left);
      row.appendChild(el('div', { className: 'rates-detail-stat-value' }, s.value));
      stats.appendChild(row);
    });
    sheet.appendChild(stats);

    /* Action buttons */
    const actions = el('div', { className: 'rates-detail-actions' });
    const buyBtn = el('button', { className: 'btn btn-primary btn-lg w-full', onClick: () => { closeModal(); navigate('/send'); } });
    buyBtn.innerHTML = createIcon('arrow-up-right', 18);
    buyBtn.appendChild(document.createTextNode(' Buy ' + (rate.pair.split('/')[0])));
    actions.appendChild(buyBtn);
    const favBtn = el('button', { className: 'btn btn-outline btn-lg w-full', onClick: () => { rate.favorite = !rate.favorite; haptic('success'); showToast(rate.favorite ? 'Added to favorites' : 'Removed from favorites', 'success'); closeModal(); } });
    favBtn.innerHTML = createIcon(rate.favorite ? 'star' : 'star', 18);
    favBtn.appendChild(document.createTextNode(' ' + (rate.favorite ? 'Favorited' : 'Add to Favorites')));
    actions.appendChild(favBtn);
    sheet.appendChild(actions);

    modal.appendChild(sheet);
  }

  return page;
}

function renderProfile() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }

  const page = el('div', { className: 'profile-page' });

  const hero = el('div', { className: 'profile-hero' });
  const avatar = el('img', { src: Store.user.avatar || getAvatar(Store.user.name), alt: Store.user.name, className: 'profile-avatar' });
  hero.appendChild(avatar);
  hero.appendChild(el('div', { className: 'profile-name' }, Store.user.name));
  hero.appendChild(el('div', { className: 'profile-email' }, Store.user.email));
  page.appendChild(hero);

  const statusSection = el('div', { className: 'profile-status' });
  const statusCard = el('div', { className: 'profile-status-card' });
  if (Store.user.isLimited) {
    const statusIcon = el('div', { className: 'profile-status-icon' });
    statusIcon.innerHTML = createIcon('alert-triangle', 24);
    statusIcon.style.color = 'var(--warning)';
    statusCard.appendChild(statusIcon);
    const statusInfo = el('div', { className: 'profile-status-info' });
    statusInfo.appendChild(el('div', { className: 'profile-status-title' }, 'Account is Limited'));
    statusInfo.appendChild(el('div', { className: 'profile-status-sub' }, 'Complete tier 3 for unlimited limits'));
    statusCard.appendChild(statusInfo);
    statusCard.appendChild(el('button', {
      className: 'profile-status-btn',
      onClick: () => navigate('/verification')
    }, 'Upgrade'));
  } else {
    const statusIcon = el('div', { className: 'profile-status-icon' });
    statusIcon.innerHTML = createIcon('check', 24);
    statusIcon.style.color = 'var(--success)';
    statusCard.appendChild(statusIcon);
    const statusInfo = el('div', { className: 'profile-status-info' });
    statusInfo.appendChild(el('div', { className: 'profile-status-title' }, 'Account Verified'));
    statusInfo.appendChild(el('div', { className: 'profile-status-sub' }, 'Tier ' + Store.user.tier + ' — Full access'));
    statusCard.appendChild(statusInfo);
  }
  statusSection.appendChild(statusCard);
  page.appendChild(statusSection);

  const generalSection = el('div', { className: 'profile-section' });
  const menuItems = [
    { icon: 'user', label: t('personal_info'), action: () => navigate('/personal-info') },
    { icon: 'sun', label: t('theme'), toggle: true, initial: state.theme === 'dark', onChange: async (on) => {
      Store.setTheme(on ? 'dark' : 'light');
      state.theme = on ? 'dark' : 'light';
      try { await Store.updateSettings({ theme: on ? 'dark' : 'light' }); } catch(e) {}
    }},
    { icon: 'bell', label: t('notification'), toggle: true, initial: Store.user.settings?.transactionAlerts !== false, onChange: async (on) => {
      try { await Store.updateSettings({ transactionAlerts: on }); } catch(e) {}
    }},
    { icon: 'shield', label: t('account_verification'), action: () => navigate('/verification') },
    { icon: 'bank', label: t('bank_account'), action: () => navigate('/bank-account') },
    { icon: 'lock', label: t('security'), action: () => navigate('/security') },
    { icon: 'globe', label: t('language'), value: Store.user.settings?.language || 'English', action: () => {}, _update: null },
    { icon: 'currency-dollar', label: t('currency'), value: Store.user.settings?.currency || 'USD', action: () => {}, _update: null },
    { icon: 'users', label: t('refer_and_earn'), action: () => navigate('/referral') }
  ];

  menuItems.forEach(item => {
    const row = el('div', { className: 'profile-row' });
    if (item.label === t('language')) {
      const langValueEl = el('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' } }, item.value);
      row.addEventListener('click', () => modalSelectOption(t('language'), ['English', 'Spanish', 'French', 'German', 'Portuguese'], item.value, async (val) => {
        await Store.updateSettings({ language: val });
        applyLanguage();
      }, (val) => { langValueEl.textContent = val; }));
      row.appendChild(el('div', { className: 'profile-row-icon' })).innerHTML = createIcon(item.icon, 20);
      row.children[0].style.color = 'var(--primary)';
      row.appendChild(el('div', { className: 'profile-row-label' }, item.label));
      row.appendChild(langValueEl);
      const chevron = el('div', { style: { display: 'flex', color: 'var(--text-muted)' } });
      chevron.innerHTML = createIcon('chevron_right', 20);
      row.appendChild(chevron);
    } else if (item.label === t('currency')) {
      const curValueEl = el('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' } }, item.value);
      row.addEventListener('click', () => modalSelectOption(t('currency'), ['USD', 'EUR', 'GBP', 'NGN', 'BRL'], item.value, async (val) => {
        await Store.updateSettings({ currency: val });
      }, (val) => { curValueEl.textContent = val; }));
      row.appendChild(el('div', { className: 'profile-row-icon' })).innerHTML = createIcon(item.icon, 20);
      row.children[0].style.color = 'var(--primary)';
      row.appendChild(el('div', { className: 'profile-row-label' }, item.label));
      row.appendChild(curValueEl);
      const chevron = el('div', { style: { display: 'flex', color: 'var(--text-muted)' } });
      chevron.innerHTML = createIcon('chevron_right', 20);
      row.appendChild(chevron);
    } else {
      if (item.action) row.addEventListener('click', item.action);
      const iconWrap = el('div', { className: 'profile-row-icon' });
      iconWrap.innerHTML = createIcon(item.icon, 20);
      iconWrap.style.color = 'var(--primary)';
      row.appendChild(iconWrap);
      row.appendChild(el('div', { className: 'profile-row-label' }, item.label));
      if (item.toggle) {
        row.appendChild(createToggle(item.onChange, item.initial));
      } else {
        if (item.value) {
          row.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' } }, item.value));
        }
        const chevron = el('div', { style: { display: 'flex', color: 'var(--text-muted)' } });
        chevron.innerHTML = createIcon('chevron_right', 20);
        row.appendChild(chevron);
      }
    }
    generalSection.appendChild(row);
  });
  page.appendChild(generalSection);

  const aboutSection = el('div', { className: 'profile-section' });
  [
    { icon: 'identification-card', label: t('terms_of_service'), action: () => modalLegal('Terms of Service', 'terms') },
    { icon: 'shield', label: t('privacy_policy'), action: () => modalLegal('Privacy Policy', 'privacy') },
    { icon: 'headphones', label: t('help_center'), action: () => navigate('/support') }
  ].forEach((item, i) => {
    const row = el('div', { className: 'profile-row', onClick: item.action });
    const icon = el('div', { className: 'profile-row-icon' });
    icon.innerHTML = createIcon(item.icon, 20);
    icon.style.color = 'var(--primary)';
    row.appendChild(icon);
    row.appendChild(el('div', { className: 'profile-row-label' }, item.label));
    const chev = el('div', { style: { display: 'flex', color: 'var(--text-muted)' } });
    chev.innerHTML = createIcon('chevron_right', 20);
    row.appendChild(chev);
    aboutSection.appendChild(row);
  });
  const removeRow = el('div', { className: 'profile-row', onClick: () => navigate('/remove-account') });
  const removeIcon = el('div', { className: 'profile-row-icon' });
  removeIcon.innerHTML = createIcon('trash', 20);
  removeIcon.style.color = 'var(--danger)';
  removeRow.appendChild(removeIcon);
  removeRow.appendChild(el('div', { className: 'profile-row-label', style: { color: 'var(--danger)' } }, t('remove_account')));
  const removeChevron = el('div', { style: { display: 'flex', color: 'var(--text-muted)' } });
  removeChevron.innerHTML = createIcon('chevron_right', 20);
  removeRow.appendChild(removeChevron);
  aboutSection.appendChild(removeRow);
  page.appendChild(aboutSection);

  const logoutSection = el('div', { className: 'profile-logout' });
  logoutSection.appendChild(el('button', {
    onClick: () => modalConfirmLogout()
  }, t('log_out')));
  page.appendChild(logoutSection);

  return page;
}

function renderNotifications() {
  const page = el('div', { className: 'notifications-page' });

  const header = el('div', { className: 'page-header' });
  header.appendChild(el('div', { className: 'page-header-left' }));
  header.appendChild(el('div', { className: 'page-header-center' }, t('notification') + 's'));
  const right = el('div', { className: 'page-header-right' });
  header.appendChild(right);
  page.appendChild(header);

  let activeTab = 'All';
  const tabs = el('div', { className: 'notif-tabs' });
  const tabDefs = [
    { key: 'All', label: 'All' },
    { key: 'transaction', label: 'Transactions' },
    { key: 'promotion', label: 'Promotions' },
    { key: 'system', label: 'Security' }
  ];
  tabDefs.forEach((t, i) => {
    const count = t.key === 'All' ? Store.notifications.filter(n => !n.read).length : Store.notifications.filter(n => n.type === t.key && !n.read).length;
    const tab = el('button', { className: 'notif-tab' + (i === 0 ? ' active' : ''), onClick: () => {
      activeTab = t.key;
      tabs.querySelectorAll('.notif-tab').forEach((tb, j) => tb.classList.toggle('active', tabDefs[j].key === t.key));
      renderList();
      haptic('light');
    }});
    tab.appendChild(document.createTextNode(t.label));
    if (count > 0) {
      const badge = el('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', borderRadius: '9px', background: 'var(--danger)', color: 'white', fontSize: '10px', fontWeight: '700', marginLeft: '4px', padding: '0 4px' } }, '' + count);
      tab.appendChild(badge);
    }
    tabs.appendChild(tab);
  });
  page.appendChild(tabs);

  const markBtn = el('button', {
    className: 'btn-notif-mark',
    onClick: () => {
      Store.notifications.forEach(n => n.read = true);
      Store.markAllNotificationsRead().catch(() => {});
      haptic('success');
      showToast('All marked as read', 'success');
      markBtn.style.display = 'none';
      renderList();
    }
  }, 'Mark all as read');
  markBtn.style.display = Store.notifications.filter(n => !n.read).length ? 'flex' : 'none';
  markBtn.style.alignItems = 'center';
  markBtn.style.justifyContent = 'center';
  markBtn.style.margin = '0 16px 8px';
  page.appendChild(markBtn);

  const listContainer = el('div');
  page.appendChild(listContainer);

  const notifColors = {
    transaction: { bg: 'var(--success-light)', color: 'var(--success)', icon: 'arrow-down-left' },
    promotion: { bg: 'var(--primary-light)', color: 'var(--primary)', icon: 'gift' },
    system: { bg: 'var(--danger-light)', color: 'var(--danger)', icon: 'shield-check' }
  };

  function timeAgo(dateStr) {
    if (!dateStr) return 'Just now';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return Math.floor(days / 30) + 'mo ago';
  }

  function getGroup(relTime) {
    if (relTime.includes('m ago') || relTime === 'Just now') return 'Recent';
    if (relTime.includes('h ago')) return 'Earlier';
    return 'Older';
  }

  function renderList() {
    listContainer.innerHTML = '';
    let filtered = activeTab === 'All' ? Store.notifications.slice() : Store.notifications.filter(n => n.type === activeTab);

    if (!filtered.length) {
      const empty = el('div', { style: { textAlign: 'center', padding: '64px 24px' } });
      const emptyIcon = el('div', { style: { color: 'var(--text-muted)', marginBottom: '16px' } });
      emptyIcon.innerHTML = createIcon('chat-circle', 48);
      empty.appendChild(emptyIcon);
      empty.appendChild(el('div', { style: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' } }, 'No notifications'));
      empty.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-muted)' } }, 'You\'re all caught up!'));
      listContainer.appendChild(empty);
      return;
    }

    const groups = {};
    filtered.forEach(n => {
      const rel = timeAgo(n.createdAt);
      n._time = n._time || rel;
      const g = getGroup(rel);
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    });

    ['Recent', 'Earlier', 'Older'].forEach(groupName => {
      const notifs = groups[groupName];
      if (!notifs || !notifs.length) return;

      const groupLabel = el('div', { style: { padding: '12px 16px 4px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' } }, groupName);
      listContainer.appendChild(groupLabel);

      notifs.forEach(n => {
        const colors = notifColors[n.type] || notifColors.system;
        const item = el('div', { className: 'notif-item' + (n.read ? '' : ' unread'), role: 'listitem', onClick: () => {
          if (!n.read) {
            n.read = true;
            item.classList.remove('unread');
            const dot = item.querySelector('.notif-unread-dot');
            if (dot) dot.remove();
            haptic('light');
            Store.markNotificationRead(n._id).catch(() => {});
          }
        }, style: { cursor: 'pointer' } });

        const icon = el('div', { className: 'notif-icon', style: { background: colors.bg, color: colors.color } });
        icon.innerHTML = createIcon(colors.icon, 20);
        item.appendChild(icon);

        const content = el('div', { className: 'notif-content' });
        const titleRow = el('div', { className: 'notif-title' });
        titleRow.appendChild(document.createTextNode(n.title));
        if (!n.read) titleRow.appendChild(el('div', { className: 'notif-unread-dot', 'aria-label': 'Unread' }));
        content.appendChild(titleRow);
        content.appendChild(el('div', { className: 'notif-message' }, n.message));

        const metaRow = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' } });
        metaRow.appendChild(el('div', { className: 'notif-time' }, n._time || timeAgo(n.createdAt)));
        if (n.type === 'system' && n.title.includes('Alert')) {
          const actions = el('div', { style: { display: 'flex', gap: '6px' } });
          actions.appendChild(el('button', { style: { fontSize: '11px', fontWeight: '600', color: 'var(--success)', background: 'var(--success-light)', border: 'none', borderRadius: '9999px', padding: '3px 10px', cursor: 'pointer' }, onClick: (e) => { e.stopPropagation(); haptic('success'); showToast('Marked as safe', 'success'); } }, 'Yes, me'));
          actions.appendChild(el('button', { style: { fontSize: '11px', fontWeight: '600', color: 'var(--danger)', background: 'var(--danger-light)', border: 'none', borderRadius: '9999px', padding: '3px 10px', cursor: 'pointer' }, onClick: (e) => { e.stopPropagation(); haptic('error'); showToast('Account secured', 'success'); } }, 'Not me'));
          metaRow.appendChild(actions);
        }
        content.appendChild(metaRow);
        item.appendChild(content);
        listContainer.appendChild(item);
      });
    });
  }

  renderList();
  return page;
}

function renderVerification() {
  const page = el('div', { className: 'notifications-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Verification'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const content = el('div', { className: 'verification-page' });
  const u = Store.user || {};
  let currentKyc = u.kycStatus;
  const userTier = u.tier || 1;
  const userBalance = (u.balance && u.balance.USD) || 0;

  function getTierStatus(tierNum) {
    if (tierNum === 1) return 'completed';
    if (tierNum === 2) return currentKyc === 'verified' ? 'completed' : (currentKyc === 'pending' ? 'pending' : 'locked');
    if (tierNum === 3) {
      if (userTier >= 3) return 'completed';
      if (currentKyc === 'verified' && userBalance >= 5000) return 'completed';
      if (currentKyc === 'verified') return 'pending';
      return 'locked';
    }
    return 'locked';
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  function buildTiers(status) {
    content.innerHTML = '';
    const progress = el('div', { className: 'verif-progress' });
    const activeTier = userTier >= 3 ? 3 : (userTier >= 2 ? 2 : 1);
    for (let i = 0; i < 3; i++) {
      progress.appendChild(el('div', { className: 'verif-progress-segment' + (i < activeTier ? ' filled' : '') }));
    }
    content.appendChild(progress);
    content.appendChild(el('div', { className: 'verif-progress-label' }, 'Tier ' + activeTier + ' of 3'));

    const tiers = [
      {
        name: 'Tier 1 — Basic',
        desc: 'Email verification',
        limit: 'Send: Not available',
        status: 'completed',
        reqs: [{ text: 'Email verified', done: true }]
      },
      {
        name: 'Tier 2 — Standard',
        desc: 'Submit your information for verification',
        limit: 'Send: Up to $1,000/day',
        status: getTierStatus(2),
        reqs: [
          { text: 'Personal details', done: currentKyc === 'verified' || currentKyc === 'pending' },
          { text: 'Government ID', done: currentKyc === 'verified' || currentKyc === 'pending' },
          { text: 'Selfie photo', done: currentKyc === 'verified' || currentKyc === 'pending' },
          { text: 'Admin approval', done: currentKyc === 'verified' }
        ]
      },
      {
        name: 'Tier 3 — Premium',
        desc: 'Unlock crypto sending',
        limit: 'Send: Up to $50,000/day · Crypto addresses allowed',
        status: getTierStatus(3),
        reqs: [
          { text: 'Tier 2 approved', done: currentKyc === 'verified' },
          { text: 'Minimum $5,000 balance', done: userBalance >= 5000 }
        ]
      }
    ];

    tiers.forEach(t => {
      const tier = el('div', { className: 'verif-tier ' + t.status });
      const tierHeader = el('div', { className: 'verif-tier-header' });
      tierHeader.appendChild(el('div', { className: 'verif-tier-name' }, t.name));
      const badge = el('div', { className: 'verif-tier-badge' });
      if (t.status === 'completed') { badge.className += ' badge-success'; badge.textContent = 'Active'; }
      else if (t.status === 'pending') { badge.className += ' badge-warning'; badge.textContent = status === 'rejected' ? 'Rejected' : 'Pending'; }
      else { badge.className += ' badge-gray'; badge.textContent = 'Locked'; }
      tierHeader.appendChild(badge);
      tier.appendChild(tierHeader);
      tier.appendChild(el('div', { className: 'verif-tier-desc' }, t.desc));
      tier.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' } }, t.limit));

      const reqs = el('div', { className: 'verif-tier-reqs' });
      t.reqs.forEach(r => {
        const req = el('div', { className: 'verif-req' + (r.done ? ' done' : '') });
        const checkIcon = el('span', { style: { width: '16px', height: '16px', display: 'flex', flexShrink: '0' } });
        checkIcon.innerHTML = createIcon(r.done ? 'check' : 'x', 16);
        req.appendChild(checkIcon);
        req.appendChild(document.createTextNode(r.text));
        reqs.appendChild(req);
      });
      tier.appendChild(reqs);

      if (t.name.includes('Standard') && t.status !== 'completed' && status !== 'pending') {
        const startBtn = el('button', { className: 'btn btn-primary w-full', style: { marginTop: '16px', height: '48px' }, onClick: () => {
          modalKycForm(() => { currentKyc = 'pending'; buildTiers('pending'); });
        } }, 'Start Verification');
        tier.appendChild(startBtn);
      }

      if (t.name.includes('Standard') && status === 'pending') {
        tier.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--warning, #f59e0b)', marginTop: '12px', padding: '10px', background: 'var(--bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' } },
          createIcon('clock', 16) + ' Your documents are being reviewed by our team.'));
      }

      if (t.name.includes('Standard') && status === 'rejected') {
        tier.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--danger, #ef4444)', marginTop: '12px', padding: '10px', background: 'var(--bg)', borderRadius: '8px' } },
          'Your submission was rejected. Please submit your details again with correct information.'));
      }

      if (t.name.includes('Premium') && t.status === 'pending' && status !== 'rejected') {
        tier.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--warning, #f59e0b)', marginTop: '8px', padding: '8px', background: 'var(--bg)', borderRadius: '8px' } }, 'Deposit at least ' + formatCurrency(5000 - userBalance) + ' more to reach $5,000 and unlock Tier 3.'));
      }

      content.appendChild(tier);
    });
  }

  buildTiers(currentKyc);

  Poller.start('kyc-poll', async () => {
    try {
      const prev = currentKyc;
      await Store.fetchUser();
      currentKyc = Store.user?.kycStatus;
      if (currentKyc !== prev && prev) {
        showToast('KYC status updated to ' + currentKyc, currentKyc === 'verified' ? 'success' : 'info');
        buildTiers(currentKyc);
      }
    } catch (e) { /* ignore polling errors */ }
  }, 10000);

  currentCleanup = () => Poller.stop('kyc-poll');

  page.appendChild(content);
  return page;
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function modalKycForm(onSuccess) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body', style: { maxWidth: '480px' } });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Identity Verification'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '24px' } });
    const u = Store.user || {};

    const personalSection = el('div', {});
    const sectionTitle1 = el('div', { style: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' } });
    sectionTitle1.innerHTML = createIcon('user', 16) + ' Personal Information';
    personalSection.appendChild(sectionTitle1);
    const personalFields = [
      { label: 'Full Name', id: 'kyc-name', value: u.name || '', placeholder: 'e.g. John Miller' },
      { label: 'Date of Birth', id: 'kyc-dob', value: u.dateOfBirth || '', placeholder: 'e.g. 1990-01-15', type: 'date' },
      { label: 'Phone Number', id: 'kyc-phone', value: u.phone || '', placeholder: 'e.g. +1 (555) 123-4567', type: 'tel' },
      { label: 'Address', id: 'kyc-address', value: u.address || '', placeholder: 'e.g. 123 Main St, New York, NY' }
    ];
    personalFields.forEach(f => {
      const wrap = el('div', { style: { marginBottom: '12px' } });
      wrap.appendChild(el('div', { style: { fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '4px' } }, f.label));
      wrap.appendChild(el('input', { type: f.type || 'text', className: 'form-input', id: f.id, value: f.value, placeholder: f.placeholder }));
      personalSection.appendChild(wrap);
    });
    content.appendChild(personalSection);

    const divider = el('div', { style: { height: '1px', background: 'var(--border)', margin: '0' } });
    content.appendChild(divider);

    const docSection = el('div', {});
    const sectionTitle2 = el('div', { style: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' } });
    sectionTitle2.innerHTML = createIcon('identification-card', 16) + ' Document Upload';
    docSection.appendChild(sectionTitle2);

    const uploads = [
      { label: 'Government ID — Front', id: 'kyc-front', icon: 'identification-card' },
      { label: 'Government ID — Back', id: 'kyc-back', icon: 'identification-card' }
    ];

    const uploadStates = {};
    uploads.forEach(upl => {
      const zone = el('div', { className: 'kyc-upload-zone', id: 'zone-' + upl.id, onClick: () => document.getElementById(upl.id).click() });
      const preview = el('div', { className: 'kyc-upload-preview' });
      const iconWrap = el('div', { className: 'kyc-upload-icon' });
      iconWrap.innerHTML = createIcon(upl.icon, 24);
      preview.appendChild(iconWrap);
      const textWrap = el('div', {});
      textWrap.appendChild(el('div', { className: 'kyc-upload-label' }, upl.label));
      const fileHint = el('div', { className: 'kyc-upload-hint', id: 'hint-' + upl.id }, 'Tap to upload');
      textWrap.appendChild(fileHint);
      preview.appendChild(textWrap);
      zone.appendChild(preview);
      const input = el('input', { type: 'file', accept: 'image/*', id: upl.id, style: { display: 'none' } });
      input.addEventListener('change', () => {
        const file = input.files[0];
        if (file) {
          uploadStates[upl.id] = file;
          document.getElementById('hint-' + upl.id).textContent = file.name;
          document.getElementById('hint-' + upl.id).style.color = 'var(--success)';
          zone.classList.add('has-file');
        }
      });
      zone.appendChild(input);
      docSection.appendChild(zone);
    });
    content.appendChild(docSection);

    const footer = el('div', { className: 'modal-footer', style: { flexDirection: 'column', gap: '8px', paddingTop: '16px' } });
    const submitBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px', fontSize: '15px' }, onClick: async () => {
      const name = document.getElementById('kyc-name').value.trim();
      if (!name) { showToast('Full name is required', 'error'); return; }
      if (!uploadStates['kyc-front'] || !uploadStates['kyc-back']) {
        showToast('Please upload both sides of your ID', 'error'); return;
      }
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner spinner-sm"></div>';

      try {
        await Store.updateProfile({
          name: name,
          phone: document.getElementById('kyc-phone').value.trim(),
          dateOfBirth: document.getElementById('kyc-dob').value.trim(),
          address: document.getElementById('kyc-address').value.trim()
        });

        const front = await readFileAsDataURL(uploadStates['kyc-front']);
        const back = await readFileAsDataURL(uploadStates['kyc-back']);

        const result = await Store.submitKycDocument('ssn', front, back, '');
        if (result?.user) Store.user = result.user;
        await Store.fetchUser();
        showToast('Documents submitted for review', 'success');
        close();
        if (onSuccess) onSuccess();
      } catch (err) { showToast(err.message || 'Submission failed', 'error'); }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit for Review';
    } }, 'Submit for Review');
    footer.appendChild(submitBtn);
    footer.appendChild(el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' } }, 'Your documents are encrypted and securely stored.'));
    body.appendChild(content);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalAddMoney() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });

    const title = el('div', { className: 'modal-header' });
    title.appendChild(el('div', { className: 'modal-title' }, 'Deposit Crypto'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    title.appendChild(closeBtn);

    const DEPOSIT_ADDRESS = 'bc1qpch9s36nxu6n7v6hjrmg3s56672alhmttk5k2k';

    const cryptoSection = el('div', { className: 'crypto-deposit' });

    const step1 = el('div', { className: 'crypto-step', id: 'crypto-step-1' });

    const amountLabel = el('div', { className: 'crypto-network-label' }, 'Amount (USD)');
    step1.appendChild(amountLabel);

    const amountInput = el('input', {
      type: 'number', className: 'modal-input-large crypto-amount-input',
      placeholder: 'Min. $100.00', value: '100', min: '100', step: '10'
    });
    step1.appendChild(amountInput);

    const minNote = el('div', { className: 'crypto-info-row', style: { marginBottom: '16px', color: 'var(--text-muted)', fontSize: '12px' } }, 'Minimum deposit: ' + formatCurrency(100) + ' USD equivalent');
    step1.appendChild(minNote);

    const generateBtn = el('button', { className: 'btn btn-primary', style: { width: '100%', height: '48px', fontSize: '15px' }, onClick: () => {
      const amount = parseFloat(amountInput.value);
      if (!amount || amount < 100) {
        amountInput.classList.add('error');
        showToast('Minimum deposit is ' + formatCurrency(100), 'error');
        return;
      }
      amountInput.classList.remove('error');
      document.getElementById('crypto-step-1').style.display = 'none';
      document.getElementById('crypto-step-2').style.display = 'block';
      document.getElementById('crypto-summary-amount').textContent = formatCurrency(amount);
    } });
    generateBtn.innerHTML = createIcon('arrow-right', 18) + ' Generate Address';
    step1.appendChild(generateBtn);

    cryptoSection.appendChild(step1);

    const step2 = el('div', { className: 'crypto-step', id: 'crypto-step-2', style: { display: 'none' } });

    const depositSummary = el('div', { className: 'crypto-summary' });
    depositSummary.innerHTML = '<span class="crypto-summary-label">Depositing</span><span class="crypto-summary-amount" id="crypto-summary-amount">$100.00</span>';
    step2.appendChild(depositSummary);

    const addressBox = el('div', { className: 'crypto-address-box' });
    const addressLabel = el('div', { className: 'crypto-address-label' });
    addressLabel.innerHTML = createIcon('qr', 16) + ' Deposit Address';
    addressBox.appendChild(addressLabel);

    const addressValue = el('div', { className: 'crypto-address-value', id: 'crypto-deposit-address' });
    addressValue.textContent = DEPOSIT_ADDRESS;
    addressBox.appendChild(addressValue);

    const copyBtn = el('button', { className: 'crypto-copy-btn', onClick: () => {
      navigator.clipboard.writeText(DEPOSIT_ADDRESS).then(() => {
        haptic('success');
        showToast('Address copied to clipboard', 'success');
      }).catch(() => {
        showToast('Failed to copy address', 'error');
      });
    }});
    copyBtn.innerHTML = createIcon('copy', 16) + ' Copy Address';
    addressBox.appendChild(copyBtn);
    step2.appendChild(addressBox);

    const warning = el('div', { className: 'crypto-warning' });
    warning.innerHTML = createIcon('alert-triangle', 16) + ' Send only to the Bitcoin (BTC) network. Sending from other networks may result in permanent loss.';
    step2.appendChild(warning);

    const sentBtn = el('button', { className: 'btn btn-primary', style: { width: '100%', height: '48px', fontSize: '15px', marginTop: '12px' }, onClick: async () => {
      const amount = parseFloat(document.getElementById('crypto-summary-amount').textContent.replace(/[^0-9.]/g, ''));
      sentBtn.disabled = true;
      sentBtn.textContent = 'Submitting...';
      try {
        await Store.claimDeposit(amount, '');
        document.getElementById('crypto-step-2').style.display = 'none';
        document.getElementById('crypto-step-3').style.display = 'block';
      } catch (e) {
        showToast('Failed to submit deposit claim', 'error');
        sentBtn.disabled = false;
        sentBtn.innerHTML = createIcon('check', 18) + ' I Have Sent It';
      }
    } });
    sentBtn.innerHTML = createIcon('check', 18) + ' I Have Sent It';
    step2.appendChild(sentBtn);

    const backBtn = el('button', { className: 'btn btn-ghost', style: { width: '100%', height: '40px', fontSize: '13px' }, onClick: () => {
      document.getElementById('crypto-step-2').style.display = 'none';
      document.getElementById('crypto-step-1').style.display = 'block';
    } });
    backBtn.innerHTML = createIcon('arrow-left', 16) + ' Change Amount';
    step2.appendChild(backBtn);

    cryptoSection.appendChild(step2);

    const step3 = el('div', { className: 'crypto-step', id: 'crypto-step-3', style: { display: 'none', textAlign: 'center', padding: '32px 0' } });
    const successIcon = el('div', { style: { fontSize: '48px', marginBottom: '16px' } });
    successIcon.innerHTML = createIcon('clock', 48);
    step3.appendChild(successIcon);
    step3.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' } }, 'Deposit Reported'));
    step3.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '300px', margin: '0 auto' } }, 'We are processing your payment. An admin will verify it shortly. You will be notified when the funds are credited.'));
    const doneBtn = el('button', { className: 'btn btn-primary', style: { width: '100%', height: '48px', fontSize: '15px', marginTop: '24px' }, onClick: close }, 'Done');
    step3.appendChild(doneBtn);
    cryptoSection.appendChild(step3);

    body.appendChild(cryptoSection);

    const modal = document.createDocumentFragment();
    modal.appendChild(title);
    modal.appendChild(body);
    return modal;
  });
}

function modalWithdraw() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });

    const title = el('div', { className: 'modal-header' });
    title.appendChild(el('div', { className: 'modal-title' }, 'Withdraw Funds'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    title.appendChild(closeBtn);

    const amountInput = el('input', { type: 'number', className: 'modal-input-large', placeholder: '0.00', value: '100' });
    body.appendChild(amountInput);
    body.appendChild(el('div', { className: 'text-center text-xs text-muted mb-16' }, t('available') + ': ' + formatCurrency(Store.user.balance.USD)));

    const bankRow = el('div', { className: 'bank-row' });
    bankRow.innerHTML = '<div><div class="bank-name">Chase •••• 1234</div><div class="bank-type">Checking account</div></div><div>' + createIcon('chevron_down', 20) + '</div>';
    body.appendChild(bankRow);

    const summary = el('div', { className: 'withdraw-summary' });
    const fee = 0;
    const amount = parseFloat(amountInput.value) || 0;
    const total = amount + fee;
    summary.innerHTML = '<div class="summary-row"><span>Amount</span><span class="summary-value" id="withdraw-amount-val">' + formatCurrency(amount) + '</span></div><div class="summary-row"><span>Fee</span><span class="summary-fee">' + formatCurrency(fee) + '</span></div><div class="summary-row summary-total"><span>Total</span><span class="summary-value" id="withdraw-total-val">' + formatCurrency(total) + '</span></div>';
    body.appendChild(summary);

    amountInput.addEventListener('input', () => {
      const val = parseFloat(amountInput.value) || 0;
      const f = 0;
      const t = val + f;
      const amountEl = document.getElementById('withdraw-amount-val');
      const totalEl = document.getElementById('withdraw-total-val');
      if (amountEl) amountEl.textContent = formatCurrency(val);
      if (totalEl) totalEl.textContent = formatCurrency(t);
    });

    const footer = el('div', { className: 'modal-footer' });
    const cta = el('button', {
      className: 'btn btn-primary w-full',
      onClick: () => {
        const pinOverlay = el('div', { style: { textAlign: 'center', padding: '16px' } });
        pinOverlay.innerHTML = '<div class="text-base font-semibold mb-16">Enter PIN</div><div class="pin-entry"><div class="pin-dot active"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div></div>';
        for (let r = 0; r < 3; r++) {
          const row = el('div', { className: 'numpad-row' });
          for (let k = 0; k < 3; k++) {
            const num = r * 3 + k + 1;
            row.appendChild(el('button', { className: 'numpad-key', onClick: () => {
              const dots = pinOverlay.querySelectorAll('.pin-dot');
              for (let d = 0; d < dots.length; d++) {
                if (!dots[d].classList.contains('filled')) {
                  dots[d].classList.add('filled');
                  dots[d].classList.remove('active');
                  if (d + 1 < dots.length) dots[d + 1].classList.add('active');
                   if (d === 3) {
                    setTimeout(async () => {
                      const amt = parseFloat(amountInput.value) || 0;
                      try {
                        await Store.createTransaction({ type: 'pending', category: 'withdrawal', title: 'Withdrawal to Bank', amount: amt });
                        await Store.fetchUser();
                        await Store.fetchTransactions();
                      } catch(e) {}
                      close();
                      showToast('Withdrawal submitted successfully!', 'success');
                    }, 500);
                  }
                  break;
                }
              }
            }}, num.toString()));
          }
          if (r === 2) {
            const empty = el('div', { className: 'numpad-key' });
            row.appendChild(empty);
          }
          pinOverlay.appendChild(row);
        }
        body.innerHTML = '';
        body.appendChild(pinOverlay);
        footer.style.display = 'none';
      }
    }, 'Withdraw Now');
    footer.appendChild(cta);

    const modal = document.createDocumentFragment();
    modal.appendChild(title);
    modal.appendChild(body);
    modal.appendChild(footer);
    return modal;
  });
}

function modalConvert() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });

    const title = el('div', { className: 'modal-header' });
    title.appendChild(el('div', { className: 'modal-title' }, 'Convert'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    title.appendChild(closeBtn);

    const row1 = el('div', { className: 'converter-row' });
    const inputFrom = el('input', { type: 'number', className: 'converter-input', placeholder: '0.00', value: '1' });
    row1.appendChild(inputFrom);

    const swapBtn = el('button', { className: 'converter-swap' });
    swapBtn.innerHTML = createIcon('repeat', 20);
    let swapped = false;
    swapBtn.addEventListener('click', () => {
      swapped = !swapped;
      swapBtn.classList.toggle('swapped', swapped);
    });
    row1.appendChild(swapBtn);

    const inputTo = el('input', { type: 'text', className: 'converter-input', placeholder: '0.00', value: '45200', readOnly: true });
    row1.appendChild(inputTo);
    body.appendChild(row1);

    body.appendChild(el('div', { className: 'converter-rate' }, '1 BTC = ' + formatCurrency(45200)));

    body.appendChild(el('div', { id: 'convert-result', className: 'text-2xl font-bold text-center text-green mt-16' }, "You'll receive: " + formatCurrency(45200)));

    const feeDetails = el('div', { className: 'fee-details' });
    feeDetails.innerHTML = '<div class="fee-row"><span>Network fee</span><span>' + formatCurrency(0.50) + '</span></div>';
    body.appendChild(feeDetails);

    const footer = el('div', { className: 'modal-footer' });
    const cta = el('button', {
      className: 'btn btn-primary w-full',
      onClick: async () => {
        cta.innerHTML = '<div class="spinner spinner-sm"></div>';
        cta.disabled = true;
        const val = parseFloat(inputFrom.value) || 0;
        try {
          await Store.createTransaction({ type: 'debit', category: 'exchange', title: 'Currency Conversion', amount: val });
          await Store.fetchUser();
          await Store.fetchTransactions();
          close();
          showToast('Conversion completed!', 'success');
        } catch (err) { showToast(err.message || 'Failed', 'error'); cta.innerHTML = 'Convert Now'; cta.disabled = false; }
      }
    }, 'Convert Now');
    footer.appendChild(cta);

    const modal = document.createDocumentFragment();
    modal.appendChild(title);
    modal.appendChild(body);
    modal.appendChild(footer);
    return modal;
  });
}

function modalTransactionDetail(tx) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });

    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Transaction Details'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const top = el('div', { style: { textAlign: 'center', padding: '20px 0' } });
    const statusColor = tx.status === 'completed' ? 'var(--success)' : tx.status === 'pending' ? 'var(--warning)' : 'var(--danger)';
    const iconBg = el('div', { style: { margin: '0 auto 12px', width: '56px', height: '56px', borderRadius: '50%', background: tx.color + '15', color: tx.color, display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    var iconMap = { 'arrow-up': 'arrow_up', 'arrow-down': 'arrow_down', send: 'send', refresh: 'refresh-cw', tv: 'tv', bitcoin: 'bitcoin', repeat: 'repeat' };
    iconBg.innerHTML = createIcon(iconMap[tx.icon] || 'arrow_up', 28);
    top.appendChild(iconBg);
    top.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' } }, tx.status));
    top.appendChild(el('div', { style: { fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' } }, (tx.type === 'credit' ? '+' : '-') + formatCurrency(tx.amount)));
    top.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' } }, tx.title));
    body.appendChild(top);

    const divider = el('div', { style: { height: '1px', background: 'var(--border)', margin: '0 -20px' } });
    body.appendChild(divider);

    const details = [
      { icon: 'receipt', label: 'Transaction ID', value: tx.id },
      { icon: 'calendar', label: 'Date & Time', value: formatDate(tx.date) },
      { icon: tx.type === 'credit' ? 'arrow-down' : 'arrow-up', label: 'Type', value: tx.type.charAt(0).toUpperCase() + tx.type.slice(1) },
      { icon: 'globe', label: 'Category', value: tx.category.charAt(0).toUpperCase() + tx.category.slice(1) },
      { icon: 'shield-check', label: 'Status', value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
      { icon: 'currency-dollar', label: 'Currency', value: tx.currency }
    ];
    const detailList = el('div', { style: { padding: '12px 0' } });
    details.forEach((d, i) => {
      const row = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < details.length - 1 ? '1px solid var(--border)' : 'none' } });
      const left = el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } });
      const icon = el('div', { style: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' } });
      icon.innerHTML = createIcon(d.icon, 14);
      left.appendChild(icon);
      left.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-muted)' } }, d.label));
      row.appendChild(left);
      row.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' } }, d.value));
      detailList.appendChild(row);
    });
    body.appendChild(detailList);

    body.appendChild(el('div', { className: 'text-center mt-8 mb-8' }, el('button', {
      className: 'btn-help',
      onClick: () => { close(); navigate('/support'); }
    }, 'Need Help?')));

    const footer = el('div', { className: 'modal-footer', style: { display: 'flex', gap: '12px' } });
    const shareBtn = el('button', { className: 'btn btn-secondary', style: { flex: '1', height: '44px' }, onClick: () => { haptic('success'); showToast('Receipt shared!', 'success'); } });
    shareBtn.innerHTML = createIcon('share', 16) + ' Share';
    const pdfBtn = el('button', { className: 'btn btn-secondary', style: { flex: '1', height: '44px' }, onClick: () => { haptic('success'); showToast('PDF downloaded!', 'success'); } });
    pdfBtn.innerHTML = createIcon('file-text', 16) + ' PDF';
    footer.appendChild(shareBtn);
    footer.appendChild(pdfBtn);

    const modal = document.createDocumentFragment();
    modal.appendChild(body);
    modal.appendChild(footer);
    return modal;
  });
}

function modalUpgrade() {
  navigate('/verification');
}

function modalComingSoon(feature) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body', style: { textAlign: 'center', padding: '40px 24px' } });

    const icon = el('div', { style: { margin: '0 auto 20px', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' } });
    icon.innerHTML = createIcon('clock', 32);
    body.appendChild(icon);

    body.appendChild(el('div', { style: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' } }, feature));
    body.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto 24px' } }, 'This feature is coming soon.'));

    const btn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' }, onClick: close }, 'Got it');
    body.appendChild(btn);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalEditField(label, currentValue, onSave, onSaved) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Edit ' + label));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { padding: '16px 0' } });
    content.appendChild(el('label', { className: 'form-label' }, label));
    const input = el('input', { type: 'text', className: 'input-wrapper', value: currentValue, style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    content.appendChild(input);
    body.appendChild(content);

    const saveBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' } }, 'Save');
    saveBtn.addEventListener('click', async () => {
      const val = input.value.trim();
      if (!val) { haptic('error'); showToast('Field cannot be empty', 'error'); return; }
      if (!onSave) { close(); return; }
      saveBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      saveBtn.disabled = true;
      try {
        await onSave(val);
        haptic('success');
        showToast(label + ' updated', 'success');
        close();
        if (onSaved) setTimeout(() => onSaved(val), 100);
      } catch (err) {
        showToast(err.message || 'Update failed', 'error');
        saveBtn.innerHTML = 'Save';
        saveBtn.disabled = false;
      }
    });
    const footer = el('div', { className: 'modal-footer' });
    footer.appendChild(saveBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalAddBank() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Add Bank Account'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' } });

    const bankInput = el('input', { type: 'text', placeholder: 'Bank Name', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    content.appendChild(bankInput);

    const acctInput = el('input', { type: 'text', placeholder: 'Account Number', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    content.appendChild(acctInput);

    const routingInput = el('input', { type: 'text', placeholder: 'Routing Number', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    content.appendChild(routingInput);

    body.appendChild(content);

    const footer = el('div', { className: 'modal-footer' });
    const addBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' } }, 'Add Account');
    addBtn.addEventListener('click', async () => {
      if (!bankInput.value.trim() || !acctInput.value.trim() || !routingInput.value.trim()) { haptic('error'); showToast('Please fill in all fields', 'error'); return; }
      addBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      addBtn.disabled = true;
      try {
        await Store.addBankAccount({ name: bankInput.value.trim(), type: 'Checking', accountNumber: acctInput.value.trim(), routingNumber: routingInput.value.trim() });
        haptic('success');
        showToast('Bank account added successfully', 'success');
        close();
        requestAnimationFrame(() => refreshPage());
      } catch (err) {
        showToast(err.message || 'Failed to add bank', 'error');
        addBtn.innerHTML = 'Add Account';
        addBtn.disabled = false;
      }
    });
    footer.appendChild(addBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalLoginActivity() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Login Activity'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const sessions = [
      { device: 'Chrome on Windows', location: 'New York, US', time: 'Just now', current: true },
      { device: 'Safari on iPhone', location: 'New York, US', time: '2 hours ago', current: false },
      { device: 'Firefox on MacOS', location: 'Boston, US', time: '3 days ago', current: false }
    ];
    sessions.forEach(s => {
      const row = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border)' } });
      const icon = el('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: s.current ? 'var(--success-light)' : 'var(--bg)', color: s.current ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' } });
      icon.innerHTML = createIcon('devices', 20);
      row.appendChild(icon);
      const info = el('div', { style: { flex: '1' } });
      info.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' } }, s.device + (s.current ? ' (Current)' : '')));
      info.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' } }, s.location + ' · ' + s.time));
      row.appendChild(info);
      if (!s.current) {
        const revokeBtn = el('button', { className: 'btn btn-outline', style: { fontSize: '11px', height: '28px', padding: '0 10px', color: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: () => { haptic('success'); showToast('Session revoked', 'success'); } }, 'Revoke');
        row.appendChild(revokeBtn);
      }
      body.appendChild(row);
    });

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalActiveDevices() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Active Devices'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const devices = [
      { name: 'iPhone 15 Pro', os: 'iOS 18.2', lastActive: 'Active now', current: true },
      { name: 'MacBook Pro', os: 'macOS 15.1', lastActive: '1 hour ago', current: false },
      { name: 'Samsung Galaxy S24', os: 'Android 15', lastActive: 'Yesterday', current: false }
    ];
    devices.forEach(d => {
      const row = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border)' } });
      const icon = el('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: d.current ? 'var(--success-light)' : 'var(--bg)', color: d.current ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' } });
      icon.innerHTML = createIcon(d.os.includes('iOS') ? 'phone' : d.os.includes('mac') ? 'gear' : 'phone', 20);
      row.appendChild(icon);
      const info = el('div', { style: { flex: '1' } });
      info.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' } }, d.name + (d.current ? ' (This device)' : '')));
      info.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' } }, d.os + ' · ' + d.lastActive));
      row.appendChild(info);
      if (!d.current) {
        const removeBtn = el('button', { className: 'btn btn-outline', style: { fontSize: '11px', height: '28px', padding: '0 10px', color: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: () => { haptic('success'); showToast(d.name + ' removed', 'success'); } }, 'Remove');
        row.appendChild(removeBtn);
      }
      body.appendChild(row);
    });

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalReplaceCard() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Replace Card'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { textAlign: 'center', padding: '16px 0' } });
    const icon = el('div', { style: { margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    icon.innerHTML = createIcon('replace', 28);
    content.appendChild(icon);
    content.appendChild(el('div', { style: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' } }, 'Request a new card?'));
    content.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto' } }, 'Your current card will be deactivated and a new virtual card will be issued within 24 hours.'));
    body.appendChild(content);

    const reasons = ['Lost', 'Damaged', 'Compromised', 'Never received'];
    const reasonList = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 0' } });
    let selectedReason = '';
    reasons.forEach(r => {
      const btn = el('button', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'left', cursor: 'pointer' }, onClick: () => {
        selectedReason = r;
        reasonList.querySelectorAll('button').forEach(b => { b.style.borderColor = 'var(--border)'; b.style.background = 'var(--surface)'; });
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'var(--primary-light)';
      }});
      btn.innerHTML = createIcon('check_circle', 18);
      btn.appendChild(document.createTextNode(' ' + r));
      reasonList.appendChild(btn);
    });
    body.appendChild(reasonList);

    const footer = el('div', { className: 'modal-footer' });
    const replaceBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' } }, 'Request Replacement');
    replaceBtn.addEventListener('click', async () => {
      if (!selectedReason) { haptic('error'); showToast('Please select a reason', 'error'); return; }
      const card = Store.cards[0];
      if (!card) return;
      replaceBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      replaceBtn.disabled = true;
      try {
        await Store.replaceCard(card._id, selectedReason);
        haptic('success');
        showToast('Card replacement requested', 'success');
        close();
        requestAnimationFrame(() => refreshPage());
      } catch (err) { showToast(err.message || 'Failed', 'error'); replaceBtn.innerHTML = 'Request Replacement'; replaceBtn.disabled = false; }
    });
    footer.appendChild(replaceBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalChangePin() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Change PIN'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const form = el('div', { style: { padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' } });
    const currentLabel = el('label', { className: 'form-label' }, 'Current PIN');
    const currentInput = el('input', { type: 'password', className: 'input-wrapper', placeholder: 'Enter current PIN', maxlength: '4', inputMode: 'numeric', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', letterSpacing: '8px', textAlign: 'center' } });
    const newLabel = el('label', { className: 'form-label' }, 'New PIN');
    const newInput = el('input', { type: 'password', className: 'input-wrapper', placeholder: 'Enter new PIN', maxlength: '4', inputMode: 'numeric', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', letterSpacing: '8px', textAlign: 'center' } });
    const confirmLabel = el('label', { className: 'form-label' }, 'Confirm New PIN');
    const confirmInput = el('input', { type: 'password', className: 'input-wrapper', placeholder: 'Confirm new PIN', maxlength: '4', inputMode: 'numeric', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', letterSpacing: '8px', textAlign: 'center' } });
    form.appendChild(currentLabel);
    form.appendChild(currentInput);
    form.appendChild(newLabel);
    form.appendChild(newInput);
    form.appendChild(confirmLabel);
    form.appendChild(confirmInput);
    body.appendChild(form);

    const saveBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' } }, 'Update PIN');
    saveBtn.addEventListener('click', async () => {
      const cur = currentInput.value.trim();
      const nw = newInput.value.trim();
      const cf = confirmInput.value.trim();
      if (!cur || !nw) { haptic('error'); showToast('Please fill in all fields', 'error'); return; }
      if (cur.length !== 4 || nw.length !== 4) { haptic('error'); showToast('PIN must be 4 digits', 'error'); return; }
      if (nw !== cf) { haptic('error'); showToast('New PINs do not match', 'error'); return; }
      if (cur === nw) { haptic('error'); showToast('New PIN must be different', 'error'); return; }
      saveBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      saveBtn.disabled = true;
      try {
        const card = Store.cards[0];
        if (card) await Store.changeCardPin(card._id, cur, nw);
        haptic('success');
        showToast('PIN updated successfully', 'success');
        close();
      } catch (err) {
        showToast(err.message || 'Failed to update PIN', 'error');
        saveBtn.innerHTML = 'Update PIN';
        saveBtn.disabled = false;
      }
    });
    const footer = el('div', { className: 'modal-footer' });
    footer.appendChild(saveBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalChangePassword() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Change Password'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const form = el('div', { style: { padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' } });
    const currentLabel = el('label', { className: 'form-label' }, 'Current Password');
    const currentInput = el('input', { type: 'password', className: 'input-wrapper', placeholder: 'Enter current password', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    const newLabel = el('label', { className: 'form-label' }, 'New Password');
    const newInput = el('input', { type: 'password', className: 'input-wrapper', placeholder: 'Enter new password', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    const confirmLabel = el('label', { className: 'form-label' }, 'Confirm New Password');
    const confirmInput = el('input', { type: 'password', className: 'input-wrapper', placeholder: 'Confirm new password', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' } });
    form.appendChild(currentLabel);
    form.appendChild(currentInput);
    form.appendChild(newLabel);
    form.appendChild(newInput);
    form.appendChild(confirmLabel);
    form.appendChild(confirmInput);
    body.appendChild(form);

    const saveBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' } }, 'Update Password');
    saveBtn.addEventListener('click', async () => {
      const cur = currentInput.value.trim();
      const nw = newInput.value.trim();
      const cf = confirmInput.value.trim();
      if (!cur || !nw) { haptic('error'); showToast('Please fill in all fields', 'error'); return; }
      if (nw.length < 6) { haptic('error'); showToast('Password must be at least 6 characters', 'error'); return; }
      if (nw !== cf) { haptic('error'); showToast('New passwords do not match', 'error'); return; }
      if (cur === nw) { haptic('error'); showToast('New password must be different', 'error'); return; }
      saveBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      saveBtn.disabled = true;
      try {
        await Store.changePassword(cur, nw);
        haptic('success');
        showToast('Password updated successfully', 'success');
        close();
      } catch (err) {
        showToast(err.message || 'Failed to update password', 'error');
        saveBtn.innerHTML = 'Update Password';
        saveBtn.disabled = false;
      }
    });
    const footer = el('div', { className: 'modal-footer' });
    footer.appendChild(saveBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalLockCard() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Lock Card'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { textAlign: 'center', padding: '16px 0' } });
    const icon = el('div', { style: { margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    icon.innerHTML = createIcon('lock', 28);
    content.appendChild(icon);
    content.appendChild(el('div', { style: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' } }, 'Lock your card?'));
    content.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto 16px' } }, 'Your card will be temporarily locked. No transactions will be processed until you unlock it.'));
    body.appendChild(content);

    const reasons = ['Suspected fraud', 'Traveling abroad', 'Temporary hold', 'Other'];
    const reasonList = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' } });
    let selectedReason = '';
    reasons.forEach(r => {
      const btn = el('button', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'left', cursor: 'pointer' }, onClick: () => {
        selectedReason = r;
        reasonList.querySelectorAll('button').forEach(b => { b.style.borderColor = 'var(--border)'; b.style.background = 'var(--surface)'; });
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'var(--primary-light)';
      }});
      btn.innerHTML = createIcon('check_circle', 18);
      btn.appendChild(document.createTextNode(' ' + r));
      reasonList.appendChild(btn);
    });
    body.appendChild(reasonList);

    const footer = el('div', { className: 'modal-footer' });
    const lockBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px', background: 'var(--primary)' } }, 'Lock Card');
    lockBtn.addEventListener('click', async () => {
      if (!selectedReason) { haptic('error'); showToast('Please select a reason', 'error'); return; }
      const card = Store.cards[0];
      if (!card) return;
      lockBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      lockBtn.disabled = true;
      try {
        await Store.blockCard(card._id, selectedReason);
        haptic('success');
        showToast('Card locked', 'success');
        close();
        requestAnimationFrame(() => refreshPage());
      } catch (err) { showToast(err.message || 'Failed', 'error'); lockBtn.innerHTML = 'Lock Card'; lockBtn.disabled = false; }
    });
    body.appendChild(lockBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalReportCard() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Report Card'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { textAlign: 'center', padding: '16px 0' } });
    const icon = el('div', { style: { margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    icon.innerHTML = createIcon('warning', 28);
    content.appendChild(icon);
    content.appendChild(el('div', { style: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' } }, 'Report Lost or Stolen'));
    content.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto' } }, 'This will immediately block your card and cancel all pending transactions. A new card will need to be issued.'));
    body.appendChild(content);

    const footer = el('div', { className: 'modal-footer' });
    const blockBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px', background: 'var(--danger)', borderColor: 'var(--danger)' } }, 'Block Card');
    blockBtn.addEventListener('click', async () => {
      const card = Store.cards[0];
      if (!card) return;
      blockBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      blockBtn.disabled = true;
      try {
        await Store.blockCard(card._id, 'lost/stolen');
        haptic('success');
        showToast('Card has been blocked. Contact support for a new card.', 'success');
        close();
        requestAnimationFrame(() => refreshPage());
      } catch (err) { showToast(err.message || 'Failed', 'error'); blockBtn.innerHTML = 'Block Card'; blockBtn.disabled = false; }
    });
    footer.appendChild(blockBtn);
    footer.appendChild(el('button', { className: 'btn btn-secondary w-full', style: { height: '48px', marginTop: '8px' }, onClick: close }, 'Cancel'));
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalDocumentUpload() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Upload Document'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' } });

    ['Front of ID', 'Back of ID', 'Selfie with ID'].forEach((doc, i) => {
      const zone = el('div', { className: 'upload-zone', onClick: () => {
        haptic('light');
        showToast(doc + ' selected from camera', 'success');
      }});
      const icon = el('div', { style: { color: 'var(--primary)', marginBottom: '8px' } });
      icon.innerHTML = createIcon(i < 2 ? 'identification-card' : 'camera', 32);
      zone.appendChild(icon);
      zone.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' } }, doc));
      zone.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' } }, 'Tap to take photo or choose file'));
      content.appendChild(zone);
    });
    body.appendChild(content);

    const footer = el('div', { className: 'modal-footer' });
    footer.appendChild(el('button', { className: 'btn btn-primary w-full', style: { height: '48px' }, onClick: () => {
      haptic('success');
      showToast('Documents submitted for review', 'success');
      close();
    } }, 'Submit Documents'));
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalLiveChat() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body', style: { display: 'flex', flexDirection: 'column', height: '60vh' } });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, 'Live Chat'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const messages = el('div', { style: { flex: '1', overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' } });

    const botMsg = el('div', { style: { display: 'flex', gap: '8px', maxWidth: '80%' } });
    const botAvatar = el('div', { style: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', fontSize: '12px', fontWeight: '700' } }, 'CX');
    const botBubble = el('div', { style: { background: 'var(--bg)', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' } }, 'Hi! How can we help you today? You can ask about your account, transactions, or card.');
    botMsg.appendChild(botAvatar);
    botMsg.appendChild(botBubble);
    messages.appendChild(botMsg);
    body.appendChild(messages);

    const inputRow = el('div', { style: { display: 'flex', gap: '8px', padding: '12px 0', borderTop: '1px solid var(--border)' } });
    const chatInput = el('input', { type: 'text', placeholder: 'Type a message...', style: { flex: '1', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '9999px', fontSize: '14px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' } });
    inputRow.appendChild(chatInput);
    const sendBtn = el('button', { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }, onClick: () => {
      if (!chatInput.value.trim()) return;
      const userMsg = el('div', { style: { display: 'flex', gap: '8px', maxWidth: '80%', alignSelf: 'flex-end' } });
      const userBubble = el('div', { style: { background: 'var(--primary)', color: 'white', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', lineHeight: '1.5' } }, chatInput.value);
      userMsg.appendChild(userBubble);
      messages.appendChild(userMsg);
      chatInput.value = '';
      messages.scrollTop = messages.scrollHeight;
      setTimeout(() => {
        const reply = el('div', { style: { display: 'flex', gap: '8px', maxWidth: '80%' } });
        const replyAvatar = el('div', { style: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', fontSize: '12px', fontWeight: '700' } }, 'CX');
        const replyBubble = el('div', { style: { background: 'var(--bg)', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' } }, 'Thanks for reaching out! A support agent will be with you shortly. In the meantime, check our FAQ section for quick answers.');
        reply.appendChild(replyAvatar);
        reply.appendChild(replyBubble);
        messages.appendChild(reply);
        messages.scrollTop = messages.scrollHeight;
      }, 1000);
    } });
    sendBtn.innerHTML = createIcon('paper_plane', 18);
    inputRow.appendChild(sendBtn);
    body.appendChild(inputRow);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalSelectOption(label, options, current, onSave, onSaved) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, label));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    let selected = current;
    const list = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0' } });
    options.forEach(opt => {
      const row = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: opt === selected ? 'var(--primary-light)' : 'transparent' }, onClick: () => {
        selected = opt;
        list.querySelectorAll('div').forEach(r => r.style.background = 'transparent');
        row.style.background = 'var(--primary-light)';
      }});
      row.appendChild(el('div', { style: { fontSize: '15px', fontWeight: opt === selected ? '600' : '400', color: 'var(--text-primary)' } }, opt));
      if (opt === selected) {
        const check = el('div', { style: { color: 'var(--primary)' } });
        check.innerHTML = createIcon('check', 20);
        row.appendChild(check);
      }
      list.appendChild(row);
    });
    body.appendChild(list);

    const saveBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px' } }, 'Save');
    saveBtn.addEventListener('click', async () => {
      if (onSave) {
        saveBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
        saveBtn.disabled = true;
        try {
          await onSave(selected);
          haptic('success');
          showToast(label + ' set to ' + selected, 'success');
          close();
          if (onSaved) setTimeout(() => onSaved(selected), 100);
        } catch (err) {
          showToast(err.message || 'Update failed', 'error');
          saveBtn.innerHTML = 'Save';
          saveBtn.disabled = false;
        }
      } else {
        haptic('success');
        showToast(label + ' set to ' + selected, 'success');
        close();
      }
    });
    const footer = el('div', { className: 'modal-footer' });
    footer.appendChild(saveBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalLegal(title, type) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const header = el('div', { className: 'modal-header' });
    header.appendChild(el('div', { className: 'modal-title' }, title));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    header.appendChild(closeBtn);
    body.appendChild(header);

    const content = el('div', { style: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', padding: '8px 0' } });
    if (type === 'terms') {
      const sections = [
        { heading: '1. Acceptance of Terms', text: 'By accessing or using the Coinexs application ("App"), you agree to be bound by these Terms of Service. If you do not agree, do not use the App.' },
        { heading: '2. Eligibility', text: 'You must be at least 18 years old and legally able to use financial services in your jurisdiction to use this App. By using Coinexs, you represent that you meet these requirements.' },
        { heading: '3. Account Registration', text: 'You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and PIN.' },
        { heading: '4. Financial Services', text: 'Coinexs provides digital wallet services, cryptocurrency exchange, virtual card issuance, and bill payment services. All transactions are subject to applicable fees and limits.' },
        { heading: '5. Fees', text: 'Coinexs charges zero fees on crypto deposits. Withdrawal fees vary by network. Card transactions have a 1.5% fee. Currency conversion uses real-time interbank rates.' },
        { heading: '6. Prohibited Activities', text: 'You may not use the App for money laundering, fraud, terrorism financing, or any illegal activity. Violation may result in account suspension or termination.' }
      ];
      sections.forEach(s => {
        content.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '6px' } }, s.heading));
        content.appendChild(el('div', {}, s.text));
      });
    } else {
      const sections = [
        { heading: '1. Information We Collect', text: 'We collect information you provide directly: name, email, phone, date of birth, address, and government-issued ID for verification. We also collect device information and usage data.' },
        { heading: '2. How We Use Your Information', text: 'We use your information to provide services, verify your identity, prevent fraud, comply with legal obligations, and improve our App experience.' },
        { heading: '3. Information Sharing', text: 'We do not sell your personal information. We may share data with service providers, regulators, or as required by law. We use bank-level encryption to protect your data.' },
        { heading: '4. Data Security', text: 'We implement industry-standard security measures including AES-256 encryption, two-factor authentication, and regular security audits to protect your information.' },
        { heading: '5. Your Rights', text: 'You can access, update, or delete your personal information through the App settings. You may also request a copy of all data we hold about you.' },
        { heading: '6. Contact', text: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@coinexs.com.' }
      ];
      sections.forEach(s => {
        content.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '6px' } }, s.heading));
        content.appendChild(el('div', {}, s.text));
      });
    }
    body.appendChild(content);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function modalConfirmLogout() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body', style: { textAlign: 'center', padding: '32px 24px' } });

    const icon = el('div', { style: { margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    icon.innerHTML = createIcon('log_out', 28);
    body.appendChild(icon);

    body.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' } }, 'Log Out'));
    body.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto 24px' } }, 'Are you sure you want to log out of your account?'));

    const footer = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
    footer.appendChild(el('button', { className: 'btn btn-primary w-full', style: { height: '48px', background: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: () => {
      close();
      Store.logout();
      showToast('Logged out successfully', 'success');
      navigate('/auth');
    } }, 'Log Out'));
    footer.appendChild(el('button', { className: 'btn btn-secondary w-full', style: { height: '48px' }, onClick: close }, 'Cancel'));
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function renderSend() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }

  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/home', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Send Money'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const userTier = Store.user?.tier || 1;
  const userBalance = Store.user?.balance?.USD || 0;
  let isUsdLike = true;
  let selectedWallet = Store.wallets?.[0];
  let coinSymbol = 'USD';

  const walletSelector = el('div', { className: 'send-wallet-selector' });

  function renderWalletOptions() {
    walletSelector.innerHTML = '';

    const usdCard = el('button', {
      className: 'send-wallet-card' + (isUsdLike && coinSymbol === 'USD' ? ' active' : ''),
      onClick: () => {
        isUsdLike = true;
        coinSymbol = 'USD';
        selectedWallet = null;
        renderWalletOptions();
        updateBalanceDisplay();
      }
    });
    const usdIcon = el('div', { className: 'send-wallet-icon', style: { background: '#0052FF20', color: '#0052FF' } });
    usdIcon.innerHTML = createIcon('currency-dollar', 20);
    usdCard.appendChild(usdIcon);
    const usdInfo = el('div', { className: 'send-wallet-info' });
    usdInfo.appendChild(el('div', { className: 'send-wallet-name' }, 'USD - US Dollar'));
    usdInfo.appendChild(el('div', { className: 'send-wallet-bal' }, formatCurrency(userBalance) + ' balance'));
    usdCard.appendChild(usdInfo);
    walletSelector.appendChild(usdCard);

    (Store.wallets || []).forEach(w => {
      const isUsdtLike = w.coin === 'USDT';
      const isActive = isUsdtLike ? (isUsdLike && coinSymbol === 'USDT') : (!isUsdLike && w._id === selectedWallet?._id);
      const card = el('button', {
        className: 'send-wallet-card' + (isActive ? ' active' : ''),
        onClick: () => {
          isUsdLike = isUsdtLike || false;
          selectedWallet = isUsdtLike ? null : w;
          coinSymbol = w.coin;
          renderWalletOptions();
          updateBalanceDisplay();
        }
      });
      const iconWrap = el('div', { className: 'send-wallet-icon', style: { background: w.color + '20', color: w.color } });
      iconWrap.innerHTML = createIcon('bitcoin', 20);
      card.appendChild(iconWrap);
      const info = el('div', { className: 'send-wallet-info' });
      info.appendChild(el('div', { className: 'send-wallet-name' }, w.coin + ' - ' + w.name));
      const balKey = w.coin === 'USDT' ? 'USD' : w.coin;
      const bal = Store.user.balance?.[balKey] ?? w.balance;
      info.appendChild(el('div', { className: 'send-wallet-bal' }, bal + ' ' + w.coin + ' (~' + formatCurrency(w.usdValue) + ')'));
      card.appendChild(info);
      walletSelector.appendChild(card);
    });
  }
  renderWalletOptions();
  const formContent = el('div', { className: 'send-form-content' });
  formContent.appendChild(walletSelector);

  const addressWrapper = el('div', { className: 'input-wrapper', id: 'send-address-wrap' });
  const addressIcon = el('div', { className: 'input-icon' });
  addressIcon.innerHTML = createIcon('arrow-right', 20);
  addressWrapper.appendChild(addressIcon);
  const addressInput = el('input', { type: 'text', placeholder: 'Recipient USD address', id: 'send-address', 'aria-label': 'Address', autocomplete: 'off' });
  addressWrapper.appendChild(addressInput);
  const addressLabel = el('label', { className: 'form-label', htmlFor: 'send-address', id: 'send-address-label' }, 'Recipient Address');
  formContent.appendChild(addressLabel);
  formContent.appendChild(addressWrapper);

  const amountWrapper = el('div', { className: 'input-wrapper' });
  const amountIcon = el('div', { className: 'input-icon' });
  amountIcon.innerHTML = createIcon('currency-dollar', 20);
  amountWrapper.appendChild(amountIcon);
  const amountInput = el('input', { type: 'number', placeholder: '0.00', id: 'send-amount', 'aria-label': 'Amount', step: '0.01' });
  amountWrapper.appendChild(amountInput);
  const amountLabel = el('label', { className: 'form-label', htmlFor: 'send-amount', id: 'send-amount-label' }, 'Amount');
  formContent.appendChild(amountLabel);
  formContent.appendChild(amountWrapper);

  const balanceLabel = el('div', { className: 'text-xs text-muted mb-8', id: 'send-balance-label' });
  formContent.appendChild(balanceLabel);

  function updateBalanceDisplay() {
    if (isUsdLike) {
      balanceLabel.textContent = 'Available: ' + formatCurrency(Store.user?.balance?.USD || 0);
    } else {
      const totalCryptoValue = (Store.wallets || []).reduce((sum, w) => sum + (w.usdValue || 0), 0);
      balanceLabel.textContent = 'Portfolio Value: ~' + formatCurrency(totalCryptoValue);
    }
    const addrWrap = document.getElementById('send-address-wrap');
    if (addrWrap) {
      const inp = addrWrap.querySelector('input');
      if (inp) inp.placeholder = 'Recipient ' + coinSymbol + ' address';
    }
    const addrLabel = document.getElementById('send-address-label');
    if (addrLabel) addrLabel.textContent = 'Recipient ' + coinSymbol + ' Address';
    const amtLbl = document.getElementById('send-amount-label');
    if (amtLbl) amtLbl.textContent = 'Amount (' + coinSymbol + ')';
    const stepInput = document.getElementById('send-amount');
    if (stepInput) stepInput.step = '0.01';
  }
  updateBalanceDisplay();

  const canSend = userTier >= 3 && userBalance >= 5000;

  const sendBtn = el('button', { className: 'btn btn-primary w-full mt-16', style: { height: '52px' } }, 'Send');
  sendBtn.addEventListener('click', async () => {
    const addr = addressInput.value.trim();
    const amt = parseFloat(amountInput.value);
    if (!addr) { haptic('error'); showToast('Enter a recipient', 'error'); return; }
    if (!amt || amt <= 0) { haptic('error'); showToast('Enter a valid amount', 'error'); return; }

    if (isUsdLike) {
      if (amt > (Store.user?.balance?.USD || 0)) { haptic('error'); showToast('Insufficient funds', 'error'); return; }
      sendBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      sendBtn.disabled = true;

      const fullyVerified = (Store.user?.tier || 1) >= 3 && Store.user?.kycStatus === 'verified';
      const hasMinBalance = (Store.user?.balance?.USD || 0) >= 5000;

      if (fullyVerified && hasMinBalance) {
        try {
          await Store.createTransaction({ type: 'debit', category: 'transfer', title: 'Send ' + coinSymbol + ' to ' + addr, amount: amt, currency: 'USD' });
          await Store.fetchUser();
          haptic('success');
          showToast('Sent ' + formatCurrency(amt) + ' to ' + addr, 'success');
          setTimeout(() => navigate('/home'), 1200);
        } catch (err) { showToast(err.message || 'Failed', 'error'); sendBtn.innerHTML = 'Send'; sendBtn.disabled = false; }
        return;
      }

      try {
        await Store.createTransaction({ type: 'debit', category: 'transfer', title: 'Send ' + coinSymbol + ' to ' + addr, amount: amt, currency: 'USD', hold: true });
        await Store.fetchUser();
      } catch (err) {
        showToast(err.message || 'Failed to hold funds', 'error');
        sendBtn.innerHTML = 'Send';
        sendBtn.disabled = false;
        return;
      }

      sendBtn.style.display = 'none';

      const overlay = el('div', { style: { padding: '40px 20px', textAlign: 'center' } });
      const barWrap = el('div', { style: { width: '100%', maxWidth: '280px', margin: '0 auto 24px' } });
      const barTrack = el('div', { style: { width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' } });
      const barFill = el('div', { style: { width: '0%', height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' } });
      barTrack.appendChild(barFill);
      barWrap.appendChild(barTrack);
      const barLabel = el('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' } }, '0%');
      barWrap.appendChild(barLabel);
      overlay.appendChild(barWrap);

      const contentArea = el('div', { style: { display: 'none' } });
      const holdIcon = el('div', { style: { fontSize: '48px', marginBottom: '16px', color: 'var(--primary)' } });
      holdIcon.innerHTML = createIcon('clock', 48);
      contentArea.appendChild(holdIcon);
      contentArea.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' } }, 'Transfer on Hold'));
      contentArea.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '4px' } }, formatCurrency(amt) + ' has been deducted from your USD balance.'));
      contentArea.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' } }, 'Complete all verification tiers and maintain a $5,000 minimum balance. An admin will review and release your transaction once conditions are met.'));
      const depositBtn = el('button', { className: 'btn btn-primary', style: { width: '100%', height: '48px', marginBottom: '8px' }, onClick: () => navigate('/home') }, 'Deposit $5,000');
      contentArea.appendChild(depositBtn);
      contentArea.appendChild(el('button', { className: 'btn btn-ghost', style: { width: '100%', height: '40px', fontSize: '13px' }, onClick: () => navigate('/verification') }, 'Complete Verification'));
      overlay.appendChild(contentArea);

      formContent.style.display = 'none';
      page.appendChild(overlay);

      let pct = 0;
      function animate() {
        pct += 1;
        if (pct <= 80) {
          barFill.style.width = pct + '%';
          barLabel.textContent = pct + '%';
          const delay = pct < 30 ? 30 : pct < 60 ? 50 : 80;
          setTimeout(() => requestAnimationFrame(animate), delay);
        } else if (pct === 81) {
          barLabel.textContent = 'Preparing transfer...';
          setTimeout(() => {
            pct = 100;
            barFill.style.width = '100%';
            barLabel.textContent = 'Complete!';
            setTimeout(() => {
              barWrap.style.display = 'none';
              contentArea.style.display = 'block';
            }, 400);
          }, 2000);
        }
      }
      requestAnimationFrame(animate);
      return;
    }

    const balKey = coinSymbol === 'USDT' ? 'USD' : coinSymbol;
    const avail = Store.user.balance?.[balKey] ?? selectedWallet.balance;
    if (!selectedWallet || avail < amt) { haptic('error'); showToast('Insufficient funds', 'error'); return; }

    sendBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
    sendBtn.disabled = true;

    if (canSend) {
      try {
        await Store.withdrawCrypto(selectedWallet._id, addr, amt);
        await Store.fetchWallets();
        haptic('success');
        showToast('Withdrawal submitted for review', 'success');
        sendLocalNotification('Withdrawal Pending', amt + ' ' + coinSymbol + ' withdrawal awaiting admin approval');
        setTimeout(() => navigate('/home'), 1200);
      } catch (err) { showToast(err.message || 'Failed', 'error'); sendBtn.innerHTML = 'Send'; sendBtn.disabled = false; }
      return;
    }

    /* --- Below Tier 3: hold funds + progress bar + fee message --- */
    let holdTx;
    try {
      holdTx = await Store.withdrawCrypto(selectedWallet._id, addr, amt);
      await Store.fetchWallets();
    } catch (err) {
      showToast(err.message || 'Failed to hold funds', 'error');
      sendBtn.innerHTML = 'Send';
      sendBtn.disabled = false;
      return;
    }

    sendBtn.style.display = 'none';

    const overlay = el('div', { style: { padding: '40px 20px', textAlign: 'center' } });
    const barWrap = el('div', { style: { width: '100%', maxWidth: '280px', margin: '0 auto 24px' } });
    const barTrack = el('div', { style: { width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' } });
    const barFill = el('div', { style: { width: '0%', height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' } });
    barTrack.appendChild(barFill);
    barWrap.appendChild(barTrack);
    const barLabel = el('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' } }, '0%');
    barWrap.appendChild(barLabel);
    overlay.appendChild(barWrap);

    const contentArea = el('div', { style: { display: 'none' } });
    const feeIcon = el('div', { style: { fontSize: '48px', marginBottom: '16px', color: 'var(--warning, #f59e0b)' } });
    feeIcon.innerHTML = createIcon('clock', 48);
    contentArea.appendChild(feeIcon);
    contentArea.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' } }, 'Transfer on Hold'));
    contentArea.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '4px' } }, amt + ' ' + coinSymbol + ' has been placed on hold from your wallet.'));
    contentArea.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' } }, 'A minimum $5,000 blockchain network fee is required to complete this transfer on-chain. Once deposited, the transaction will be processed within approximately 10 minutes.'));
    const depositBtn = el('button', { className: 'btn btn-primary', style: { width: '100%', height: '48px', marginBottom: '8px' }, onClick: () => navigate('/home') }, 'Deposit $5,000');
    contentArea.appendChild(depositBtn);
    contentArea.appendChild(el('button', { className: 'btn btn-ghost', style: { width: '100%', height: '40px', fontSize: '13px' }, onClick: () => navigate('/verification') }, 'Complete Verification'));
    overlay.appendChild(contentArea);

    formContent.style.display = 'none';
    page.appendChild(overlay);

    let pct = 0;
    function animate() {
      pct += 1;
      if (pct <= 80) {
        barFill.style.width = pct + '%';
        barLabel.textContent = pct + '%';
        const delay = pct < 30 ? 30 : pct < 60 ? 50 : 80;
        setTimeout(() => requestAnimationFrame(animate), delay);
      } else if (pct === 81) {
        barLabel.textContent = 'Broadcasting to blockchain...';
        setTimeout(() => {
          pct = 90;
          barFill.style.width = '90%';
          barLabel.textContent = 'Broadcasting to blockchain... 90%';
          setTimeout(() => {
            pct = 100;
            barFill.style.width = '100%';
            barLabel.textContent = 'Complete!';
            setTimeout(() => {
              barWrap.style.display = 'none';
              contentArea.style.display = 'block';
            }, 400);
          }, 200);
        }, 6000);
      }
    }
    requestAnimationFrame(animate);
  });
  formContent.appendChild(sendBtn);
  page.appendChild(formContent);

  return page;
}

function renderReceive() {
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/home', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Receive'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const depositAddr = BTC_DEPOSIT_ADDRESS;
  if (depositAddr) {
    const depositCard = el('div', { className: 'receive-address-card', style: { border: '2px solid var(--primary)', marginBottom: '20px' } });
    const depositTop = el('div', { className: 'receive-address-top' });
    const depositInfo = el('div', { className: 'receive-coin-info' });
    const depositIcon = el('div', { className: 'receive-coin-icon', style: { background: 'var(--primary)20', color: 'var(--primary)' } });
    depositIcon.innerHTML = createIcon('download-simple', 22);
    depositInfo.appendChild(depositIcon);
    depositInfo.appendChild(el('div', { className: 'receive-coin-name', style: { color: 'var(--primary)', fontWeight: '600' } }, 'Your Deposit Address'));
    depositTop.appendChild(depositInfo);
    depositCard.appendChild(depositTop);
    const depositAddrBox = el('div', { className: 'receive-address-box' });
    depositAddrBox.appendChild(el('div', { className: 'receive-address-text', style: { fontSize: '15px', fontWeight: '500' } }, depositAddr));
    depositCard.appendChild(depositAddrBox);
    const depositCopyBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '40px', fontSize: '13px' }, onClick: () => {
      navigator.clipboard.writeText(depositAddr).then(() => { haptic('success'); showToast('Deposit address copied', 'success'); }).catch(() => {});
    }});
    depositCopyBtn.innerHTML = createIcon('copy', 16) + ' Copy Address';
    depositCard.appendChild(depositCopyBtn);
    page.appendChild(depositCard);
  }

  page.appendChild(el('div', { className: 'text-center mb-16' }, el('div', { className: 'text-lg font-bold' }, 'Crypto Wallet Addresses'), el('div', { className: 'text-sm text-muted mt-4' }, 'Blockchain addresses for receiving crypto')));

  Store.wallets.forEach(w => {
    const card = el('div', { className: 'receive-address-card' });
    const top = el('div', { className: 'receive-address-top' });
    const coinInfo = el('div', { className: 'receive-coin-info' });
    const coinIcon = el('div', { className: 'receive-coin-icon', style: { background: w.color + '20', color: w.color } });
    coinIcon.innerHTML = createIcon(w.icon, 22);
    coinInfo.appendChild(coinIcon);
    coinInfo.appendChild(el('div', { className: 'receive-coin-name' }, w.name));
    top.appendChild(coinInfo);
    card.appendChild(top);

    const addressBox = el('div', { className: 'receive-address-box' });
    addressBox.appendChild(el('div', { className: 'receive-address-text' }, w.address));
    card.appendChild(addressBox);

    const copyBtn = el('button', { className: 'btn btn-secondary w-full', style: { height: '40px', fontSize: '13px' }, onClick: () => {
      navigator.clipboard.writeText(w.address).then(() => { haptic('success'); showToast(w.coin + ' address copied', 'success'); }).catch(() => {});
    }});
    copyBtn.innerHTML = createIcon('copy', 16) + ' Copy Address';
    card.appendChild(copyBtn);
    page.appendChild(card);
  });

  return page;
}

function renderGiftCards() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/home', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, t('gift_card_store')));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const searchWrapper = el('div', { className: 'input-wrapper mb-16' });
  const searchIcon = el('div', { className: 'input-icon' });
  searchIcon.innerHTML = createIcon('search', 20);
  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(el('input', { type: 'text', placeholder: 'Search brands...', id: 'gc-search' }));
  page.appendChild(searchWrapper);

  if (!Store.giftCardsLoaded) {
    const grid = el('div', { className: 'gc-grid' });
    for (var i = 0; i < 4; i++) {
      grid.appendChild(el('div', { className: 'gc-card', style: { minHeight: '120px' } },
        el('div', { className: 'skeleton skeleton-circle', style: { width: '56px', height: '56px' } }),
        el('div', { className: 'skeleton skeleton-text', style: { width: '60%' } }),
        el('div', { className: 'skeleton skeleton-text-sm', style: { width: '40%' } })
      ));
    }
    page.appendChild(grid);
  } else {
    const grid = el('div', { className: 'gc-grid' });
    Store.giftCards.forEach(gc => {
      const card = el('button', { className: 'gc-card', onClick: () => {
        modalGiftCardDetail(gc);
      }});
      const iconWrap = el('div', { className: 'gc-icon', style: { background: gc.color + '20', color: gc.color } });
      iconWrap.innerHTML = createIcon(gc.icon, 28);
      card.appendChild(iconWrap);
      card.appendChild(el('div', { className: 'gc-brand' }, gc.brand));
      card.appendChild(el('div', { className: 'gc-denom' }, 'From ' + formatCurrency(gc.denominations[0])));
      grid.appendChild(card);
    });
    page.appendChild(grid);
  }

  return page;
}

function modalGiftCardDetail(gc) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const title = el('div', { className: 'modal-header' });
    title.appendChild(el('div', { className: 'modal-title' }, gc.brand + ' Gift Card'));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    title.appendChild(closeBtn);
    body.appendChild(title);

    const iconWrap = el('div', { className: 'text-center mb-16' });
    const icon = el('div', { className: 'gc-modal-icon', style: { background: gc.color + '20', color: gc.color } });
    icon.innerHTML = createIcon(gc.icon, 48);
    iconWrap.appendChild(icon);
    body.appendChild(iconWrap);

    body.appendChild(el('div', { className: 'text-sm font-semibold mb-8 text-center text-secondary' }, 'Select Amount'));

    const chips = el('div', { className: 'quick-chips', style: { justifyContent: 'center' } });
    let selectedAmt = gc.denominations[0];
    gc.denominations.forEach(v => {
      const chip = el('button', { className: 'chip' + (v === selectedAmt ? ' active' : ''), onClick: () => {
        document.querySelectorAll('.modal-body .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedAmt = v;
      }}, formatCurrency(v));
      chips.appendChild(chip);
    });
    body.appendChild(chips);

    body.appendChild(el('div', { className: 'text-center text-xs text-muted mt-8 mb-16' }, 'Delivered instantly to your email'));

    const footer = el('div', { className: 'modal-footer' });
    const buyBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '52px' } }, 'Buy ' + formatCurrency(selectedAmt) + ' Card');
    buyBtn.addEventListener('click', async () => {
      if (Store.user.balance.USD < selectedAmt) { haptic('error'); showToast('Insufficient balance', 'error'); return; }
      buyBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      buyBtn.disabled = true;
      try {
        await Store.createTransaction({ type: 'debit', category: 'giftcard', title: gc.brand + ' Gift Card', amount: selectedAmt });
        await Store.fetchUser();
        await Store.fetchTransactions();
        haptic('success');
        showToast(gc.brand + ' ' + formatCurrency(selectedAmt) + ' card purchased!', 'success');
        close();
      } catch (err) { showToast(err.message || 'Failed', 'error'); buyBtn.innerHTML = 'Buy ' + formatCurrency(selectedAmt) + ' Card'; buyBtn.disabled = false; }
    });
    footer.appendChild(buyBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(title);
    frag.appendChild(body);
    return frag;
  });
}

function renderCryptoWallet() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/home', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Wallet'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  if (!Store.walletsLoaded) {
    const loading = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' } });
    loading.appendChild(el('div', { className: 'skeleton', style: { width: '140px', height: '24px', borderRadius: '4px' } }));
    loading.appendChild(el('div', { className: 'skeleton', style: { width: '200px', height: '36px', borderRadius: '4px' } }));
    page.appendChild(loading);
    for (var i = 0; i < 2; i++) {
      const skelCard = el('div', { className: 'wallet-coin-card' });
      const skelTop = el('div', { className: 'wallet-coin-top' });
      const skelLeft = el('div', { className: 'wallet-coin-left' });
      skelLeft.appendChild(el('div', { className: 'skeleton skeleton-circle', style: { width: '40px', height: '40px' } }));
      const skelInfo = el('div', {});
      skelInfo.appendChild(el('div', { className: 'skeleton skeleton-text', style: { width: '80px' } }));
      skelInfo.appendChild(el('div', { className: 'skeleton skeleton-text-sm', style: { width: '120px' } }));
      skelLeft.appendChild(skelInfo);
      skelTop.appendChild(skelLeft);
      skelTop.appendChild(el('div', { className: 'skeleton', style: { width: '70px', height: '18px', borderRadius: '4px' } }));
      skelCard.appendChild(skelTop);
      skelCard.appendChild(el('div', { className: 'skeleton', style: { width: '100%', height: '32px', borderRadius: '4px', marginTop: '12px' } }));
      skelCard.appendChild(el('div', { style: { display: 'flex', gap: '8px', marginTop: '12px' } },
        el('div', { className: 'skeleton', style: { flex: '1', height: '36px', borderRadius: '8px' } }),
        el('div', { className: 'skeleton', style: { flex: '1', height: '36px', borderRadius: '8px' } })
      ));
      page.appendChild(skelCard);
    }
  } else {
    const totalUsd = Store.wallets.reduce((s, w) => s + w.usdValue, 0) + Store.user.balance.USD;
    page.appendChild(el('div', { className: 'text-center mb-24' }, el('div', { className: 'text-xs text-muted' }, 'Total Portfolio Value'), el('div', { className: 'text-3xl font-bold mt-4' }, formatCurrency(totalUsd))));

    Store.wallets.forEach(w => {
      const card = el('div', { className: 'wallet-coin-card' });
      const top = el('div', { className: 'wallet-coin-top' });
      const left = el('div', { className: 'wallet-coin-left' });
      const icon = el('div', { className: 'wallet-coin-icon', style: { background: w.color + '20', color: w.color } });
      icon.innerHTML = createIcon(w.icon, 22);
      left.appendChild(icon);
      const info = el('div', { className: 'wallet-coin-info' });
      info.appendChild(el('div', { className: 'wallet-coin-name' }, w.name));
      info.appendChild(el('div', { className: 'wallet-coin-balance' }, w.balance + ' ' + w.coin));
      left.appendChild(info);
      top.appendChild(left);
      top.appendChild(el('div', { className: 'wallet-coin-usd' }, formatCurrency(w.usdValue)));
      card.appendChild(top);

      const sparkline = el('div', { className: 'wallet-sparkline' });
      const trend = w.trend;
      const sW = 100, sH = 32;
      const max = Math.max(...trend), min = Math.min(...trend), range = max - min || 1;
      const pts = trend.map((v, i) => ((i / (trend.length - 1)) * sW) + ',' + (sH - ((v - min) / range) * sH)).join(' ');
      sparkline.innerHTML = '<svg width="100%" height="' + sH + '" viewBox="0 0 ' + sW + ' ' + sH + '"><polyline points="' + pts + '" fill="none" stroke="' + w.color + '" stroke-width="1.5" stroke-linecap="round"/></svg>';
      card.appendChild(sparkline);

      const actions = el('div', { className: 'wallet-coin-actions' });
      actions.appendChild(el('button', { className: 'btn btn-secondary', style: { flex: '1', height: '36px', fontSize: '13px' }, onClick: () => navigate('/receive') }, 'Deposit'));
      actions.appendChild(el('button', { className: 'btn btn-outline', style: { flex: '1', height: '36px', fontSize: '13px' }, onClick: () => navigate('/send') }, 'Send'));
      card.appendChild(actions);
      page.appendChild(card);
    });

    const usdCard = el('div', { className: 'wallet-usd-card' });
    const usdLeft = el('div', { className: 'wallet-coin-left' });
    const usdIcon = el('div', { className: 'wallet-coin-icon', style: { background: 'var(--primary-light)', color: 'var(--primary)' } });
    usdIcon.innerHTML = createIcon('currency-dollar', 22);
    usdLeft.appendChild(usdIcon);
    usdLeft.appendChild(el('div', { className: 'wallet-coin-info' },
      el('div', { className: 'wallet-coin-name' }, 'US Dollar'),
      el('div', { className: 'wallet-coin-balance' }, getUserCurrency() + ' ' + t('balance'))
    ));
    usdCard.appendChild(usdLeft);
    usdCard.appendChild(el('div', { className: 'wallet-coin-usd' }, formatCurrency(Store.user.balance.USD)));
    page.appendChild(usdCard);
  }

  return page;
}

function renderBillPay() {
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/home', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Bill Pay'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const categories = [
    { key: 'airtime', label: 'Airtime', icon: 'phone', color: '#E20074' },
    { key: 'data', label: 'Data', icon: 'wifi', color: '#009FDB' },
    { key: 'cable', label: 'Cable TV', icon: 'tv', color: '#0078D4' },
    { key: 'electricity', label: 'Electricity', icon: 'zap', color: '#FF6600' }
  ];

  let selectedCategory = 'airtime';
  const providerGrid = el('div', { className: 'bill-provider-grid', id: 'bill-providers' });

  function renderProviders(cat) {
    providerGrid.innerHTML = '';
    Store.billProviders[cat].forEach(p => {
      const item = el('button', { className: 'bill-provider-item', onClick: () => modalBillPay(p, cat) });
      const icon = el('div', { className: 'bill-provider-icon', style: { background: p.color + '20', color: p.color } });
      icon.innerHTML = createIcon(p.icon, 24);
      item.appendChild(icon);
      item.appendChild(el('div', { className: 'bill-provider-name' }, p.name));
      providerGrid.appendChild(item);
    });
  }

  const catTabs = el('div', { className: 'bill-cat-tabs' });
  categories.forEach(c => {
    const tab = el('button', { className: 'bill-cat-tab' + (c.key === selectedCategory ? ' active' : ''), onClick: () => {
      selectedCategory = c.key;
      document.querySelectorAll('.bill-cat-tab').forEach((t, i) => t.classList.toggle('active', categories[i].key === c.key));
      renderProviders(c.key);
    }});
    tab.innerHTML = createIcon(c.icon, 18) + ' ' + c.label;
    catTabs.appendChild(tab);
  });
  page.appendChild(catTabs);

  renderProviders(selectedCategory);
  page.appendChild(providerGrid);
  return page;
}

function modalBillPay(provider, category) {
  openModal((close) => {
    const body = el('div', { className: 'modal-body' });
    const title = el('div', { className: 'modal-header' });
    title.appendChild(el('div', { className: 'modal-title' }, provider.name));
    const closeBtn = el('button', { className: 'modal-close', onClick: close });
    closeBtn.innerHTML = createIcon('x', 20);
    title.appendChild(closeBtn);
    body.appendChild(title);

    const phoneWrapper = el('div', { className: 'input-wrapper mb-16' });
    const phoneIcon = el('div', { className: 'input-icon' });
    phoneIcon.innerHTML = createIcon('phone', 20);
    phoneWrapper.appendChild(phoneIcon);
    phoneWrapper.appendChild(el('input', { type: 'tel', placeholder: 'Phone / Account Number', 'aria-label': 'Account number' }));
    body.appendChild(phoneWrapper);

    body.appendChild(el('label', { className: 'form-label' }, 'Amount'));
    const amountInput = el('input', { type: 'number', className: 'modal-input-large', placeholder: '0.00', value: '25' });
    body.appendChild(amountInput);

    const chips = el('div', { className: 'quick-chips' });
    [10, 25, 50, 100].forEach(v => {
      chips.appendChild(el('button', { className: 'chip' + (v === 25 ? ' active' : ''), onClick: () => { amountInput.value = v; } }, formatCurrency(v)));
    });
    body.appendChild(chips);

    const footer = el('div', { className: 'modal-footer' });
    const payBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '52px' } }, 'Pay Now');
    payBtn.addEventListener('click', async () => {
      const amt = parseFloat(amountInput.value) || 0;
      if (amt <= 0) { haptic('error'); showToast('Enter a valid amount', 'error'); return; }
      payBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
      payBtn.disabled = true;
      try {
        await Store.createTransaction({ type: 'debit', category: 'billpay', title: provider.name + ' Bill Pay', amount: amt });
        await Store.fetchUser();
        await Store.fetchTransactions();
        haptic('success');
        showToast(provider.name + ' payment of ' + formatCurrency(amt) + ' sent!', 'success');
        close();
      } catch (err) { showToast(err.message || 'Failed', 'error'); payBtn.innerHTML = 'Pay Now'; payBtn.disabled = false; }
    });
    footer.appendChild(payBtn);
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(title);
    frag.appendChild(body);
    return frag;
  });
}

function renderSupport() {
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Support'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const contactGrid = el('div', { className: 'support-contact-grid' });
  [
    { icon: 'chat-circle', label: 'Live Chat', desc: 'Chat with us', color: '#10B981', action: () => modalLiveChat() },
    { icon: 'mail', label: 'Email', desc: 'help@coinexs.com', color: '#0052FF', action: () => { window.location.href = 'mailto:help@coinexs.com'; } },
    { icon: 'phone', label: 'Phone', desc: '+1 (800) 555-0123', color: '#8B5CF6', action: () => { window.location.href = 'tel:+18005550123'; } }
  ].forEach(c => {
    const item = el('button', { className: 'support-contact-item', onClick: c.action });
    const icon = el('div', { className: 'support-contact-icon', style: { background: c.color + '15', color: c.color } });
    icon.innerHTML = createIcon(c.icon, 22);
    item.appendChild(icon);
    item.appendChild(el('div', { className: 'support-contact-label' }, c.label));
    item.appendChild(el('div', { className: 'support-contact-desc' }, c.desc));
    contactGrid.appendChild(item);
  });
  page.appendChild(contactGrid);

  page.appendChild(el('div', { className: 'text-sm font-bold mt-24 mb-12' }, t('faq')));

  Store.support.faqs.forEach(faq => {
    const item = el('div', { className: 'support-faq' });
    const q = el('div', { className: 'support-faq-q', onClick: () => {
      const a = item.querySelector('.support-faq-a');
      if (a) { const isOpen = a.style.maxHeight !== '0px' && a.style.maxHeight !== ''; a.style.maxHeight = isOpen ? '0px' : a.scrollHeight + 'px'; }
    }});
    q.appendChild(el('span', {}, faq.q));
    q.innerHTML += createIcon('chevron_down', 16);
    item.appendChild(q);
    const a = el('div', { className: 'support-faq-a' });
    a.appendChild(el('div', {}, faq.a));
    item.appendChild(a);
    page.appendChild(item);
  });

  return page;
}

function renderReferral() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Refer & Earn'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const hero = el('div', { className: 'referral-hero' });
  hero.innerHTML = '<div class="referral-hero-icon">' + createIcon('user-plus', 40) + '</div>';
  hero.appendChild(el('div', { className: 'referral-hero-title' }, t('give_5_get_5')));
  hero.appendChild(el('div', { className: 'referral-hero-desc' }, t('referral_desc')));
  page.appendChild(hero);

  const codeBox = el('div', { className: 'referral-code-box' });
  codeBox.appendChild(el('div', { className: 'referral-code-label' }, t('your_referral_code')));
  const refCode = Store.user.referralCode || 'COIN' + (Store.user.username || 'USER').toUpperCase();
  codeBox.appendChild(el('div', { className: 'referral-code-value' }, refCode));
  const shareBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '44px', marginTop: '12px' }, onClick: () => {
    navigator.clipboard.writeText(refCode).then(() => { haptic('success'); showToast('Referral code copied!', 'success'); }).catch(() => {});
  }});
  shareBtn.innerHTML = createIcon('share', 16) + ' ' + t('share_code');
  codeBox.appendChild(shareBtn);
  page.appendChild(codeBox);

  const stats = el('div', { className: 'referral-stats' });
  [
    { label: t('total_referrals'), value: String(Store.user.referralCount || 0) },
    { label: t('total_earned'), value: formatCurrency(Store.user.referralEarnings || 0) }
  ].forEach(s => {
    const card = el('div', { className: 'referral-stat-card' });
    card.appendChild(el('div', { className: 'referral-stat-value' }, s.value));
    card.appendChild(el('div', { className: 'referral-stat-label' }, s.label));
    stats.appendChild(card);
  });
  page.appendChild(stats);

  if (Store.user.referralCount > 0) {
    page.appendChild(el('div', { className: 'text-sm font-bold mt-24 mb-12' }, t('recent_referrals')));
    for (var i = 0; i < Math.min(Store.user.referralCount, 5); i++) {
      const row = el('div', { className: 'referral-row' });
      const left = el('div', { className: 'referral-row-left' });
      left.appendChild(el('div', { className: 'referral-row-name' }, 'Friend #' + (i + 1)));
      left.appendChild(el('div', { className: 'referral-row-date' }, 'Referred'));
      row.appendChild(left);
      row.appendChild(el('div', { className: 'referral-row-reward' }, '+ ' + formatCurrency(5.00)));
      page.appendChild(row);
    }
  } else {
    const empty = el('div', { className: 'text-center text-muted mt-24', style: { padding: '24px' } });
    empty.appendChild(el('div', { style: { marginBottom: '8px' } }, t('no_referrals')));
    empty.appendChild(el('div', { style: { fontSize: '13px' } }, 'Share your code to earn rewards'));
    page.appendChild(empty);
  }

  return page;
}

function renderSwap() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/home', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, t('swap')));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const coins = ['USD', 'BTC', 'ETH', 'USDT'];
  const rates = { 'USD-BTC': 0.0000221, 'USD-ETH': 0.000408, 'USD-USDT': 1.0, 'BTC-USD': 45200, 'ETH-USD': 2450, 'USDT-USD': 1.0, 'BTC-ETH': 18.45, 'ETH-BTC': 0.0542, 'BTC-USDT': 45200, 'ETH-USDT': 2450, 'USDT-BTC': 0.0000221, 'USDT-ETH': 0.000408 };
  let fromCoin = 'USD', toCoin = 'BTC';

  const fromSection = el('div', { className: 'swap-section' });
  fromSection.appendChild(el('div', { className: 'swap-label' }, t('you_pay')));
  const fromRow = el('div', { className: 'swap-amount-row' });
  const fromInput = el('input', { type: 'number', className: 'swap-amount-input', placeholder: '0.00', value: '100', id: 'swap-from' });
  fromRow.appendChild(fromInput);
  const fromSelector = el('button', { className: 'swap-coin-btn', id: 'swap-from-btn' });
  fromSelector.innerHTML = createIcon('chevron_down', 14) + ' ' + fromCoin;
  fromRow.appendChild(fromSelector);
  fromSection.appendChild(fromRow);
  fromSection.appendChild(el('div', { className: 'swap-balance-text' }, t('balance') + ': ' + formatCurrency(Store.user.balance.USD)));
  page.appendChild(fromSection);

  const swapBtn = el('button', { className: 'swap-flip-btn', onClick: () => {
    [fromCoin, toCoin] = [toCoin, fromCoin];
    document.getElementById('swap-from-btn').innerHTML = createIcon('chevron_down', 14) + ' ' + fromCoin;
    document.getElementById('swap-to-btn').innerHTML = createIcon('chevron_down', 14) + ' ' + toCoin;
    updateSwapResult();
    haptic('light');
  }});
  swapBtn.innerHTML = createIcon('arrows-clockwise', 22);
  page.appendChild(swapBtn);

  const toSection = el('div', { className: 'swap-section' });
  toSection.appendChild(el('div', { className: 'swap-label' }, t('you_receive')));
  const toRow = el('div', { className: 'swap-amount-row' });
  const toInput = el('input', { type: 'text', className: 'swap-amount-input', placeholder: '0.00', readOnly: true, id: 'swap-to' });
  toRow.appendChild(toInput);
  const toSelector = el('button', { className: 'swap-coin-btn', id: 'swap-to-btn' });
  toSelector.innerHTML = createIcon('chevron_down', 14) + ' ' + toCoin;
  toRow.appendChild(toSelector);
  toSection.appendChild(toRow);
  page.appendChild(toSection);

  const rateText = el('div', { className: 'text-center text-xs text-muted mt-16', id: 'swap-rate' });
  page.appendChild(rateText);

  const swapBtnEl = el('button', { className: 'btn btn-primary w-full mt-16', style: { height: '52px' } }, t('swap_now'));
  swapBtnEl.addEventListener('click', async () => {
    const val = parseFloat(fromInput.value) || 0;
    if (val <= 0) { haptic('error'); showToast(t('enter_valid_amount'), 'error'); return; }
    const balKey = fromCoin === 'USDT' ? 'USD' : fromCoin;
    const fromBalance = Store.user.balance?.[balKey] || 0;
    if (fromBalance < val) { haptic('error'); showToast('Insufficient ' + fromCoin + ' balance', 'error'); return; }
    swapBtnEl.innerHTML = '<div class="spinner spinner-sm"></div>';
    swapBtnEl.disabled = true;
    try {
      await Store.createTransaction({ type: 'debit', category: 'exchange', title: fromCoin + ' to ' + toCoin + ' Swap', amount: val, currency: fromCoin === 'USDT' ? 'USD' : fromCoin });
      const key = fromCoin + '-' + toCoin;
      const rate = rates[key] || 1;
      await Store.createTransaction({ type: 'credit', category: 'exchange', title: toCoin + ' from ' + fromCoin + ' Swap', amount: val * rate, currency: toCoin === 'USDT' ? 'USD' : toCoin });
      await Store.fetchUser();
      await Store.fetchTransactions();
      haptic('success');
      showToast(t('swap_completed'), 'success');
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) { showToast(err.message || 'Failed', 'error'); swapBtnEl.innerHTML = t('swap_now'); swapBtnEl.disabled = false; }
  });
  page.appendChild(swapBtnEl);

  function updateSwapResult() {
    const val = parseFloat(fromInput.value) || 0;
    const key = fromCoin + '-' + toCoin;
    const rate = rates[key] || 1;
    toInput.value = (val * rate).toFixed(6);
    const rEl = document.getElementById('swap-rate');
    if (rEl) rEl.textContent = '1 ' + fromCoin + ' = ' + rate + ' ' + toCoin;
  }
  fromInput.addEventListener('input', updateSwapResult);
  requestAnimationFrame(updateSwapResult);

  fromSelector.addEventListener('click', () => {
    const other = toCoin;
    const available = coins.filter(c => c !== other);
    const idx = available.indexOf(fromCoin);
    fromCoin = available[(idx + 1) % available.length];
    fromSelector.innerHTML = createIcon('chevron_down', 14) + ' ' + fromCoin;
    updateSwapResult();
    haptic('light');
  });
  toSelector.addEventListener('click', () => {
    const other = fromCoin;
    const available = coins.filter(c => c !== other);
    const idx = available.indexOf(toCoin);
    toCoin = available[(idx + 1) % available.length];
    toSelector.innerHTML = createIcon('chevron_down', 14) + ' ' + toCoin;
    updateSwapResult();
    haptic('light');
  });

  return page;
}

function renderPersonalInfo() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const u = Store.user;
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, t('personal_info')));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const avatarSection = el('div', { className: 'cards-section', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 16px' } });
  const avatarWrap = el('div', { style: { width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', position: 'relative' } });
  avatarWrap.appendChild(el('img', { src: Store.user.avatar || getAvatar(Store.user.name), alt: Store.user.name, style: { width: '100%', height: '100%', objectFit: 'cover' } }));
  avatarSection.appendChild(avatarWrap);
  avatarSection.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' } }, Store.user.name));
  avatarSection.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-muted)' } }, Store.user.email));
  page.appendChild(avatarSection);

  const fields = [
    { label: 'Full Name', value: Store.user.name, icon: 'user', save: async (val) => { await Store.updateProfile({ name: val }); } },
    { label: 'Email', value: Store.user.email, icon: 'mail', save: async (val) => { await Store.updateEmail(val); } },
    { label: 'Phone', value: Store.user.phone || '', icon: 'phone', save: async (val) => { await Store.updateProfile({ phone: val }); } },
    { label: 'Date of Birth', value: Store.user.dateOfBirth || '', icon: 'calendar', save: async (val) => { await Store.updateProfile({ dateOfBirth: val }); } },
    { label: 'Address', value: Store.user.address || '', icon: 'map-pin', save: async (val) => { await Store.updateProfile({ address: val }); } },
    { label: 'Username', value: '@' + Store.user.username, icon: 'at', save: async (val) => { await Store.updateUsername(val.replace(/^@/, '')); } }
  ];

  const infoSection = el('div', { className: 'cards-section' });
  infoSection.appendChild(el('div', { className: 'cards-section-title' }, t('details')));
  fields.forEach((f, i) => {
    const valueEl = el('div', { style: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' } }, f.value);
    const row = el('div', { className: 'profile-row', onClick: () => modalEditField(f.label, f.value, f.save, (val) => {
      const display = f.label === 'Username' ? '@' + val : val;
      valueEl.textContent = display;
      f.value = display;
    }) });
    const left = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } });
    const icon = el('div', { style: { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' } });
    icon.innerHTML = createIcon(f.icon, 18);
    left.appendChild(icon);
    const text = el('div', {});
    text.appendChild(el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' } }, f.label));
    text.appendChild(valueEl);
    left.appendChild(text);
    row.appendChild(left);
    const editBtn = el('div', { style: { color: 'var(--primary)' } });
    editBtn.innerHTML = createIcon('pencil_simple', 16);
    row.appendChild(editBtn);
    infoSection.appendChild(row);
  });
  page.appendChild(infoSection);

  return page;
}

function renderBankAccount() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, t('bank_account')));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  page.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' } }, 'Link a bank account for fast deposits and withdrawals.'));

  Store.user.bankAccounts.forEach((bank, i) => {
    const card = el('div', { className: 'cards-section', style: { padding: '16px' } });
    const top = el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } });
    const left = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } });
    const icon = el('div', { style: { width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    icon.innerHTML = createIcon('bank', 20);
    left.appendChild(icon);
    const info = el('div', {});
    info.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' } }, bank.name));
    info.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, bank.type));
    left.appendChild(info);
    top.appendChild(left);
    const badge = el('span', { className: 'cards-status-badge ' + (bank.isDefault ? 'cards-status-active' : 'cards-status-frozen'), style: { fontSize: '11px' } }, bank.isDefault ? 'Default' : 'Backup');
    top.appendChild(badge);
    card.appendChild(top);
    const accountNum = el('div', { style: { fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Courier New', monospace" } }, '••••' + bank.last4);
    card.appendChild(accountNum);

    const actions = el('div', { style: { display: 'flex', gap: '8px', marginTop: '12px' } });
    if (!bank.isDefault) {
      actions.appendChild(el('button', { className: 'btn btn-secondary', style: { flex: '1', height: '36px', fontSize: '13px' }, onClick: async () => {
        haptic('success');
        await Store.setDefaultBank(bank.id);
        showToast(bank.name + ' set as default', 'success');
        refreshPage();
      } }, t('set_default')));
    }
    actions.appendChild(el('button', { className: 'btn btn-outline', style: { flex: '1', height: '36px', fontSize: '13px', color: 'var(--danger)' }, onClick: async () => {
      haptic('success');
      await Store.removeBankAccount(bank.id);
      showToast(bank.name + ' removed', 'success');
      refreshPage();
    } }, t('remove')));
    card.appendChild(actions);
    page.appendChild(card);
  });

  page.appendChild(el('button', { className: 'btn btn-primary w-full', style: { height: '48px' }, onClick: () => modalAddBank() }, t('add_bank')));

  return page;
}

function renderSecurity() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, t('security')));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const sections = [
    { title: 'Authentication', items: [
      { icon: 'lock', label: t('change_pin'), desc: 'Update your 4-digit PIN', action: () => modalChangePin() },
      { icon: 'fingerprint', label: t('biometric_login'), desc: t('biometric_desc'), toggle: true, initial: Store.user.settings?.biometrics || false, onChange: async (on) => { await Store.updateSettings({ biometrics: on }); } },
      { icon: 'shield-check', label: t('two_factor'), desc: t('two_factor_desc'), toggle: true, initial: Store.user.settings?.twoFactor || false, onChange: async (on) => { await Store.updateSettings({ twoFactor: on }); } },
      { icon: 'key', label: t('change_password'), desc: 'Update your password', action: () => modalChangePassword() }
    ]},
    { title: 'Sessions', items: [
      { icon: 'scan', label: t('login_activity'), desc: 'View recent logins', action: () => modalLoginActivity() },
      { icon: 'devices', label: t('active_devices'), desc: 'Manage logged-in devices', action: () => modalActiveDevices() }
    ]},
    { title: 'Notifications', items: [
      { icon: 'bell', label: 'Login Notifications', desc: 'Get alerted on new sign-ins', toggle: true, initial: Store.user.settings?.loginNotifications !== false, onChange: async (on) => { await Store.updateSettings({ loginNotifications: on }); } },
      { icon: 'currency-dollar', label: 'Transaction Alerts', desc: 'Notifications for sends and receives', toggle: true, initial: Store.user.settings?.transactionAlerts !== false, onChange: async (on) => { await Store.updateSettings({ transactionAlerts: on }); } }
    ]},
    { title: 'Recovery', items: [
      { icon: 'mail', label: t('recovery_email'), desc: Store.user.settings?.recoveryEmail || t('not_set'), value: t('verified'), action: () => modalEditField('Recovery Email', Store.user.settings?.recoveryEmail || '', async (val) => {
        await Store.updateSettings({ recoveryEmail: val });
      }) },
      { icon: 'phone', label: t('recovery_phone'), desc: Store.user.settings?.recoveryPhone || t('not_set'), value: t('verified'), action: () => modalEditField('Recovery Phone', Store.user.settings?.recoveryPhone || '', async (val) => {
        await Store.updateSettings({ recoveryPhone: val });
      }) }
    ]}
  ];

  sections.forEach(sec => {
    const section = el('div', { className: 'cards-section' });
    section.appendChild(el('div', { className: 'cards-section-title' }, sec.title));
    sec.items.forEach((item, i) => {
      const row = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < sec.items.length - 1 ? '1px solid var(--border)' : 'none' } });
      const left = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '0' } });
      const icon = el('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' } });
      icon.innerHTML = createIcon(item.icon, 18);
      left.appendChild(icon);
      const text = el('div', {});
      text.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' } }, item.label));
      text.appendChild(el('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' } }, item.desc));
      left.appendChild(text);
      row.appendChild(left);
      if (item.toggle) {
        row.appendChild(createToggle(async (on) => {
          haptic('light');
          if (item.onChange) await item.onChange(on);
        }, item.initial));
      } else if (item.value) {
        row.appendChild(el('span', { className: 'cards-status-badge cards-status-active', style: { fontSize: '11px' } }, item.value));
      } else if (item.action) {
        row.style.cursor = 'pointer';
        row.addEventListener('click', item.action);
        const chevron = el('div', { style: { color: 'var(--text-muted)' } });
        chevron.innerHTML = createIcon('chevron_right', 18);
        row.appendChild(chevron);
      }
      section.appendChild(row);
    });
    page.appendChild(section);
  });

  page.appendChild(el('button', { className: 'btn btn-outline w-full', style: { height: '48px', color: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: () => navigate('/remove-account') }, 'Remove Account'));

  return page;
}

function renderRemoveAccount() {
  if (!authGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const page = el('div', { className: 'form-page' });
  const header = el('div', { className: 'page-header' });
  const left = el('div', { className: 'page-header-left' });
  left.appendChild(iconButton('arrow_left', 24, () => navigate('/profile', { direction: 'reverse' })));
  header.appendChild(left);
  header.appendChild(el('div', { className: 'page-header-center' }, 'Remove Account'));
  header.appendChild(el('div', { className: 'page-header-right' }));
  page.appendChild(header);

  const warningCard = el('div', { style: { background: 'var(--danger-light)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' } });
  const warnIcon = el('div', { style: { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
  warnIcon.innerHTML = createIcon('warning', 28);
  warningCard.appendChild(warnIcon);
  warningCard.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' } }, 'Are you sure?'));
  warningCard.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' } }, 'Removing your account is permanent and cannot be undone. All your data, balance, and transaction history will be lost.'));
  page.appendChild(warningCard);

  const consequencesSection = el('div', { style: { background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-sm)' } });
  consequencesSection.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' } }, 'What happens when you remove your account:'));
  [
    'All remaining balance will be forfeited',
    'Transaction history will be permanently deleted',
    'Active cards will be cancelled immediately',
    'Pending transactions may still be processed',
    'Your referral code will stop working'
  ].forEach(item => {
    const row = el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' } });
    const dot = el('div', { style: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', flexShrink: '0' } });
    row.appendChild(dot);
    row.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-secondary)' } }, item));
    consequencesSection.appendChild(row);
  });
  page.appendChild(consequencesSection);

  page.appendChild(el('button', { className: 'btn btn-primary w-full', style: { height: '48px', background: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: () => {
    modalConfirmRemove();
  } }, 'I understand, remove my account'));

  page.appendChild(el('button', { className: 'btn btn-secondary w-full', style: { height: '48px' }, onClick: () => navigate('/profile', { direction: 'reverse' }) }, 'Cancel'));

  return page;
}

function modalConfirmRemove() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body', style: { textAlign: 'center', padding: '32px 24px' } });

    body.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' } }, 'Confirm Account Removal'));

    body.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' } }, 'Type DELETE to confirm'));

    const input = el('input', { type: 'text', placeholder: 'Type DELETE', style: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', textAlign: 'center', fontWeight: '600', letterSpacing: '2px', marginBottom: '16px', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' } });
    body.appendChild(input);

    const btn = el('button', { className: 'btn w-full', style: { height: '48px', background: 'var(--border)', color: 'var(--text-muted)', borderColor: 'transparent', cursor: 'not-allowed' }, disabled: true }, 'Remove Account');
    body.appendChild(btn);

    input.addEventListener('input', () => {
      const match = input.value.trim().toUpperCase() === 'DELETE';
      btn.disabled = !match;
      if (match) {
        btn.style.background = 'var(--danger)';
        btn.style.color = 'white';
        btn.style.cursor = 'pointer';
      } else {
        btn.style.background = 'var(--border)';
        btn.style.color = 'var(--text-muted)';
        btn.style.cursor = 'not-allowed';
      }
    });

    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      btn.innerHTML = '<div class="spinner spinner-sm"></div>';
      btn.disabled = true;
      try {
        await Store.deleteAccount('DELETE');
        Store.logout();
        showToast('Account removed', 'success');
        navigate('/auth');
      } catch (err) {
        showToast(err.message || 'Failed to delete account', 'error');
        btn.innerHTML = 'Remove Account';
        btn.disabled = false;
      }
    });

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

function showTooltipWalkthrough() {
  if (localStorage.getItem('coinexs_tutorial_seen')) return;
  const steps = [
    { selector: '.balance-amount', title: 'Your Balance', text: 'Your total balance is always visible here. Tap to hide or show.' },
    { selector: '.quick-actions-grid', title: 'Quick Actions', text: 'Send, receive, swap, and buy gift cards with one tap.' },
    { selector: '.nav-item[data-route="/cards"]', title: 'Virtual Cards', text: 'Manage your virtual card, set limits, and freeze anytime.' },
    { selector: '.nav-item[data-route="/rates"]', title: 'Live Rates', text: 'Track crypto and fiat rates in real-time.' }
  ];

  let currentStep = 0;
  const overlay = el('div', { style: { position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none' } });
  const backdrop = el('div', { style: { position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.6)', zIndex: '9998', pointerEvents: 'auto' } });
  overlay.appendChild(backdrop);

  const tooltipCard = el('div', { style: { position: 'fixed', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: '10000', maxWidth: '300px', width: '90%', pointerEvents: 'auto', transition: 'top 0.3s ease' } });
  overlay.appendChild(tooltipCard);

  const stepDots = el('div', { style: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' } });
  const titleEl = el('div', { style: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' } });
  const textEl = el('div', { style: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' } });
  const btnRow = el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } });
  const skipBtn = el('button', { className: 'btn btn-secondary', style: { height: '36px', fontSize: '13px', padding: '0 16px' }, onClick: () => { overlay.remove(); localStorage.setItem('coinexs_tutorial_seen', 'true'); } }, 'Skip');
  const nextBtn = el('button', { className: 'btn btn-primary', style: { height: '36px', fontSize: '13px', padding: '0 16px' } });
  btnRow.appendChild(skipBtn);
  btnRow.appendChild(nextBtn);
  tooltipCard.appendChild(stepDots);
  tooltipCard.appendChild(titleEl);
  tooltipCard.appendChild(textEl);
  tooltipCard.appendChild(btnRow);

  function renderStep() {
    stepDots.innerHTML = '';
    for (var i = 0; i < steps.length; i++) {
      stepDots.appendChild(el('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: i === currentStep ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s' } }));
    }
    const step = steps[currentStep];
    titleEl.textContent = step.title;
    textEl.textContent = step.text;
    nextBtn.textContent = currentStep === steps.length - 1 ? 'Got it' : 'Next';

    const target = document.querySelector(step.selector);
    if (target) {
      const rect = target.getBoundingClientRect();
      const topPos = rect.top < window.innerHeight / 2 ? rect.bottom + 12 : rect.top - 130;
      tooltipCard.style.top = Math.max(20, Math.min(topPos, window.innerHeight - 150)) + 'px';
    } else {
      tooltipCard.style.top = '40%';
    }

    nextBtn.onclick = () => {
      currentStep++;
      if (currentStep >= steps.length) {
        overlay.remove();
        localStorage.setItem('coinexs_tutorial_seen', 'true');
      } else {
        renderStep();
      }
    };
  }

  renderStep();
  document.body.appendChild(overlay);
}

function sendLocalNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (!Store.user?.settings?.loginNotifications && !Store.user?.settings?.transactionAlerts) return;
  try { new Notification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: 'coinexs-' + Date.now() }); } catch (e) {}
}

function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return;
  if (localStorage.getItem('coinexs_notif_prompted')) return;
  localStorage.setItem('coinexs_notif_prompted', 'true');
  setTimeout(() => {
    modalNotificationPrompt();
  }, 3000);
}

function modalNotificationPrompt() {
  openModal((close) => {
    const body = el('div', { className: 'modal-body', style: { textAlign: 'center', padding: '32px 24px' } });
    const icon = el('div', { style: { margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    icon.innerHTML = createIcon('bell', 28);
    body.appendChild(icon);
    body.appendChild(el('div', { style: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' } }, 'Stay Updated'));
    body.appendChild(el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto 24px' } }, 'Get notified about transactions, security alerts, and important account updates.'));

    const footer = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
    footer.appendChild(el('button', { className: 'btn btn-primary w-full', style: { height: '48px' }, onClick: async () => {
      close();
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          showToast('Notifications enabled', 'success');
          sendLocalNotification('Coinexs', 'You\'ll now receive important alerts and updates.');
        } else {
          showToast('Notifications blocked', 'info');
        }
      } else {
        showToast('Notifications not supported on this device', 'info');
      }
    } }, 'Enable Notifications'));
    footer.appendChild(el('button', { className: 'btn btn-secondary w-full', style: { height: '48px' }, onClick: close }, 'Not Now'));
    body.appendChild(footer);

    const frag = document.createDocumentFragment();
    frag.appendChild(body);
    return frag;
  });
}

document.addEventListener('click', (e) => {
  const txRow = e.target.closest('.transaction-row');
  if (txRow) {
    const txId = txRow.dataset.id;
    const tx = Store.transactions.find(t => t.id === txId);
    if (tx) modalTransactionDetail(tx);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Handle direct access
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

// ─── Install Banner (PWA) ───

let deferredInstallPrompt = null;

function renderInstallBanner() {
  if (localStorage.getItem('coinexs_install_dismissed') === 'true') return;
  const existing = document.getElementById('install-banner');
  if (existing) return;

  const banner = el('div', { className: 'install-banner', id: 'install-banner' });
  const icon = el('div', { className: 'install-banner-icon' });
  icon.innerHTML = createIcon('arrow_down', 20);
  banner.appendChild(icon);
  const text = el('div', { className: 'install-banner-text' });
  text.appendChild(el('div', { className: 'install-banner-title' }, 'Install Coinexs'));
  text.appendChild(el('div', { className: 'install-banner-sub' }, 'Get the best experience on your phone'));
  banner.appendChild(text);
  const installBtn = el('button', { className: 'install-banner-btn', onClick: async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    if (result.outcome === 'accepted') {
      banner.remove();
      localStorage.setItem('coinexs_install_dismissed', 'true');
    }
    deferredInstallPrompt = null;
  } }, 'Install');
  banner.appendChild(installBtn);
  const dismissBtn = el('button', { className: 'install-banner-dismiss', onClick: () => {
    banner.remove();
    localStorage.setItem('coinexs_install_dismissed', 'true');
  }, 'aria-label': 'Dismiss' });
  dismissBtn.innerHTML = createIcon('x', 16);
  banner.appendChild(dismissBtn);

  document.getElementById('app').appendChild(banner);
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  renderInstallBanner();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  localStorage.setItem('coinexs_install_dismissed', 'true');
  const banner = document.getElementById('install-banner');
  if (banner) banner.remove();
});