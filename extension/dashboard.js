'use strict';

let savedTabs = { active: [], archived: [] };
let mutationPending = false;
let refreshTimer;
let refreshing = false;
let refreshNeeded = true;
let refreshRevision = 0;
let hasRendered = false;
let searchEntries = [];
let selectedSearchKey = null;

function isForeground() {
  return document.visibilityState === 'visible' && document.hasFocus();
}

function matchesSearch(item, query) {
  return String(item.title || '').toLowerCase().includes(query) ||
    String(item.url || '').toLowerCase().includes(query);
}

async function activateOpenTab(id) {
  const tab = await chrome.tabs.get(id);
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });
}

function captureDashboardState() {
  const focused = document.activeElement;
  return {
    expanded: [...document.querySelectorAll('.mission-card')]
      .filter(card => card.querySelector('.page-chips-overflow')?.style.display === 'contents')
      .map(card => card.dataset.domainId),
    focused,
    focusData: focused ? { ...focused.dataset, domainId: focused.dataset.domainId || focused.closest('.mission-card')?.dataset.domainId } : {},
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    sidebarScroll: document.getElementById('deferredColumn').scrollTop,
  };
}

function restoreDashboardState(state) {
  for (const card of document.querySelectorAll('.mission-card')) {
    if (!state.expanded.includes(card.dataset.domainId)) continue;
    const overflow = card.querySelector('.page-chips-overflow');
    if (overflow) overflow.style.display = 'contents';
    const toggle = card.querySelector('[data-action="expand-chips"]');
    if (toggle) toggle.hidden = true;
  }
  if (state.focused && !state.focused.isConnected) {
    const data = state.focusData;
    const replacement = [...document.querySelectorAll('[data-action], [data-focus-key]')].find(element =>
      data.focusKey ? element.dataset.focusKey === data.focusKey : element.dataset.action === data.action &&
      (data.tabId ? element.dataset.tabId === data.tabId :
        data.deferredId ? element.dataset.deferredId === data.deferredId :
          data.domainId && (element.dataset.domainId || element.closest('.mission-card')?.dataset.domainId) === data.domainId));
    replacement?.focus({ preventScroll: true });
  }
  document.getElementById('deferredColumn').scrollTop = state.sidebarScroll;
  window.scrollTo(state.scrollX, state.scrollY);
}

function requestRefresh(delay = 250) {
  refreshNeeded = true;
  refreshRevision++;
  clearTimeout(refreshTimer);
  if (isForeground() && !mutationPending && !refreshing) {
    refreshTimer = setTimeout(flushRefresh, delay);
  }
}

async function flushRefresh() {
  if (!isForeground() || mutationPending || refreshing || !refreshNeeded) return;
  refreshing = true;
  refreshNeeded = false;
  const revision = refreshRevision;
  let state;
  try {
    const committed = await renderStaticDashboard(
      () => isForeground() && !mutationPending && revision === refreshRevision,
      () => {
        state = captureDashboardState();
        if (hasRendered) document.body.classList.add('live-updates');
      },
    );
    if (committed) {
      renderSearch();
      restoreDashboardState(state);
      hasRendered = true;
    } else {
      refreshNeeded = true;
    }
  } catch (error) {
    console.error('[tab-out] Refresh failed:', error);
    // Retry on the next external event or return to the foreground, not in a loop.
  } finally {
    refreshing = false;
    if (refreshNeeded && isForeground() && !mutationPending) {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(flushRefresh, 250);
    }
  }
}

function renderSearch() {
  const input = document.getElementById('globalSearch');
  const query = input.value.trim().toLowerCase();
  const panel = document.getElementById('searchPanel');
  const list = document.getElementById('searchResults');
  const searching = query.length > 0;
  panel.hidden = !searching;
  document.getElementById('dashboardColumns').hidden = searching;
  input.setAttribute('aria-expanded', String(searching));
  if (!searching) {
    selectedSearchKey = null;
    searchEntries = [];
    list.replaceChildren();
    input.removeAttribute('aria-activedescendant');
    return;
  }

  const groupedTabs = domainGroups.flatMap(group => group.tabs);
  const groupedIds = new Set(groupedTabs.map(tab => tab.id));
  const otherTabs = openTabs.filter(tab => !tab.isTabOut && !groupedIds.has(tab.id));
  const sources = [
    ['Open tabs', [...groupedTabs, ...otherTabs].map(tab => ({
      ...tab, key: `tab:${tab.id}`, tabId: tab.id,
    }))],
    ['Saved for later', savedTabs.active.map(item => ({ ...item, key: `saved:${item.id}` }))],
    ['Archive', savedTabs.archived.map(item => ({ ...item, key: `archived:${item.id}` }))],
  ];
  searchEntries = [];
  const fragment = document.createDocumentFragment();
  for (const [label, items] of sources) {
    const matches = items.filter(item => matchesSearch(item, query));
    if (!matches.length) continue;
    const group = document.createElement('div');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);
    const heading = document.createElement('h2');
    heading.textContent = label;
    group.append(heading);
    for (const item of matches) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-result';
      button.id = `result-${encodeURIComponent(item.key)}`;
      button.dataset.searchKey = item.key;
      button.setAttribute('role', 'option');
      button.disabled = item.tabId === undefined && !savedLink(item.url);
      const title = document.createElement('span');
      title.className = 'search-result-title';
      title.textContent = item.title || item.url;
      const url = document.createElement('span');
      url.className = 'search-result-url';
      url.textContent = item.url;
      button.append(title, url);
      group.append(button);
      if (!button.disabled) searchEntries.push(item);
    }
    fragment.append(group);
  }
  const focusedKey = list.contains(document.activeElement) ? document.activeElement.dataset.searchKey : null;
  list.replaceChildren(fragment);
  if (!searchEntries.some(item => item.key === selectedSearchKey)) selectedSearchKey = null;
  updateSearchSelection();
  if (focusedKey) {
    const replacement = [...list.querySelectorAll('[data-search-key]')]
      .find(element => element.dataset.searchKey === focusedKey);
    (replacement || input).focus({ preventScroll: true });
  }
  const count = list.querySelectorAll('.search-result').length;
  document.getElementById('searchStatus').textContent = count ? `${count} results` : 'No results';
}

