function adminGuard() {
  if (!Store.user) {
    if (!Store.isLoggedIn()) { navigate('/admin/login'); return false; }
    Store.fetchUser().then(() => refreshPage()).catch(() => { Store.logout(); navigate('/admin/login'); });
    return false;
  }
  if (Store.user.role !== 'admin' && Store.user.role !== 'superadmin') {
    showToast('Admin access required', 'error');
    navigate('/admin/login');
    return false;
  }
  return true;
}

function adminPageLayout(title, activeTab) {
  const wrapper = el('div', { className: 'admin-wrapper' });
  const sidebar = el('div', { className: 'admin-sidebar' });
  const logo = el('div', { className: 'admin-logo' });
  const logoImg = el('img', { className: 'admin-logo-img', alt: 'Coinexs' });
  logoImg.src = document.documentElement.getAttribute('data-theme') === 'dark' ? 'assets/images/logo-wordmark-dark.png' : 'assets/images/logo-wordmark-light.png';
  logo.appendChild(logoImg);
  sidebar.appendChild(logo);

  const navItems = [
    { icon: 'chart-line-up', label: 'Dashboard', route: '/admin' },
    { icon: 'users', label: 'Users', route: '/admin/users' },
    { icon: 'coins', label: 'Transactions', route: '/admin/transactions' },
    { icon: 'cards', label: 'Cards', route: '/admin/cards' },
    { icon: 'chart-line-up', label: 'Rates', route: '/admin/rates' },
    { icon: 'gift', label: 'Gift Cards', route: '/admin/giftcards' },
    { icon: 'identification-card', label: 'KYC', route: '/admin/kyc' },
    { icon: 'bell', label: 'Notifications', route: '/admin/notifications' },
    { icon: 'download-simple', label: 'Deposits', route: '/admin/deposits' },
    { icon: 'chat-dots', label: 'Live Chat', route: '/admin/chat' }
  ];

  const nav = el('div', { className: 'admin-nav' });
  navItems.forEach(item => {
    const btn = el('button', { className: 'admin-nav-item' + (item.route === activeTab ? ' active' : ''), onClick: () => navigate(item.route) });
    const iconWrap = el('div', { className: 'admin-nav-icon' });
    iconWrap.innerHTML = createIcon(item.icon, 18);
    btn.appendChild(iconWrap);
    btn.appendChild(el('span', {}, item.label));
    if (item.route === '/admin/kyc') {
      Store.adminGetUsers({ kyc: 'pending', limit: 1 }).then(data => {
        if (data.total > 0) {
          const badge = el('span', { className: 'admin-badge' }, String(data.total));
          btn.appendChild(badge);
        }
      }).catch(() => {});
    }
    if (item.route === '/admin/deposits') {
      Store.adminGetDepositClaims('pending').then(data => {
        const pending = (data.claims || []).length;
        if (pending > 0) {
          const badge = el('span', { className: 'admin-badge' }, String(pending));
          btn.appendChild(badge);
        }
      }).catch(() => {});
    }
    if (item.route === '/admin/chat') {
      Store.adminChatGetOpenCount().then(data => {
        if (data.count > 0) {
          const badge = el('span', { className: 'admin-badge' }, String(data.count));
          btn.appendChild(badge);
        }
      }).catch(() => {});
    }
    nav.appendChild(btn);
  });
  sidebar.appendChild(nav);

  const backBtn = el('button', { className: 'admin-nav-item', style: { marginTop: 'auto' }, onClick: () => navigate('/home') });
  const backIcon = el('div', { className: 'admin-nav-icon' });
  backIcon.innerHTML = createIcon('arrow_left', 18);
  backBtn.appendChild(backIcon);
  backBtn.appendChild(el('span', {}, 'Back to App'));
  sidebar.appendChild(backBtn);

  wrapper.appendChild(sidebar);

  const main = el('div', { className: 'admin-main' });
  const header = el('div', { className: 'admin-header' });
  header.appendChild(el('h1', { className: 'admin-title' }, title));
  const headerActions = el('div', { className: 'admin-header-actions' });
  const refreshBtn = el('button', { className: 'admin-icon-btn', onClick: () => refreshPage(), title: 'Refresh' });
  refreshBtn.innerHTML = createIcon('arrows-clockwise', 16);
  headerActions.appendChild(refreshBtn);
  const userBadge = el('div', { className: 'admin-user-badge' });
  userBadge.innerHTML = createIcon('shield', 14);
  userBadge.appendChild(el('span', {}, Store.user && Store.user.name ? Store.user.name : 'Admin'));
  headerActions.appendChild(userBadge);
  header.appendChild(headerActions);
  main.appendChild(header);

  const content = el('div', { className: 'admin-content' });
  main.appendChild(content);
  wrapper.appendChild(main);

  return { wrapper, content };
}

function adminStatCard(icon, label, value, color) {
  const card = el('div', { className: 'admin-stat-card' });
  const topRow = el('div', { className: 'admin-stat-top' });
  const iconWrap = el('div', { className: 'admin-stat-icon', style: { background: (color || 'var(--primary)') + '18', color: color || 'var(--primary)' } });
  iconWrap.innerHTML = createIcon(icon, 20);
  topRow.appendChild(iconWrap);
  card.appendChild(topRow);
  card.appendChild(el('div', { className: 'admin-stat-value' }, String(value)));
  card.appendChild(el('div', { className: 'admin-stat-label' }, label));
  return card;
}

function renderAdminLogin() {
  const wrapper = el('div', { className: 'admin-login-wrapper' });
  const card = el('div', { className: 'admin-login-card' });
  const logo = el('div', { className: 'admin-login-logo' });
  const loginLogoImg = el('img', { className: 'admin-login-logo-img', alt: 'Coinexs' });
  loginLogoImg.src = document.documentElement.getAttribute('data-theme') === 'dark' ? 'assets/images/logo-wordmark-dark-240.png' : 'assets/images/logo-wordmark-light-240.png';
  logo.appendChild(loginLogoImg);
  card.appendChild(logo);
  card.appendChild(el('div', { className: 'admin-login-sub' }, 'Authorized personnel only'));

  const errorEl = el('div', { className: 'admin-login-error', style: { display: 'none' } });
  card.appendChild(errorEl);

  const form = el('form', { className: 'admin-login-form' });
  const emailInput = el('input', { type: 'email', placeholder: 'Admin email', className: 'admin-login-input', required: true, autocomplete: 'email' });
  form.appendChild(emailInput);
  const passInput = el('input', { type: 'password', placeholder: 'Password', className: 'admin-login-input', required: true, autocomplete: 'current-password' });
  form.appendChild(passInput);

  const submitBtn = el('button', { type: 'submit', className: 'admin-login-btn' }, 'Sign In');
  const spinnerWrap = el('span', { style: { display: 'none' } });
  spinnerWrap.innerHTML = '<div class="spinner spinner-sm"></div>';
  submitBtn.appendChild(spinnerWrap);
  form.appendChild(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    const spinner = submitBtn.querySelector('span');
    if (spinner) spinner.style.display = 'inline-flex';
    const origText = submitBtn.childNodes[0];
    if (origText) origText.textContent = 'Signing in...';

    const loginPayload = JSON.stringify({ login: emailInput.value.trim(), password: passInput.value });
    api('/auth/login', { method: 'POST', body: loginPayload }).then(data => {
      if (!data.token) { throw new Error('Invalid response'); }
      Store.login(data.token);
      return api('/users/profile');
    }).then(data => {
      const user = data.user || data;
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        Store.logout();
        errorEl.textContent = 'Access denied. Admin credentials required.';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        if (origText) origText.textContent = 'Sign In';
        if (spinner) spinner.style.display = 'none';
        return;
      }
      Store.user = user;
      navigate('/admin');
    }).catch(err => {
      Store.logout();
      errorEl.textContent = err.message || 'Login failed. Check your credentials.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      if (origText) origText.textContent = 'Sign In';
      if (spinner) spinner.style.display = 'none';
    });
  });

  card.appendChild(form);
  wrapper.appendChild(card);
  return wrapper;
}

