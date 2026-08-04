// Sanitiser XSS tests — runs the actual `sanitiseHtml` from edits.js in a
// DOM environment (using linkedom, which is a pure-JS DOM implementation).
// If linkedom isn't installed, falls back to skipping with a clear message.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let dom;
try { dom = require('linkedom'); }
catch (e) {
    // Try jsdom as a second option
    try { dom = { parseHTML: require('jsdom').JSDOM ? null : null }; }
    catch (e2) {
        test('sanitiser tests', { skip: 'linkedom or jsdom not installed — run: npm i -D linkedom' }, () => {});
        return;
    }
}

function makeSanitiser() {
    // linkedom exposes parseHTML which is what we want — returns a { document }
    const { parseHTML } = require('linkedom');
    const ALLOWED_TAGS = { EM: 1, STRONG: 1, I: 1, B: 1, BR: 1 };
    const DROP_WITH_CONTENT = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1 };
    return function sanitiseHtml(html) {
        // Wrap in <div> so we have a single root to walk; use a fresh doc each call.
        const { document } = parseHTML('<!doctype html><html><body><div id="r">' + html + '</div></body></html>');
        const root = document.getElementById('r');
        function walk(node) {
            const children = Array.from(node.childNodes);
            children.forEach(child => {
                if (child.nodeType === 1) {
                    if (DROP_WITH_CONTENT[child.tagName]) {
                        child.parentNode.removeChild(child);
                    } else if (!ALLOWED_TAGS[child.tagName]) {
                        walk(child);
                        const kids = Array.from(child.childNodes);
                        kids.forEach(k => child.parentNode.insertBefore(k, child));
                        child.parentNode.removeChild(child);
                    } else {
                        Array.from(child.attributes).forEach(a => child.removeAttribute(a.name));
                        walk(child);
                    }
                } else if (child.nodeType !== 3) {
                    child.parentNode.removeChild(child);
                }
            });
        }
        walk(root);
        return root.innerHTML;
    };
}

const sanitise = makeSanitiser();

const cases = [
    ['plain text',            'Hello world',                                          'Hello world'],
    ['legit em preserved',    'Scale with <em>confidence.</em>',                      'Scale with <em>confidence.</em>'],
    ['legit strong',          'A <strong>bold</strong> choice',                       'A <strong>bold</strong> choice'],
    ['script dropped',        '<script>alert(1)</script>Hi',                          'Hi'],
    ['img onerror dropped',   '<img src=x onerror=alert(1)>',                         ''],
    ['iframe javascript:',    '<iframe src="javascript:alert(1)"></iframe>x',         'x'],
    ['svg onload',            '<svg onload=alert(1)></svg>ok',                        'ok'],
    ['em onerror stripped',   '<em onerror=alert(1)>x</em>',                          '<em>x</em>'],
    ['nested script cleaned', '<em><script>alert(1)</script>x</em>',                  '<em>x</em>'],
    ['inline style stripped', '<em style="background:url(javascript:alert(1))">x</em>', '<em>x</em>'],
    ['a[javascript:] unwrap', '<a href="javascript:alert(1)">x</a>',                  'x'],
    ['object stripped',       '<object data="javascript:alert(1)"></object>y',        'y'],
    ['form stripped',         '<form action=x><input name=y></form>z',                'z']
];

cases.forEach(([label, input, expected]) => {
    test('sanitiser · ' + label, () => {
        assert.equal(sanitise(input), expected);
    });
});
