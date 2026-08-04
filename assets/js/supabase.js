/* Tarlu — Supabase client + form adapter.
   Load order:
     1. This file reads a <meta name="tarlu-supabase" content="URL|ANON_KEY">
        from the page's <head> (added at deploy time — see README).
     2. Lazy-loads supabase-js from CDN when first needed.
     3. Exposes window.TarluSupabase.submitForm(table, payload).
   Falls back gracefully to a preview stub if no credentials are present. */
(function () {
    'use strict';

    var CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
    var clientPromise = null;

    function config() {
        var meta = document.querySelector('meta[name="tarlu-supabase"]');
        if (!meta) return null;
        var parts = (meta.content || '').split('|');
        if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
        return { url: parts[0].trim(), key: parts[1].trim() };
    }

    async function getClient() {
        if (clientPromise) return clientPromise;
        var cfg = config();
        if (!cfg) throw new Error('Supabase credentials not configured. Add <meta name="tarlu-supabase" content="URL|ANON_KEY"> to the page head.');
        clientPromise = import(CDN).then(function (mod) {
            return mod.createClient(cfg.url, cfg.key, {
                auth: { persistSession: false }  // Public forms don't need sessions.
            });
        });
        return clientPromise;
    }

    /**
     * Submit a form payload to a Supabase table.
     * @param {string} table  e.g. 'enquiries', 'complaints'
     * @param {object} payload  plain JSON
     * @returns {Promise<{ok: boolean, error?: string, preview?: boolean}>}
     */
    async function submitForm(table, payload) {
        if (!config()) {
            // Preview mode — accept but don't persist.
            console.info('[Tarlu] Supabase not configured; preview submission for', table, payload);
            return { ok: true, preview: true };
        }
        try {
            var client = await getClient();
            var res = await client.from(table).insert(payload);
            if (res.error) return { ok: false, error: res.error.message };
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message || String(err) };
        }
    }

    // Turn a <form> DOM element into a plain JSON payload.
    // Multi-value inputs (checkboxes with same name) are collected as arrays.
    function serialiseForm(form) {
        var data = {};
        var fd = new FormData(form);
        fd.forEach(function (value, key) {
            if (value === '' || value == null) return;
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (!Array.isArray(data[key])) data[key] = [data[key]];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });
        return data;
    }

    /**
     * Auto-wire a form to submit via Supabase. Handles button state, success/error UI.
     * @param {HTMLFormElement} form
     * @param {string} table
     * @param {object} opts { successMsg, errorMsg, redirect }
     */
    function wireForm(form, table, opts) {
        opts = opts || {};
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            var btn = form.querySelector('button[type="submit"]');
            var note = form.querySelector('.form-note');
            var originalText = btn ? btn.textContent : '';
            if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
            var payload = serialiseForm(form);
            var result = await submitForm(table, payload);
            if (result.ok) {
                var msg = result.preview
                    ? 'Preview mode — no backend connected yet.'
                    : (opts.successMsg || 'Thank you — we\'ll be in touch shortly.');
                if (btn) { btn.textContent = result.preview ? 'Preview only · not stored' : '✓ Sent'; }
                if (note) note.textContent = msg;
                form.classList.add('form-submitted');
                if (!result.preview) form.reset();
                if (opts.redirect && !result.preview) setTimeout(function () { window.location.href = opts.redirect; }, 1500);
            } else {
                if (btn) { btn.disabled = false; btn.textContent = originalText; }
                if (note) note.textContent = 'Something went wrong: ' + result.error;
            }
        });
    }

    window.TarluSupabase = {
        submitForm: submitForm,
        wireForm: wireForm,
        serialiseForm: serialiseForm,
        isConfigured: function () { return !!config(); }
    };
})();
