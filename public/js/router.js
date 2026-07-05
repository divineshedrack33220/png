let routes = {};
let currentCleanup = null;
let isTransitioning = false;

function registerRoute(path, handler) {
  routes[path] = handler;
}

function navigate(path, data = {}) {
  if (isTransitioning) return;

  const cleanPath = path.split('?')[0];
  const adminPaths = cleanPath.startsWith('/admin');
  if (cleanPath.startsWith('/') && !adminPaths && !['/splash', '/onboarding', '/auth', '/signup', '/login', '/forgot-password', '/home', '/history', '/cards', '/rates', '/profile', '/notifications', '/verification', '/send', '/receive', '/gift-cards', '/crypto-wallet', '/bill-pay', '/support', '/referral', '/swap', '/remove-account', '/personal-info', '/bank-account', '/security'].includes(cleanPath)) {
    path = '/home';
  }

  if (cleanPath === state.currentRoute) return;

  state.direction = data.direction || 'forward';
  window.location.hash = path;
}

function handleRoute() {
  if (isTransitioning) return;

  const hash = window.location.hash.slice(1) || '/splash';
  const path = hash.split('?')[0];

  if (path === state.currentRoute && state.currentRoute !== '') return;

  const app = document.getElementById('app');
  if (!app) return;

  const isAuthRoute = ['/auth', '/signup', '/login', '/forgot-password', '/splash', '/onboarding'].includes(path);
  const isAdminRoute = path.startsWith('/admin');

  showNav(!isAuthRoute && !isAdminRoute);
  const fab = document.querySelector('.fab-chat');
  if (fab) fab.style.display = path === '/home' ? 'flex' : 'none';

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;

  if (state.currentRoute && state.currentRoute !== path) {
    isTransitioning = true;
    state.previousRoute = state.currentRoute;
    state.currentRoute = path;
    app.classList.add(state.direction === 'forward' ? 'page-leave' : 'page-leave-reverse');
    setTimeout(function() {
      app.classList.remove('page-leave', 'page-leave-reverse');
      renderPage(path, app);
      app.classList.add(state.direction === 'forward' ? 'page-enter' : 'page-enter-reverse');
      setTimeout(function() {
        app.classList.remove('page-enter', 'page-enter-reverse');
        isTransitioning = false;
        app.querySelector('h1, h2, .page-header-center, [tabindex]:not([tabindex="-1"])')?.focus();
      }, 200);
    }, 80);
  } else {
    state.currentRoute = path;
    renderPage(path, app);
  }
}

function renderPage(path, app) {
  const handler = routes[path];
  if (handler) {
    executeHandler(handler, path, app);
    return;
  }
  for (const [route, fn] of Object.entries(routes)) {
    const parts = route.split('/');
    const pathParts = path.split('/');
    if (parts.length === pathParts.length) {
      let match = true;
      const params = {};
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith(':')) {
          params[parts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (parts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        state.params = params;
        executeHandler(fn, path, app);
        return;
      }
    }
  }
  navigate('/home');
}

function executeHandler(handler, path, app) {
  const isAdmin = path.startsWith('/admin');
  app.classList.toggle('admin-mode', isAdmin);
  document.body.classList.toggle('admin-body', isAdmin);
  try {
    const result = handler();
    if (typeof result === 'string') {
      app.innerHTML = result;
    } else if (result instanceof Node) {
      app.innerHTML = '';
      app.appendChild(result);
    } else if (result && typeof result.then === 'function') {
      app.innerHTML = '<div style="display:flex;justify-content:center;padding:40px;min-height:60vh;align-items:center" role="status"><div class="spinner spinner-lg"></div><span class="sr-only">Loading...</span></div>';
      result.then(function(html) {
        if (typeof html === 'string') app.innerHTML = html;
        else if (html instanceof Node) { app.innerHTML = ''; app.appendChild(html); }
      }).catch(function() {
        app.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><div class="empty-state-title">Failed to load</div><button class="btn btn-primary mt-16" onclick="navigate(window.location.hash.slice(1))">Retry</button></div>';
      });
    }
  } catch (err) {
    console.error('Page render error:', err);
    app.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><div class="empty-state-title">Something went wrong</div><div class="empty-state-sub">' + (err.message || '') + '</div><button class="btn btn-primary mt-16" onclick="navigate(window.location.hash.slice(1))">Retry</button></div>';
  }
  updateNav(path);
}

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  if (!window.location.hash) {
    window.location.hash = '#/splash';
  } else {
    handleRoute();
  }
}
