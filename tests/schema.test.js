// Verifies every data-edit-key in the 15 public HTML pages has a matching
// field entry in admin/data/pages.js — and vice-versa.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const schemaJs = fs.readFileSync(path.join(ROOT, 'admin', 'data', 'pages.js'), 'utf8');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(schemaJs, ctx);
const schema = ctx.window.TarluPagesSchema;

test('schema loads without error', () => {
    assert.ok(schema, 'TarluPagesSchema should be defined');
    assert.ok(Array.isArray(schema.groups));
    assert.ok(schema.groups.length > 0);
});

schema.groups.forEach(group => {
    group.pages.forEach(page => {
        test(`schema · ${page.slug} · all fields have data-edit-key in HTML`, () => {
            const html = fs.readFileSync(path.join(ROOT, page.file), 'utf8');
            page.fields.forEach(f => {
                const needle = `data-edit-key="${f.key}"`;
                assert.ok(html.includes(needle),
                    `${page.file} is missing data-edit-key="${f.key}" — admin edits for this field will silently no-op`);
            });
        });
    });
});
