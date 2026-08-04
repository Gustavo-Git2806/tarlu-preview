/* Tarlu — cookie consent banner (GDPR / UK PECR-compliant minimum).
   Renders a bottom banner on first visit. Choice persists in localStorage
   under 'tarlu_consent_v1' as 'accepted' or 'declined'. Analytics scripts
   subscribe to `tarlu:consent-accepted` before loading. */
(function () {
    'use strict';
    var KEY = 'tarlu_consent_v1';
    var current = null;
    try { current = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    if (current === 'accepted') { fire(); return; }
    if (current === 'declined') { return; }

    function fire() {
        try { document.dispatchEvent(new CustomEvent('tarlu:consent-accepted')); } catch (e) {}
    }

    function set(value) {
        try { localStorage.setItem(KEY, value); } catch (e) {}
        if (value === 'accepted') fire();
        var el = document.getElementById('tarlu-consent');
        if (el) el.remove();
    }

    function render() {
        var el = document.createElement('div');
        el.id = 'tarlu-consent';
        el.className = 'consent-banner';
        el.setAttribute('role', 'region');
        el.setAttribute('aria-label', 'Cookie consent');
        el.innerHTML =
            '<div class="consent-inner">' +
                '<p class="consent-msg">This site uses <strong>anonymous analytics</strong> to understand how visitors use it. No cookies, no tracking across sites, no personal data. ' +
                '<a href="fulfilment-terms-and-conditions.html#clause-19">Privacy details</a>.</p>' +
                '<div class="consent-actions">' +
                    '<button type="button" class="consent-btn consent-btn-ghost" data-consent="declined">Decline</button>' +
                    '<button type="button" class="consent-btn consent-btn-primary" data-consent="accepted">Accept</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(el);
        el.querySelectorAll('[data-consent]').forEach(function (btn) {
            btn.addEventListener('click', function () { set(btn.getAttribute('data-consent')); });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
