/**
 * Tab Out UI Prototype - Mock Dataset
 *
 * 包含约24个标签、7个域名、3个窗口、中文长标题、重复项、稍后阅读与归档。
 * 纯内存虚拟数据，不连接真实Chrome API或LocalStorage。
 */

export const INITIAL_WINDOWS = [
  { id: 1, title: '窗口 1 · 核心工程研发', shortName: '研发' },
  { id: 2, title: '窗口 2 · 方案协同与设计', shortName: '设计' },
  { id: 3, title: '窗口 3 · 架构调研与参考', shortName: '资料' }
];

export const INITIAL_TABS = [
  // --- 窗口 1: 核心工程研发 (Window 1) ---
  {
    id: 'tab-101',
    windowId: 1,
    title: 'Tab Out 仪表盘前端工程 (Vite + React 19 热重载面板)',
    url: 'http://localhost:3000/dashboard',
    domain: 'localhost:3000',
    favIconUrl: '',
    pinned: true,
    active: true,
    timeAgo: '刚刚'
  },
  {
    id: 'tab-102',
    windowId: 1,
    title: 'Tab Out 仪表盘前端工程 (Vite + React 19 热重载面板)',
    url: 'http://localhost:3000/dashboard',
    domain: 'localhost:3000',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '12分钟前'
  },
  {
    id: 'tab-103',
    windowId: 1,
    title: '微服务聚合网关 API 文档与联调测试控制台 (Swagger UI)',
    url: 'http://localhost:8080/swagger-ui/index.html',
    domain: 'localhost:8080',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '28分钟前'
  },
  {
    id: 'tab-104',
    windowId: 1,
    title: 'Design System Storybook 基础组件库交互规范预览',
    url: 'http://localhost:6006/?path=/story/components-tablist',
    domain: 'localhost:6006',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '45分钟前'
  },
  {
    id: 'tab-105',
    windowId: 1,
    title: 'PR #28901: Optimize concurrent scheduler queue and fiber reconciliation',
    url: 'https://github.com/facebook/react/pull/28901',
    domain: 'github.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '1小时前'
  },
  {
    id: 'tab-106',
    windowId: 1,
    title: 'PR #28901: Optimize concurrent scheduler queue and fiber reconciliation',
    url: 'https://github.com/facebook/react/pull/28901',
    domain: 'github.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '1小时前'
  },
  {
    id: 'tab-107',
    windowId: 1,
    title: 'Issue #42: 标签页过多时内存占用与高密度排版体验改进建议',
    url: 'https://github.com/zarazhangrui/tab-out/issues/42',
    domain: 'github.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '2小时前'
  },
  {
    id: 'tab-108',
    windowId: 1,
    title: 'TypeScript 5.8 发布说明与新语法特性拆解指南',
    url: 'https://github.com/microsoft/typescript/releases/tag/v5.8.0',
    domain: 'github.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '3小时前'
  },
  {
    id: 'tab-109',
    windowId: 1,
    title: 'Web Locks API 浏览器多标签页资源锁与状态同步方案 - Web API | MDN',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Locks_API',
    domain: 'developer.mozilla.org',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '3小时前'
  },

  // --- 窗口 2: 方案协同与设计 (Window 2) ---
  {
    id: 'tab-201',
    windowId: 2,
    title: '飞书文档 - Q2 全球产品体验重构设计方案与核心业务指标评审纪要 (v3.2)',
    url: 'https://feishu.cn/docx/doxcn987654321',
    domain: 'feishu.cn',
    favIconUrl: '',
    pinned: true,
    active: false,
    timeAgo: '20分钟前'
  },
  {
    id: 'tab-202',
    windowId: 2,
    title: '飞书文档 - Q2 全球产品体验重构设计方案与核心业务指标评审纪要 (v3.2)',
    url: 'https://feishu.cn/docx/doxcn987654321',
    domain: 'feishu.cn',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '35分钟前'
  },
  {
    id: 'tab-203',
    windowId: 2,
    title: '飞书多维表格 - 2026 敏捷开发冲刺任务排期与缺陷跟踪看板',
    url: 'https://feishu.cn/base/bascn12345678',
    domain: 'feishu.cn',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '1小时前'
  },
  {
    id: 'tab-204',
    windowId: 2,
    title: '产品体验升级项目资产库与各终端设计规范输出归档 - 云空间',
    url: 'https://feishu.cn/drive/folder/fldcn556677',
    domain: 'feishu.cn',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '2小时前'
  },
  {
    id: 'tab-205',
    windowId: 2,
    title: 'Figma - [Design System 2026] Core Components & Tokens spec',
    url: 'https://www.figma.com/file/F92841/Core-Design-System',
    domain: 'figma.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '40分钟前'
  },
  {
    id: 'tab-206',
    windowId: 2,
    title: 'Figma - Tab Out 全新视觉探索与高密度标签流走查原型',
    url: 'https://www.figma.com/file/F92842/New-Tab-Manager-V2',
    domain: 'figma.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '1小时前'
  },
  {
    id: 'tab-207',
    windowId: 2,
    title: 'Figma - 全局快捷指令与键盘导航微交互动效规范',
    url: 'https://www.figma.com/file/F92843/App-Flow-Diagram',
    domain: 'figma.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '2小时前'
  },
  {
    id: 'tab-208',
    windowId: 2,
    title: 'CSS 容器查询（Container Queries）高密度卡片自适应最佳实践 - MDN',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Container_Queries',
    domain: 'developer.mozilla.org',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '4小时前'
  },

  // --- 窗口 3: 架构调研与参考 (Window 3) ---
  {
    id: 'tab-301',
    windowId: 3,
    title: 'Service Worker API 生命周期管理与离线缓存策略深度指南 - MDN',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API',
    domain: 'developer.mozilla.org',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '1小时前'
  },
  {
    id: 'tab-302',
    windowId: 3,
    title: '【技术选型】2026年现代前端构建与微前端架构演进深度剖析 - 知乎专栏',
    url: 'https://www.zhihu.com/question/584920194',
    domain: 'zhihu.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '2小时前'
  },
  {
    id: 'tab-303',
    windowId: 3,
    title: '【技术选型】2026年现代前端构建与微前端架构演进深度剖析 - 知乎专栏',
    url: 'https://www.zhihu.com/question/584920194',
    domain: 'zhihu.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '2小时前'
  },
  {
    id: 'tab-304',
    windowId: 3,
    title: '如何设计一个优雅且克制的高信息密度产品界面？ - 专栏精选',
    url: 'https://zhuanlan.zhihu.com/p/8923019',
    domain: 'zhihu.com',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '3小时前'
  },
  {
    id: 'tab-305',
    windowId: 3,
    title: '关于跨终端统一渲染引擎性能优化实践与内存泄漏排查总结 - 掘金',
    url: 'https://juejin.cn/post/734567890123',
    domain: 'juejin.cn',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '1小时前'
  },
  {
    id: 'tab-306',
    windowId: 3,
    title: '从 0 到 1 打造现代化浏览器扩展：MV3 架构下的状态同步技巧',
    url: 'https://juejin.cn/post/734567890456',
    domain: 'juejin.cn',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '2小时前'
  },
  {
    id: 'tab-307',
    windowId: 3,
    title: '大规模多任务标签管理产品的交互设计推演与心智模型构建',
    url: 'https://juejin.cn/post/734567890789',
    domain: 'juejin.cn',
    favIconUrl: '',
    pinned: false,
    active: false,
    timeAgo: '5小时前'
  }
];