function renderAdminDashboard() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Dashboard', '/admin');

  const statsGrid = el('div', { className: 'admin-stats-grid' });
  for (var i = 0; i < 4; i++) statsGrid.appendChild(el('div', { className: 'admin-stat-card admin-skeleton' }));
  content.appendChild(statsGrid);

  const sectionsContainer = el('div', { className: 'admin-sections' });
  const sectionSkel1 = el('div', { className: 'admin-section' });
  const skelHeader1 = el('div', { className: 'admin-section-header' });
  skelHeader1.appendChild(el('div', { className: 'admin-section-title admin-skeleton', style: { width: '140px', height: '14px' } }));
  sectionSkel1.appendChild(skelHeader1);
  for (i = 0; i < 4; i++) sectionSkel1.appendChild(el('div', { className: 'admin-skeleton', style: { height: '40px', margin: '0 20px 1px' } }));
  sectionsContainer.appendChild(sectionSkel1);
  const sectionSkel2 = el('div', { className: 'admin-section' });
  const skelHeader2 = el('div', { className: 'admin-section-header' });
  skelHeader2.appendChild(el('div', { className: 'admin-section-title admin-skeleton', style: { width: '120px', height: '14px' } }));
  sectionSkel2.appendChild(skelHeader2);
  for (i = 0; i < 3; i++) sectionSkel2.appendChild(el('div', { className: 'admin-skeleton', style: { height: '40px', margin: '0 20px 1px' } }));
  sectionsContainer.appendChild(sectionSkel2);
  content.appendChild(sectionsContainer);

  Store.adminGetStats().then(data => {
    statsGrid.innerHTML = '';
    statsGrid.appendChild(adminStatCard('users', 'Total Users', data.stats.totalUsers, '#0052FF'));
    statsGrid.appendChild(adminStatCard('coins', 'Total Volume', formatCurrency(data.stats.totalVolume), '#10B981'));
    statsGrid.appendChild(adminStatCard('identification-card', 'Pending KYC', data.stats.pendingKyc, '#F59E0B'));
    statsGrid.appendChild(adminStatCard('cards', 'Active Cards', data.stats.activeCards, '#8B5CF6'));

    const sections = el('div', { className: 'admin-sections' });

    const recentTxSection = el('div', { className: 'admin-section' });
    const txHeader = el('div', { className: 'admin-section-header' });
    txHeader.appendChild(el('div', { className: 'admin-section-title' }, 'Recent Transactions'));
    const txSearch = el('input', { type: 'text', className: 'admin-dash-search', placeholder: 'Search transactions...', onInput: (e) => {
      const q = e.target.value.toLowerCase();
      txRows.forEach(row => {
        const match = row.dataset.search && row.dataset.search.includes(q);
        row.style.display = match || !q ? 'flex' : 'none';
      });
      txEmpty.style.display = txRows.every(r => r.style.display === 'none') ? 'block' : 'none';
    } });
    const viewAllTx = el('button', { className: 'admin-link', onClick: () => navigate('/admin/transactions') }, 'View all');
    txHeader.appendChild(txSearch);
    txHeader.appendChild(viewAllTx);
    recentTxSection.appendChild(txHeader);
    const txRows = [];
    data.recentTransactions.forEach(tx => {
      const row = el('div', { className: 'admin-table-row' });
      const user = tx.userId ? tx.userId.name || tx.userId.email : 'Unknown';
      const txDate = new Date(tx.date);
      const dateStr = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      row.dataset.search = (tx.title + ' ' + user + ' ' + tx.category + ' ' + tx.amount).toLowerCase();
      const debitIcon = el('div', { className: 'admin-row-icon', style: { background: tx.type === 'credit' ? '#10B98120' : '#EF444420', color: tx.type === 'credit' ? '#10B981' : '#EF4444' } });
      debitIcon.innerHTML = createIcon(tx.type === 'credit' ? 'arrow_down' : 'arrow_up', 16);
      row.appendChild(debitIcon);
      row.appendChild(el('div', { className: 'admin-row-main' },
        el('div', { className: 'admin-row-title' }, tx.title),
        el('div', { className: 'admin-row-sub' }, user + ' · ' + dateStr)
      ));
      const amountEl = el('div', { className: 'admin-row-amount ' + (tx.type === 'credit' ? 'text-green' : 'text-red'), style: { whiteSpace: 'nowrap' } });
      amountEl.textContent = (tx.type === 'credit' ? '+' : '-') + formatCurrency(tx.amount);
      row.appendChild(amountEl);
      recentTxSection.appendChild(row);
      txRows.push(row);
    });
    const txEmpty = el('div', { className: 'admin-empty', style: { display: 'none' } }, 'No matching transactions');
    if (data.recentTransactions.length === 0) { txEmpty.style.display = 'block'; recentTxSection.appendChild(el('div', { className: 'admin-empty' }, 'No transactions')); }
    else recentTxSection.appendChild(txEmpty);
    sections.appendChild(recentTxSection);

    const recentUsersSection = el('div', { className: 'admin-section' });
    const usersHeader = el('div', { className: 'admin-section-header' });
    usersHeader.appendChild(el('div', { className: 'admin-section-title' }, 'Recent Signups'));
    const userSearch = el('input', { type: 'text', className: 'admin-dash-search', placeholder: 'Search users...', onInput: (e) => {
      const q = e.target.value.toLowerCase();
      userRows.forEach(row => {
        const match = row.dataset.search && row.dataset.search.includes(q);
        row.style.display = match || !q ? 'flex' : 'none';
      });
      userEmpty.style.display = userRows.every(r => r.style.display === 'none') ? 'block' : 'none';
    } });
    const viewAllUsers = el('button', { className: 'admin-link', onClick: () => navigate('/admin/users') }, 'View all');
    usersHeader.appendChild(userSearch);
    usersHeader.appendChild(viewAllUsers);
    recentUsersSection.appendChild(usersHeader);
    const userRows = [];
    data.recentUsers.forEach(u => {
      const row = el('div', { className: 'admin-table-row', onClick: () => navigate('/admin/users/' + u._id), role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter') navigate('/admin/users/' + u._id); } });
      row.dataset.search = (u.name + ' ' + u.email + ' @' + u.username + ' ' + u.role).toLowerCase();
      const avatar = el('img', { className: 'admin-avatar', src: typeof getAvatar === 'function' ? getAvatar(u.name) : '', alt: u.name });
      row.appendChild(avatar);
      const main = el('div', { className: 'admin-row-main' });
      main.appendChild(el('div', { className: 'admin-row-title' }, u.name));
      const subParts = ['@' + u.username];
      if (u.email) subParts.push(u.email);
      if (u.createdAt) subParts.push(new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      main.appendChild(el('div', { className: 'admin-row-sub' }, subParts.join(' · ')));
      row.appendChild(main);
      if (u.balance?.USD !== undefined) {
        row.appendChild(el('div', { className: 'admin-row-amount text-green', style: { whiteSpace: 'nowrap', fontSize: '13px' } }, formatCurrency(u.balance.USD)));
      }
      const roleBadge = el('span', { className: 'admin-role-badge ' + u.role }, u.role);
      row.appendChild(roleBadge);
      if (u.kycStatus && u.kycStatus !== 'none') {
        const kycBadge = el('span', { className: 'admin-kyc-badge ' + u.kycStatus }, u.kycStatus);
        row.appendChild(kycBadge);
      }
      const caret = el('div', { style: { color: 'var(--text-muted)', marginLeft: 'auto' } });
      caret.innerHTML = createIcon('caret-right', 14);
      row.appendChild(caret);
      recentUsersSection.appendChild(row);
      userRows.push(row);
    });
    const userEmpty = el('div', { className: 'admin-empty', style: { display: 'none' } }, 'No matching users');
    if (data.recentUsers.length === 0) { userEmpty.style.display = 'block'; recentUsersSection.appendChild(el('div', { className: 'admin-empty' }, 'No users')); }
    else recentUsersSection.appendChild(userEmpty);
    sections.appendChild(recentUsersSection);

    content.replaceChild(sections, sectionsContainer);
  }).catch(err => {
    statsGrid.innerHTML = '<div class="admin-empty">Failed to load dashboard. <button class="btn btn-primary btn-sm" onclick="renderAdminDashboard()">Retry</button></div>';
    content.replaceChild(el('div', { className: 'admin-sections' }, el('div', { className: 'admin-section' }, el('div', { className: 'admin-empty' }, 'Could not load data'))), sectionsContainer);
  });

  return wrapper;
}

function renderAdminUsers() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Users', '/admin/users');

  let currentPage = 1, searchQuery = '', filterKyc = '', filterStatus = '';

  const toolbar = el('div', { className: 'admin-toolbar' });
  const searchWrapper = el('div', { className: 'admin-search' });
  searchWrapper.innerHTML = createIcon('magnifying-glass', 18);
  const searchInput = el('input', { type: 'text', placeholder: 'Search users...', className: 'admin-search-input' });
  searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; loadUsers(); });
  searchWrapper.appendChild(searchInput);
  toolbar.appendChild(searchWrapper);

  const filters = el('div', { className: 'admin-filters' });
  ['all', 'pending', 'verified', 'rejected'].forEach(f => {
    filters.appendChild(el('button', { className: 'admin-chip' + (f === 'all' && !filterKyc ? ' active' : ''), onClick: () => { filterKyc = f === 'all' ? '' : f; currentPage = 1; loadUsers(); } }, f === 'all' ? 'All KYC' : f.charAt(0).toUpperCase() + f.slice(1)));
  });
  toolbar.appendChild(filters);
  content.appendChild(toolbar);

  const tableContainer = el('div', { className: 'admin-table-container' });
  content.appendChild(tableContainer);

  const pagination = el('div', { className: 'admin-pagination' });
  content.appendChild(pagination);

  function loadUsers() {
    tableContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner spinner-lg"></div></div>';
    Store.adminGetUsers({ page: currentPage, limit: 15, search: searchQuery, kyc: filterKyc }).then(data => {
      tableContainer.innerHTML = '';
      if (data.users.length === 0) {
        tableContainer.appendChild(el('div', { className: 'admin-empty' }, 'No users found'));
        pagination.innerHTML = '';
        return;
      }

      const table = el('div', { className: 'admin-table' });
      const headerRow = el('div', { className: 'admin-table-header admin-table-row' });
      headerRow.appendChild(el('div', { style: { flex: '2' } }, 'User'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Role'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'KYC'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Balance'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Actions'));
      table.appendChild(headerRow);

      data.users.forEach(u => {
        const row = el('div', { className: 'admin-table-row' });
        const userCell = el('div', { className: 'admin-row-main', style: { flex: '2', cursor: 'pointer' }, onClick: () => navigate('/admin/users/' + u._id) });
        userCell.appendChild(el('div', { className: 'admin-row-title' }, u.name));
        userCell.appendChild(el('div', { className: 'admin-row-sub' }, '@' + u.username + ' · ' + u.email));
        row.appendChild(userCell);

        row.appendChild(el('div', { style: { flex: '1' } }, el('span', { className: 'admin-role-badge ' + u.role }, u.role)));

        const kycBadge = el('span', { className: 'admin-kyc-badge ' + u.kycStatus }, u.kycStatus || 'none');
        row.appendChild(el('div', { style: { flex: '1' } }, kycBadge));

        row.appendChild(el('div', { style: { flex: '1', fontSize: '14px' } }, formatCurrency(u.balance?.USD || 0)));

        const actions = el('div', { className: 'admin-row-actions', style: { flex: '1' } });
        const suspendBtn = el('button', { className: 'admin-action-btn ' + (u.isSuspended ? 'warning' : 'danger'), onClick: async (e) => {
          e.stopPropagation();
          try {
            await Store.adminSuspendUser(u._id, !u.isSuspended, '');
            showToast(u.isSuspended ? 'User unsuspended' : 'User suspended', 'success');
            loadUsers();
          } catch (err) { showToast(err.message || 'Failed', 'error'); }
        } }, u.isSuspended ? 'Unsuspend' : 'Suspend');
        actions.appendChild(suspendBtn);
        row.appendChild(actions);

        table.appendChild(row);
      });
      tableContainer.appendChild(table);

      pagination.innerHTML = '';
      if (data.pages > 1) {
        if (currentPage > 1) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage--; loadUsers(); } }, 'Previous'));
        pagination.appendChild(el('span', { className: 'admin-page-info' }, 'Page ' + currentPage + ' of ' + data.pages));
        if (currentPage < data.pages) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage++; loadUsers(); } }, 'Next'));
      }
    }).catch(err => {
      tableContainer.innerHTML = '<div class="admin-empty">Failed to load users</div>';
    });
  }

  loadUsers();
  return wrapper;
}

