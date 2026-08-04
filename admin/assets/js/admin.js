/* Tarlu Admin — auth gate, sidebar shell, sha-256 password check.
   Credentials: default 'admin' / 'tarlu2026' (see hash below).
   Depends on: store.js (TarluStore) loaded first. */
(function () {
    'use strict';

    // SHA-256 hex of 'tarlu2026' — computed once, checked at runtime.
    // Password change is preview-only (settings updates a new hash in localStorage).
    var DEFAULT_HASH = '25f3303c2f23c38317965a9121ad68ce8042d871460b4b1484d5cf9db3c49b74';
    var DEFAULT_USER = 'admin';

    async function sha256Hex(text) {
        var enc = new TextEncoder();
        var buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
        var arr = Array.from(new Uint8Array(buf));
        return arr.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    function getStoredHash() {
        var s = window.TarluStore.settings();
        return (s && s.password_hash) ? s.password_hash : DEFAULT_HASH;
    }
    function getStoredUser() {
        var s = window.TarluStore.settings();
        return (s && s.username) ? s.username : DEFAULT_USER;
    }

    // Icon library (inline SVG strings)
    var ICONS = {
        home:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
        mail:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
        pages:  '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
        grid:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        tag:    '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12 12 4H4v8l8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
        gauge:  '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 12l4-4"/></svg>',
        file:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6"/></svg>',
        target: '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
        star:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.8 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9z"/></svg>',
        cog:    '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03z"/></svg>',
        users:  '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        logout: '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
        edit:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
        eye:    '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
        plus:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
        down:   '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
        up:     '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
        reset:  '<svg class="a-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/></svg>'
    };

    // Sidebar sections (used everywhere)
    var SIDEBAR = [
        {
            heading: 'Overview',
            items: [
                { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: 'home' },
                { key: 'messages',  label: 'Messages',  href: 'messages.html',  icon: 'mail' }
            ]
        },
        {
            heading: 'Content',
            items: [
                { key: 'pages',      label: 'All pages', href: 'pages.html', icon: 'pages' }
            ]
        },
        {
            heading: 'Site',
            items: [
                { key: 'settings', label: 'Settings',  href: 'settings.html', icon: 'cog' },
                { key: 'logout',   label: 'Log out',   href: '#logout',        icon: 'logout', action: 'logout' }
            ]
        }
    ];

    function renderSidebar(activeKey) {
        var html = '<a class="a-brand" href="dashboard.html" aria-label="Tarlu Admin">' +
                   '<img class="a-brand-logo" src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,h=80/mp8JxO6q3MTPNqDR/tarlu_nav_logo.3x-mk3JeXBqJKsKOvW4.png" alt="Tarlu" height="32">' +
                   '<span class="a-brand-tag">Admin</span>' +
                   '</a>';
        html += '<nav class="a-nav" aria-label="Primary">';
        SIDEBAR.forEach(function (section) {
            html += '<div class="a-nav-section">';
            html += '<div class="a-nav-heading">' + section.heading + '</div>';
            section.items.forEach(function (item) {
                var isActive = item.key === activeKey ? ' active' : '';
                html += '<a class="a-nav-item' + isActive + '" href="' + item.href + '"' + (item.action ? ' data-action="' + item.action + '"' : '') + '>' +
                        (ICONS[item.icon] || '') +
                        '<span>' + item.label + '</span>' +
                        '</a>';
            });
            html += '</div>';
        });
        html += '</nav>';
        html += '<div class="a-sidebar-foot">' +
                '<strong>' + escapeHtml(window.TarluStore.currentUser()) + '</strong>' +
                '<a href="../index.html" target="_blank" rel="noopener">View site →</a>' +
                '</div>';
        return html;
    }

    function attachSidebarActions() {
        var logoutLink = document.querySelector('.a-nav-item[data-action="logout"]');
        if (logoutLink) {
            logoutLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.TarluStore.clearAuth();
                window.location.href = 'index.html';
            });
        }
        // Mobile toggle + scrim
        var toggle = document.querySelector('[data-sidebar-toggle]');
        var sidebar = document.querySelector('.a-sidebar');
        function closeSidebar() {
            if (sidebar) sidebar.classList.remove('open');
            document.body.classList.remove('a-sidebar-open');
        }
        function openSidebar() {
            if (sidebar) sidebar.classList.add('open');
            document.body.classList.add('a-sidebar-open');
        }
        if (toggle && sidebar) {
            toggle.addEventListener('click', function () {
                if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
            });
        }
        // Close on link tap
        sidebar && sidebar.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', closeSidebar);
        });
        // Close on scrim tap
        document.body.addEventListener('click', function (e) {
            if (!document.body.classList.contains('a-sidebar-open')) return;
            if (sidebar && !sidebar.contains(e.target) && !e.target.closest('[data-sidebar-toggle]')) {
                closeSidebar();
            }
        });
    }

    function toast(message, kind) {
        var el = document.createElement('div');
        el.className = 'a-toast' + (kind ? ' a-toast-' + kind : '');
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(function () {
            el.style.transition = 'opacity 0.3s ease';
            el.style.opacity = '0';
            setTimeout(function () { el.remove(); }, 350);
        }, 2600);
    }

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Called by every admin page except the login page.
    async function requireAuth() {
        if (!window.TarluStore.isAuthed()) {
            window.location.replace('index.html');
            return false;
        }
        return true;
    }

    // Called by login page.
    async function attemptLogin(username, password) {
        var expectedUser = getStoredUser();
        var expectedHash = getStoredHash();
        if (username.trim().toLowerCase() !== expectedUser.toLowerCase()) return false;
        var hash = await sha256Hex(password);
        if (hash !== expectedHash) return false;
        window.TarluStore.setAuthed(expectedUser);
        return true;
    }

    function mountShell(opts) {
        opts = opts || {};
        var body = document.body;
        var mainContent = body.innerHTML;
        var toggleBtn = '<button class="a-mobile-toggle" data-sidebar-toggle aria-label="Toggle menu">☰ Menu</button>';
        body.innerHTML = '<div class="a-shell">' +
                         '<aside class="a-sidebar" data-sidebar>' + renderSidebar(opts.active) + '</aside>' +
                         '<main class="a-main">' + toggleBtn + mainContent + '</main>' +
                         '</div>';
        attachSidebarActions();
        injectIcons();
    }

    // Return schema — always loaded via <script src="data/pages.js"> before this.
    // (No fetch() fallback — browsers block file:// XHR, so the JS mirror is authoritative.)
    async function loadSchema() {
        if (!window.TarluPagesSchema) throw new Error('data/pages.js not loaded before admin.js');
        return window.TarluPagesSchema;
    }

    // Any element with [data-icon="name"] gets its innerHTML swapped for the
    // matching entry in ICONS. Called after mountShell so shell icons already resolved.
    function injectIcons(root) {
        (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
            var name = el.getAttribute('data-icon');
            if (ICONS[name]) el.innerHTML = ICONS[name];
        });
    }

    function downloadEditsJson() {
        var json = window.TarluStore.exportJson();
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'tarlu-edits-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        toast('Edits exported.', 'success');
    }

    window.TarluAdmin = {
        ICONS: ICONS,
        toast: toast,
        escapeHtml: escapeHtml,
        requireAuth: requireAuth,
        attemptLogin: attemptLogin,
        mountShell: mountShell,
        loadSchema: loadSchema,
        sha256Hex: sha256Hex,
        downloadEditsJson: downloadEditsJson,
        injectIcons: injectIcons
    };
})();
