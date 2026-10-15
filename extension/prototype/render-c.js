/**
 * Tab Out UI Prototype - Variant C: 快捷启动器 (Quick Launcher / Command Center)
 *
 * 布局特色：
 * 1. 深色优先（Command Palette / Raycast 质感），键盘驱动极速流
 * 2. 搜索居中与指令聚焦：全局模糊检索、智能场景分类分组、数字索引序号
 * 3. 极低视觉噪音，高密度命令列表，一键批量去重与极速暂存
 */

import { store } from './state.js';
import { icons, getDomainIcon } from './icons.js';

export function renderVariantC(container) {
  const stats = store.getStats();
  const dupes = store.getDuplicateUrls();
  const filteredTabs = store.getFilteredTabs();

  // Smart Sectioning for Command Results
  const sections = [];

  // Section 1: Duplicates (if any and not explicitly filtered to something else)
  if (stats.duplicateTabCount > 0 && store.activeFilter !== 'dev' && store.activeFilter !== 'collab' && store.activeFilter !== 'research') {
    const dupeTabs = filteredTabs.filter(t => dupes.has(t.url));
    if (dupeTabs.length > 0) {
      sections.push({
        id: 'dupes',
        title: '⚠️ 存在多副本的标签 (待清理)',
        badge: `${dupeTabs.length} 项`,
        tabs: dupeTabs
      });
    }
  }

  // Section 2: Localhost & Engineering (Window 1 or localhost/github)
  const devTabs = filteredTabs.filter(t =>
    (t.domain.includes('localhost') || t.domain.includes('github')) &&
    !(sections[0]?.id === 'dupes' && dupes.has(t.url))
  );
  if (devTabs.length > 0) {
    sections.push({
      id: 'dev',
      title: '💻 本地工程与代码仓库',
      badge: `${devTabs.length} 项`,
      tabs: devTabs
    });
  }

  // Section 3: Collaboration & Design (feishu, figma)
  const collabTabs = filteredTabs.filter(t =>
    (t.domain.includes('feishu') || t.domain.includes('figma')) &&
    !(sections[0]?.id === 'dupes' && dupes.has(t.url))
  );
  if (collabTabs.length > 0) {
    sections.push({
      id: 'collab',
      title: '📄 设计与文档协同',
      badge: `${collabTabs.length} 项`,
      tabs: collabTabs
    });
  }

  // Section 4: Tech & Reference (mdn, zhihu, juejin)
  const refTabs = filteredTabs.filter(t =>
    (t.domain.includes('mozilla') || t.domain.includes('zhihu') || t.domain.includes('juejin')) &&
    !(sections[0]?.id === 'dupes' && dupes.has(t.url))
  );
  if (refTabs.length > 0) {
    sections.push({
      id: 'ref',
      title: '🌐 技术参考与资讯',
      badge: `${refTabs.length} 项`,
      tabs: refTabs
    });
  }

  // Fallback for any tabs not caught in above
  const handledIds = new Set(sections.flatMap(s => s.tabs.map(t => t.id)));
  const remainder = filteredTabs.filter(t => !handledIds.has(t.id));
  if (remainder.length > 0) {
    sections.push({
      id: 'other',
      title: '🔍 其他匹配条目',
      badge: `${remainder.length} 项`,
      tabs: remainder
    });
  }

  let globalIndexCounter = 0;

  container.innerHTML = `
    <div class="variant-c-layout">
      <!-- Command Palette Shell -->
      <div class="vc-palette">
        <!-- Spotlight Search Bar -->
        <div class="vc-input-wrap">
          <span class="vc-input-icon">${icons.command}</span>
          <input
            type="text"
            class="vc-input"
            id="vcInput"
            placeholder="搜索标签、执行跳转、网址过滤... [/]"
            value="${store.searchQuery.replace(/[&<>"\']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"})[char])}"
            autocomplete="off"
            autofocus
          />
          <div class="vc-input-hints">
            <span class="vc-kbd">↑↓ 导航</span>
            <span class="vc-kbd">↵ 跳转</span>
            <span class="vc-kbd">Esc 清空</span>
          </div>
        </div>

        <!-- Smart Filter Chips -->
        <nav class="vc-chips-bar">
          <button class="vc-chip ${store.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            全部 (${stats.totalTabs})
          </button>

          ${stats.duplicateTabCount > 0 ? `
            <button class="vc-chip ${store.activeFilter === 'duplicates' ? 'active' : ''}" data-filter="duplicates" style="color: var(--amber-base);">
              重复项 (${stats.duplicateTabCount})
            </button>
          ` : ''}

          <button class="vc-chip ${store.activeFilter === 'win-1' ? 'active' : ''}" data-filter="win-1">
            研发窗口 (${store.tabs.filter(t => t.windowId === 1).length})
          </button>

          <button class="vc-chip ${store.activeFilter === 'win-2' ? 'active' : ''}" data-filter="win-2">
            设计窗口 (${store.tabs.filter(t => t.windowId === 2).length})
          </button>

          <button class="vc-chip ${store.activeFilter === 'win-3' ? 'active' : ''}" data-filter="win-3">
            资料窗口 (${store.tabs.filter(t => t.windowId === 3).length})
          </button>

          <button class="vc-chip" id="vcOpenSavedBtn" style="margin-left: auto;">
            稍后读 (${store.saved.length})
          </button>
        </nav>

        <!-- Command Results Feed -->
        <main class="vc-results-feed" id="vcResultsFeed">
          ${sections.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-title">未发现匹配标签</div>
              <p>按 Esc 清除过滤词，或使用左右方向键切换原型方案</p>
            </div>
          ` : sections.map(sec => `
            <div class="vc-section-group">
              <div class="vc-section-header">
                <span>${sec.title}</span>
                <span class="badge-count">${sec.badge}</span>
              </div>

              ${sec.tabs.map(tab => {
                globalIndexCounter++;
                const isSelected = store.selectedTabId === tab.id;
                const isDupe = dupes.has(tab.url);
                const winObj = store.windows.find(w => w.id === tab.windowId);
                const indexLabel = globalIndexCounter <= 9 ? globalIndexCounter : '·';

                return `
                  <div
                    class="vc-command-row ${isSelected ? 'selected' : ''}"
                    data-tab-id="${tab.id}"
                    tabindex="0"
                  >
                    <div class="vc-index-badge">${indexLabel}</div>
                    <div class="vc-row-icon">${getDomainIcon(tab.domain)}</div>

                    <div class="vc-row-main">
                      <div class="vc-row-title" title="${tab.title}">${tab.title}</div>
                      <div class="vc-row-url" title="${tab.url}">${tab.url}</div>
                    </div>

                    <div class="vc-row-badges">
                      ${isDupe ? `
                        <span class="badge badge-dupe" data-close-dupe="${encodeURIComponent(tab.url)}" title="点击关闭冗余副本">2x 重复</span>
                      ` : ''}
                      <span class="badge-win">${winObj?.shortName || 'W' + tab.windowId}</span>
                    </div>

                    <div class="vc-row-actions" onclick="event.stopPropagation()">
                      <button class="va-action-btn btn-save" data-save-tab="${tab.id}" title="存为稍后阅读">
                        ${icons.bookmark}
                      </button>
                      <button class="va-action-btn btn-close" data-close-tab="${tab.id}" title="关闭标签">
                        ${icons.close}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </main>

        <!-- Command Palette Footer -->
        <footer class="vc-palette-footer">
          <div class="vc-footer-hints">
            <span>当前筛选命中: <strong>${stats.filteredCount}</strong> 项</span>
            ${stats.duplicateTabCount > 0 ? `
              <button class="vc-footer-btn" id="vcCleanAllDupesBtn" style="color: var(--amber-base);">
                ${icons.duplicate}
                <span>一键去重 (清理 ${stats.duplicateExtraCount} 个多余副本)</span>
              </button>
            ` : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="vc-footer-btn" id="vcFooterDrawerBtn">
              ${icons.bookmark}
              <span>稍后阅读 (${store.saved.length})</span>
            </button>
          </div>
        </footer>
      </div>

      <!-- Slide Drawer for Saved & Archive -->
      <div class="vb-drawer-overlay ${store.drawerOpen ? 'open' : ''}" id="vcDrawerOverlay"></div>
      <aside class="vb-drawer ${store.drawerOpen ? 'open' : ''}" id="vcDrawer">
        <header class="vb-drawer-header">
          <div class="vb-drawer-title" style="font-family: var(--font-sans); font-size: 15px; font-weight: 600;">
            稍后阅读与归档抽屉
          </div>
          <button class="switcher-btn" id="vcCloseDrawerBtn">
            ${icons.close}
          </button>
        </header>

        <div class="vb-drawer-body">
          <section>
            <div style="font-size: 11.5px; font-weight: 600; color: var(--ink-muted); text-transform: uppercase; margin-bottom: 8px;">
              稍后阅读清单 (${store.saved.length})
            </div>

            <div class="va-saved-list">
              ${store.saved.length === 0 ? `
                <div style="color: var(--ink-muted); font-size: 12px; padding: 12px 0;">暂无暂存条目</div>
              ` : store.saved.map(item => `
                <div class="va-saved-item">
                  <div class="va-saved-top">
                    <span class="va-saved-title">${item.title}</span>
                    <div class="va-saved-actions">
                      <button class="va-action-btn" data-archive-saved="${item.id}" title="移入归档">
                        ${icons.archive}
                      </button>
                      <button class="va-action-btn" data-remove-saved="${item.id}" title="删除">
                        ${icons.close}
                      </button>
                    </div>
                  </div>
                  <div class="va-saved-meta">
                    <span>${item.domain}</span>
                    <span>·</span>
                    <span>${item.savedAt}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <section style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <div style="font-size: 11.5px; font-weight: 600; color: var(--ink-muted); text-transform: uppercase; margin-bottom: 8px;">
              归档记录 (${store.archive.length})
            </div>

            <div class="va-saved-list">
              ${store.archive.length === 0 ? `
                <div style="color: var(--ink-muted); font-size: 12px; padding: 12px 0;">暂无历史归档</div>
              ` : store.archive.map(arch => `
                <div class="va-saved-item" style="opacity: 0.85;">
                  <div class="va-saved-top">
                    <span class="va-saved-title">${arch.title}</span>
                    <button class="va-action-btn" data-restore-archive="${arch.id}" title="恢复至阅读清单">
                      ${icons.restore}
                    </button>
                  </div>
                  <div class="va-saved-meta">
                    <span>${arch.domain}</span>
                    <span>·</span>
                    <span>${arch.archivedAt}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      </aside>
    </div>
  `;

  // Bind interactive events
  bindVariantCEvents(container);
}

function bindVariantCEvents(container) {
  // Input
  const input = container.querySelector('#vcInput');
  input?.addEventListener('input', (e) => {
    store.setSearchQuery(e.target.value);
  });

  // Filter Chips
  container.querySelectorAll('.vc-chip[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const f = e.currentTarget.getAttribute('data-filter');
      store.setActiveFilter(f);
    });
  });

  // Drawer toggles
  const openDrawer = () => store.setDrawerOpen(true);
  const closeDrawer = () => store.setDrawerOpen(false);

  container.querySelector('#vcOpenSavedBtn')?.addEventListener('click', openDrawer);
  container.querySelector('#vcFooterDrawerBtn')?.addEventListener('click', openDrawer);
  container.querySelector('#vcCloseDrawerBtn')?.addEventListener('click', closeDrawer);
  container.querySelector('#vcDrawerOverlay')?.addEventListener('click', closeDrawer);

  // Clean all duplicates
  container.querySelector('#vcCleanAllDupesBtn')?.addEventListener('click', () => {
    store.closeAllDuplicates();
    window.showToast?.('已一键清理所有多余重复项，各保留首个标签');
  });

  // Command Row Selection & Actions
  container.querySelectorAll('.vc-command-row[data-tab-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-tab-id');
      store.selectTab(id);
    });
    row.addEventListener('dblclick', (e) => {
      const id = e.currentTarget.getAttribute('data-tab-id');
      const t = store.tabs.find(tab => tab.id === id);
      window.showToast?.(`演示反馈：已模拟执行跳转至「${t?.title || '页面'}」`);
    });
  });

  // Close Tab
  container.querySelectorAll('[data-close-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-close-tab');
      store.closeTab(id);
      window.showToast?.('已关闭标签');
    });
  });

  // Save Tab
  container.querySelectorAll('[data-save-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-save-tab');
      store.saveTab(id);
      window.showToast?.('已将标签存入稍后阅读');
    });
  });

  // Close Duplicates
  container.querySelectorAll('[data-close-dupe]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = decodeURIComponent(e.currentTarget.getAttribute('data-close-dupe'));
      store.closeDuplicates(url);
      window.showToast?.('已清理该网址的多余副本');
    });
  });

  // Drawer actions
  container.querySelectorAll('[data-remove-saved]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-remove-saved');
      store.removeSavedTab(id);
      window.showToast?.('已从稍后阅读删除');
    });
  });

  container.querySelectorAll('[data-archive-saved]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-archive-saved');
      store.archiveSavedTab(id);
      window.showToast?.('已移入历史归档');
    });
  });

  container.querySelectorAll('[data-restore-archive]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-restore-archive');
      store.restoreArchivedTab(id);
      window.showToast?.('已恢复至阅读清单');
    });
  });
}
