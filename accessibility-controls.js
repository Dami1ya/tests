(function () {
  const STORAGE_KEY = 'accessibilityPrefs';
  const defaultPrefs = {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
  };

  const fontOptions = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' }
  ];

  const loadPrefs = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        fontFamily: parsed.fontFamily || defaultPrefs.fontFamily,
        fontSize: Number(parsed.fontSize) || defaultPrefs.fontSize,
      };
    } catch {
      return { ...defaultPrefs };
    }
  };

  const savePrefs = (prefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  };

  const applyPrefs = (prefs) => {
    document.body.style.fontFamily = prefs.fontFamily;
    document.documentElement.style.fontSize = `${prefs.fontSize}px`;
  };

  const createToolbar = (prefs) => {
    const toolbar = document.createElement('div');
    toolbar.className = 'accessibility-toolbar';
    toolbar.setAttribute('role', 'dialog');
    toolbar.setAttribute('aria-label', 'Accessibility controls');

    const fontLabel = document.createElement('label');
    fontLabel.textContent = 'Font';

    const fontSelect = document.createElement('select');
    fontOptions.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      fontSelect.appendChild(opt);
    });
    fontSelect.value = prefs.fontFamily;

    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Size';

    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '14';
    sizeInput.max = '26';
    sizeInput.step = '1';
    sizeInput.value = String(prefs.fontSize);

    const sizeValue = document.createElement('span');
    sizeValue.className = 'size-value';
    sizeValue.textContent = `${prefs.fontSize}px`;

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';

    fontSelect.addEventListener('change', () => {
      const next = { ...prefs, fontFamily: fontSelect.value };
      prefs = next;
      applyPrefs(next);
      savePrefs(next);
    });

    sizeInput.addEventListener('input', () => {
      const nextSize = Number(sizeInput.value);
      sizeValue.textContent = `${nextSize}px`;
      const next = { ...prefs, fontSize: nextSize };
      prefs = next;
      applyPrefs(next);
      savePrefs(next);
    });

    resetBtn.addEventListener('click', () => {
      prefs = { ...defaultPrefs };
      fontSelect.value = prefs.fontFamily;
      sizeInput.value = String(prefs.fontSize);
      sizeValue.textContent = `${prefs.fontSize}px`;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    toolbar.append(fontLabel, fontSelect, sizeLabel, sizeInput, sizeValue, resetBtn);
    return toolbar;
  };

  const createTrigger = () => {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'accessibility-trigger';
    trigger.textContent = 'Aa';
    trigger.setAttribute('aria-label', 'Open font and size controls');
    return trigger;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const prefs = loadPrefs();
    applyPrefs(prefs);

    const trigger = createTrigger();
    const toolbar = createToolbar(prefs);

    trigger.addEventListener('click', () => {
      const isOpen = toolbar.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      const clickInsideToolbar = toolbar.contains(event.target);
      const clickOnTrigger = trigger.contains(event.target);

      if (!clickInsideToolbar && !clickOnTrigger) {
        toolbar.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.body.append(trigger, toolbar);
  });
})();
