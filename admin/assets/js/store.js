/* Tarlu Admin — localStorage store + JSON export/import.
   Used by both the admin editor and the public-page override loader (edits.js). */
(function (root) {
    'use strict';

    var EDITS_KEY = 'tarlu_edits_v1';
    var AUTH_KEY  = 'tarlu_admin_auth_v1';
    var SETTINGS_KEY = 'tarlu_admin_settings_v1';

    function safeParse(raw, fallback) {
        if (!raw) return fallback;
        try { return JSON.parse(raw); } catch (e) { return fallback; }
    }

    var store = {
        // Edits: { "<page-slug>": { "<field-key>": "<value>" } }
        loadAll: function () {
            return safeParse(localStorage.getItem(EDITS_KEY), {});
        },
        loadPage: function (slug) {
            var all = this.loadAll();
            return all[slug] || {};
        },
        getField: function (slug, key) {
            var page = this.loadPage(slug);
            return Object.prototype.hasOwnProperty.call(page, key) ? page[key] : null;
        },
        savePage: function (slug, fields) {
            var all = this.loadAll();
            all[slug] = fields;
            localStorage.setItem(EDITS_KEY, JSON.stringify(all));
            return all;
        },
        setField: function (slug, key, value) {
            var all = this.loadAll();
            if (!all[slug]) all[slug] = {};
            all[slug][key] = value;
            localStorage.setItem(EDITS_KEY, JSON.stringify(all));
        },
        clearPage: function (slug) {
            var all = this.loadAll();
            delete all[slug];
            localStorage.setItem(EDITS_KEY, JSON.stringify(all));
        },
        clearAll: function () {
            localStorage.removeItem(EDITS_KEY);
        },
        exportJson: function () {
            var payload = {
                schema: 'tarlu-edits-v1',
                exported_at: new Date().toISOString(),
                edits: this.loadAll()
            };
            return JSON.stringify(payload, null, 2);
        },
        importJson: function (text) {
            var parsed;
            try { parsed = JSON.parse(text); } catch (e) { throw new Error('Invalid JSON.'); }
            if (!parsed || parsed.schema !== 'tarlu-edits-v1') {
                throw new Error('File is not a Tarlu edits export (missing schema tag).');
            }
            // Whitelist-based validation. Reject anything that could carry non-string
            // payloads (arrays, nested objects, prototype pollution keys) before it
            // hits localStorage — where it would later be consumed by edits.js and
            // (for html-line fields) written via innerHTML.
            var MAX_KEY_LEN   = 128;
            var MAX_SLUG_LEN  = 128;
            var MAX_VALUE_LEN = 4000;
            var SLUG_RE       = /^[a-z0-9][a-z0-9_-]*$/i;
            var KEY_RE        = /^[a-z0-9][a-z0-9._-]*$/i;
            var clean = {};
            var raw   = parsed.edits;
            if (raw !== null && raw !== undefined && (typeof raw !== 'object' || Array.isArray(raw))) {
                throw new Error('Malformed edits payload.');
            }
            for (var slug in (raw || {})) {
                if (!Object.prototype.hasOwnProperty.call(raw, slug)) continue;
                if (slug === '__proto__' || slug === 'constructor' || slug === 'prototype') continue;
                if (typeof slug !== 'string' || slug.length > MAX_SLUG_LEN || !SLUG_RE.test(slug)) continue;
                var pageEdits = raw[slug];
                if (!pageEdits || typeof pageEdits !== 'object' || Array.isArray(pageEdits)) continue;
                var pageClean = {};
                for (var k in pageEdits) {
                    if (!Object.prototype.hasOwnProperty.call(pageEdits, k)) continue;
                    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
                    if (typeof k !== 'string' || k.length > MAX_KEY_LEN || !KEY_RE.test(k)) continue;
                    var v = pageEdits[k];
                    if (typeof v !== 'string') continue;
                    if (v.length > MAX_VALUE_LEN) v = v.slice(0, MAX_VALUE_LEN);
                    pageClean[k] = v;
                }
                if (Object.keys(pageClean).length) clean[slug] = pageClean;
            }
            localStorage.setItem(EDITS_KEY, JSON.stringify(clean));
            return clean;
        },

        // Auth state
        AUTH_KEY: AUTH_KEY,
        isAuthed: function () {
            var raw = sessionStorage.getItem(AUTH_KEY);
            var obj = safeParse(raw, null);
            return !!(obj && obj.ok && (Date.now() - obj.t) < 8 * 60 * 60 * 1000);
        },
        setAuthed: function (user) {
            sessionStorage.setItem(AUTH_KEY, JSON.stringify({ ok: true, t: Date.now(), u: user || 'admin' }));
        },
        clearAuth: function () {
            sessionStorage.removeItem(AUTH_KEY);
        },
        currentUser: function () {
            var raw = sessionStorage.getItem(AUTH_KEY);
            var obj = safeParse(raw, null);
            return obj && obj.u ? obj.u : 'Admin';
        },

        // Settings (e.g. changed credentials, later)
        settings: function () {
            return safeParse(localStorage.getItem(SETTINGS_KEY), { credentials_changed: false });
        },
        saveSettings: function (obj) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj || {}));
        },

        // Stats
        editStats: function () {
            var all = this.loadAll();
            var pages = Object.keys(all).length;
            var fields = 0;
            for (var slug in all) {
                if (Object.prototype.hasOwnProperty.call(all, slug)) {
                    fields += Object.keys(all[slug]).length;
                }
            }
            return { pages: pages, fields: fields };
        }
    };

    root.TarluStore = store;
})(typeof window !== 'undefined' ? window : this);
