/**
 * Tab Out UI Prototype - Variant A: 静谧工作台 (Serene Workbench)
 * 
 * 布局特色：
 * 1. 三栏工作台架构（侧边分组导航 + 紧凑标签工作流 + 详情与稍后阅读检视器）
 * 2. 沉静工整，极高信息密度，极其适合工程研发与多任务并行分拣
 * 3. 标签行高紧凑（38px），具备独立域名折叠、行级快捷操作、选中高亮与全量元信息检视
 */

import { store } from './state.js';
import { icons, getDomainIcon } from './icons.js';

export function renderVariantA(container) {
  const stats = store.getStats();
  const dupes = store.getDuplicateUrls();
  const groups = store.getGroupedByDomain();
  const selectedTab = store.tabs.find(t => t.id === store.selectedTabId) || store.tabs[0] || null;

  container.innerHTML = `
    <div class="variant-a-layout">
      <!-- 栏目 1: 左侧分组与工作区导航 -->
      <aside class="va-sidebar">
        <div class="va-brand">
          <div class="va-brand-title">
            ${icons.grid}
            <span>Tab Out</span>
          </div>
          <span class="va-brand-tag">工作台 A</span>
        </div>

        <div class="va-sidebar-body">
          <!-- 快捷过滤 -->
          <div class="va-nav-section">
            <div class="va-nav-section-title">视图过滤</div>
            <div class="va-nav-list">
              <button class="va-nav-item ${store.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
                <div class="va-nav-item-left">
                  ${icons.list}
                  <span>全部活动标签</span>
                </div>
                <span class="badge-count">${stats.totalTabs}</span>
              </button>

              ${stats.duplicateTabCount > 0 ? `
                <button class="va-nav-item ${store.activeFilter === 'duplicates' ? 'active' : ''}" data-filter="duplicates">
                  <div class="va-nav-item-left" style="color: var(--amber-base);">
                    ${icons.duplicate}
                    <span>重复标签项</span>
                  </div>
                  <span class="badge badge-dupe">${stats.duplicateTabCount}</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- 窗口导航 -->
          <div class="va-nav-section">
            <div class="va-nav-section-title">浏览器窗口</div>
            <div class="va-nav-list">
              ${store.windows.map(win => {
                const count = store.tabs.filter(t => t.windowId === win.id).length;
                const isSelected = store.activeFilter === `win-${win.id}`;
                return `
                  <button class="va-nav-item ${isSelected ? 'active' : ''}" data-filter="win-${win.id}">
                    <div class="va-nav-item-left">
                      ${icons.window}
                      <span>${win.title}</span>
                    </div>
                    <span class="badge-count">${count}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 域名分组树 -->
          <div class="va-nav-section">
            <div class="va-nav-section-title">活跃域名 (${groups.length})</div>
            <div class="va-nav-list">
              ${groups.map(g => `
                <button class="va-nav-item" data-jump-domain="${g.domain}">
                  <div class="va-nav-item-left">
                    <span style="opacity: 0.8;">${getDomainIcon(g.domain)}</span>
                    <span>${g.domain}</span>
                  </div>
                  <span class="badge-count">${g.tabs.length}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 侧栏底部批处理 -->
        <div class="va-sidebar-footer">
          ${stats.duplicateTabCount > 0 ? `
            <button class="va-clean-btn" id="vaCleanDupesBtn">
              ${icons.duplicate}
              <span>清理多余副本 (${stats.duplicateExtraCount})</span>
            </button>
          ` : ''}
        </div>
      </aside>

      <!-- 栏目 2: 中间标签工作流 -->
      <main class="va-stream">
        <header class="va-stream-header">
          <div class="va-search-bar">
            <span class="va-search-icon">${icons.search}</span>
            <input 
              type="text" 
              class="va-search-input" 
              id="vaSearchInput"
              placeholder="搜索标签标题、网址或域名... [/]" 
              value="${store.searchQuery.replace(/[&<>"\']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"})[char])}"
              autocomplete="off"
            />
            <span class="va-search-kbd">/</span>
          </div>

          <div class="va-stream-stats">
            <span>当前显示 <strong>${stats.filteredCount}</strong> 项</span>
            ${store.activeFilter !== 'all' ? `
              <button class="badge" id="vaResetFilterBtn" style="cursor: pointer; background: var(--bg-surface-subtle);">
                清除过滤 ×
              </button>
            ` : ''}
          </div>
        </header>

        <div class="va-stream-body" id="vaStreamBody">
          ${groups.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-title">未找到匹配的标签</div>
              <p>尝试更换关键词或清除筛选条件</p>
            </div>
          ` : groups.map(g => {
            const isCollapsed = store.collapsedGroups.has(g.domain);
            return `
              <div class="va-group-card" id="group-${g.domain}">
                <div class="va-group-header" data-toggle-group="${g.domain}">
                  <div class="va-group-title">
                    <span style="display:flex; color: var(--ink-muted);">
                      ${isCollapsed ? icons.chevronRight : icons.chevronDown}
                    </span>
                    <span style="display:flex;">${getDomainIcon(g.domain)}</span>
                    <span>${g.domain}</span>
                    <span class="badge-count">${g.tabs.length}</span>
                    ${g.hasDuplicates ? `<span class="badge badge-dupe">有重复</span>` : ''}
                  </div>

                  <div class="va-group-actions" onclick="event.stopPropagation()">
                    <button class="va-group-btn" data-close-group="${g.domain}" title="关闭该域名下所有标签">
                      关闭本组 (${g.tabs.length})
                    </button>
                  </div>
                </div>

                ${!isCollapsed ? `
                  <div class="va-tab-list">
                    ${g.tabs.map(tab => {
                      const isDupe = dupes.has(tab.url);
                      const isSelected = selectedTab && selectedTab.id === tab.id;
                      const winObj = store.windows.find(w => w.id === tab.windowId);
                      return `
                        <div 
                          class="va-tab-row ${isSelected ? 'selected' : ''}" 
                          data-tab-id="${tab.id}"
                          tabindex="0"
                        >
                          <div class="va-tab-icon">
                            ${getDomainIcon(tab.domain)}
                          </div>

                          <div class="va-tab-main">
                            <span class="va-tab-title" title="${tab.title}">${tab.title}</span>
                            <span class="va-tab-path" title="${tab.url}">${tab.url.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                          </div>

                          <div class="va-tab-meta">
                            ${isDupe ? `<span class="badge badge-dupe" data-close-dupe="${encodeURIComponent(tab.url)}" title="点击仅保留1份">2x 重复</span>` : ''}
                            <span class="badge badge-win" title="${winObj?.title || ''}">W${tab.windowId}</span>
                          </div>

                          <div class="va-tab-actions" onclick="event.stopPropagation()">
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
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </main>

      <!-- 栏目 3: 右侧详情与稍后阅读检视器 -->
      <aside class="va-inspector">
        <!-- 选中标签详情 -->
        <div class="va-inspector-section">
          <div class="va-inspector-header">
            <span>标签检视 (Inspector)</span>
            <span style="font-size: 11px; font-weight: normal; color: var(--ink-muted);">Enter 模拟跳转</span>
          </div>

          ${selectedTab ? `
            <div class="va-detail-card">
              <div class="va-detail-title">${selectedTab.title}</div>
              <div class="va-detail-url">${selectedTab.url}</div>

              <div class="va-detail-props">
                <span class="va-prop-label">所属窗口</span>
                <span class="va-prop-value">${store.windows.find(w => w.id === selectedTab.windowId)?.title || '默认窗口'}</span>

                <span class="va-prop-label">所属域名</span>
                <span class="va-prop-value">${selectedTab.domain}</span>

                <span class="va-prop-label">重复状态</span>
                <span class="va-prop-value">
                  ${dupes.has(selectedTab.url) ? '<strong style="color: var(--amber-base);">存在重复副本</strong>' : '唯一实例'}
                </span>

                <span class="va-prop-label">活跃时间</span>
                <span class="va-prop-value">${selectedTab.timeAgo}</span>
              </div>

              <div class="va-detail-actions">
                <button class="va-btn-primary" id="vaSimulateJumpBtn">
                  ${icons.external}
                  <span>模拟跳转标签</span>
                </button>
                <button class="switcher-btn" style="border: 1px solid var(--border-base);" id="vaInspectSaveBtn" title="保存">
                  ${icons.bookmark}
                </button>
                <button class="switcher-btn" style="border: 1px solid var(--border-base); color: var(--rose-base);" id="vaInspectCloseBtn" title="关闭">
                  ${icons.trash}
                </button>
              </div>
            </div>
          ` : `
            <div style="color: var(--ink-muted); font-size: 12px; padding: 20px 0; text-align: center;">
              未选择标签
            </div>
          `}
        </div>

        <!-- 稍后阅读清单 -->
        <div class="va-inspector-section" style="flex: 1;">
          <div class="va-inspector-header">
            <span>稍后阅读 (${store.saved.length})</span>
            <span style="font-size: 10.5px; color: var(--ink-muted);">暂存列表</span>
          </div>

          <div class="va-saved-list">
            ${store.saved.length === 0 ? `
              <div style="font-size: 12px; color: var(--ink-muted); text-align: center; padding: 16px 0;">
                暂无稍后阅读条目
              </div>
            ` : store.saved.map(item => `
              <div class="va-saved-item">
                <div class="va-saved-top">
                  <span class="va-saved-title">${item.title}</span>
                  <div class="va-saved-actions">
                    <button class="va-action-btn" data-archive-saved="${item.id}" title="归档此条目">
                      ${icons.archive}
                    </button>
                    <button class="va-action-btn" data-remove-saved="${item.id}" title="从稍后阅读删除">
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
        </div>

        <!-- 归档历史折叠 -->
        <div class="va-inspector-section">
          <div class="va-inspector-header" style="margin-bottom: 0;">
            <span>归档记录 (${store.archive.length})</span>
            <button class="switcher-btn" id="vaToggleArchiveBtn" style="font-size: 11px; padding: 2px 6px;">
              ${store.drawerOpen ? '收起' : '展开'}
            </button>
          </div>

          ${store.drawerOpen ? `
            <div class="va-archive-body">
              ${store.archive.length === 0 ? `
                <div style="font-size: 11.5px; color: var(--ink-muted); padding: 8px 0;">无归档条目</div>
              ` : store.archive.map(arch => `
                <div class="va-saved-item" style="opacity: 0.85;">
                  <div class="va-saved-top">
                    <span class="va-saved-title" style="font-size: 11.5px;">${arch.title}</span>
                    <button class="va-action-btn" data-restore-archive="${arch.id}" title="恢复至稍后阅读">
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
          ` : ''}
        </div>
      </aside>
    </div>
  `;

  // Bind interactive events
  bindVariantAEvents(container, selectedTab);
}

function bindVariantAEvents(container, selectedTab) {
  // Search Input
  const searchInput = container.querySelector('#vaSearchInput');
  searchInput?.addEventListener('input', (e) => {
    store.setSearchQuery(e.target.value);
  });

  // Filter Buttons
  container.querySelectorAll('.va-nav-item[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const f = e.currentTarget.getAttribute('data-filter');
      store.setActiveFilter(f);
    });
  });

  // Reset Filter
  container.querySelector('#vaResetFilterBtn')?.addEventListener('click', () => {
    store.setActiveFilter('all');
    store.setSearchQuery('');
  });

  // Clean Dupes
  container.querySelector('#vaCleanDupesBtn')?.addEventListener('click', () => {
    store.closeAllDuplicates();
    window.showToast?.('已清理所有多余重复标签，各保留 1 份');
  });

  // Jump Domain
  container.querySelectorAll('[data-jump-domain]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dom = e.currentTarget.getAttribute('data-jump-domain');
      const target = container.querySelector(`#group-${dom}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Toggle Group Collapse
  container.querySelectorAll('[data-toggle-group]').forEach(header => {
    header.addEventListener('click', (e) => {
      const dom = e.currentTarget.getAttribute('data-toggle-group');
      store.toggleGroupCollapse(dom);
    });
  });

  // Close Group
  container.querySelectorAll('[data-close-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dom = e.currentTarget.getAttribute('data-close-group');
      store.closeGroup(dom);
      window.showToast?.(`已关闭域名 ${dom} 下的所有标签`);
    });
  });

  // Row selection
  container.querySelectorAll('.va-tab-row[data-tab-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-tab-id');
      store.selectTab(id);
    });
    row.addEventListener('dblclick', (e) => {
      const id = e.currentTarget.getAttribute('data-tab-id');
      const t = store.tabs.find(tab => tab.id === id);
      window.showToast?.(`演示反馈：已模拟跳转至「${t?.title || '页面'}」`);
    });
  });

  // Close Tab
  container.querySelectorAll('[data-close-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-close-tab');
      store.closeTab(id);
      window.showToast?.('已关闭标签页');
    });
  });

  // Save Tab
  container.querySelectorAll('[data-save-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-save-tab');
      store.saveTab(id);
      window.showToast?.('已将标签存为稍后阅读');
    });
  });

  // Close Duplicates from badge
  container.querySelectorAll('[data-close-dupe]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = decodeURIComponent(e.currentTarget.getAttribute('data-close-dupe'));
      store.closeDuplicates(url);
      window.showToast?.('已保留首个实例并关闭重复标签');
    });
  });

  // Inspector actions
  container.querySelector('#vaSimulateJumpBtn')?.addEventListener('click', () => {
    if (selectedTab) {
      window.showToast?.(`演示反馈：已模拟跳转至「${selectedTab.title}」`);
    }
  });

  container.querySelector('#vaInspectSaveBtn')?.addEventListener('click', () => {
    if (selectedTab) {
      store.saveTab(selectedTab.id);
      window.showToast?.('已将标签存入稍后阅读');
    }
  });

  container.querySelector('#vaInspectCloseBtn')?.addEventListener('click', () => {
    if (selectedTab) {
      store.closeTab(selectedTab.id);
      window.showToast?.('已关闭当前标签');
    }
  });

  // Saved actions
  container.querySelectorAll('[data-remove-saved]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-remove-saved');
      store.removeSavedTab(id);
      window.showToast?.('已移除稍后阅读条目');
    });
  });

  container.querySelectorAll('[data-archive-saved]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-archive-saved');
      store.archiveSavedTab(id);
      window.showToast?.('已将条目移至归档记录');
    });
  });

  // Archive toggle & actions
  container.querySelector('#vaToggleArchiveBtn')?.addEventListener('click', () => {
    store.setDrawerOpen(!store.drawerOpen);
  });

  container.querySelectorAll('[data-restore-archive]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-restore-archive');
      store.restoreArchivedTab(id);
      window.showToast?.('已从归档恢复至稍后阅读');
    });
  });
}
