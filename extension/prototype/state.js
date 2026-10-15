/**
 * Tab Out UI Prototype - State Management (In-Memory Only)
 *
 * 完全在内存中维护状态，绝不调用真实 Chrome 扩展 API，不读写 localStorage。
 * 切换变体（A/B/C）时保留当前演示状态（剩余标签、保存列表、主题、搜索词）。
 */

import { getInitialData, INITIAL_WINDOWS } from './data.js';

class PrototypeStore {
  constructor() {
    const initial = getInitialData();
    this.windows = initial.windows;
    this.tabs = initial.tabs;
    this.saved = initial.saved;
    this.archive = initial.archive;

    // Read initial variant from URL query (?variant=A/B/C)
    const urlParams = new URLSearchParams(window.location.search);
    const vParam = (urlParams.get('variant') || 'A').toUpperCase();
    this.variant = ['A', 'B', 'C'].includes(vParam) ? vParam : 'A';

    // Default theme: Variant C defaults to dark, others system/dark preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme = this.variant === 'C' ? 'dark' : (prefersDark ? 'dark' : 'light');

    this.searchQuery = '';
    this.activeFilter = 'all'; // 'all' | 'duplicates' | 'win-1' | 'win-2' | 'win-3' | 'saved'
    this.collapsedGroups = new Set();
    this.selectedTabId = this.tabs.length > 0 ? this.tabs[0].id : null;
    this.drawerOpen = false;

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event = { type: 'STATE_CHANGED' }) {
    for (const listener of this.listeners) {
      try {
        listener(this, event);
      } catch (err) {
        console.error('Listener error in prototype store:', err);
      }
    }
  }

  // --- Theme Management ---
  setTheme(theme) {
    this.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.notify({ type: 'THEME_CHANGED', theme: this.theme });
  }

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  // --- Variant Management ---
  setVariant(variant) {
    const v = variant.toUpperCase();
    if (!['A', 'B', 'C'].includes(v)) return;
    if (this.variant === v) return;
    this.variant = v;

    // Update URL query string without reloading page
    const url = new URL(window.location);
    url.searchParams.set('variant', v);
    window.history.replaceState({}, '', url);

    this.notify({ type: 'VARIANT_CHANGED', variant: this.variant });
  }

  nextVariant() {
    const map = { A: 'B', B: 'C', C: 'A' };
    this.setVariant(map[this.variant] || 'A');
  }

  prevVariant() {
    const map = { A: 'C', B: 'A', C: 'B' };
    this.setVariant(map[this.variant] || 'A');
  }

  // --- Search & Filters ---
  setSearchQuery(q) {
    this.searchQuery = q;
    // Reset selection to first matching tab
    const matches = this.getFilteredTabs();
    this.selectedTabId = matches.length > 0 ? matches[0].id : null;
    this.notify({ type: 'SEARCH_CHANGED', query: this.searchQuery });
  }

  setActiveFilter(filter) {
    this.activeFilter = filter;
    const matches = this.getFilteredTabs();
    this.selectedTabId = matches.length > 0 ? matches[0].id : null;
    this.notify({ type: 'FILTER_CHANGED', filter });
  }

  toggleGroupCollapse(domain) {
    if (this.collapsedGroups.has(domain)) {
      this.collapsedGroups.delete(domain);
    } else {
      this.collapsedGroups.add(domain);
    }
    this.notify({ type: 'GROUP_COLLAPSE_TOGGLED', domain });
  }

  setDrawerOpen(open) {
    this.drawerOpen = Boolean(open);
    this.notify({ type: 'DRAWER_TOGGLED', open: this.drawerOpen });
  }

  // --- Keyboard Selection ---
  selectTab(id) {
    this.selectedTabId = id;
    this.notify({ type: 'TAB_SELECTED', id });
  }

  selectNextTab() {
    const list = this.getFilteredTabs();
    if (!list.length) return;
    const currentIndex = list.findIndex(t => t.id === this.selectedTabId);
    const nextIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    this.selectedTabId = list[nextIndex].id;
    this.notify({ type: 'TAB_SELECTED', id: this.selectedTabId });
  }

