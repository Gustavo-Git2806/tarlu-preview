// Node built-in test runner — no npm install needed.
// Run:  node --test tests/store.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// --- Fake browser environment for the module ---
class FakeStorage {
    constructor() { this.data = {}; }
    getItem(k) { return this.data[k] != null ? this.data[k] : null; }
    setItem(k, v) { this.data[k] = String(v); }
    removeItem(k) { delete this.data[k]; }
    clear() { this.data = {}; }
}
function newCtx() {
    const ctx = {
        window: {},
        localStorage: new FakeStorage(),
        sessionStorage: new FakeStorage(),
        Date, JSON, Object, Array
    };
    vm.createContext(ctx);
    const src = fs.readFileSync(path.join(__dirname, '..', 'admin', 'assets', 'js', 'store.js'), 'utf8');
    vm.runInContext(src, ctx);
    return ctx;
}

test('importJson: rejects missing schema', () => {
    const { window: { TarluStore } } = newCtx();
    assert.throws(() => TarluStore.importJson('{"edits": {}}'), /schema/);
});

test('importJson: rejects malformed JSON', () => {
    const { window: { TarluStore } } = newCtx();
    assert.throws(() => TarluStore.importJson('not-json'), /Invalid JSON/);
});

test('importJson: accepts a legit payload', () => {
    const { window: { TarluStore } } = newCtx();
    const result = TarluStore.importJson(JSON.stringify({
        schema: 'tarlu-edits-v1',
        edits: { index: { 'hero.title': 'Hello' } }
    }));
    assert.equal(JSON.stringify(result), JSON.stringify({ index: { 'hero.title': 'Hello' } }));
});

test('importJson: drops non-string values', () => {
    const { window: { TarluStore } } = newCtx();
    const result = TarluStore.importJson(JSON.stringify({
        schema: 'tarlu-edits-v1',
        edits: { index: { 'hero.title': { evil: true } } }
    }));
    assert.equal(JSON.stringify(result), JSON.stringify({}));
});

test('importJson: blocks prototype pollution', () => {
    const { window: { TarluStore } } = newCtx();
    TarluStore.importJson(JSON.stringify({
        schema: 'tarlu-edits-v1',
        edits: { '__proto__': { polluted: 'yes' } }
    }));
    assert.equal({}.polluted, undefined, 'Object prototype should not have been polluted');
});

test('importJson: rejects unsafe slugs and keys', () => {
    const { window: { TarluStore } } = newCtx();
    const result = TarluStore.importJson(JSON.stringify({
        schema: 'tarlu-edits-v1',
        edits: {
            '../etc/passwd':      { k: 'v' },
            '<script>':           { k: 'v' },
            'valid-slug':         { '<img>': 'x', 'valid.key': 'ok' }
        }
    }));
    assert.equal(JSON.stringify(result), JSON.stringify({ 'valid-slug': { 'valid.key': 'ok' } }));
});

test('importJson: truncates over-long values', () => {
    const { window: { TarluStore } } = newCtx();
    const long = 'x'.repeat(5000);
    const result = TarluStore.importJson(JSON.stringify({
        schema: 'tarlu-edits-v1',
        edits: { index: { 'hero.title': long } }
    }));
    assert.equal(result.index['hero.title'].length, 4000);
});

test('setField / getField / clearPage round-trip', () => {
    const { window: { TarluStore } } = newCtx();
    TarluStore.setField('index', 'hero.title', 'Hello');
    assert.equal(TarluStore.getField('index', 'hero.title'), 'Hello');
    TarluStore.clearPage('index');
    assert.equal(TarluStore.getField('index', 'hero.title'), null);
});

test('editStats counts pages and fields', () => {
    const { window: { TarluStore } } = newCtx();
    TarluStore.setField('index', 'hero.title', 'a');
    TarluStore.setField('index', 'hero.lead', 'b');
    TarluStore.setField('contact', 'hero.title', 'c');
    const stats = TarluStore.editStats();
    assert.equal(stats.pages, 2);
    assert.equal(stats.fields, 3);
});

test('exportJson produces valid schema output', () => {
    const { window: { TarluStore } } = newCtx();
    TarluStore.setField('index', 'hero.title', 'a');
    const parsed = JSON.parse(TarluStore.exportJson());
    assert.equal(parsed.schema, 'tarlu-edits-v1');
    assert.equal(JSON.stringify(parsed.edits), JSON.stringify({ index: { 'hero.title': 'a' } }));
    assert.ok(parsed.exported_at);
});
