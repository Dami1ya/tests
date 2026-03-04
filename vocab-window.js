(function () {
  const PREFIX = 'vocabWindowPos:';
  const COLLAPSE_PREFIX = 'vocabWindowCollapsed:';

  const makeDraggable = (windowEl) => {
    const handle = windowEl.querySelector('.vocab-header');
    const list = windowEl.querySelector('.vocab-list');
    if (!handle) return;

    const id = windowEl.dataset.windowId || 'default';
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const saved = localStorage.getItem(PREFIX + id);
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        windowEl.style.left = pos.left;
        windowEl.style.top = pos.top;
        windowEl.style.right = 'auto';
        windowEl.style.bottom = 'auto';
      } catch {
      }
    }

    const savedCollapsed = localStorage.getItem(COLLAPSE_PREFIX + id) === 'true';

    const titleText = handle.textContent || 'Vocabulary';
    handle.textContent = '';

    const title = document.createElement('span');
    title.className = 'vocab-title';
    title.textContent = titleText;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'vocab-toggle';
    toggleBtn.setAttribute('aria-label', 'Minimize vocabulary window');

    const setCollapsed = (collapsed) => {
      windowEl.classList.toggle('minimized', collapsed);
      toggleBtn.textContent = collapsed ? '+' : '−';
      toggleBtn.setAttribute('aria-label', collapsed ? 'Expand vocabulary window' : 'Minimize vocabulary window');
      localStorage.setItem(COLLAPSE_PREFIX + id, String(collapsed));
      if (list) {
        list.setAttribute('aria-hidden', String(collapsed));
      }
    };

    toggleBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const collapsedNow = windowEl.classList.contains('minimized');
      setCollapsed(!collapsedNow);
    });

    handle.append(title, toggleBtn);
    setCollapsed(savedCollapsed);

    const onMove = (clientX, clientY) => {
      const dx = clientX - startX;
      const dy = clientY - startY;
      windowEl.style.left = `${startLeft + dx}px`;
      windowEl.style.top = `${startTop + dy}px`;
      windowEl.style.right = 'auto';
      windowEl.style.bottom = 'auto';
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = '';
      localStorage.setItem(PREFIX + id, JSON.stringify({
        left: windowEl.style.left,
        top: windowEl.style.top,
      }));
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
    };

    const mouseMove = (event) => {
      if (!isDragging) return;
      onMove(event.clientX, event.clientY);
    };

    const mouseUp = () => endDrag();

    const touchMove = (event) => {
      if (!isDragging || !event.touches[0]) return;
      onMove(event.touches[0].clientX, event.touches[0].clientY);
    };

    const touchEnd = () => endDrag();

    const startDrag = (clientX, clientY) => {
      isDragging = true;
      startX = clientX;
      startY = clientY;
      const rect = windowEl.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      document.body.style.userSelect = 'none';
    };

    handle.addEventListener('mousedown', (event) => {
      if (event.target === toggleBtn) {
        return;
      }
      startDrag(event.clientX, event.clientY);
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', mouseUp);
    });

    handle.addEventListener('touchstart', (event) => {
      if (event.target === toggleBtn) {
        return;
      }
      if (!event.touches[0]) return;
      startDrag(event.touches[0].clientX, event.touches[0].clientY);
      window.addEventListener('touchmove', touchMove, { passive: true });
      window.addEventListener('touchend', touchEnd);
    }, { passive: true });
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.vocab-window').forEach(makeDraggable);
  });
})();