function fieldRow(label, value) {
  return el('div', { className: 'admin-field-row' },
    el('span', { className: 'admin-field-label' }, label),
    el('span', { className: 'admin-field-value' }, value || '—')
  );
}

function renderAdminUserDetail(userId) {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('User Detail', '/admin/users');

  content.appendChild(el('div', { style: { display: 'flex', justifyContent: 'center', padding: '40px' } }, el('div', { className: 'spinner spinner-lg' })));

  Store.adminGetUserDetail(userId).then(data => {
    const u = data.user;
    content.innerHTML = '';
    const backBtn = el('button', { className: 'btn btn-secondary', style: { marginBottom: '16px' }, onClick: () => navigate('/admin/users') });
    backBtn.innerHTML = createIcon('arrow_left', 16) + ' Back to Users';
    content.appendChild(backBtn);

    const grid1 = el('div', { className: 'admin-detail-grid' });

    /* ─── Profile ─── */
    const profileCard = el('div', { className: 'admin-section' });
    profileCard.appendChild(el('div', { className: 'admin-section-title' }, 'Profile'));
    const profileInfo = el('div', { className: 'admin-profile' });
    const avatar = el('img', { className: 'admin-avatar-lg', src: getAvatar(u.name), alt: u.name });
    profileInfo.appendChild(avatar);
    const details = el('div', { className: 'admin-profile-details' });
    details.appendChild(el('div', { className: 'admin-profile-name' }, u.name));
    details.appendChild(el('div', { className: 'admin-profile-email' }, u.email));
    details.appendChild(el('div', { className: 'admin-profile-meta' }, '@' + u.username + ' · Joined ' + new Date(u.createdAt).toLocaleDateString()));
    profileInfo.appendChild(details);
    profileCard.appendChild(profileInfo);

    const personalFields = el('div', { className: 'admin-fields-grid' });
    personalFields.appendChild(fieldRow('Phone', u.phone));
    personalFields.appendChild(fieldRow('Date of Birth', u.dateOfBirth));
    personalFields.appendChild(fieldRow('Address', u.address));
    personalFields.appendChild(fieldRow('Referral Code', u.referralCode));
    personalFields.appendChild(fieldRow('Referrals', String(u.referralCount || 0)));
    personalFields.appendChild(fieldRow('Referral Earnings', formatCurrency(u.referralEarnings || 0)));
    personalFields.appendChild(fieldRow('Last Login', u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'));
    profileCard.appendChild(personalFields);

    const roleSection = el('div', { className: 'admin-profile-actions' });
    const roleSelect = el('select', { className: 'admin-select', value: u.role });
    ['user', 'admin', 'superadmin'].forEach(r => {
      const opt = el('option', { value: r }, r.charAt(0).toUpperCase() + r.slice(1));
      if (r === u.role) opt.selected = true;
      roleSelect.appendChild(opt);
    });
    roleSelect.addEventListener('change', async () => {
      try { await Store.adminUpdateUserRole(userId, roleSelect.value); showToast('Role updated', 'success'); } catch (err) { showToast(err.message || 'Failed', 'error'); }
    });
    roleSection.appendChild(el('span', { style: { fontSize: '14px', fontWeight: '500' } }, 'Role: '));
    roleSection.appendChild(roleSelect);
    profileCard.appendChild(roleSection);

    const statusRow = el('div', { className: 'admin-field-row', style: { padding: '8px 20px 16px', borderTop: '1px solid var(--border)', marginTop: '12px' } });
    statusRow.appendChild(el('span', { className: 'admin-field-label' }, 'KYC'));
    statusRow.appendChild(el('span', { className: 'admin-kyc-badge ' + u.kycStatus }, u.kycStatus));
    statusRow.appendChild(el('span', { style: { marginLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)' } }, 'Tier ' + (u.tier || 1) + (u.isLimited ? ' · Limited' : ' · Unlimited')));
    if (u.isSuspended) {
      statusRow.appendChild(el('span', { style: { marginLeft: '12px', fontSize: '12px', color: 'var(--danger)' } }, 'SUSPENDED'));
    }
    profileCard.appendChild(statusRow);

    if (u.isSuspended) {
      const suspBanner = el('div', { className: 'admin-banner warning' });
      suspBanner.innerHTML = createIcon('warning', 16) + ' Suspended: ' + (u.suspensionReason || 'No reason');
      profileCard.appendChild(suspBanner);
    }

    grid1.appendChild(profileCard);

    /* ─── Settings ─── */
    const s = u.settings || {};
    const settingsCard = el('div', { className: 'admin-section' });
    settingsCard.appendChild(el('div', { className: 'admin-section-title' }, 'Settings'));
    const settingsFields = el('div', { className: 'admin-fields-grid' });
    settingsFields.appendChild(fieldRow('Theme', s.theme));
    settingsFields.appendChild(fieldRow('Currency', s.currency));
    settingsFields.appendChild(fieldRow('Language', s.language));
    settingsFields.appendChild(fieldRow('Two-Factor Auth', s.twoFactor ? 'Enabled' : 'Disabled'));
    settingsFields.appendChild(fieldRow('Biometrics', s.biometrics ? 'Enabled' : 'Disabled'));
    settingsFields.appendChild(fieldRow('Login Notifications', s.loginNotifications ? 'On' : 'Off'));
    settingsFields.appendChild(fieldRow('Transaction Alerts', s.transactionAlerts ? 'On' : 'Off'));
    if (s.recoveryEmail) settingsFields.appendChild(fieldRow('Recovery Email', s.recoveryEmail));
    if (s.recoveryPhone) settingsFields.appendChild(fieldRow('Recovery Phone', s.recoveryPhone));
    settingsCard.appendChild(settingsFields);
    grid1.appendChild(settingsCard);

    content.appendChild(grid1);

    /* ─── Balances + Bank Accounts ─── */
    const grid2 = el('div', { className: 'admin-detail-grid' });

    const balanceCard = el('div', { className: 'admin-section' });
    const balHeader = el('div', { className: 'admin-section-header' });
    balHeader.appendChild(el('div', { className: 'admin-section-title' }, 'Wallet Balances'));
    balanceCard.appendChild(balHeader);
    const balGrid = el('div', { className: 'admin-balance-grid' });
    const currencies = [
      { key: 'USD', label: 'USD', icon: 'currency-dollar', color: '#10B981', fmt: v => formatCurrency(v) },
      { key: 'BTC', label: 'BTC', icon: 'bitcoin', color: '#F7931A', fmt: v => (v || 0).toFixed(6) },
      { key: 'ETH', label: 'ETH', icon: 'ethereum', color: '#627EEA', fmt: v => (v || 0).toFixed(6) }
    ];
    currencies.forEach(c => {
      const card = el('div', { className: 'admin-stat-card', style: { position: 'relative' } });
      const top = el('div', { className: 'admin-stat-top' });
      const label = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
      const icon = el('div', { className: 'admin-stat-icon', style: { background: c.color + '20', color: c.color } });
      icon.innerHTML = createIcon(c.icon, 16);
      label.appendChild(icon);
      label.appendChild(el('span', { style: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' } }, c.label));
      top.appendChild(label);
      const editBtn = el('button', { className: 'admin-action-btn', style: { padding: '4px 8px', fontSize: '11px' }, onClick: (e) => {
        e.stopPropagation();
        openModal((close) => {
          const body = el('div', { className: 'modal-body' });
          body.appendChild(el('div', { className: 'modal-header' }, el('div', { className: 'modal-title' }, 'Edit ' + c.key + ' Balance')));
          const closeBtn = el('button', { className: 'modal-close', onClick: close });
          closeBtn.innerHTML = createIcon('x', 20);
          body.appendChild(closeBtn);

          const form = el('div', { className: 'balance-edit-form' });
          const currentVal = u.balance?.[c.key] || 0;

          const currentRow = el('div', { className: 'balance-edit-current' });
          currentRow.innerHTML = '<span class="balance-edit-current-label">Current Balance</span><span class="balance-edit-current-value">' + c.fmt(currentVal) + '</span>';
          form.appendChild(currentRow);

          const fieldGroup = el('div', { className: 'balance-edit-fields' });

          const opLabel = el('label', { className: 'balance-edit-label' }, 'Operation');
          const opSelect = el('select', { className: 'balance-edit-select' });
          opSelect.appendChild(el('option', { value: 'set' }, 'Set to'));
          opSelect.appendChild(el('option', { value: 'add' }, 'Add'));
          opSelect.appendChild(el('option', { value: 'subtract' }, 'Subtract'));
          fieldGroup.appendChild(opLabel);
          fieldGroup.appendChild(opSelect);

          const amtLabel = el('label', { className: 'balance-edit-label' }, 'Amount');
          const amtInput = el('input', { type: 'number', className: 'balance-edit-input', placeholder: '0.00', value: currentVal, step: c.key === 'USD' ? '0.01' : '0.000001', min: '0' });
          fieldGroup.appendChild(amtLabel);
          fieldGroup.appendChild(amtInput);

          form.appendChild(fieldGroup);

          const submitBtn = el('button', { className: 'balance-edit-btn', onClick: async () => {
            const amt = parseFloat(amtInput.value);
            if (isNaN(amt) || amt < 0) { showToast('Enter a valid amount', 'error'); return; }
            submitBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
            submitBtn.disabled = true;
            try {
              await Store.adminUpdateUserBalance(userId, c.key, amt, opSelect.value);
              showToast(c.key + ' balance updated', 'success');
              close();
              renderAdminUserDetail(userId);
            } catch (err) { showToast(err.message || 'Failed', 'error'); submitBtn.innerHTML = 'Update Balance'; submitBtn.disabled = false; }
          } }, 'Update Balance');
          form.appendChild(submitBtn);
          body.appendChild(form);
          const frag = document.createDocumentFragment(); frag.appendChild(body); return frag;
        });
      } });
      editBtn.innerHTML = createIcon('pencil_simple', 12) + ' Edit';
      top.appendChild(editBtn);
      card.appendChild(top);
      const val = el('div', { className: 'admin-stat-value' }, c.fmt(u.balance?.[c.key] || 0));
      card.appendChild(val);
      balGrid.appendChild(card);
    });
    balanceCard.appendChild(balGrid);
    grid2.appendChild(balanceCard);

    if (u.bankAccounts && u.bankAccounts.length > 0) {
      const bankCard = el('div', { className: 'admin-section' });
      bankCard.appendChild(el('div', { className: 'admin-section-title' }, 'Bank Accounts'));
      u.bankAccounts.forEach(b => {
        const row = el('div', { className: 'admin-table-row', style: { padding: '10px 20px' } });
        row.appendChild(el('div', { className: 'admin-row-main' },
          el('div', { className: 'admin-row-title' }, b.name),
          el('div', { className: 'admin-row-sub' }, b.type + ' · •••• ' + b.last4 + (b.isDefault ? ' · Default' : ''))
        ));
        bankCard.appendChild(row);
      });
      grid2.appendChild(bankCard);
    }

    content.appendChild(grid2);

    /* ─── Crypto Wallets + Cards ─── */
    const grid3 = el('div', { className: 'admin-detail-grid' });

    if (data.wallets && data.wallets.length > 0) {
      const walletCard = el('div', { className: 'admin-section' });
      walletCard.appendChild(el('div', { className: 'admin-section-title' }, 'Crypto Wallets'));
      data.wallets.forEach(w => {
        const row = el('div', { className: 'admin-table-row', style: { padding: '10px 20px' } });
        row.appendChild(el('div', { className: 'admin-row-main' },
          el('div', { className: 'admin-row-title' }, w.name + ' (' + w.coin + ')'),
          el('div', { className: 'admin-row-sub' }, 'Balance: ' + (w.balance || 0) + ' · Value: ' + formatCurrency(w.usdValue || 0))
        ));
        if (w.address) row.appendChild(el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' } }, w.address));
        walletCard.appendChild(row);
      });
      grid3.appendChild(walletCard);
    }

    if (data.cards && data.cards.length > 0) {
      const cardSection = el('div', { className: 'admin-section' });
      cardSection.appendChild(el('div', { className: 'admin-section-title' }, 'Cards'));
      data.cards.forEach(c => {
        const cardBody = el('div', { className: 'admin-card-detail', style: { padding: '12px 20px', borderBottom: '1px solid var(--border)' } });
        const topRow = el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } });
        topRow.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '600' } }, c.holder));
        topRow.appendChild(el('span', { className: 'admin-kyc-badge ' + c.status }, c.status));
        cardBody.appendChild(topRow);
        const fields = el('div', { className: 'admin-fields-grid', style: { gridTemplateColumns: '1fr 1fr' } });
        fields.appendChild(fieldRow('Card Number', c.cardNumber));
        fields.appendChild(fieldRow('CVV', c.cvv));
        fields.appendChild(fieldRow('Expiry', c.expiry));
        fields.appendChild(fieldRow('Tier', c.tier));
        fields.appendChild(fieldRow('Daily Limit', formatCurrency(c.limits?.daily || 0)));
        fields.appendChild(fieldRow('Per-Tx Limit', formatCurrency(c.limits?.perTx || 0)));
        cardBody.appendChild(fields);
        cardSection.appendChild(cardBody);
      });
      grid3.appendChild(cardSection);
    }

    content.appendChild(grid3);

    /* ─── KYC ─── */
    if (u.kycStatus !== 'none') {
      const kycCard = el('div', { className: 'admin-section', style: { marginBottom: '16px' } });
      kycCard.appendChild(el('div', { className: 'admin-section-title' }, 'KYC Verification'));
      kycCard.appendChild(el('div', { style: { padding: '0 20px 12px', fontSize: '14px' } }, 'Status: ', el('span', { className: 'admin-kyc-badge ' + u.kycStatus }, u.kycStatus)));

      if (u.kycDocuments && u.kycDocuments.length > 0) {
        const docList = el('div', { style: { padding: '0 20px 12px' } });
        u.kycDocuments.forEach(d => {
          const docRow = el('div', { style: { fontSize: '13px', padding: '3px 0', color: 'var(--text-secondary)' } });
          docRow.textContent = d.type + ' — ' + d.status + (d.reason ? ' (' + d.reason + ')' : '') + ' · ' + new Date(d.submittedAt).toLocaleDateString();
          docList.appendChild(docRow);
        });
        kycCard.appendChild(docList);
      }

      if (u.kycStatus === 'pending') {
        const kycActions = el('div', { className: 'admin-kyc-actions', style: { padding: '0 20px 16px' } });
        kycActions.appendChild(el('button', { className: 'btn btn-primary btn-sm', onClick: async () => {
          try { await Store.adminReviewKyc(userId, 'approve'); showToast('KYC approved', 'success'); renderAdminUserDetail(userId); } catch (err) { showToast(err.message || 'Failed', 'error'); }
        } }, 'Approve'));
        kycActions.appendChild(el('button', { className: 'btn btn-outline btn-sm', style: { color: 'var(--danger)' }, onClick: async () => {
          const reason = prompt('Rejection reason:');
          if (reason !== null) { try { await Store.adminReviewKyc(userId, 'reject', reason); showToast('KYC rejected', 'success'); renderAdminUserDetail(userId); } catch (err) { showToast(err.message || 'Failed', 'error'); } }
        } }, 'Reject'));
        kycCard.appendChild(kycActions);
      }
      content.appendChild(kycCard);
    }

    /* ─── Transactions ─── */
    const txCard = el('div', { className: 'admin-section', style: { marginBottom: '16px' } });
    txCard.appendChild(el('div', { className: 'admin-section-title' }, 'Transactions'));
    data.transactions.slice(0, 20).forEach(tx => {
      const row = el('div', { className: 'admin-table-row', style: { padding: '10px 20px' } });
      const debitIcon = el('div', { className: 'admin-row-icon', style: { background: tx.type === 'credit' ? '#10B98120' : '#EF444420', color: tx.type === 'credit' ? '#10B981' : '#EF4444' } });
      debitIcon.innerHTML = createIcon(tx.type === 'credit' ? 'arrow_down' : 'arrow_up', 16);
      row.appendChild(debitIcon);
      row.appendChild(el('div', { className: 'admin-row-main' },
        el('div', { className: 'admin-row-title' }, tx.title),
        el('div', { className: 'admin-row-sub' }, tx.category + ' · ' + (tx.status || 'completed') + ' · ' + new Date(tx.date).toLocaleDateString())
      ));
      const amt = el('div', { className: 'admin-row-amount ' + (tx.type === 'credit' ? 'text-green' : 'text-red') });
      amt.textContent = (tx.type === 'credit' ? '+' : '-') + formatCurrency(tx.amount);
      row.appendChild(amt);
      if (tx.status === 'pending') {
        const act = el('div', { className: 'admin-row-actions' });
        act.appendChild(el('button', { className: 'admin-action-btn success', onClick: async (e) => {
          e.stopPropagation(); try { await Store.adminUpdateTransactionStatus(tx._id, 'completed'); showToast('Approved', 'success'); renderAdminUserDetail(userId); } catch (err) { showToast(err.message || 'Failed', 'error'); }
        } }, 'Approve'));
        act.appendChild(el('button', { className: 'admin-action-btn danger', onClick: async (e) => {
          e.stopPropagation(); try { await Store.adminUpdateTransactionStatus(tx._id, 'failed'); showToast('Rejected', 'success'); renderAdminUserDetail(userId); } catch (err) { showToast(err.message || 'Failed', 'error'); }
        } }, 'Reject'));
        row.appendChild(act);
      }
      txCard.appendChild(row);
    });
    if (data.transactions.length === 0) txCard.appendChild(el('div', { className: 'admin-empty' }, 'No transactions'));
    content.appendChild(txCard);

    /* ─── Danger Zone ─── */
    const dangerZone = el('div', { className: 'admin-section' });
    dangerZone.appendChild(el('div', { className: 'admin-section-title', style: { color: 'var(--danger)' } }, 'Danger Zone'));
    const dangerActions = el('div', { className: 'admin-kyc-actions', style: { padding: '0 20px 16px' } });
    dangerActions.appendChild(el('button', { className: 'btn btn-outline btn-sm', style: { color: u.isSuspended ? 'var(--success)' : 'var(--danger)' }, onClick: async () => {
      const action = u.isSuspended ? 'unsuspend' : 'suspend';
      const reason = u.isSuspended ? '' : (prompt('Suspension reason:') || '');
      if (u.isSuspended || reason !== null) {
        try { await Store.adminSuspendUser(userId, !u.isSuspended, reason); showToast('User ' + action + 'ed', 'success'); renderAdminUserDetail(userId); } catch (err) { showToast(err.message || 'Failed', 'error'); }
      }
    } }, u.isSuspended ? 'Unsuspend' : 'Suspend'));
    dangerActions.appendChild(el('button', { className: 'btn btn-outline btn-sm', style: { color: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: async () => {
      if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        try { await Store.adminDeleteUser(userId); showToast('User deleted', 'success'); navigate('/admin/users'); } catch (err) { showToast(err.message || 'Failed', 'error'); }
      }
    } }, 'Delete'));
    dangerZone.appendChild(dangerActions);
    content.appendChild(dangerZone);
  }).catch(err => {
    content.innerHTML = '<div class="admin-empty">Failed to load user: ' + (err.message || 'Error') + '</div>';
  });

  return wrapper;
}

function renderAdminTransactions() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Transactions', '/admin/transactions');

  let currentPage = 1, filterType = '', filterStatus = '';

  const filters = el('div', { className: 'admin-toolbar' });
  const typeFilters = el('div', { className: 'admin-filters' });
  ['all', 'credit', 'debit', 'pending'].forEach(f => {
    typeFilters.appendChild(el('button', { className: 'admin-chip' + (f === 'all' && !filterType ? ' active' : ''), onClick: () => { filterType = f === 'all' ? '' : f; currentPage = 1; loadTx(); } }, f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)));
  });
  filters.appendChild(typeFilters);
  const statusFilters = el('div', { className: 'admin-filters' });
  ['all', 'completed', 'pending', 'failed'].forEach(f => {
    statusFilters.appendChild(el('button', { className: 'admin-chip' + (f === 'all' && !filterStatus ? ' active' : ''), onClick: () => { filterStatus = f === 'all' ? '' : f; currentPage = 1; loadTx(); } }, f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)));
  });
  filters.appendChild(statusFilters);

  const batchBar = el('div', { className: 'admin-batch-bar', style: { display: 'none' } });
  const batchCount = el('span', { className: 'admin-batch-count' });
  const batchApprove = el('button', { className: 'admin-action-btn success', style: { display: 'none' }, onClick: async () => {
    const checked = [...document.querySelectorAll('.admin-tx-checkbox:checked')].map(cb => cb.value);
    if (checked.length === 0) return;
    batchApprove.disabled = true; batchReject.disabled = true;
    batchApprove.innerHTML = '<div class="spinner spinner-sm"></div>';
    try { const r = await Store.adminBatchUpdateTransactionStatus(checked, 'completed'); showToast(r.message || 'Approved ' + checked.length, 'success'); loadTx(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
  } }, 'Approve Selected');
  const batchReject = el('button', { className: 'admin-action-btn danger', style: { display: 'none' }, onClick: async () => {
    const checked = [...document.querySelectorAll('.admin-tx-checkbox:checked')].map(cb => cb.value);
    if (checked.length === 0) return;
    batchApprove.disabled = true; batchReject.disabled = true;
    batchReject.innerHTML = '<div class="spinner spinner-sm"></div>';
    try { const r = await Store.adminBatchUpdateTransactionStatus(checked, 'failed'); showToast(r.message || 'Rejected ' + checked.length, 'success'); loadTx(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
  } }, 'Reject Selected');
  batchBar.appendChild(batchCount);
  batchBar.appendChild(batchApprove);
  batchBar.appendChild(batchReject);
  filters.appendChild(batchBar);
  content.appendChild(filters);

  const tableContainer = el('div', { className: 'admin-table-container' });
  content.appendChild(tableContainer);
  const pagination = el('div', { className: 'admin-pagination' });
  content.appendChild(pagination);

  function updateBatchBar() {
    const checked = [...document.querySelectorAll('.admin-tx-checkbox:checked')];
    const pendingChecks = checked.filter(cb => cb.dataset.status === 'pending');
    batchBar.style.display = checked.length > 0 ? 'flex' : 'none';
    batchCount.textContent = checked.length === 1 ? '1 selected' : checked.length + ' selected';
    batchApprove.style.display = pendingChecks.length > 0 ? 'inline-flex' : 'none';
    batchReject.style.display = pendingChecks.length > 0 ? 'inline-flex' : 'none';
  }

  function loadTx() {
    tableContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner spinner-lg"></div></div>';
    Store.adminGetTransactions({ page: currentPage, limit: 15, type: filterType, status: filterStatus }).then(data => {
      tableContainer.innerHTML = '';
      if (data.transactions.length === 0) { tableContainer.appendChild(el('div', { className: 'admin-empty' }, 'No transactions found')); pagination.innerHTML = ''; batchBar.style.display = 'none'; return; }

      const table = el('div', { className: 'admin-table' });
      const headerRow = el('div', { className: 'admin-table-header admin-table-row' });
      const selectAll = el('input', { type: 'checkbox', className: 'admin-tx-checkbox-all', onInput: (e) => {
        document.querySelectorAll('.admin-tx-checkbox').forEach(cb => { cb.checked = e.target.checked; });
        updateBatchBar();
      } });
      headerRow.appendChild(el('div', { style: { flex: '0 0 36px' } }, selectAll));
      headerRow.appendChild(el('div', { style: { flex: '2' } }, 'Transaction'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'User'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Amount'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Status'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Actions'));
      table.appendChild(headerRow);

      data.transactions.forEach(tx => {
        const row = el('div', { className: 'admin-table-row' });
        const cb = el('input', { type: 'checkbox', className: 'admin-tx-checkbox', value: tx._id, dataset: { status: tx.status }, onInput: () => updateBatchBar() });
        row.appendChild(el('div', { style: { flex: '0 0 36px' } }, cb));
        row.appendChild(el('div', { className: 'admin-row-main', style: { flex: '2' } },
          el('div', { className: 'admin-row-title' }, tx.title),
          el('div', { className: 'admin-row-sub' }, tx.category + ' · ' + new Date(tx.date).toLocaleDateString())
        ));
        const userName = tx.userId ? (tx.userId.name || tx.userId.email) : 'Unknown';
        row.appendChild(el('div', { style: { flex: '1', fontSize: '13px' } }, userName));
        row.appendChild(el('div', { className: 'admin-row-amount ' + (tx.type === 'credit' ? 'text-green' : 'text-red'), style: { flex: '1' } }, (tx.type === 'credit' ? '+' : '-') + formatCurrency(tx.amount)));
        row.appendChild(el('div', { style: { flex: '1' } }, el('span', { className: 'admin-kyc-badge ' + tx.status }, tx.status)));

        const actions = el('div', { className: 'admin-row-actions', style: { flex: '1' } });
        if (tx.status === 'pending') {
          actions.appendChild(el('button', { className: 'admin-action-btn success', onClick: async (e) => {
            e.stopPropagation();
            try { await Store.adminUpdateTransactionStatus(tx._id, 'completed'); showToast('Approved', 'success'); loadTx(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
          } }, 'Approve'));
          actions.appendChild(el('button', { className: 'admin-action-btn danger', onClick: async (e) => {
            e.stopPropagation();
            try { await Store.adminUpdateTransactionStatus(tx._id, 'failed'); showToast('Rejected', 'success'); loadTx(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
          } }, 'Reject'));
        }
        row.appendChild(actions);
        table.appendChild(row);
      });
      tableContainer.appendChild(table);

      pagination.innerHTML = '';
      if (data.pages > 1) {
        if (currentPage > 1) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage--; loadTx(); } }, 'Previous'));
        pagination.appendChild(el('span', { className: 'admin-page-info' }, 'Page ' + currentPage + ' of ' + data.pages));
        if (currentPage < data.pages) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage++; loadTx(); } }, 'Next'));
      }
    }).catch(() => { tableContainer.innerHTML = '<div class="admin-empty">Failed to load transactions</div>'; });
  }

  loadTx();
  return wrapper;
}

function renderAdminCards() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Cards', '/admin/cards');

  let currentPage = 1, filterStatus = '';

  const filters = el('div', { className: 'admin-toolbar' });
  const statusFilters = el('div', { className: 'admin-filters' });
  ['all', 'active', 'frozen', 'blocked'].forEach(f => {
    statusFilters.appendChild(el('button', { className: 'admin-chip' + (f === 'all' && !filterStatus ? ' active' : ''), onClick: () => { filterStatus = f === 'all' ? '' : f; currentPage = 1; loadCards(); } }, f.charAt(0).toUpperCase() + f.slice(1)));
  });
  filters.appendChild(statusFilters);
  content.appendChild(filters);

  const tableContainer = el('div', { className: 'admin-table-container' });
  content.appendChild(tableContainer);
  const pagination = el('div', { className: 'admin-pagination' });
  content.appendChild(pagination);

  function loadCards() {
    tableContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner spinner-lg"></div></div>';
    Store.adminGetCards({ page: currentPage, limit: 15, status: filterStatus }).then(data => {
      tableContainer.innerHTML = '';
      if (data.cards.length === 0) { tableContainer.appendChild(el('div', { className: 'admin-empty' }, 'No cards found')); pagination.innerHTML = ''; return; }

      const table = el('div', { className: 'admin-table' });
      const headerRow = el('div', { className: 'admin-table-header admin-table-row' });
      headerRow.appendChild(el('div', { style: { flex: '2' } }, 'Card'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'User'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Status'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Actions'));
      table.appendChild(headerRow);

      data.cards.forEach(c => {
        const row = el('div', { className: 'admin-table-row' });
        row.appendChild(el('div', { className: 'admin-row-main', style: { flex: '2' } },
          el('div', { className: 'admin-row-title' }, '•••• ' + c.last4),
          el('div', { className: 'admin-row-sub' }, c.type + ' · ' + c.holder + ' · Exp ' + c.expiry)
        ));
        const userName = c.userId ? (c.userId.name || c.userId.email) : 'Unknown';
        row.appendChild(el('div', { style: { flex: '1', fontSize: '13px' } }, userName));
        row.appendChild(el('div', { style: { flex: '1' } }, el('span', { className: 'admin-kyc-badge ' + c.status }, c.status)));

        const actions = el('div', { className: 'admin-row-actions', style: { flex: '1' } });
        ['active', 'frozen', 'blocked'].forEach(s => {
          if (s !== c.status) {
            actions.appendChild(el('button', { className: 'admin-action-btn ' + (s === 'active' ? 'success' : s === 'frozen' ? 'warning' : 'danger'), onClick: async (e) => {
              e.stopPropagation();
              try { await Store.adminUpdateCardStatus(c._id, s); showToast('Card ' + s, 'success'); loadCards(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
            } }, s.charAt(0).toUpperCase() + s.slice(1)));
          }
        });
        row.appendChild(actions);
        table.appendChild(row);
      });
      tableContainer.appendChild(table);

      pagination.innerHTML = '';
      if (data.pages > 1) {
        if (currentPage > 1) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage--; loadCards(); } }, 'Previous'));
        pagination.appendChild(el('span', { className: 'admin-page-info' }, 'Page ' + currentPage + ' of ' + data.pages));
        if (currentPage < data.pages) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage++; loadCards(); } }, 'Next'));
      }
    }).catch(() => { tableContainer.innerHTML = '<div class="admin-empty">Failed to load cards</div>'; });
  }

  loadCards();
  return wrapper;
}

