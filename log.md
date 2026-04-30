# Site Log — zandervera.com

**Repo:** [zedpudding/zedpudding.github.io](https://github.com/zedpudding/zedpudding.github.io)
**Host:** GitHub Pages
**Custom domain:** zandervera.com (via CNAME)

---

## Site Overview

Single-page portfolio for Zander Vera, Identity Designer. Built as a single `index.html` file with no external dependencies beyond GSAP (CDN) and Google Fonts (Syne, Syne Mono).

**Key design details:**
- Custom smooth scroll: `html` is `position: fixed`, the `#scrollContainer` div is translated via JS `lerp` loop (GSAP `set`) — same pattern as Chris Kalaf's site
- Custom cursor: crosshair at rest, lightning bolt SVG on hover
- Preloader: white background, name slides up, percentage counts to 100, then wipes away
- Hero name auto-fits to full viewport width via `fitHeroName()` JS function
- `mix-blend-mode: difference` on nav for automatic contrast over any background
- Root font set as `0.694444vw` so `1rem ≈ 10px` at 1440px — all spacing/type in rem

**Sections:** Hero → Marquee → Projects (6 items, 3-col grid) → About → Clients (12 names, 6-col grid) → Contact → Footer

---

## Change Log

### 2026-04-29 — Initial build (`a7f5cae` → `f51fd1f`)

- First commit: base HTML/CSS/JS structure
- Custom domain added: `CNAME` set to `zandervera.com`
- Iterative cleanup and updates to content and styling

### 2026-04-30 — Nav fix + full responsive pass (`c2240ad`)

**Nav sticky fix**
- Nav was inside `#scrollContainer`, which receives `transform: translateY(-currentY)` every animation frame from the smooth scroll loop — causing the nav to scroll off-screen with the content
- Fix: moved `<nav>` outside `#scrollContainer` so it sits independently in the DOM; `position: fixed` then works as intended

**Responsive overhaul**
- The original breakpoints set `html { font-size: 1.8vw }` at ≤900px and `2.8vw` at ≤600px — this made the root font *larger* on smaller screens, which caused display text (`13rem`, `9rem`, `10rem`) to blow out well beyond the viewport width
- Replaced with a proportional scaling system:
  - `≤1100px`: `0.833vw` (~9px at 1100px)
  - `≤900px`: `1.2vw` (~10.8px at 900px)
  - `≤600px`: `2.133vw` (~12.8px at 600px)
  - `≤400px`: `3.2vw` (~12.8px at 400px)
- Added explicit display text overrides at each breakpoint so large headings scale down proportionally:
  - `.contact-big`: 13rem → 9rem → 6rem → 4.5rem
  - `.about-big-text`: 9rem → 5rem → 4rem
  - `.projects-title`: 10rem → 8rem → 5rem → 4rem
  - `.footer-name`: 5rem → 3rem → 2.5rem
- Layout fixes: projects grid goes 3→2→1 col; clients grid 6→3→2 col; about section stacks to 1 col; contact section stacks; projects title row stacks at 600px; scroll hint hidden at 600px
- Padding reduced progressively at 600px and 400px breakpoints
- Preloader text scaled down at 600px; names stack vertically at 400px
- Removed the `font-size: 19vw` override on `.hero-name-line` at 600px — the `fitHeroName()` JS function sets inline styles that override CSS anyway, so the rule had no effect
