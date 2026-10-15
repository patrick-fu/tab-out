/**
 * Tab Out UI Prototype - Main Entry & Controller
 * 
 * 协调 Variant A/B/C 渲染、共享底栏切换、全局键盘流（/、↑↓、Enter、Esc）、Toast 反馈系统。
 * 纯内存虚拟原型，零远端依赖，不调用真实 Chrome 扩展 API。
 */

import { store } from './state.js';
import { PrototypeSwitcher, isInputActive } from './switcher.js';
import { renderVariantA } from './render-a.js';
import { renderVariantB } from './render-b.js';
import { renderVariantC } from './render-c.js';
import { icons } from './icons.js';

class PrototypeApp {
  constructor() {
    this.appRoot = document.getElementById('prototypeAppRoot');
    this.toastEl = document.getElementById('prototypeToast');
    this.toastTimeout = null;

    this.initToast();
    this.initTheme();
    this.initKeyboard();
    this.initSwitcher();
    this.render();

    // Subscribe to state changes
    store.subscribe((_, event) => {
      this.render();
      // If selected tab changed and we are in keyboard navigation, ensure row is in view
      if (event?.type === 'TAB_SELECTED') {
        this.scrollSelectedIntoView();
      }
    });
  }

  initToast() {
    window.showToast = (message) => {
      if (!this.toastEl) return;
      this.toastEl.innerHTML = `
        <span style="display:flex; color: var(--emerald-base);">${icons.check}</span>
        <span>${message}</span>
      `;
      this.toastEl.classList.add('visible');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toastEl.classList.remove('visible');
      }, 2600);
    };
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', store.theme);
  }

  initSwitcher() {
    new PrototypeSwitcher('prototypeSwitcherRoot');
  }

  getActiveSearchInput() {
    return document.querySelector('#vaSearchInput, #vbSearchInput, #vcInput');
  }

  scrollSelectedIntoView() {
    const selectedEl = document.querySelector('.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const activeInput = this.getActiveSearchInput();
      const inInput = isInputActive();

      // '/' Key to focus search
      if (e.key === '/' && !inInput) {
        e.preventDefault();
        if (activeInput) {
          activeInput.focus();
          activeInput.select();
        }
        return;
      }

      // 'Escape' Key to exit/clear search
      if (e.key === 'Escape') {
        if (store.drawerOpen) {
          store.setDrawerOpen(false);
          return;
        }
        if (store.searchQuery) {
          store.setSearchQuery('');
        }
        if (inInput) {
          document.activeElement.blur();
        }
        return;
      }

      // 'ArrowDown' Navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        store.selectNextTab();
        return;
      }

      // 'ArrowUp' Navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        store.selectPrevTab();
        return;
      }

      // 'Enter' Key to simulate tab jump
      if (e.key === 'Enter') {
        const selectedTab = store.tabs.find(t => t.id === store.selectedTabId);
        if (selectedTab) {
          e.preventDefault();
          window.showToast(`演示反馈：已模拟跳转至「${selectedTab.title}」`);
        }
        return;
      }

      // '1'~'9' Number keys for direct selection when not in input
      if (!inInput && e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        const filtered = store.getFilteredTabs();
        if (filtered.length >= num) {
          e.preventDefault();
          const target = filtered[num - 1];
          store.selectTab(target.id);
          window.showToast(`快捷索引 [${num}]：已选中「${target.title}」`);
        }
        return;
      }
    });
  }

  render() {
    if (!this.appRoot) return;

    // Preserve active input focus and cursor position
    const activeEl = document.activeElement;
    const isSearchFocused = activeEl && (activeEl.id === 'vaSearchInput' || activeEl.id === 'vbSearchInput' || activeEl.id === 'vcInput');
    const selStart = isSearchFocused ? activeEl.selectionStart : null;
    const selEnd = isSearchFocused ? activeEl.selectionEnd : null;

    // Preserve scroll positions
    const scrollMap = new Map();
    this.appRoot.querySelectorAll('[id]').forEach(el => {
      if (el.scrollTop > 0 || el.scrollLeft > 0) {
        scrollMap.set(el.id, { top: el.scrollTop, left: el.scrollLeft });
      }
    });
    const winScrollY = window.scrollY;
    const winScrollX = window.scrollX;

    // Dispatch to corresponding variant renderer
    switch (store.variant) {
      case 'A':
        renderVariantA(this.appRoot);
        break;
      case 'B':
        renderVariantB(this.appRoot);
        break;
      case 'C':
        renderVariantC(this.appRoot);
        break;
      default:
        renderVariantA(this.appRoot);
    }

    // Restore scroll positions
    scrollMap.forEach((pos, id) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollTop = pos.top;
        el.scrollLeft = pos.left;
      }
    });
    window.scrollTo(winScrollX, winScrollY);

    // Restore input focus & selection
    if (isSearchFocused) {
      const newActiveInput = this.getActiveSearchInput();
      if (newActiveInput) {
        newActiveInput.focus();
        if (selStart !== null && selEnd !== null) {
          try {
            newActiveInput.setSelectionRange(selStart, selEnd);
          } catch (_) {}
        }
      }
    }
  }
}

// Boot up once DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PrototypeApp());
} else {
  new PrototypeApp();
}
