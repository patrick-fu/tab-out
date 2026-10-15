/**
 * Tab Out UI Prototype - Inline SVG Icons
 * Zero remote dependencies. All SVGs are inline vectors with currentColor.
 */

export const icons = {
  // Navigation & Search
  search: `<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 5 15M5 5l10 10"/></svg>`,
  bookmark: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h10a1.5 1.5 0 0 1 1.5 1.5v12.5l-6.5-4-6.5 4V5A1.5 1.5 0 0 1 5 3.5z"/></svg>`,
  bookmarkFilled: `<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3.5h10a1.5 1.5 0 0 1 1.5 1.5v12.5l-6.5-4-6.5 4V5A1.5 1.5 0 0 1 5 3.5z"/></svg>`,
  archive: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="4" rx="1"/><path d="M4 7v9a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7M8.5 11h3"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h13M7.5 5.5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M5.5 5.5v10.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V5.5M8.5 9v5M11.5 9v5"/></svg>`,
  restore: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a6 6 0 1 1 1.5 4M4 5v4h4"/></svg>`,
  external: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 3.5h4v4M8 12l8.5-8.5M16.5 10.5v5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 6 5h5"/></svg>`,
  duplicate: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="6.5" width="10" height="10" rx="1.5"/><path d="M4.5 13.5H4A1.5 1.5 0 0 1 2.5 12V4A1.5 1.5 0 0 1 4 2.5h8A1.5 1.5 0 0 1 13.5 4v.5"/></svg>`,
  window: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3.5" width="14" height="13" rx="2"/><path d="M3 7.5h14M6.5 5.5h.01M9 5.5h.01"/></svg>`,
  chevronDown: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 7.5 5 5 5-5"/></svg>`,
  chevronRight: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 5 5 5-5 5"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 10.5 4 4 7-8.5"/></svg>`,
  sparkles: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m10 2 1.8 5.2L17 9l-5.2 1.8L10 16l-1.8-5.2L3 9l5.2-1.8zM15 14l.8 2.2L18 17l-2.2.8L15 20l-.8-2.2L12 17l2.2-.8z"/></svg>`,
  reset: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10a7 7 0 1 1 2 4.9M3 15v-5h5"/></svg>`,
  sun: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M3 10h2M16 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/></svg>`,
  moon: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.3 12.8A7.5 7.5 0 1 1 7.2 2.7a6.5 6.5 0 0 0 10.1 10.1z"/></svg>`,
  command: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 6.5A2.5 2.5 0 1 0 11 9h-2a2.5 2.5 0 1 0-2.5 2.5H9v2a2.5 2.5 0 1 0 2.5-2.5h-2v-2h2a2.5 2.5 0 0 0 2-2.5z"/></svg>`,
  grid: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></svg>`,
  list: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5.5h10M7 10h10M7 14.5h10M3 5.5h.01M3 10h.01M3 14.5h.01"/></svg>`,
  shield: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5 4 5v5.5c0 4.5 3 7.5 6 8.5 3-1 6-4 6-8.5V5l-6-2.5z"/></svg>`,
  arrowLeft: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.5 15-5-5 5-5"/></svg>`,
  arrowRight: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 5 5 5-5 5"/></svg>`,

  // Domain Favicon Icons (clean SVG monograms / logos)
  domainGithub: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  domainFeishu: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c3-1 6.5-1 9.5 0M3 10.5c4.5-1.5 9-1.5 13.5 0M6 4.5c4-1 8-1 12 0M18.5 7.5l2.5 5.5-3 6.5"/></svg>`,
  domainFigma: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 2h4a4 4 0 0 1 0 8H8V2zm0 8h4a4 4 0 1 1 0 8H8v-8zm0 8h4a4 4 0 1 1-4 4v-4zm-4-8a4 4 0 0 1 4-4v8H4a4 4 0 0 1 0-8zm0-8a4 4 0 0 1 4 4H4V2z"/></svg>`,
  domainLocalhost: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M7 8l3 3-3 3M13 14h4"/></svg>`,
  domainMdn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5h4v11H3zm7-2h4v15h-4zm7 4h4v9h-4z"/></svg>`,
  domainZhihu: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 4h13v2.5h-5.2l.7 3.5h4.5v2.5h-4l1.8 7.5h-2.8L12 12.5H8.8L7.5 20H4.8l2-7.5H4v-2.5h3.3l-.7-3.5H5.5V4z"/></svg>`,
  domainJuejin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 7.5-3 2.5L12 8 6 13l-3-2.5L12 3zm0 7.5 6 5-2 1.5L12 14l-4 3-2-1.5 6-5zm0 6 3 2.5-3 2.5-3-2.5 3-2.5z"/></svg>`,
  domainDefault: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>`
};

export function getDomainIcon(domain = '') {
  const d = domain.toLowerCase();
  if (d.includes('github')) return icons.domainGithub;
  if (d.includes('feishu') || d.includes('lark')) return icons.domainFeishu;
  if (d.includes('figma')) return icons.domainFigma;
  if (d.includes('localhost') || d.includes('127.0.0.1')) return icons.domainLocalhost;
  if (d.includes('mozilla') || d.includes('mdn')) return icons.domainMdn;
  if (d.includes('zhihu')) return icons.domainZhihu;
  if (d.includes('juejin')) return icons.domainJuejin;
  return icons.domainDefault;
}
