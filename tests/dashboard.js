'use strict';

const frame = document.querySelector('iframe');
const results = document.getElementById('results');
const originalTheme = localStorage.getItem('theme');
let tabs;
let storage;
let failures = 0;
const source = fetch('../extension/index.html').then(response => response.text());

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function until(predicate, message) {
  const deadline = performance.now() + 4000;
  while (!predicate()) {
    if (performance.now() > deadline) throw new Error(message);
    await new Promise(resolve => setTimeout(resolve, 25));
  }
}

async function check(name, run) {
  const item = document.createElement('li');
  results.append(item);
  try {
    await run();
    item.textContent = `PASS: ${name}`;
  } catch (error) {
    failures++;
    item.textContent = `FAIL: ${name}: ${error.message}`;
    console.error(error);
  }
}

function fixture(domain, count, start) {
  return Array.from({ length: count }, (_, index) => ({
    id: start + index,
    windowId: 1,
    url: `https://${domain}/${index}`,
    title: `${domain} page ${index}`,
  }));
}

async function loadDashboard() {
  const loaded = new Promise(resolve => frame.onload = resolve);
  const html = await source;
  frame.srcdoc = html.replace('<head>', `<head><base href="${new URL('../extension/', location.href)}">
    <script>
      window.chrome = parent.fixtureChrome;
      window.requestAnimationFrame = () => 0;
    <\/script>`).replace('<script src="config.local.js" onerror="/* no personal config, that\'s fine */"></script>', '');
  await loaded;
  await until(() => frame.contentDocument.querySelector('.mission-card'), 'Dashboard did not render');
  // Wait for the dashboard's entrance animation before comparing geometry.
  await Promise.all(frame.contentDocument.getAnimations().map(animation => animation.finished));
}

window.fixtureChrome = {
  runtime: { id: 'fixture' },
  tabs: {
    query: async () => structuredClone(tabs),
    remove: async ids => {
      const removed = new Set(Array.isArray(ids) ? ids : [ids]);
      tabs = tabs.filter(tab => !removed.has(tab.id));
    },
  },
  storage: {
    local: {
      get: async key => structuredClone({ [key]: storage[key] }),
      set: async values => Object.assign(storage, structuredClone(values)),
    },
  },
};

function names() {
  return Array.from(frame.contentDocument.querySelectorAll('.mission-name'), element => element.textContent);
}

function chooseTheme(theme) {
  const select = frame.contentDocument.getElementById('themeSelect');
  assert(select, 'Theme selector missing');
  select.value = theme;
  select.dispatchEvent(new frame.contentWindow.Event('change', { bubbles: true }));
}

function background() {
  return frame.contentWindow.getComputedStyle(frame.contentDocument.body).backgroundColor;
}

(async () => {
  try {
    localStorage.removeItem('theme');
    storage = { deferred: [{ id: 'saved', url: 'https://saved.example/', title: 'Saved page', savedAt: new Date().toISOString() }] };
    tabs = [
      ...fixture('alpha.example', 8, 100),
      ...fixture('beta.example', 7, 200),
      ...fixture('gamma.example', 6, 300),
      ...fixture('delta.example', 5, 400),
      ...fixture('epsilon.example', 4, 500),
      ...fixture('zeta.example', 3, 600),
    ];
    await loadDashboard();

    await check('Closing a tab keeps other cards in their columns', async () => {
      const cards = [...frame.contentDocument.querySelectorAll('.mission-card')];
      const before = cards.map(card => card.getBoundingClientRect().x);
      cards[0].querySelector('[data-action="close-single-tab"]').click();
      await until(() => cards[0].querySelectorAll('.page-chip').length === 7, 'Tab row was not removed');
      assert(tabs.length === 32, 'Close action did not remove exactly one tab');
      assert(cards.every((card, index) => Math.abs(card.getBoundingClientRect().x - before[index]) < 1), 'A surviving card moved to another column');
    });

    await check('Group order survives count changes and a page reload', async () => {
      const before = names().join('|');
      tabs = tabs.filter(tab => !tab.url.includes('alpha.example') || tab.id === 101);
      await loadDashboard();
      assert(names().join('|') === before, 'Existing groups were reordered by their tab counts');
    });

    await check('New groups append; removed groups disappear without reordering survivors', async () => {
      tabs = tabs.filter(tab => !tab.url.includes('beta.example'));
      tabs.push(...fixture('new.example', 10, 700));
      await loadDashboard();
      assert(names().join('|') === 'Alpha Example|Gamma Example|Delta Example|Epsilon Example|Zeta Example|New Example', 'Unexpected group order');
      assert(!storage.groupOrder.includes('beta.example'), 'Removed group was retained in storage');
    });

    await check('Light and dark themes change colors and persist across reloads', async () => {
      chooseTheme('light');
      const light = background();
      chooseTheme('dark');
      const dark = background();
      assert(light !== dark, 'Theme did not change the rendered background');
      assert(frame.contentWindow.getComputedStyle(frame.contentDocument.documentElement).colorScheme === 'dark', 'Native controls are not dark');
      await loadDashboard();
      assert(background() === dark, 'Dark theme was not restored');
      assert(frame.contentDocument.getElementById('themeSelect').value === 'dark', 'Selector did not restore saved choice');
    });

    await check('System mode follows the OS and synchronizes changes between pages', async () => {
      chooseTheme('system');
      const style = frame.contentWindow.getComputedStyle(frame.contentDocument.documentElement);
      assert(style.colorScheme === 'light dark', 'System mode forces a fixed scheme');
      const systemDark = frame.contentWindow.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemColor = background();
      chooseTheme(systemDark ? 'dark' : 'light');
      assert(background() === systemColor, 'System preference did not select the matching palette');
      localStorage.setItem('theme', systemDark ? 'light' : 'dark');
      await until(() => frame.contentDocument.getElementById('themeSelect').value === (systemDark ? 'light' : 'dark'), 'Theme change from another page did not synchronize');
      localStorage.removeItem('theme');
      await until(() => frame.contentDocument.getElementById('themeSelect').value === 'system', 'Cleared preference did not restore system mode');
    });

    await check('Dashboard and saved sidebar fit narrow and wide viewports', async () => {
      for (const width of [360, 640, 1100]) {
        frame.width = width;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const doc = frame.contentDocument;
        assert(doc.documentElement.scrollWidth <= width, `Horizontal overflow at ${width}px`);
        assert(doc.getElementById('deferredColumn').getBoundingClientRect().width > 0, 'Saved sidebar disappeared');
      }
    });
    document.title = `${failures ? 'FAIL' : 'PASS'} — Tab Out regression checks`;
  } finally {
    if (originalTheme === null) localStorage.removeItem('theme');
    else localStorage.setItem('theme', originalTheme);
  }
})();
