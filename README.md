# Tarlu — Editorial Preview

Static HTML preview of a Tarlu.com rebuild — 4-page site in editorial magazine style.

**Live:** [gustavo-git2806.github.io/tarlu-preview](https://gustavo-git2806.github.io/tarlu-preview/) *(after Pages provisions)*

## What this is

- 15 pages: 4 public (`index`, `services`, `markets`, `contact`) + 11 hidden (pricing schedules, forms, T&Cs) linked only by direct URL
- Shared stylesheet: `assets/css/tarlu-v3.css`
- Admin panel: `admin/` — content editor with session-based login (client-side, preview only)
- Fonts: **Space Grotesk** (display) + **IBM Plex Sans** (body), via Google Fonts CDN
- Palette: Tarlu blue `#0075C2` + navy `#001A78` + white/stone
- Images hotlinked from the current tarlu.com Zyrosite CDN

Content mirrors the current tarlu.com — same services, sectors, testimonials, contact info. The design and typography are new.

## Preview-only caveats

- Forms are decorative — submissions are blocked client-side (except `complete-enquiry-form` which is pre-wired to a Google Forms endpoint).
- Admin auth is client-side SHA-256 (preview only — do not treat as real security).
- Admin edits persist in the browser's `localStorage`, applied to public pages via `assets/js/edits.js`. Export to JSON via the dashboard to persist.
- Images depend on tarlu.com's CDN staying up. If images ever 404, they can be swapped for local copies.

## Deploy

This repo is served straight off GitHub Pages from `main`. No build step, no framework, no bundler — open any `.html` in a browser and it works.

## Supabase — activate real form submissions

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste + run [`_supabase/schema.sql`](_supabase/schema.sql) — creates 5 tables + RLS policies.
3. In *Project Settings → API*, copy the **Project URL** and **anon public** key.
4. Either:
   - **Local dev:** paste `<meta name="tarlu-supabase" content="https://XXXX.supabase.co|eyJ...">` into every page's `<head>` (or just the one you're testing).
   - **Production via GitHub Actions:** set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as [repo secrets](../../settings/secrets/actions) — the `deploy.yml` workflow injects them automatically at build time.

Without credentials, all 5 forms run in **preview mode** — accept input, show "Preview only", don't persist anything. No breakage.

## Tests

```bash
npm install                 # once (pulls linkedom + playwright)
npm run test:unit           # store + sanitiser + schema tests (~100ms)
npm run test:e2e            # Playwright smoke on 9 pages + admin login (~10s)
```

Unit tests run on every PR via `.github/workflows/qa.yml`. E2E + Lighthouse budget checks also enforced.

## Going to production — flip list

Before pointing a real domain at this site:

1. **Remove `<meta name="robots" content="noindex,nofollow">`** from every HTML page (17 files: 15 public + 404 + admin/index).
2. **Update `robots.txt`** — change `Disallow: /` to keep only the `/admin/` disallow.
3. **Update `sitemap.xml`** — replace `gustavo-git2806.github.io/tarlu-preview` with the production domain.
4. **Update OG `og:url` / canonical** links across the 15 pages (same domain swap).
5. **Update `assets/js/analytics.js`** — set `DOMAIN` to the production hostname registered with Plausible.
6. **Update `admin/assets/js/admin.js`** — change the default `DEFAULT_HASH` (currently SHA-256 of `tarlu2026`) or force users to change it on first login via Settings.
7. **Wire forms to a backend** — 5 forms currently have `onsubmit="event.preventDefault();…"`. Remove for real submissions. The enquiry form is pre-wired to Google Forms (add a `hidden_iframe` target to activate).
