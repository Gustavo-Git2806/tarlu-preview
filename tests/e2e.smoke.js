// E2E smoke — visits every public page + admin login and checks the essentials
// render. Uses Playwright directly (no test framework wrapper).
// Requires `npx playwright install chromium` first.
// Run:  node tests/e2e.smoke.js  (starts a local http server on port 8811)
const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = 8811;
const BASE = 'http://localhost:' + PORT;

// --- Static server ------------------------------------------------------
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.xml':'application/xml', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };
const server = http.createServer((req, res) => {
    let file = decodeURIComponent(req.url.split('?')[0]);
    if (file === '/') file = '/index.html';
    const full = path.join(ROOT, file);
    if (!full.startsWith(ROOT) || !fs.existsSync(full)) { res.statusCode = 404; return res.end('404'); }
    if (fs.statSync(full).isDirectory()) { res.statusCode = 404; return res.end('is dir'); }
    res.setHeader('Content-Type', MIME[path.extname(full)] || 'application/octet-stream');
    fs.createReadStream(full).pipe(res);
});

const PAGES = [
    { path: '/index.html',                              expectText: 'Scale your brand' },
    { path: '/services.html',                           expectText: 'Complete fulfilment' },
    { path: '/markets.html',                            expectText: 'Trusted across' },
    { path: '/contact.html',                            expectText: "Let's talk" },
    { path: '/complete-enquiry-form.html',              expectText: 'Complete enquiry form' },
    { path: '/fulfilment-service-surcharges.html',      expectText: 'Fulfilment service surcharges' },
    { path: '/fulfilment-terms-and-conditions.html',    expectText: 'Terms & conditions' },
    { path: '/admin/index.html',                        expectText: 'Sign in' },
    { path: '/404.html',                                expectText: 'Nothing at this address' }
];

(async () => {
    await new Promise(r => server.listen(PORT, r));
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    let pass = 0, fail = 0;
    for (const p of PAGES) {
        try {
            await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
            const content = await page.textContent('body');
            if (!content.includes(p.expectText)) throw new Error('Missing: ' + p.expectText);
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.waitForTimeout(50);
            if (errors.length) throw new Error('JS errors: ' + errors.join('; '));
            console.log('  ✓ ' + p.path);
            pass++;
        } catch (e) {
            console.log('  ✗ ' + p.path + ' — ' + e.message);
            fail++;
        }
    }

    // Admin login flow smoke
    try {
        await page.goto(BASE + '/admin/index.html');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'tarlu2026');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            page.click('#login-btn')
        ]);
        const url = page.url();
        if (!url.endsWith('/dashboard.html')) throw new Error('Not redirected to dashboard: ' + url);
        const dash = await page.textContent('body');
        if (!dash.includes('Welcome back')) throw new Error('Dashboard missing greeting');
        console.log('  ✓ admin login → dashboard');
        pass++;
    } catch (e) {
        console.log('  ✗ admin login — ' + e.message);
        fail++;
    }

    await browser.close();
    server.close();
    console.log('\n' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail === 0 ? 0 : 1);
})();
