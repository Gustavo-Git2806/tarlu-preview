// Automated accessibility smoke — runs axe-core against 5 key pages.
// Fails on any 'serious' or 'critical' violation.
// Requires: playwright + @axe-core/playwright (installed via npm i).
const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const ROOT = path.join(__dirname, '..');
const PORT = 8812;
const BASE = 'http://localhost:' + PORT;

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
    '/index.html',
    '/services.html',
    '/markets.html',
    '/contact.html',
    '/complete-enquiry-form.html'
];

(async () => {
    await new Promise(r => server.listen(PORT, r));
    const browser = await chromium.launch();
    // Reduced motion — prevents axe from measuring elements mid-fade-in,
    // which was producing false-positive "low contrast" readings from
    // opacity:0 states in the .reveal animation.
    const ctx = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce'
    });
    const page = await ctx.newPage();

    let totalSerious = 0;
    for (const p of PAGES) {
        await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
            .analyze();
        const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
        if (serious.length) {
            console.log('\n✗ ' + p + ' — ' + serious.length + ' serious/critical:');
            serious.forEach(v => {
                console.log('    · ' + v.id + ' (' + v.impact + '): ' + v.help);
                v.nodes.slice(0, 3).forEach(n => {
                    console.log('      → ' + n.target.join(' '));
                    n.any.forEach(a => a.data && console.log('        data: ' + JSON.stringify(a.data)));
                });
            });
        } else {
            console.log('✓ ' + p + ' — no serious/critical violations (' + results.violations.length + ' minor)');
        }
        totalSerious += serious.length;
    }

    await browser.close();
    server.close();
    console.log('\n' + (totalSerious === 0 ? 'ALL PAGES PASS a11y smoke.' : totalSerious + ' serious/critical violation(s) across pages.'));
    process.exit(totalSerious === 0 ? 0 : 1);
})();
