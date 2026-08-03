# Tarlu — Editorial Preview

Static HTML preview of a Tarlu.com rebuild — 4-page site in editorial magazine style.

**Live:** [gustavo-git2806.github.io/tarlu-preview](https://gustavo-git2806.github.io/tarlu-preview/) *(after Pages provisions)*

## What this is

- 4 pages: `index.html`, `services.html`, `markets.html`, `contact.html`
- One shared stylesheet: `assets/css/editorial.css`
- Fonts: **Fraunces** (serif display, variable) + **Inter** (body sans), via Google Fonts CDN
- Palette: white / cream / ink + bronze accent
- Images hotlinked from the current tarlu.com Zyrosite CDN

Content mirrors the current tarlu.com — same services, sectors, testimonials, contact info. The design and typography are new.

## Preview-only caveats

- Contact form is decorative — submissions are blocked client-side.
- No admin panel here (the real editable version lives in a private companion repo).
- Images depend on tarlu.com's CDN staying up. If images ever 404, they can be swapped for local copies.

## Deploy

This repo is served straight off GitHub Pages from `main`. No build step, no framework, no bundler — open any `.html` in a browser and it works.