  selectPrevTab() {
    const list = this.getFilteredTabs();
    if (!list.length) return;
    const currentIndex = list.findIndex(t => t.id === this.selectedTabId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    this.selectedTabId = list[prevIndex].id;
    this.notify({ type: 'TAB_SELECTED', id: this.selectedTabId });
  }

  // --- Tab Actions ---
  closeTab(id) {
    const tab = this.tabs.find(t => t.id === id);
    if (!tab) return;
    this.tabs = this.tabs.filter(t => t.id !== id);

    // Update selection if needed
    if (this.selectedTabId === id) {
      const remaining = this.getFilteredTabs();
      this.selectedTabId = remaining.length > 0 ? remaining[0].id : null;
    }

    this.notify({ type: 'TAB_CLOSED', tab });
  }

  closeGroup(domain) {
    const closed = this.tabs.filter(t => t.domain === domain);
    this.tabs = this.tabs.filter(t => t.domain !== domain);
    this.notify({ type: 'GROUP_CLOSED', domain, count: closed.length });
  }

  closeDuplicates(url) {
    // Keep the first one, close subsequent ones with the same URL
    let foundFirst = false;
    let closedCount = 0;
    this.tabs = this.tabs.filter(t => {
      if (t.url === url) {
        if (!foundFirst) {
          foundFirst = true;
          return true; // keep first
        }
        closedCount++;
        return false; // remove duplicate
      }
      return true;
    });
    this.notify({ type: 'DUPLICATES_CLOSED', url, count: closedCount });
  }

  closeAllDuplicates() {
    const seen = new Set();
    let closedCount = 0;
    this.tabs = this.tabs.filter(t => {
      if (seen.has(t.url)) {
        closedCount++;
        return false;
      }
      seen.add(t.url);
      return true;
    });
    this.notify({ type: 'ALL_DUPLICATES_CLOSED', count: closedCount });
  }

  saveTab(id) {
    const tab = this.tabs.find(t => t.id === id);
    if (!tab) return;
    // Add to saved list if not already there
    if (!this.saved.some(s => s.url === tab.url)) {
      this.saved.unshift({
        id: 'saved-' + Date.now(),
        title: tab.title,
        url: tab.url,
        domain: tab.domain,
        savedAt: '刚刚保存'
      });
    }
    // Remove from open tabs
    this.closeTab(id);
    this.notify({ type: 'TAB_SAVED', tab });
  }

  removeSavedTab(id) {
    const item = this.saved.find(s => s.id === id);
    this.saved = this.saved.filter(s => s.id !== id);
    this.notify({ type: 'SAVED_TAB_REMOVED', item });
  }

  archiveSavedTab(id) {
    const item = this.saved.find(s => s.id === id);
    if (!item) return;
    this.saved = this.saved.filter(s => s.id !== id);
    this.archive.unshift({
      id: 'arch-' + Date.now(),
      title: item.title,
      url: item.url,
      domain: item.domain,
      archivedAt: '刚刚归档'
    });
    this.notify({ type: 'SAVED_TAB_ARCHIVED', item });
  }

  restoreArchivedTab(id) {
    const item = this.archive.find(a => a.id === id);
    if (!item) return;
    this.archive = this.archive.filter(a => a.id !== id);
    this.saved.unshift({
      id: 'saved-' + Date.now(),
      title: item.title,
      url: item.url,
      domain: item.domain,
      savedAt: '从归档恢复'
    });
    this.notify({ type: 'ARCHIVED_TAB_RESTORED', item });
  }

  resetDemoData() {
    const initial = getInitialData();
    this.tabs = initial.tabs;
    this.saved = initial.saved;
    this.archive = initial.archive;
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.collapsedGroups.clear();
    this.selectedTabId = this.tabs[0]?.id || null;
    this.notify({ type: 'DEMO_DATA_RESET' });
  }

  // --- Query & Grouping Helpers ---
  getDuplicateUrls() {
    const countMap = {};
    for (const tab of this.tabs) {
      countMap[tab.url] = (countMap[tab.url] || 0) + 1;
    }
    const dupes = new Set();
    for (const [url, count] of Object.entries(countMap)) {
      if (count > 1) dupes.add(url);
    }
    return dupes;
  }

  getFilteredTabs() {
    const dupes = this.getDuplicateUrls();
    let list = this.tabs;

    // Apply activeFilter
    if (this.activeFilter === 'duplicates') {
      list = list.filter(t => dupes.has(t.url));
    } else if (this.activeFilter.startsWith('win-')) {
      const winId = parseInt(this.activeFilter.replace('win-', ''), 10);
      list = list.filter(t => t.windowId === winId);
    }

    // Apply searchQuery
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.url.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getGroupedByDomain() {
    const filtered = this.getFilteredTabs();
    const groups = {};
    for (const tab of filtered) {
      if (!groups[tab.domain]) {
        groups[tab.domain] = {
          domain: tab.domain,
          tabs: [],
          hasDuplicates: false
        };
      }
      groups[tab.domain].tabs.push(tab);
    }

    const dupes = this.getDuplicateUrls();
    for (const domain of Object.keys(groups)) {
      groups[domain].hasDuplicates = groups[domain].tabs.some(t => dupes.has(t.url));
    }

    // Sort by count descending
    const order = [...new Set(getInitialData().tabs.map(tab => tab.domain))];
    return Object.values(groups).sort((a, b) => order.indexOf(a.domain) - order.indexOf(b.domain));
  }

  getGroupedByWindow() {
    const filtered = this.getFilteredTabs();
    const groups = {};
    for (const win of this.windows) {
      groups[win.id] = {
        window: win,
        tabs: []
      };
    }
    for (const tab of filtered) {
      if (groups[tab.windowId]) {
        groups[tab.windowId].tabs.push(tab);
      }
    }
    return Object.values(groups);
  }

  getStats() {
    const dupes = this.getDuplicateUrls();
    let dupeTabCount = 0;
    for (const tab of this.tabs) {
      if (dupes.has(tab.url)) dupeTabCount++;
    }
    const distinctDomains = new Set(this.tabs.map(t => t.domain)).size;
    const distinctWindows = new Set(this.tabs.map(t => t.windowId)).size;

    return {
      totalTabs: this.tabs.length,
      distinctDomains,
      distinctWindows,
      duplicateUrlCount: dupes.size,
      duplicateTabCount: dupeTabCount,
      duplicateExtraCount: dupeTabCount - dupes.size,
      savedCount: this.saved.length,
      archiveCount: this.archive.length,
      filteredCount: this.getFilteredTabs().length
    };
  }
}

export const store = new PrototypeStore();
