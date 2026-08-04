/* Tarlu public-page override loader.
   Reads admin edits from localStorage (key: tarlu_edits_v1) and replaces the
   content of elements matching data-edit-key="<slug>.<key>" on the current page.
   Slug is inferred from the current filename.

   Security: values are user-controlled (admin can import arbitrary JSON via
   Settings → Import edits). Any element carrying data-edit-html="1" gets its
   content re-rendered from stored HTML. We DO NOT set innerHTML directly —
   we parse and rebuild, stripping every tag/attribute not on the allow-list. */
(function () {
    'use strict';

    // Allow-list mirrors the only legitimate use of data-edit-html on the site:
    // the italic/strong emphasis inside headings (e.g. "Scale with <em>confidence.</em>").
    var ALLOWED_TAGS = { EM: 1, STRONG: 1, I: 1, B: 1, BR: 1 };
    // These tags are dropped entirely — including their text children — so a
    // stripped <script> or <style> doesn't leak its body as visible text.
    var DROP_WITH_CONTENT = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1 };

    function currentSlug() {
        var path = window.location.pathname.split('/').pop() || 'index.html';
        return path.replace(/\.html$/i, '') || 'index';
    }

    function safeParse(raw, fallback) {
        if (!raw) return fallback;
        try { return JSON.parse(raw); } catch (e) { return fallback; }
    }

    // Sanitise an HTML fragment via DOMParser: strip all tags outside the
    // allow-list (children preserved), drop every attribute, and normalise.
    function sanitiseHtml(html) {
        var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
        var root = doc.body.firstChild;
        // Walk depth-first, mutating in-place.
        function walk(node) {
            var children = Array.prototype.slice.call(node.childNodes);
            children.forEach(function (child) {
                if (child.nodeType === 1 /* ELEMENT_NODE */) {
                    if (DROP_WITH_CONTENT[child.tagName]) {
                        // Drop the whole subtree — never leak its text body.
                        child.parentNode.removeChild(child);
                    } else if (!ALLOWED_TAGS[child.tagName]) {
                        // Unwrap: replace element with its (recursively cleaned) children.
                        walk(child);
                        var childNodes = Array.prototype.slice.call(child.childNodes);
                        childNodes.forEach(function (c) { child.parentNode.insertBefore(c, child); });
                        child.parentNode.removeChild(child);
                    } else {
                        // Strip every attribute on allowed tags (no href, no on*, no style).
                        Array.prototype.slice.call(child.attributes).forEach(function (attr) {
                            child.removeAttribute(attr.name);
                        });
                        walk(child);
                    }
                } else if (child.nodeType !== 3 /* !TEXT_NODE */) {
                    // Drop comments, processing instructions, CDATA, etc.
                    child.parentNode.removeChild(child);
                }
            });
        }
        walk(root);
        return root;
    }

    function apply() {
        var slug = currentSlug();
        var all = safeParse(localStorage.getItem('tarlu_edits_v1'), {});
        var pageEdits = all[slug];
        if (!pageEdits || typeof pageEdits !== 'object') return;

        Object.keys(pageEdits).forEach(function (key) {
            var value = pageEdits[key];
            if (typeof value !== 'string') return;  // Defence in depth vs. tampered stores.
            var selector = '[data-edit-key="' + key.replace(/"/g, '\\"') + '"]';
            var nodes = document.querySelectorAll(selector);
            nodes.forEach(function (node) {
                if (node.hasAttribute('data-edit-html')) {
                    // Parse + sanitise, then swap child nodes in one go.
                    var cleanRoot = sanitiseHtml(value);
                    node.replaceChildren.apply(node, Array.prototype.slice.call(cleanRoot.childNodes));
                } else {
                    node.textContent = value;
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
})();
