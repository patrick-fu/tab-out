/**
 * Tab Out UI Prototype - Shared Floating Switcher Bar
 * 
 * 仅在 localhost、127.0.0.1 或 file: 协议展示，防止误发布。
 * 提供前后箭头、方案直选、主题切换、演示状态指示（方案/主题/检索/剩余数）、重置按钮。
 * 支持左右方向键切换方案（在 input / textarea / select 内不拦截左右键）。
 */

import { store } from './state.js';
import { icons } from './icons.js';

export function isLocalEnvironment() {
  const host = window.location.hostname;
  const proto = window.location.protocol;
  return proto === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

export function isInputActive() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

export class PrototypeSwitcher {
  constructor(containerId = 'prototypeSwitcherRoot') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }

    this.init();
  }

  init() {
    if (!isLocalEnvironment()) {
      this.container.style.display = 'none';
      return;
    }

    this.render();

    // Listen to store updates
    store.subscribe(() => {
      this.render();
    });

    // Handle left/right arrow navigation
    window.addEventListener('keydown', (e) => {
      if (isInputActive()) return; // Do not intercept in inputs

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        store.prevVariant();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        store.nextVariant();
      }
    });
  }

  render() {
    if (!isLocalEnvironment()) return;

    const stats = store.getStats();
    const variantNames = {
      A: '方案 A · 静谧工作台',
      B: '方案 B · 纸上索引',
      C: '方案 C · 快捷启动器'
    };

    const queryText = store.searchQuery ? `检索: "${store.searchQuery}"` : '全部展开';
    const themeLabel = store.theme === 'dark' ? '深色' : '浅色';

    this.container.innerHTML = `
      <div class="prototype-switcher-bar" role="region" aria-label="AGY 原型切换控制栏">
        <!-- 身份标识 -->
        <div class="switcher-badge" title="AGY 专属交互设计原型，纯前端内存态，无任何真实数据读写">
          <span class="badge-dot"></span>
          <span class="badge-brand">AGY Prototype</span>
          <span class="badge-env">Local Demo</span>
        </div>

        <div class="switcher-divider"></div>

        <!-- 方案切换器 -->
        <div class="switcher-nav">
          <button class="switcher-btn switcher-arrow" id="switcherPrevBtn" title="上一个方案 (← 快捷键)">
            ${icons.arrowLeft}
          </button>

          <div class="switcher-variants">
            <button class="variant-pill ${store.variant === 'A' ? 'active' : ''}" data-variant="A">
              <span class="pill-key">A</span>
              <span class="pill-title">静谧工作台</span>
            </button>
            <button class="variant-pill ${store.variant === 'B' ? 'active' : ''}" data-variant="B">
              <span class="pill-key">B</span>
              <span class="pill-title">纸上索引</span>
            </button>
            <button class="variant-pill ${store.variant === 'C' ? 'active' : ''}" data-variant="C">
              <span class="pill-key">C</span>
              <span class="pill-title">快捷启动器</span>
            </button>
          </div>

          <button class="switcher-btn switcher-arrow" id="switcherNextBtn" title="下一个方案 (→ 快捷键)">
            ${icons.arrowRight}
          </button>
        </div>

        <div class="switcher-divider"></div>

        <!-- 实时状态指示 -->
        <div class="switcher-status">
          <span class="status-metric" title="当前剩余标签数 / 初始演示数">
            <strong>${stats.totalTabs}</strong>/24 标签
          </span>
          <span class="status-sep">·</span>
          <span class="status-metric" title="活跃域名数">${stats.distinctDomains} 域名</span>
          ${stats.duplicateTabCount > 0 ? `
            <span class="status-sep">·</span>
            <span class="status-metric status-dupe" title="重复标签数">${stats.duplicateTabCount} 重复</span>
          ` : ''}
          <span class="status-sep">·</span>
          <span class="status-metric status-query" title="当前筛选条件">${queryText.replace(/[&<>"\']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"})[char])}</span>
        </div>

        <div class="switcher-divider"></div>

        <!-- 实用控制：主题切换 & 重置演示 -->
        <div class="switcher-actions">
          <button class="switcher-btn switcher-theme-btn" id="switcherThemeBtn" title="切换深浅主题 (当前: ${themeLabel})">
            ${store.theme === 'dark' ? icons.sun : icons.moon}
            <span>${themeLabel}</span>
          </button>

          <button class="switcher-btn switcher-reset-btn" id="switcherResetBtn" title="恢复 24 个演示标签与初始状态">
            ${icons.reset}
            <span>重置演示</span>
          </button>
        </div>
      </div>
    `;

    // Bind events
    this.container.querySelector('#switcherPrevBtn')?.addEventListener('click', () => store.prevVariant());
    this.container.querySelector('#switcherNextBtn')?.addEventListener('click', () => store.nextVariant());
    this.container.querySelector('#switcherThemeBtn')?.addEventListener('click', () => store.toggleTheme());
    this.container.querySelector('#switcherResetBtn')?.addEventListener('click', () => {
      store.resetDemoData();
      window.showToast?.('已重置演示数据为初始 24 个标签');
    });

    this.container.querySelectorAll('.variant-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const v = e.currentTarget.getAttribute('data-variant');
        if (v) store.setVariant(v);
      });
    });
  }
}