function updateSearchSelection() {
  const input = document.getElementById('globalSearch');
  input.removeAttribute('aria-activedescendant');
  for (const button of document.querySelectorAll('.search-result')) {
    const selected = button.dataset.searchKey === selectedSearchKey;
    button.setAttribute('aria-selected', String(selected));
    if (selected) input.setAttribute('aria-activedescendant', button.id);
  }
}

async function openSearchResult(key) {
  const entry = searchEntries.find(item => item.key === key);
  if (!entry) return;
  try {
    if (entry.tabId !== undefined) await activateOpenTab(entry.tabId);
    else {
      const url = savedLink(entry.url);
      if (url) await chrome.tabs.create({ url });
    }
  } catch {
    showToast('Result is no longer available');
    selectedSearchKey = null;
    updateSearchSelection();
    requestRefresh();
  }
}

const searchInput = document.getElementById('globalSearch');
searchInput.addEventListener('input', () => {
  selectedSearchKey = null;
  renderSearch();
});
document.getElementById('searchResults').addEventListener('focusin', event => {
  const button = event.target.closest('[data-search-key]');
  if (!button || button.disabled) return;
  selectedSearchKey = button.dataset.searchKey;
  updateSearchSelection();
});
document.getElementById('searchResults').addEventListener('click', event => {
  const button = event.target.closest('[data-search-key]');
  if (button) openSearchResult(button.dataset.searchKey);
});
document.addEventListener('keydown', event => {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  const editing = event.target.closest('input, textarea, select, [contenteditable="true"]');
  if (event.key === '/' && !editing) {
    event.preventDefault();
    searchInput.focus();
    return;
  }
  if (event.target === searchInput || document.getElementById('searchPanel').contains(event.target)) {
    if (event.key === 'Escape') {
      event.preventDefault();
      searchInput.value = '';
      renderSearch();
      searchInput.blur();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!searchEntries.length) return;
      searchInput.focus({ preventScroll: true });
      const activeKey = event.target.closest('[data-search-key]')?.dataset.searchKey || selectedSearchKey;
      const current = searchEntries.findIndex(item => item.key === activeKey);
      const index = current < 0 ? (event.key === 'ArrowDown' ? 0 : searchEntries.length - 1) :
        (current + (event.key === 'ArrowDown' ? 1 : -1) + searchEntries.length) % searchEntries.length;
      selectedSearchKey = searchEntries[index].key;
      updateSearchSelection();
      document.getElementById(searchInput.getAttribute('aria-activedescendant')).scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const key = event.target.closest('[data-search-key]')?.dataset.searchKey || selectedSearchKey;
      if (key) openSearchResult(key);
    }
  } else if (event.key === 'Enter' && event.target.matches('.page-chip[data-action="focus-tab"]')) {
    event.preventDefault();
    event.target.click();
  }
});

for (const name of ['onCreated', 'onRemoved', 'onMoved', 'onAttached', 'onDetached', 'onReplaced']) {
  chrome.tabs[name].addListener(() => requestRefresh());
}
chrome.tabs.onUpdated.addListener((id, change) => {
  if (change.url !== undefined || change.title !== undefined || change.status === 'complete') requestRefresh();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.deferred) requestRefresh();
});
function foregroundChanged() {
  if (isForeground()) requestRefresh(0);
  else {
    clearTimeout(refreshTimer);
    refreshRevision++;
    refreshNeeded = true;
  }
}
window.addEventListener('focus', foregroundChanged);
window.addEventListener('blur', foregroundChanged);
document.addEventListener('visibilitychange', foregroundChanged);
requestRefresh(0);
