/**
 * Tab Out UI Prototype - Variant B: 纸上索引 (Paper Index / Editorial Index)
 * 
 * 布局特色：
 * 1. 纸质出版物编目质感，雅致的排版层次，沉静克制且具人文气息
 * 2. 稳定的按域名卡片网格（2-3 列响应式），每个域名卡片具备精致的线框与条目编目
 * 3. 支持超限条目（+N 更多）平滑展开、重复项温和琥珀色标记、右侧滑出式稍后阅读抽屉
 */

import { store } from './state.js';
import { icons, getDomainIcon } from './icons.js';

export function renderVariantB(container) {
  const stats = store.getStats();
  const dupes = store.getDuplicateUrls();
  const groups = store.getGroupedByDomain();

  container.innerHTML = `
    <div class="variant-b-layout">
      <!-- 顶头出版物报头 (Masthead) -->
      <header class="vb-masthead">
        <div class="vb-brand-section">
          <div class="vb-volume">EDITION 2026 · ISSUE 04 · TAB OUT CATALOG</div>
          <h1 class="vb-title">纸上索引</h1>
          <p class="vb-subtitle">全景标签编目与结构化整理 · 专为多任务信息沉淀设计</p>
        </div>

        <div class="vb-masthead-meta">
          <div class="vb-meta-chip">
            <strong>${stats.totalTabs}</strong>
            <span>在席标签</span>
          </div>
          <div class="vb-meta-chip">
            <strong>${stats.distinctDomains}</strong>
            <span>归属域目</span>
          </div>
          <div class="vb-meta-chip">
            <strong>${stats.distinctWindows}</strong>
            <span>窗口分区</span>
          </div>
          ${stats.duplicateTabCount > 0 ? `
            <div class="vb-meta-chip" style="color: var(--amber-base);">
              <strong>${stats.duplicateTabCount}</strong>
              <span>待整理副本</span>
            </div>
          ` : ''}
        </div>
      </header>

      <!-- 工具与过滤检索带 (Editorial Toolbar) -->
      <nav class="vb-toolbar">
        <div class="vb-search-box">
          <span style="color: var(--ink-muted); display: flex;">${icons.search}</span>
          <input 
            type="text" 
            class="vb-search-input" 
            id="vbSearchInput"
            placeholder="在编目中索引长标题或网址... [/]" 
            value="${store.searchQuery.replace(/[&<>"\']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"})[char])}"
            autocomplete="off"
          />
        </div>

        <div class="vb-filters">
          <button class="vb-filter-pill ${store.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            全量目次 (${stats.totalTabs})
          </button>

          ${stats.duplicateTabCount > 0 ? `
            <button class="vb-filter-pill ${store.activeFilter === 'duplicates' ? 'active' : ''}" data-filter="duplicates">
              重复目次 (${stats.duplicateTabCount})
            </button>
          ` : ''}

          ${store.windows.map(win => {
            const count = store.tabs.filter(t => t.windowId === win.id).length;
            const isSelected = store.activeFilter === `win-${win.id}`;
            return `
              <button class="vb-filter-pill ${isSelected ? 'active' : ''}" data-filter="win-${win.id}">
                ${win.shortName} (${count})
              </button>
            `;
          }).join('')}
        </div>

        <button class="vb-drawer-toggle" id="vbDrawerToggleBtn">
          ${icons.bookmark}
          <span>稍后阅读 (${store.saved.length})</span>
        </button>
      </nav>

      <!-- 域名卡片网格 (Editorial Card Grid) -->
      <main class="vb-grid">
        ${groups.length === 0 ? `
          <div class="empty-state" style="grid-column: 1 / -1; background: var(--bg-canvas); border-radius: var(--radius-sm); border: 1px dashed var(--border-base);">
            <div class="empty-state-title">未索引到匹配条目</div>
            <p>请尝试重置搜索词或过滤选项</p>
          </div>
        ` : groups.map(g => {
          const isExpanded = store.collapsedGroups.has(g.domain);
          const limit = 3;
          const hasOverflow = g.tabs.length > limit;
          const visibleTabs = (hasOverflow && !isExpanded) ? g.tabs.slice(0, limit) : g.tabs;
          const overflowCount = g.tabs.length - limit;

          return `
            <article class="vb-domain-card" id="card-${g.domain}">
              <header class="vb-card-masthead">
                <div class="vb-card-domain">
                  <span style="display:flex; opacity: 0.85;">${getDomainIcon(g.domain)}</span>
                  <span>${g.domain}</span>
                  <span class="badge-count">${g.tabs.length}</span>
                  ${g.hasDuplicates ? `<span class="badge badge-dupe">含副本</span>` : ''}
                </div>

                <div class="vb-card-actions">
                  <button class="vb-card-close-btn" data-close-group="${g.domain}" title="关闭该域名下全部条目">
                    关闭组
                  </button>
                </div>
              </header>

              <div class="vb-card-entries">
                ${visibleTabs.map(tab => {
                  const isDupe = dupes.has(tab.url);
                  const isSelected = store.selectedTabId === tab.id;
                  const winObj = store.windows.find(w => w.id === tab.windowId);
                  return `
                    <div 
                      class="vb-entry-row ${isSelected ? 'selected' : ''}" 
                      data-tab-id="${tab.id}"
                      tabindex="0"
                    >
                      <div class="vb-entry-header">
                        <span class="vb-entry-title" title="${tab.title}">${tab.title}</span>

                        <div class="vb-entry-actions" onclick="event.stopPropagation()">
                          <button class="va-action-btn btn-save" data-save-tab="${tab.id}" title="存为稍后阅读">
                            ${icons.bookmark}
                          </button>
                          <button class="va-action-btn btn-close" data-close-tab="${tab.id}" title="关闭标签">
                            ${icons.close}
                          </button>
                        </div>
                      </div>

                      <div class="vb-entry-meta">
                        <span class="badge-win">${winObj?.shortName || 'W' + tab.windowId}</span>
                        <span class="vb-entry-url" title="${tab.url}">${tab.url}</span>
                        ${isDupe ? `
                          <span class="badge badge-dupe" data-close-dupe="${encodeURIComponent(tab.url)}" title="仅保留1份">2x 重复</span>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              ${hasOverflow ? `
                <button class="vb-overflow-btn" data-toggle-overflow="${g.domain}">
                  ${!isExpanded ? `+ 展开剩余 ${overflowCount} 个目次条目` : `收起超限目次`}
                </button>
              ` : ''}
            </article>
          `;
        }).join('')}
      </main>

      <!-- 侧滑抽屉：稍后阅读与归档 (Slide Drawer) -->
      <div class="vb-drawer-overlay ${store.drawerOpen ? 'open' : ''}" id="vbDrawerOverlay"></div>
      <aside class="vb-drawer ${store.drawerOpen ? 'open' : ''}" id="vbDrawer">
        <header class="vb-drawer-header">
          <div class="vb-drawer-title">纸上藏书阁 · 稍后阅读</div>
          <button class="switcher-btn" id="vbCloseDrawerBtn">
            ${icons.close}
          </button>
        </header>

        <div class="vb-drawer-body">
          <section>
            <div style="font-size: 11.5px; font-weight: 600; color: var(--ink-muted); text-transform: uppercase; margin-bottom: 8px;">
              待阅读清单 (${store.saved.length})
            </div>

            <div class="va-saved-list">
              ${store.saved.length === 0 ? `
                <div style="color: var(--ink-muted); font-size: 12px; padding: 12px 0;">空空如也，随时收藏标签至此</div>
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
                <div style="color: var(--ink-muted); font-size: 12px; padding: 12px 0;">暂无归档记录</div>
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
  bindVariantBEvents(container);
}

function bindVariantBEvents(container) {
  // Search Input
  const searchInput = container.querySelector('#vbSearchInput');
  searchInput?.addEventListener('input', (e) => {
    store.setSearchQuery(e.target.value);
  });

  // Filter Pills
  container.querySelectorAll('.vb-filter-pill[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const f = e.currentTarget.getAttribute('data-filter');
      store.setActiveFilter(f);
    });
  });

  // Drawer Toggle
  container.querySelector('#vbDrawerToggleBtn')?.addEventListener('click', () => {
    store.setDrawerOpen(true);
  });
  container.querySelector('#vbCloseDrawerBtn')?.addEventListener('click', () => {
    store.setDrawerOpen(false);
  });
  container.querySelector('#vbDrawerOverlay')?.addEventListener('click', () => {
    store.setDrawerOpen(false);
  });

  // Toggle Overflow accordion
  container.querySelectorAll('[data-toggle-overflow]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dom = e.currentTarget.getAttribute('data-toggle-overflow');
      store.toggleGroupCollapse(dom);
    });
  });

  // Close Group
  container.querySelectorAll('[data-close-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dom = e.currentTarget.getAttribute('data-close-group');
      store.closeGroup(dom);
      window.showToast?.(`已关闭域名「${dom}」下的所有目次条目`);
    });
  });

  // Entry Selection & Double-click
  container.querySelectorAll('.vb-entry-row[data-tab-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-tab-id');
      store.selectTab(id);
    });
    row.addEventListener('dblclick', (e) => {
      const id = e.currentTarget.getAttribute('data-tab-id');
      const t = store.tabs.find(tab => tab.id === id);
      window.showToast?.(`演示反馈：已模拟翻阅至「${t?.title || '页面'}」`);
    });
  });

  // Close Tab
  container.querySelectorAll('[data-close-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-close-tab');
      store.closeTab(id);
      window.showToast?.('已移除该索引条目');
    });
  });

  // Save Tab
  container.querySelectorAll('[data-save-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-save-tab');
      store.saveTab(id);
      window.showToast?.('已收录入「稍后阅读」');
    });
  });

  // Close Duplicates
  container.querySelectorAll('[data-close-dupe]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = decodeURIComponent(e.currentTarget.getAttribute('data-close-dupe'));
      store.closeDuplicates(url);
      window.showToast?.('已归并重复目次，仅保留首个条目');
    });
  });

  // Drawer actions
  container.querySelectorAll('[data-remove-saved]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-remove-saved');
      store.removeSavedTab(id);
      window.showToast?.('已自稍后阅读移除');
    });
  });

  container.querySelectorAll('[data-archive-saved]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-archive-saved');
      store.archiveSavedTab(id);
      window.showToast?.('已归档至历史记录');
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