function renderAdminRates() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Rates', '/admin/rates');

  const addBtn = el('button', { className: 'btn btn-primary', style: { height: '40px', marginBottom: '16px' }, onClick: () => {
    openModal((close) => {
      const body = el('div', { className: 'modal-body' });
      body.appendChild(el('div', { className: 'modal-header' }, el('div', { className: 'modal-title' }, 'Add Rate')));
      const closeBtn = el('button', { className: 'modal-close', onClick: close });
      closeBtn.innerHTML = createIcon('x', 20);
      body.appendChild(closeBtn);

      const form = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' } });
      function mkField(input, errorText) {
        const wrap = el('div', {});
        const err = el('div', { className: 'field-error' }, errorText);
        input.addEventListener('input', () => { input.classList.remove('error'); err.classList.remove('visible'); });
        wrap.appendChild(input);
        wrap.appendChild(err);
        return wrap;
      }
      const pairInput = el('input', { type: 'text', placeholder: 'Pair (e.g. SOL/USD)', className: 'form-input' });
      const nameInput = el('input', { type: 'text', placeholder: 'Name (e.g. Solana)', className: 'form-input' });
      const buyInput = el('input', { type: 'number', placeholder: 'Buy price', className: 'form-input' });
      const sellInput = el('input', { type: 'number', placeholder: 'Sell price', className: 'form-input' });
      form.appendChild(mkField(pairInput, 'Pair is required'));
      form.appendChild(mkField(nameInput, 'Name is required'));
      form.appendChild(mkField(buyInput, 'Buy price is required'));
      form.appendChild(mkField(sellInput, 'Sell price is required'));

      const submitBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px', marginTop: '8px' }, onClick: async () => {
        let valid = true;
        [[pairInput, 'Pair is required'], [nameInput, 'Name is required'], [buyInput, 'Buy price is required'], [sellInput, 'Sell price is required']].forEach(([inp, msg]) => {
          if (!inp.value) { inp.classList.add('error'); inp.parentNode.querySelector('.field-error').classList.add('visible'); valid = false; }
        });
        if (!valid) return;
        submitBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
        submitBtn.disabled = true;
        try {
          await Store.adminCreateRate({ pair: pairInput.value.toUpperCase(), name: nameInput.value, buy: parseFloat(buyInput.value), sell: parseFloat(sellInput.value) });
          showToast('Rate created', 'success');
          close();
          loadRates();
        } catch (err) { showToast(err.message || 'Failed', 'error'); submitBtn.innerHTML = 'Create'; submitBtn.disabled = false; }
      } }, 'Create');
      form.appendChild(submitBtn);
      body.appendChild(form);
      const frag = document.createDocumentFragment(); frag.appendChild(body); return frag;
    });
  } });
  addBtn.innerHTML = createIcon('plus', 16) + ' Add Rate';
  content.appendChild(addBtn);

  const tableContainer = el('div', { className: 'admin-table-container' });
  content.appendChild(tableContainer);

  function loadRates() {
    tableContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner spinner-lg"></div></div>';
    Store.adminGetRates().then(data => {
      tableContainer.innerHTML = '';
      const table = el('div', { className: 'admin-table' });
      const headerRow = el('div', { className: 'admin-table-header admin-table-row' });
      headerRow.appendChild(el('div', { style: { flex: '2' } }, 'Pair'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Buy'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Sell'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Change'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Actions'));
      table.appendChild(headerRow);

      data.rates.forEach(r => {
        const row = el('div', { className: 'admin-table-row' });
        row.appendChild(el('div', { className: 'admin-row-main', style: { flex: '2' } },
          el('div', { className: 'admin-row-title' }, r.pair),
          el('div', { className: 'admin-row-sub' }, r.name + ' · ' + r.type)
        ));
        row.appendChild(el('div', { style: { flex: '1', fontSize: '14px' } }, '$' + r.buy.toLocaleString()));
        row.appendChild(el('div', { style: { flex: '1', fontSize: '14px' } }, '$' + r.sell.toLocaleString()));
        row.appendChild(el('div', { className: (r.change >= 0 ? 'text-green' : 'text-red'), style: { flex: '1', fontSize: '14px' } }, (r.change >= 0 ? '+' : '') + r.change + '%'));

        const actions = el('div', { className: 'admin-row-actions', style: { flex: '1' } });
        actions.appendChild(el('button', { className: 'admin-action-btn', onClick: () => {
          openModal((close) => {
            const body = el('div', { className: 'modal-body' });
            body.appendChild(el('div', { className: 'modal-header' }, el('div', { className: 'modal-title' }, 'Edit ' + r.pair)));
            const closeBtn = el('button', { className: 'modal-close', onClick: close });
            closeBtn.innerHTML = createIcon('x', 20);
            body.appendChild(closeBtn);

            const form = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' } });
            const buyInput = el('input', { type: 'number', className: 'form-input', value: r.buy, step: 'any' });
            const sellInput = el('input', { type: 'number', className: 'form-input', value: r.sell, step: 'any' });
            form.appendChild(el('label', { className: 'form-label' }, 'Buy Price'));
            form.appendChild(buyInput);
            form.appendChild(el('label', { className: 'form-label' }, 'Sell Price'));
            form.appendChild(sellInput);

            const saveBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px', marginTop: '8px' }, onClick: async () => {
              saveBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
              saveBtn.disabled = true;
              try {
                await Store.adminUpdateRate(r._id, { buy: parseFloat(buyInput.value), sell: parseFloat(sellInput.value) });
                showToast('Rate updated', 'success'); close(); loadRates();
              } catch (err) { showToast(err.message || 'Failed', 'error'); saveBtn.innerHTML = 'Save'; saveBtn.disabled = false; }
            } }, 'Save');
            form.appendChild(saveBtn);
            body.appendChild(form);
            const frag = document.createDocumentFragment(); frag.appendChild(body); return frag;
          });
        } }, 'Edit'));
        actions.appendChild(el('button', { className: 'admin-action-btn danger', onClick: async (e) => {
          e.stopPropagation();
          if (confirm('Delete ' + r.pair + '?')) {
            try { await Store.adminDeleteRate(r._id); showToast('Rate deleted', 'success'); loadRates(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
          }
        } }, 'Delete'));
        row.appendChild(actions);
        table.appendChild(row);
      });
      tableContainer.appendChild(table);
    }).catch(() => { tableContainer.innerHTML = '<div class="admin-empty">Failed to load rates</div>'; });
  }

  loadRates();
  return wrapper;
}

