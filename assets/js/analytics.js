/* Tarlu — analytics loader (Plausible by default).
   Only injects the tracking script if the visitor has accepted consent.
   No cookies, no tracking across sites — Plausible is GDPR-safe by default,
   but we still gate on consent so the visitor stays in control.

   To activate live tracking:
     1. Sign up at https://plausible.io and add the site
     2. Change DOMAIN below to the production domain (e.g. 'tarlu.com')
     3. Keep this file — no other change needed. */
(function () {
    'use strict';

    var DOMAIN = 'tarlu.com';   // <-- change to your Plausible-registered domain
    var SRC    = 'https://plausible.io/js/script.js';

    function load() {
        if (document.querySelector('script[data-plausible]')) return;   // already loaded
        var s = document.createElement('script');
        s.defer = true;
        s.setAttribute('data-plausible', '1');
        s.setAttribute('data-domain', DOMAIN);
        s.src = SRC;
        document.head.appendChild(s);
    }

    // If consent has already been given in a previous visit, load immediately.
    try {
        if (localStorage.getItem('tarlu_consent_v1') === 'accepted') load();
    } catch (e) { /* private mode — no-op */ }

    // If consent is granted in the current visit, load then.
    document.addEventListener('tarlu:consent-accepted', load);
})();