export const INITIAL_SAVED = [
  {
    id: 'saved-1',
    title: 'W3C: Web Applications Architecture Draft 2026',
    url: 'https://www.w3.org/TR/webapps-core-2026',
    domain: 'w3.org',
    savedAt: '昨天 19:40'
  },
  {
    id: 'saved-2',
    title: 'React Server Components 进阶指南与渲染流水线拆解',
    url: 'https://react.dev/reference/rsc-deep-dive',
    domain: 'react.dev',
    savedAt: '前天 14:22'
  },
  {
    id: 'saved-3',
    title: '现代浏览器多进程架构与标签页资源调度剖析 - Chromium Design Docs',
    url: 'https://chromium.googlesource.com/specs/multi-process-architecture',
    domain: 'chromium.googlesource.com',
    savedAt: '4月11日'
  }
];

export const INITIAL_ARCHIVE = [
  {
    id: 'arch-1',
    title: 'Chrome 扩展 Manifest V3 迁移指南与踩坑避坑清单',
    url: 'https://developer.chrome.com/docs/extensions/mv3/intro',
    domain: 'developer.chrome.com',
    archivedAt: '4月08日'
  },
  {
    id: 'arch-2',
    title: 'TypeScript 5.7 性能回归测试报告与 Benchmark 分析',
    url: 'https://github.com/microsoft/typescript/issues/57812',
    domain: 'github.com',
    archivedAt: '4月05日'
  }
];

export function getInitialData() {
  return {
    windows: JSON.parse(JSON.stringify(INITIAL_WINDOWS)),
    tabs: JSON.parse(JSON.stringify(INITIAL_TABS)),
    saved: JSON.parse(JSON.stringify(INITIAL_SAVED)),
    archive: JSON.parse(JSON.stringify(INITIAL_ARCHIVE))
  };
}
