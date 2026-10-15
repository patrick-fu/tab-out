(() => {
  const themes = ['system', 'light', 'dark'];

  function applyTheme(value) {
    const theme = themes.includes(value) ? value : 'system';
    document.documentElement.dataset.theme = theme;
    const select = document.getElementById('themeSelect');
    if (select) select.value = theme;
  }

  // Run before the stylesheet loads so a saved dark theme never flashes light.
  try {
    applyTheme(localStorage.getItem('theme'));
  } catch {
    applyTheme('system');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('themeSelect');
    select.value = document.documentElement.dataset.theme;
    select.addEventListener('change', () => {
      applyTheme(select.value);
      try {
        localStorage.setItem('theme', select.value);
      } catch (err) {
        console.error('[tab-out] Failed to persist theme:', err);
      }
    });
  });

  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && (event.key === 'theme' || event.key === null)) {
      applyTheme(event.newValue);
    }
  });
})();