function renderAdminGiftCards() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Gift Cards', '/admin/giftcards');

  const addBtn = el('button', { className: 'btn btn-primary', style: { height: '40px', marginBottom: '16px' }, onClick: () => {
    openModal((close) => {
      const body = el('div', { className: 'modal-body' });
      body.appendChild(el('div', { className: 'modal-header' }, el('div', { className: 'modal-title' }, 'Add Gift Card')));
      const closeBtn = el('button', { className: 'modal-close', onClick: close });
      closeBtn.innerHTML = createIcon('x', 20);
      body.appendChild(closeBtn);

      const form = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' } });
      const brandInput = el('input', { type: 'text', placeholder: 'Brand name', className: 'form-input' });
      const denomsInput = el('input', { type: 'text', placeholder: 'Denominations (comma separated, e.g. 25,50,100)', className: 'form-input' });
      form.appendChild(brandInput);
      form.appendChild(denomsInput);

      const submitBtn = el('button', { className: 'btn btn-primary w-full', style: { height: '48px', marginTop: '8px' }, onClick: async () => {
        if (!brandInput.value || !denomsInput.value) { showToast('Fill all fields', 'error'); return; }
        submitBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
        submitBtn.disabled = true;
        try {
          await Store.adminCreateGiftCard({ brand: brandInput.value, denominations: denomsInput.value.split(',').map(d => parseInt(d.trim())).filter(Boolean) });
          showToast('Gift card created', 'success'); close(); loadGiftCards();
        } catch (err) { showToast(err.message || 'Failed', 'error'); submitBtn.innerHTML = 'Create'; submitBtn.disabled = false; }
      } }, 'Create');
      form.appendChild(submitBtn);
      body.appendChild(form);
      const frag = document.createDocumentFragment(); frag.appendChild(body); return frag;
    });
  } });
  addBtn.innerHTML = createIcon('plus', 16) + ' Add Gift Card';
  content.appendChild(addBtn);

  const grid = el('div', { className: 'admin-gc-grid' });
  content.appendChild(grid);

  function loadGiftCards() {
    grid.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner spinner-lg"></div></div>';
    Store.adminGetGiftCards().then(data => {
      grid.innerHTML = '';
      data.giftCards.forEach(gc => {
        const card = el('div', { className: 'admin-gc-card' });
        const iconWrap = el('div', { className: 'gc-icon', style: { background: gc.color + '20', color: gc.color } });
        iconWrap.innerHTML = createIcon(gc.icon, 28);
        card.appendChild(iconWrap);
        card.appendChild(el('div', { className: 'gc-brand' }, gc.brand));
        card.appendChild(el('div', { className: 'gc-denom' }, gc.denominations.join(', ')));
        card.appendChild(el('span', { className: 'admin-kyc-badge ' + (gc.isActive ? 'verified' : 'rejected') }, gc.isActive ? 'Active' : 'Inactive'));

        const actions = el('div', { className: 'admin-gc-actions' });
        actions.appendChild(el('button', { className: 'admin-action-btn', onClick: async () => {
          try { await Store.adminUpdateGiftCard(gc._id, { isActive: !gc.isActive }); showToast('Updated', 'success'); loadGiftCards(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
        } }, gc.isActive ? 'Deactivate' : 'Activate'));
        actions.appendChild(el('button', { className: 'admin-action-btn danger', onClick: async () => {
          if (confirm('Delete ' + gc.brand + '?')) {
            try { await Store.adminDeleteGiftCard(gc._id); showToast('Deleted', 'success'); loadGiftCards(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
          }
        } }, 'Delete'));
        card.appendChild(actions);
        grid.appendChild(card);
      });
    }).catch(() => { grid.innerHTML = '<div class="admin-empty">Failed to load gift cards</div>'; });
  }

  loadGiftCards();
  return wrapper;
}

function renderAdminKyc() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('KYC Review', '/admin/kyc');

  let currentPage = 1;
  const tableContainer = el('div', { className: 'admin-table-container' });
  content.appendChild(tableContainer);
  const pagination = el('div', { className: 'admin-pagination' });
  content.appendChild(pagination);

  function loadKyc() {
    tableContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner spinner-lg"></div></div>';
    Store.adminGetUsers({ page: currentPage, limit: 15, kyc: 'pending' }).then(data => {
      tableContainer.innerHTML = '';
      if (data.users.length === 0) { tableContainer.appendChild(el('div', { className: 'admin-empty' }, 'No pending KYC submissions')); pagination.innerHTML = ''; return; }

      const table = el('div', { className: 'admin-table' });
      const headerRow = el('div', { className: 'admin-table-header admin-table-row' });
      headerRow.appendChild(el('div', { style: { flex: '2' } }, 'User'));
      headerRow.appendChild(el('div', { style: { flex: '1' } }, 'Submitted'));
      headerRow.appendChild(el('div', { style: { flex: '2' } }, 'Actions'));
      table.appendChild(headerRow);

      data.users.forEach(u => {
        const row = el('div', { className: 'admin-table-row' });
        const userCell = el('div', { className: 'admin-row-main', style: { flex: '2', cursor: 'pointer' }, onClick: () => navigate('/admin/users/' + u._id) });
        userCell.appendChild(el('div', { className: 'admin-row-title' }, u.name));
        userCell.appendChild(el('div', { className: 'admin-row-sub' }, '@' + u.username + ' · ' + u.email));
        row.appendChild(userCell);

        const submitted = u.kycDocuments && u.kycDocuments.length > 0 ? new Date(u.kycDocuments[u.kycDocuments.length - 1].submittedAt).toLocaleDateString() : 'N/A';
        row.appendChild(el('div', { style: { flex: '1', fontSize: '13px' } }, submitted));

        const actions = el('div', { className: 'admin-row-actions', style: { flex: '2' } });
        actions.appendChild(el('button', { className: 'admin-action-btn success', onClick: async (e) => {
          e.stopPropagation();
          try { await Store.adminReviewKyc(u._id, 'approve'); showToast('KYC approved', 'success'); loadKyc(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
        } }, 'Approve'));
        actions.appendChild(el('button', { className: 'admin-action-btn danger', onClick: async (e) => {
          e.stopPropagation();
          const reason = prompt('Rejection reason:');
          if (reason !== null) {
            try { await Store.adminReviewKyc(u._id, 'reject', reason); showToast('KYC rejected', 'success'); loadKyc(); } catch (err) { showToast(err.message || 'Failed', 'error'); }
          }
        } }, 'Reject'));
        actions.appendChild(el('button', { className: 'admin-action-btn', onClick: () => navigate('/admin/users/' + u._id) }, 'View'));
        row.appendChild(actions);
        table.appendChild(row);
      });
      tableContainer.appendChild(table);

      pagination.innerHTML = '';
      if (data.pages > 1) {
        if (currentPage > 1) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage--; loadKyc(); } }, 'Previous'));
        pagination.appendChild(el('span', { className: 'admin-page-info' }, 'Page ' + currentPage + ' of ' + data.pages));
        if (currentPage < data.pages) pagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { currentPage++; loadKyc(); } }, 'Next'));
      }
    }).catch(() => { tableContainer.innerHTML = '<div class="admin-empty">Failed to load KYC data</div>'; });
  }

  loadKyc();
  return wrapper;
}

