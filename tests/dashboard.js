'use strict';

const frame = document.querySelector('iframe');
const results = document.getElementById('results');
const originalTheme = localStorage.getItem('theme');
let tabs;
let storage;
let failures = 0;
let queryCount = 0;
let storageReads = 0;
let opened = [];
let activated = [];
let queryBarrier;
let releaseQuery;
let queryFailure = false;
let capturedQuery;
window.fixtureFocused = true;
window.fixtureVisible = true;
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
  const filter = new URLSearchParams(location.search).get('check');
  if (filter && !name.includes(filter)) return;
  const item = document.createElement('li');
  results.append(item);
  try {
    await run();
    item.textContent = `PASS: ${name}`;
  } catch (error) {
    failures++;
    item.textContent = `FAIL: ${name}: ${error.message}`;
    console.error(error);
  } finally {
    queryBarrier = null;
    capturedQuery = null;
    queryFailure = false;
    releaseQuery?.();
    releaseQuery = null;
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

async function loadDashboard(expectRendered = true) {
  for (const event of Object.values(window.fixtureChrome.tabs)) {
    if (event?.addListener) event.clear();
  }
  window.fixtureChrome.storage.onChanged.clear();
  const loaded = new Promise(resolve => frame.onload = resolve);
  const html = await source;
  frame.srcdoc = html.replace('<head>', `<head><base href="${new URL('../extension/', location.href)}">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'self'">
    <script src="../tests/fixture-bridge.js"><\/script>`).replace('<script src="config.local.js"></script>', '');
  await loaded;
  if (!expectRendered) return;
  await until(() => frame.contentDocument.querySelector('.mission-card'), 'Dashboard did not render');
  // Wait for the dashboard's entrance animation before comparing geometry.
  await Promise.all(frame.contentDocument.getAnimations().map(animation => animation.finished));
}

function fixtureEvent() {
  const listeners = new Set();
  return { clear: () => listeners.clear(), addListener: listener => listeners.add(listener), emit: (...args) => {
    for (const listener of listeners) listener(...args);
  } };
}

window.fixtureChrome = {
  runtime: { id: 'fixture' },
  windows: { update: async () => {} },
  tabs: {
    ...Object.fromEntries(['onCreated', 'onRemoved', 'onMoved', 'onAttached', 'onDetached', 'onReplaced', 'onUpdated'].map(name => [name, fixtureEvent()])),
    query: async () => {
      queryCount++;
      if (queryFailure) throw new Error('Simulated Chrome read failure');
      const snapshot = structuredClone(tabs);
      capturedQuery?.();
      if (queryBarrier) await queryBarrier;
      return snapshot;
    },
    get: async id => {
      const tab = tabs.find(tab => tab.id === id);
      if (!tab) throw new Error('No such tab');
      return structuredClone(tab);
    },
    update: async id => {
      if (!tabs.some(tab => tab.id === id)) throw new Error('No such tab');
      activated.push(id);
    },
    create: async options => opened.push(options.url),
    remove: async ids => {
      const removed = new Set(Array.isArray(ids) ? ids : [ids]);
      tabs = tabs.filter(tab => !removed.has(tab.id));
      for (const id of removed) window.fixtureChrome.tabs.onRemoved.emit(id, {});
    },
  },
  storage: {
    onChanged: fixtureEvent(),
    local: {
      get: async key => { storageReads++; return structuredClone({ [key]: storage[key] }); },
      set: async values => {
        Object.assign(storage, structuredClone(values));
        const changes = Object.fromEntries(Object.entries(values).map(([key, newValue]) => [key, { newValue }]));
        window.fixtureChrome.storage.onChanged.emit(changes, 'local');
      },
    },
  },
};

function search(query) {
  const input = frame.contentDocument.getElementById('globalSearch');
  input.value = query;
  input.dispatchEvent(new frame.contentWindow.Event('input', { bubbles: true }));
  return input;
}

function key(element, value) {
  element.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
}

function foreground(focused, visible = true) {
  window.fixtureFocused = focused;
  window.fixtureVisible = visible;
  frame.contentWindow.dispatchEvent(new frame.contentWindow.Event(focused ? 'focus' : 'blur'));
  frame.contentDocument.dispatchEvent(new frame.contentWindow.Event('visibilitychange'));
}

function pause(ms = 600) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function refreshWithTab(tab) {
  tabs.push(tab);
  window.fixtureChrome.tabs.onCreated.emit(tab);
  await until(() => frame.contentDocument.querySelector(`[data-tab-id="${tab.id}"]`), 'New tab was not rendered');
}

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
      const before = new Map(cards.map(card => [card.dataset.domainId, card.getBoundingClientRect().x]));
      cards[0].querySelector('[data-action="close-single-tab"]').click();
      await until(() => frame.contentDocument.querySelectorAll(`[data-domain-id="${cards[0].dataset.domainId}"] .page-chip`).length === 7, 'Tab row was not removed');
      assert(tabs.length === 32, 'Close action did not remove exactly one tab');
      assert([...frame.contentDocument.querySelectorAll('.mission-card')].every(card => Math.abs(card.getBoundingClientRect().x - before.get(card.dataset.domainId)) < 1), 'A surviving card moved to another column');
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
    await check('Untrusted titles, group names, saved IDs and links stay inert under CSP', async () => {
      const payload = '<button data-action="close-all-open-tabs" id="injected">attack & text</button>';
      window.fixtureGroups = [{ hostname: 'unsafe.example', groupKey: 'unsafe', groupLabel: payload }];
      tabs = fixture('unsafe.example', 10, 1000).map(tab => ({ ...tab, title: payload }));
      storage.deferred = [
        { id: 'id" data-action="close-all-open-tabs', title: payload, url: 'javascript:alert(1)' },
        { id: 'archive', title: payload, url: 'data:text/html,attack', completed: true },
        { id: 'safe', title: payload, url: 'https://safe.example/?x="&y=<test>' },
      ];
      await loadDashboard();
      const doc = frame.contentDocument;
      assert(!doc.querySelector('#injected'), 'Injected markup became a DOM element');
      assert(doc.querySelector('.mission-name').textContent === payload, 'Group label did not render as text');
      assert(doc.querySelectorAll('.chip-text')[8].textContent === payload, 'Overflow title did not render as text');
      assert(doc.querySelector('.deferred-title').textContent.trim() === payload, 'Saved title did not render as text');
      assert(doc.querySelector('.archive-item-title').textContent.trim() === payload, 'Archive title did not render as text');
      assert(!doc.querySelector('a[href^="javascript:"], a[href^="data:"]'), 'Unsafe saved URL is navigable');
      assert(!doc.querySelector('[onerror]'), 'Inline error handlers remain');
      assert(frame.contentWindow.policyViolations.length === 0, 'Page caused a CSP violation');
      assert(doc.querySelector('.deferred-dismiss').dataset.deferredId === storage.deferred[0].id, 'Saved ID escaped its attribute');
      search('attack');
      assert(!doc.querySelector('#injected'), 'Search rendered title as markup');
      assert(doc.querySelectorAll('.search-result').length === 13, 'Search missed overflow or saved items');
      assert(doc.querySelectorAll('.search-result:disabled').length === 2, 'Unsafe results can be opened');
      search('');
      window.fixtureGroups = [];
    });

    await check('Search covers every window, overflow, saved and archived items with stable substring matching', async () => {
      tabs = fixture('search.example', 10, 1100).map((tab, index) => ({ ...tab, title: `Needle ${index}`, windowId: index % 2 + 1 }));
      storage.deferred = [
        { id: 's', url: 'https://saved.example/needle', title: 'Saved' },
        { id: 'a', url: 'https://archive.example/', title: 'Archived NEEDLE', completed: true },
        { id: 'dismissed', url: 'https://needle.example/', dismissed: true },
      ];
      await loadDashboard();
      const doc = frame.contentDocument;
      const input = search('nEeDlE');
      assert(doc.getElementById('dashboardColumns').hidden, 'Search did not show a dedicated result view');
      const headings = [...doc.querySelectorAll('#searchResults h2')].map(el => el.textContent);
      assert(headings.join('|') === 'Open tabs|Saved for later|Archive', 'Sources are not separated');
      assert(doc.querySelectorAll('.search-result').length === 12, 'Search missed data or included dismissed data');
      assert(doc.querySelectorAll('.search-result')[9].textContent.includes('Needle 9'), 'Overflow tab is absent or reordered');
      search('nEdLe');
      assert(doc.querySelectorAll('.search-result').length === 0, 'Search unexpectedly used fuzzy matching');
      search('needle 9');
      key(input, 'ArrowDown');
      key(input, 'Enter');
      await until(() => activated.includes(1109), 'Enter did not activate exact tab in the other window');
      search('saved.example/needle');
      key(input, 'ArrowDown'); key(input, 'Enter');
      await until(() => opened.includes('https://saved.example/needle'), 'Saved result did not open');
      search('Archived');
      key(input, 'ArrowUp'); key(input, 'Enter');
      await until(() => opened.includes('https://archive.example/'), 'Archived result did not open');
      input.focus();
      key(input, 'Escape');
      assert(!input.value && doc.activeElement !== input && !doc.getElementById('dashboardColumns').hidden, 'Escape did not clear and leave search');
      key(doc.body, '/');
      assert(doc.activeElement === input, 'Slash did not focus search');
      doc.getElementById('archiveToggle').click();
      const archiveInput = doc.getElementById('archiveSearch');
      archiveInput.focus(); key(archiveInput, '/');
      doc.getElementById('archiveToggle').click();
      assert(doc.activeElement === archiveInput, 'Slash stole focus from an input');
    });

    await check('Foreground events update tabs and saved items; bursts coalesce', async () => {
      await pause();
      const before = queryCount;
      tabs.push({ id: 1200, windowId: 2, title: 'Fresh title', url: 'https://fresh.example/' });
      for (let i = 0; i < 20; i++) window.fixtureChrome.tabs.onUpdated.emit(1200, { title: 'Fresh title' });
      await until(() => frame.contentDocument.querySelector('[data-tab-id="1200"]'), 'Title/create changes were not reflected');
      await pause();
      assert(queryCount === before + 1, `Burst caused ${queryCount - before} tab queries`);
      storage.deferred.push({ id: 'external', title: 'External saved change', url: 'https://external.example/' });
      window.fixtureChrome.storage.onChanged.emit({ deferred: { newValue: storage.deferred } }, 'local');
      await until(() => frame.contentDocument.querySelector('[data-deferred-id="external"]'), 'Saved changes were not reflected');
      tabs.find(tab => tab.id === 1200).url = 'https://moved.example/';
      window.fixtureChrome.tabs.onUpdated.emit(1200, { url: 'https://moved.example/' });
      await until(() => frame.contentDocument.querySelector('[data-domain-id="domain-moved.example"]'), 'Navigation did not regroup tab');
    });

    await check('Background and unfocused windows do no refresh reads; focus catches up once', async () => {
      await pause();
      for (const visible of [true, false]) {
        foreground(false, visible);
        const before = queryCount;
        const beforeStorage = storageReads;
        tabs.push(...fixture(`background${visible}.example`, 1, visible ? 1300 : 1301));
        for (let i = 0; i < 15; i++) window.fixtureChrome.tabs.onCreated.emit({});
        window.fixtureChrome.storage.onChanged.emit({ deferred: {} }, 'local');
        await pause();
        assert(queryCount === before && storageReads === beforeStorage, 'Background event queried tabs or storage');
        assert(!frame.contentDocument.querySelector(`[data-tab-id="${visible ? 1300 : 1301}"]`), 'Background event changed DOM');
      }
      const before = queryCount;
      foreground(true);
      await until(() => frame.contentDocument.querySelector('[data-tab-id="1301"]'), 'Focus did not catch up');
      await pause();
      assert(queryCount === before + 1, 'Focus catch-up was not coalesced');
    });

    await check('Losing foreground during a read prevents stale DOM commit', async () => {
      let release;
      queryBarrier = new Promise(resolve => { release = resolve; releaseQuery = resolve; });
      let started = false;
      capturedQuery = () => started = true;
      tabs.push(...fixture('inflight.example', 1, 1400));
      window.fixtureChrome.tabs.onCreated.emit({});
      await until(() => started, 'Read did not start');
      foreground(false);
      queryBarrier = null;
      capturedQuery = null;
      release();
      await pause();
      assert(!frame.contentDocument.querySelector('[data-tab-id="1400"]'), 'In-flight read painted in background');
      foreground(true);
      await until(() => frame.contentDocument.querySelector('[data-tab-id="1400"]'), 'Return to foreground lost pending data');
    });

    await check('A newer event invalidates an in-flight snapshot', async () => {
      let release;
      queryBarrier = new Promise(resolve => { release = resolve; releaseQuery = resolve; });
      let started = false;
      capturedQuery = () => started = true;
      window.fixtureChrome.tabs.onUpdated.emit(1400, { title: 'before' });
      await until(() => started, 'Read did not start');
      const changed = tabs.find(tab => tab.id === 1400);
      changed.title = 'Newest title';
      window.fixtureChrome.tabs.onUpdated.emit(1400, { title: changed.title });
      queryBarrier = null; capturedQuery = null; release();
      await until(() => frame.contentDocument.querySelector('[data-tab-id="1400"] .chip-text')?.textContent === 'Newest title', 'Newer data was dropped');
    });

    await check('Refresh keeps query and selected identity; removal clears selection before Enter', async () => {
      const doc = frame.contentDocument;
      const input = search('needle');
      input.focus(); key(input, 'ArrowDown');
      const selected = input.getAttribute('aria-activedescendant');
      await refreshWithTab({ id: 1500, windowId: 1, title: 'Another needle', url: 'https://another.example/' });
      assert(input.value === 'needle' && input.getAttribute('aria-activedescendant') === selected, 'Refresh lost query or selected identity');
      assert(doc.activeElement === input, 'Refresh lost input focus');
      const selectedId = Number(decodeURIComponent(selected).split(':')[1]);
      await window.fixtureChrome.tabs.remove(selectedId);
      await until(() => !input.hasAttribute('aria-activedescendant'), 'Disappeared result remained selected');
      const before = activated.length + opened.length;
      key(input, 'Enter');
      await pause(50);
      assert(activated.length + opened.length === before, 'Enter opened a replacement result');
      search('');
    });

    await check('Expanded groups, archive query, focused row and scroll survive refresh', async () => {
      const doc = frame.contentDocument;
      const card = doc.querySelector('[data-domain-id="domain-search.example"]');
      card.querySelector('[data-action="expand-chips"]').click();
      doc.getElementById('archiveToggle').click();
      const archiveInput = doc.getElementById('archiveSearch');
      archiveInput.value = 'not-found';
      archiveInput.dispatchEvent(new frame.contentWindow.Event('input', { bubbles: true }));
      const row = card.querySelector('[data-action="close-single-tab"]');
      const tabId = row.dataset.tabId;
      row.focus();
      frame.contentWindow.scrollTo(0, 120);
      const scroll = frame.contentWindow.scrollY;
      await refreshWithTab({ id: 1600, windowId: 1, title: 'Extra', url: 'https://search.example/extra' });
      assert(doc.querySelector('[data-domain-id="domain-search.example"] .page-chips-overflow').style.display === 'contents', 'Group collapsed');
      assert(doc.getElementById('archiveToggle').classList.contains('open'), 'Archive collapsed');
      assert(archiveInput.value === 'not-found' && doc.querySelectorAll('.archive-item').length === 0, 'Archive filter was lost');
      assert(doc.activeElement.dataset.tabId === tabId, 'Focused row was lost');
      assert(Math.abs(frame.contentWindow.scrollY - scroll) < 1, 'Scroll position was lost');
      archiveInput.value = '';
      archiveInput.dispatchEvent(new frame.contentWindow.Event('input', { bubbles: true }));
    });

    await check('Read failure preserves the last committed dashboard without retry loops', async () => {
      const before = frame.contentDocument.getElementById('openTabsMissions').innerHTML;
      const beforeQueries = queryCount;
      queryFailure = true;
      window.fixtureChrome.tabs.onUpdated.emit(1600, { title: 'failure' });
      await pause();
      assert(frame.contentDocument.getElementById('openTabsMissions').innerHTML === before, 'Failed query erased the dashboard');
      assert(queryCount === beforeQueries + 1, 'Read failure caused retry loop');
      queryFailure = false;
      foreground(true);
      await pause();
    });
    await check('Internal pages and duplicate URLs remain individually searchable by tab ID', async () => {
      tabs.push(
        { id: 1700, windowId: 3, title: 'Needle settings', url: 'chrome://settings/' },
        { id: 1701, windowId: 3, title: 'Needle blank', url: 'about:blank' },
        { id: 1702, windowId: 4, title: 'Needle duplicate', url: 'https://search.example/1' },
      );
      window.fixtureChrome.tabs.onCreated.emit({});
      search('needle');
      await until(() => frame.contentDocument.querySelector('[data-search-key="tab:1702"]'), 'New search entries were not refreshed');
      const doc = frame.contentDocument;
      assert(doc.querySelector('[data-search-key="tab:1700"]') && doc.querySelector('[data-search-key="tab:1701"]'), 'Internal pages are missing from search');
      key(doc.getElementById('globalSearch'), 'ArrowUp');
      const duplicate = doc.querySelector('[data-search-key="tab:1702"]');
      duplicate.focus();
      key(duplicate, 'Enter');
      await until(() => activated.includes(1702), 'Duplicate URL focused a different instance');
      await window.fixtureChrome.tabs.remove(1702);
      await until(() => !doc.querySelector('[data-search-key="tab:1702"]'), 'Focused result was not removed');
      const input = doc.getElementById('globalSearch');
      assert(!input.hasAttribute('aria-activedescendant'), 'Removing a focused result left an earlier selection active');
      const beforeEnter = activated.length;
      key(input, 'Enter');
      await pause(50);
      assert(activated.length === beforeEnter, 'Removing focused result caused Enter to open another result');
      const old = tabs.find(tab => tab.id === 1700);
      old.id = 1703;
      window.fixtureChrome.tabs.onReplaced.emit(1703, 1700);
      await until(() => doc.querySelector('[data-search-key="tab:1703"]') && !doc.querySelector('[data-search-key="tab:1700"]'), 'Replaced tab ID was not reconciled');
      search('');
    });

    await check('Saved links, archive links and bulk controls keep focus across redraws', async () => {
      const doc = frame.contentDocument;
      doc.getElementById('archiveSearch').value = '';
      if (!doc.getElementById('archiveToggle').classList.contains('open')) doc.getElementById('archiveToggle').click();
      for (const selector of ['.deferred-title', '.archive-item-title', '[data-action="close-all-open-tabs"]', '[data-action="dedup-keep-one"]']) {
        const focused = doc.querySelector(selector);
        assert(focused, `Missing focus target ${selector}`);
        focused.focus();
        const focusKey = focused.dataset.focusKey;
        storage.deferred.push({ id: `focus-${selector}`, title: 'Another saved item', url: 'https://focus.example/', completed: selector === '.archive-item-title' });
        tabs.push({ id: 1800 + storage.deferred.length, windowId: 1, title: 'Duplicate extra', url: 'https://search.example/1' });
        window.fixtureChrome.storage.onChanged.emit({ deferred: {} }, 'local');
        await until(() => !focused.isConnected, 'Fixture did not redraw focused region');
        assert(doc.activeElement.dataset.focusKey === focusKey, `Focus lost on ${selector}`);
      }
    });

    await check('Local mutations reconcile duplicates, counts, saved state and removed groups', async () => {
      const doc = frame.contentDocument;
      const card = doc.querySelector('[data-domain-id="domain-search.example"]');
      const close = card.querySelector('[data-action="close-single-tab"]');
      const id = Number(close.dataset.tabId);
      close.click();
      await until(() => !tabs.some(tab => tab.id === id) && !doc.querySelector(`[data-action="close-single-tab"][data-tab-id="${id}"]`), 'Close did not reconcile the exact tab');
      const save = doc.querySelector('[data-action="defer-single-tab"]');
      const savedId = Number(save.dataset.tabId);
      const savedUrl = tabs.find(tab => tab.id === savedId).url;
      save.click();
      await until(() => !tabs.some(tab => tab.id === savedId) && [...doc.querySelectorAll('.deferred-title')].some(link => link.href === savedUrl), 'Save did not reconcile saved list');
      const checkbox = doc.querySelector('.deferred-checkbox');
      const deferredId = checkbox.dataset.deferredId;
      checkbox.click();
      await until(() => !doc.querySelector(`[data-action="check-deferred"][data-deferred-id="${deferredId}"]`), 'Checking saved item did not archive it');
      assert(storage.deferred.find(item => item.id === deferredId).completed, 'Saved completion was not persisted');
      doc.querySelector('[data-action="dedup-keep-one"]').click();
      await until(() => tabs.filter(tab => tab.url === 'https://search.example/1').length === 1, 'Duplicate cleanup did not keep exactly one');
      await pause();
      const group = doc.querySelector('[data-domain-id="domain-another.example"]');
      group.querySelector('[data-action="close-domain-tabs"]').click();
      await until(() => !doc.querySelector('[data-domain-id="domain-another.example"]'), 'Empty group was not removed');
      assert(Number(doc.getElementById('statTabs').textContent) === tabs.length, 'Footer count is stale');
      doc.querySelector('[data-action="close-all-open-tabs"]').click();
      await until(() => doc.querySelectorAll('.mission-card').length === 0, 'Close all left stale cards');
      assert(doc.querySelector('.missions-empty-state'), 'Closing the last group lost the empty state');
    });
    await check('A page loaded in the background waits for foreground before its first query', async () => {
      foreground(false, false);
      tabs.push(...fixture('startup.example', 1, 1900));
      const before = queryCount;
      await loadDashboard(false);
      await pause();
      assert(queryCount === before, 'Background startup queried tabs');
      assert(!frame.contentDocument.querySelector('.mission-card'), 'Background startup rendered cards');
      foreground(true);
      await until(() => frame.contentDocument.querySelector('.mission-card'), 'Foreground did not perform first render');
    });
    document.title = `${failures ? 'FAIL' : 'PASS'} — Tab Out regression checks`;
  } finally {
    if (originalTheme === null) localStorage.removeItem('theme');
    else localStorage.setItem('theme', originalTheme);
  }
})();
