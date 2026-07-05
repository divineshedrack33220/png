function animateBalance(element, target, duration = 1000) {
  if (!element) return;
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * easeOut;
    element.textContent = formatCurrency(current);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatCurrency(target);
    }
  }
  requestAnimationFrame(update);
}

function animateCounter(element, target, duration = 800) {
  if (!element) return;
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * easeOut;
    element.textContent = formatCurrency(current);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatCurrency(target);
    }
  }
  requestAnimationFrame(update);
}

function createTiltEffect(element, options = { max: 15, perspective: 1000 }) {
  if (!element) return;

  let isMobile = 'ontouchstart' in window;

  const handleMove = (x, y) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (x - centerX) / (rect.width / 2);
    const deltaY = (y - centerY) / (rect.height / 2);
    const rotateY = deltaX * options.max;
    const rotateX = -deltaY * options.max;
    element.style.transform = `perspective(${options.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleLeave = () => {
    element.style.transform = `perspective(${options.perspective}px) rotateX(0deg) rotateY(0deg)`;
  };

  if (isMobile) {
    const onTouch = (e) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    element.addEventListener('touchmove', onTouch, { passive: true });
    element.addEventListener('touchend', handleLeave);
  } else {
    element.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    element.addEventListener('mouseleave', handleLeave);
  }
}

function pullToRefresh(element, onRefresh) {
  if (!element) return;
  let startY = 0;
  let pulling = false;
  let pullDist = 0;
  const threshold = 60;

  const pullIndicator = document.createElement('div');
  pullIndicator.className = 'pull-to-refresh';
  pullIndicator.innerHTML = '<div class="spinner" style="opacity:0"></div>';
  element.insertBefore(pullIndicator, element.firstChild);

  element.addEventListener('touchstart', (e) => {
    if (element.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  element.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const y = e.touches[0].clientY;
    pullDist = Math.max(0, y - startY);
    if (pullDist > 0) {
      const spinner = pullIndicator.querySelector('.spinner');
      if (spinner) {
        spinner.style.opacity = Math.min(1, pullDist / threshold);
        spinner.style.transform = `rotate(${pullDist * 3}deg)`;
      }
    }
  }, { passive: true });

  element.addEventListener('touchend', () => {
    if (pulling && pullDist >= threshold) {
      const spinner = pullIndicator.querySelector('.spinner');
      if (spinner) spinner.style.opacity = '1';
      pullIndicator.style.height = '60px';
      if (onRefresh) onRefresh().then(() => {
        pullIndicator.style.height = '0';
      });
    } else {
      pullIndicator.style.height = '0';
    }
    pulling = false;
    pullDist = 0;
  }, { passive: true });
}

function shimmerOn(element) {
  if (!element) return;
  element.classList.add('skeleton');
}

function shimmerOff(element) {
  if (!element) return;
  element.classList.remove('skeleton');
}