function renderAdminNotifications() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Notifications', '/admin/notifications');

  const sendSection = el('div', { className: 'admin-section' });
  sendSection.appendChild(el('div', { className: 'admin-section-title' }, 'Send Notification'));

  const form = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
  const titleInput = el('input', { type: 'text', placeholder: 'Title', className: 'form-input' });
  const titleErr = el('div', { className: 'field-error' }, 'Title is required');
  titleInput.addEventListener('input', () => { titleInput.classList.remove('error'); titleErr.classList.remove('visible'); });
  const msgInput = el('textarea', { placeholder: 'Message', className: 'form-input', rows: '3' });
  const msgErr = el('div', { className: 'field-error' }, 'Message is required');
  msgInput.addEventListener('input', () => { msgInput.classList.remove('error'); msgErr.classList.remove('visible'); });
  const scopeSelect = el('select', { className: 'form-input' });
  scopeSelect.appendChild(el('option', { value: 'all' }, 'All Users'));

  Store.adminGetUsers({ limit: 100 }).then(data => {
    data.users.forEach(u => {
      const opt = el('option', { value: u._id }, u.name + ' (' + u.username + ')');
      scopeSelect.appendChild(opt);
    });
  }).catch(() => {});

  form.appendChild(titleInput);
  form.appendChild(titleErr);
  form.appendChild(msgInput);
  form.appendChild(msgErr);
  form.appendChild(scopeSelect);

  const sendBtn = el('button', { className: 'btn btn-primary', style: { height: '48px', marginTop: '8px' }, onClick: async () => {
    let valid = true;
    if (!titleInput.value) { titleInput.classList.add('error'); titleErr.classList.add('visible'); valid = false; }
    if (!msgInput.value) { msgInput.classList.add('error'); msgErr.classList.add('visible'); valid = false; }
    if (!valid) return;
    sendBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
    sendBtn.disabled = true;
    try {
      const target = scopeSelect.value === 'all' ? {} : { userId: scopeSelect.value };
      await Store.adminSendNotification({ ...target, title: titleInput.value, message: msgInput.value, type: 'system' });
      showToast('Notification sent', 'success');
      titleInput.value = '';
      msgInput.value = '';
      loadNotifications();
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
    sendBtn.innerHTML = 'Send Notification';
    sendBtn.disabled = false;
  } }, 'Send Notification');
  form.appendChild(sendBtn);
  sendSection.appendChild(form);
  content.appendChild(sendSection);

  const historySection = el('div', { className: 'admin-section' });
  historySection.appendChild(el('div', { className: 'admin-section-title' }, 'Notification History'));
  const historyContainer = el('div', {});
  historySection.appendChild(historyContainer);
  const notifPagination = el('div', { className: 'admin-pagination' });
  historySection.appendChild(notifPagination);
  content.appendChild(historySection);

  let notifPage = 1;

  function loadNotifications() {
    historyContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:20px"><div class="spinner"></div></div>';
    Store.adminGetNotifications({ page: notifPage, limit: 20 }).then(data => {
      historyContainer.innerHTML = '';
      data.notifications.forEach(n => {
        const row = el('div', { className: 'admin-table-row' });
        row.appendChild(el('div', { className: 'admin-row-main' },
          el('div', { className: 'admin-row-title' }, n.title),
          el('div', { className: 'admin-row-sub' }, (n.userId ? n.userId.name || n.userId.email : 'All') + ' · ' + new Date(n.createdAt).toLocaleDateString())
        ));
        row.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, n.message));
        historyContainer.appendChild(row);
      });
      if (data.notifications.length === 0) historyContainer.appendChild(el('div', { className: 'admin-empty' }, 'No notifications sent yet'));
      notifPagination.innerHTML = '';
      if (data.pages > 1) {
        if (notifPage > 1) notifPagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { notifPage--; loadNotifications(); } }, 'Previous'));
        notifPagination.appendChild(el('span', { className: 'admin-page-info' }, 'Page ' + notifPage + ' of ' + data.pages));
        if (notifPage < data.pages) notifPagination.appendChild(el('button', { className: 'admin-page-btn', onClick: () => { notifPage++; loadNotifications(); } }, 'Next'));
      }
    }).catch(() => { historyContainer.innerHTML = '<div class="admin-empty">Failed to load</div>'; });
  }

  loadNotifications();
  return wrapper;
}

