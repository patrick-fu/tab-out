const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const app = readFileSync(join(__dirname, '../extension/app.js'), 'utf8');

for (const [hour, minute, expected] of [
  [0, 0, 'Hello, night owl'],
  [1, 0, 'Hello, night owl'],
  [4, 59, 'Hello, night owl'],
  [5, 0, 'Good morning'],
  [11, 59, 'Good morning'],
  [12, 0, 'Good afternoon'],
  [16, 59, 'Good afternoon'],
  [17, 0, 'Good evening'],
  [23, 59, 'Good evening'],
]) {
  test(`Dashboard greeting at local ${hour}:${String(minute).padStart(2, '0')}`, async () => {
    const now = new Date(2026, 9, 15, hour, minute).getTime();
    const greeting = { textContent: '' };
    const date = { textContent: '' };
    const context = vm.createContext({
      console,
      Date: class extends Date {
        constructor(...args) { super(...(args.length ? args : [now])); }
      },
      document: {
        getElementById: id => id === 'greeting' ? greeting : id === 'dateDisplay' ? date : null,
        addEventListener() {},
      },
      chrome: {
        runtime: { id: 'fixture' },
        tabs: { query: async () => [] },
        storage: { local: { get: async () => ({}), set: async () => {} } },
      },
    });

    vm.runInContext(app, context);
    await vm.runInContext('let savedTabs; renderStaticDashboard()', context);
    assert.equal(greeting.textContent, expected);
  });
}