function renderAdminDeposits() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Deposit Claims', '/admin/deposits');

  const filterBar = el('div', { className: 'admin-filter-bar' });
  const filterSelect = el('select', { className: 'form-input', style: { width: '200px' } });
  ['all', 'pending', 'confirmed', 'rejected'].forEach(s => {
    filterSelect.appendChild(el('option', { value: s }, s.charAt(0).toUpperCase() + s.slice(1)));
  });
  filterSelect.addEventListener('change', loadClaims);
  filterBar.appendChild(el('div', { style: { fontSize: '13px', color: 'var(--text-secondary)' } }, 'Status:'));
  filterBar.appendChild(filterSelect);
  content.appendChild(filterBar);

  const container = el('div', {});
  content.appendChild(container);

  function loadClaims() {
    const status = filterSelect.value === 'all' ? '' : filterSelect.value;
    container.innerHTML = '<div style="display:flex;justify-content:center;padding:40px"><div class="spinner"></div></div>';
    Store.adminGetDepositClaims(status).then(data => {
      container.innerHTML = '';
      if (!data.claims || data.claims.length === 0) {
        container.appendChild(el('div', { className: 'admin-empty' }, 'No deposit claims found'));
        return;
      }
      data.claims.forEach(claim => {
        const user = claim.userId || {};
        const row = el('div', { className: 'admin-table-row' });
        const main = el('div', { className: 'admin-row-main' });
        const titleRow = el('div', { className: 'admin-row-title' }, (user.name || user.email || 'Unknown') + ' — ' + formatCurrency(claim.amount));
        main.appendChild(titleRow);
        const subRow = el('div', { className: 'admin-row-sub' }, new Date(claim.createdAt).toLocaleString() + ' · ' + claim.address.slice(0, 16) + '...');
        if (claim.txHash) subRow.textContent += ' · Tx: ' + claim.txHash.slice(0, 12) + '...';
        main.appendChild(subRow);
        row.appendChild(main);

        const statusBadge = el('span', { className: 'admin-badge', style: {
          background: claim.status === 'pending' ? 'var(--warning)' : claim.status === 'confirmed' ? 'var(--success)' : 'var(--danger)',
          color: '#000',
          marginRight: '12px'
        } }, claim.status);
        row.appendChild(statusBadge);

        if (claim.status === 'pending') {
          const actions = el('div', { className: 'admin-row-actions' });
          const confirmBtn = el('button', { className: 'btn btn-success btn-sm', style: { marginRight: '8px' }, onClick: async () => {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
            try {
              await Store.adminReviewDepositClaim(claim._id, 'confirmed', '');
              showToast('Deposit confirmed for ' + formatCurrency(claim.amount), 'success');
              loadClaims();
            } catch (err) { showToast(err.message || 'Failed', 'error'); confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm'; }
          } }, 'Confirm');
          actions.appendChild(confirmBtn);
          const rejectBtn = el('button', { className: 'btn btn-danger btn-sm', onClick: async () => {
            rejectBtn.disabled = true;
            rejectBtn.innerHTML = '<div class="spinner spinner-sm"></div>';
            try {
              await Store.adminReviewDepositClaim(claim._id, 'rejected', '');
              showToast('Deposit claim rejected', 'success');
              loadClaims();
            } catch (err) { showToast(err.message || 'Failed', 'error'); rejectBtn.disabled = false; rejectBtn.textContent = 'Reject'; }
          } }, 'Reject');
          actions.appendChild(rejectBtn);
          row.appendChild(actions);
        }

        container.appendChild(row);
      });
    }).catch(() => { container.innerHTML = '<div class="admin-empty">Failed to load deposit claims</div>'; });
  }

  loadClaims();
  return wrapper;
}

function renderAdminChat() {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Live Chat', '/admin/chat');

  const toolbar = el('div', { className: 'admin-toolbar' });
  const filterAll = el('button', { className: 'admin-chip active', onClick: () => { activeFilter = ''; loadConversations(); updateFilterUI(); } }, 'All');
  const filterOpen = el('button', { className: 'admin-chip', onClick: () => { activeFilter = 'open'; loadConversations(); updateFilterUI(); } }, 'Open');
  const filterClosed = el('button', { className: 'admin-chip', onClick: () => { activeFilter = 'closed'; loadConversations(); updateFilterUI(); } }, 'Closed');
  toolbar.appendChild(filterAll);
  toolbar.appendChild(filterOpen);
  toolbar.appendChild(filterClosed);
  content.appendChild(toolbar);

  let activeFilter = '';
  function updateFilterUI() {
    [filterAll, filterOpen, filterClosed].forEach(btn => btn.classList.remove('active'));
    if (activeFilter === '') filterAll.classList.add('active');
    else if (activeFilter === 'open') filterOpen.classList.add('active');
    else filterClosed.classList.add('active');
  }

  const container = el('div', { className: 'admin-table-container' });
  content.appendChild(container);

  ChatService.connect();

  function loadConversations() {
    container.innerHTML = '<div class="admin-empty">Loading conversations...</div>';
    Store.adminChatGetAllConversations(activeFilter).then(data => {
      container.innerHTML = '';
      const conversations = data.conversations || [];
      if (conversations.length === 0) {
        container.appendChild(el('div', { className: 'admin-empty' }, 'No conversations found'));
        return;
      }
      conversations.forEach(conv => {
        const userName = conv.userId ? (conv.userId.name || conv.userId.email) : 'Unknown';
        const userEmail = conv.userId ? conv.userId.email : '';
        const lastMsg = conv.lastMessage || 'No messages';
        const timeAgo = getTimeAgo(conv.lastMessageAt);
        const isOpen = conv.status === 'open';

        const row = el('div', { className: 'admin-table-row', role: 'button', onClick: () => navigate('/admin/chat/' + conv._id) });

        const avatarDiv = el('div', { className: 'admin-row-icon', style: { background: isOpen ? '#10B98120' : '#6B728020', color: isOpen ? '#10B981' : '#6B7280' } });
        avatarDiv.innerHTML = createIcon('chat-dots', 16);
        row.appendChild(avatarDiv);

        const mainDiv = el('div', { className: 'admin-row-main' });
        const titleRow = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
        titleRow.appendChild(el('div', { className: 'admin-row-title' }, userName));
        const statusBadge = el('span', { className: 'admin-kyc-badge ' + (isOpen ? 'active' : 'none') }, isOpen ? 'Open' : 'Closed');
        titleRow.appendChild(statusBadge);
        mainDiv.appendChild(titleRow);
        const subRow = el('div', { className: 'admin-row-sub' }, lastMsg.length > 60 ? lastMsg.substring(0, 60) + '...' : lastMsg);
        mainDiv.appendChild(subRow);
        if (userEmail) {
          mainDiv.appendChild(el('div', { className: 'admin-row-sub', style: { fontSize: '10px' } }, userEmail));
        }
        row.appendChild(mainDiv);

        const timeDiv = el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: '0' } }, timeAgo);
        row.appendChild(timeDiv);

        container.appendChild(row);
      });
    }).catch(() => {
      container.innerHTML = '<div class="admin-empty">Failed to load conversations</div>';
    });
  }

  loadConversations();
  return wrapper;
}

function renderAdminChatConversation(id) {
  if (!adminGuard()) { const d = el('div', { style: { display: 'flex', justifyContent: 'center', padding: '60px 0' } }); d.innerHTML = '<div class="spinner spinner-lg"></div>'; return d; }
  const { wrapper, content } = adminPageLayout('Chat', '/admin/chat');
  content.style.padding = '0';
  content.style.maxWidth = '100%';

  const chatView = el('div', { className: 'admin-chat-view' });

  const chatHeader = el('div', { className: 'admin-chat-header' });
  const backBtn = el('button', { className: 'admin-icon-btn', onClick: () => navigate('/admin/chat') });
  backBtn.innerHTML = createIcon('arrow_left', 18);
  chatHeader.appendChild(backBtn);

  const userInfo = el('div', { style: { flex: '1' } });
  const userNameEl = el('div', { className: 'admin-chat-user-name' }, 'Loading...');
  const userStatusEl = el('div', { className: 'admin-chat-user-status' }, '');
  userInfo.appendChild(userNameEl);
  userInfo.appendChild(userStatusEl);
  chatHeader.appendChild(userInfo);

  const closeBtn = el('button', { className: 'admin-chat-close-btn', onClick: async () => {
    if (!confirm('End this conversation?')) return;
    try {
      await Store.adminChatClose(id);
      showToast('Conversation ended', 'success');
      userStatusEl.textContent = 'Closed';
      closeBtn.style.display = 'none';
      chatInput.disabled = true;
      sendBtn.style.opacity = '0.5';
      sendBtn.style.pointerEvents = 'none';
    } catch (err) {
      showToast(err.message || 'Failed to close', 'error');
    }
  } }, 'End Chat');
  chatHeader.appendChild(closeBtn);
  chatView.appendChild(chatHeader);

  const messagesContainer = el('div', { className: 'admin-chat-messages' });
  chatView.appendChild(messagesContainer);

  const typingBar = el('div', { className: 'admin-chat-typing-bar', style: { display: 'none', padding: '4px 20px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' } });
  typingBar.textContent = 'User is typing...';
  chatView.appendChild(typingBar);

  const inputArea = el('div', { className: 'admin-chat-input-area' });
  const chatInput = el('textarea', { className: 'admin-chat-input', placeholder: 'Type your reply...', rows: '1' });
  inputArea.appendChild(chatInput);
  const sendBtn = el('button', { className: 'admin-chat-send-btn', onClick: doSend });
  sendBtn.innerHTML = createIcon('paper-plane', 18);
  inputArea.appendChild(sendBtn);
  chatView.appendChild(inputArea);

  content.appendChild(chatView);

  let adminTypingTimer = null;
  let conversationUserId = null;

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });

  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';

    if (conversationUserId) {
      ChatService.sendTyping(id, conversationUserId);
      clearTimeout(adminTypingTimer);
      adminTypingTimer = setTimeout(() => {
        ChatService.sendStopTyping(id, conversationUserId);
      }, 2000);
    }
  });

  function doSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    chatInput.style.height = 'auto';

    const optimistic = { _id: 'temp_' + Date.now(), senderRole: 'admin', text, createdAt: new Date().toISOString() };
    renderMessage(optimistic);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    Store.adminChatSendMessage(id, text).catch(() => {
      showToast('Failed to send message', 'error');
    });
  }

  function renderMessage(msg) {
    const isAdmin = msg.senderRole === 'admin';
    const row = el('div', { className: 'admin-chat-bubble-row ' + (isAdmin ? 'admin' : 'user') });
    if (!isAdmin) {
      const avatar = el('div', { className: 'admin-chat-bubble-avatar' }, 'U');
      row.appendChild(avatar);
    }
    const bubble = el('div', { className: 'admin-chat-bubble ' + (isAdmin ? 'admin' : 'user') }, msg.text);
    row.appendChild(bubble);
    messagesContainer.appendChild(row);
  }

  function onNewMsg(data) {
    if (data.conversationId === id && data.message.senderRole === 'user') {
      renderMessage(data.message);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function onClosed(data) {
    if (data.conversationId === id) {
      userStatusEl.textContent = 'Closed';
      closeBtn.style.display = 'none';
      chatInput.disabled = true;
      sendBtn.style.opacity = '0.5';
      sendBtn.style.pointerEvents = 'none';
    }
  }

  function onTyping(data) {
    if (String(data.conversationId) === String(id)) {
      typingBar.style.display = 'block';
    }
  }

  function onStopTyping(data) {
    if (String(data.conversationId) === String(id)) {
      typingBar.style.display = 'none';
    }
  }

  ChatService.on('new_message', onNewMsg);
  ChatService.on('closed', onClosed);
  ChatService.on('typing', onTyping);
  ChatService.on('stop_typing', onStopTyping);
  ChatService.connect();

  Store.adminChatGetConversationMessages(id).then(data => {
    const conv = data.conversation;
    if (conv) {
      userNameEl.textContent = conv.userId ? (conv.userId.name || conv.userId.email) : 'Unknown';
      if (conv.userId && conv.userId._id) {
        conversationUserId = conv.userId._id;
      }
      if (conv.status === 'closed') {
        userStatusEl.textContent = 'Closed';
        closeBtn.style.display = 'none';
        chatInput.disabled = true;
        sendBtn.style.opacity = '0.5';
        sendBtn.style.pointerEvents = 'none';
      } else {
        userStatusEl.textContent = 'Online';
        userStatusEl.style.color = '#10B981';
      }
    }
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach(msg => renderMessage(msg));
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      messagesContainer.appendChild(el('div', { className: 'admin-empty', style: { padding: '40px' } }, 'No messages yet'));
    }
    ChatService.joinConversation(id);
  }).catch(() => {
    userNameEl.textContent = 'Failed to load conversation';
  });

  return wrapper;
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
