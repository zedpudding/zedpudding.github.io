/* ═══════════════════════════════════════════════════════════
   app.js — global init
   GSAP plugins · Lenis · Barba · Cursor · Nav active state
═══════════════════════════════════════════════════════════ */

// ── GSAP PLUGINS ──────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer);

// ── LENIS ─────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── CURSOR ────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
if (cursor) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'none' });
  });
}

// ── NAV ACTIVE STATE ──────────────────────────────────────
function updateNavActive() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('#nav .nav-links a').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
    const isHome = href === '' || href === '/';
    const active = isHome
      ? (path === '' || path === '/' || path === '/index.html')
      : path.startsWith(href);
    link.classList.toggle('is-active', active);
  });
}
updateNavActive();

// ── BARBA PAGE TRANSITIONS ────────────────────────────────
barba.init({
  preventRunning: true,
  transitions: [{
    name: 'curtain',

    async leave({ current }) {
      SiteFX.killScrollTriggers();
      SiteFX.emit('page:leave', current);

      // Curtain sweeps in
      gsap.set('#transition-overlay', { xPercent: -100 });
      await gsap.to('#transition-overlay', {
        xPercent: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      });
    },

    async enter({ next }) {
      // Reset scroll
      lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);

      // Curtain sweeps out
      await gsap.to('#transition-overlay', {
        xPercent: 100,
        duration: 0.5,
        ease: 'power3.inOut',
      });
      gsap.set('#transition-overlay', { xPercent: -100 });

      // Wire up new page
      updateNavActive();
      SiteFX.bindCursorHover(next.container);
      SiteFX.initReveal(next.container);
      SiteFX.emit('page:enter', next);
      SiteFX.setPhase('enter');
    },
  }],

  views: [
    {
      namespace: 'home',
      afterEnter() { SiteFX.getModule('home')?.init(); },
      beforeLeave() { SiteFX.getModule('home')?.destroy(); },
    },
    {
      namespace: 'work',
      afterEnter() { SiteFX.getModule('work')?.init(); },
      beforeLeave() { SiteFX.getModule('work')?.destroy(); },
    },
    {
      namespace: 'logos',
      afterEnter() { SiteFX.getModule('logos')?.init(); },
      beforeLeave() { SiteFX.getModule('logos')?.destroy(); },
    },
    {
      namespace: 'books',
      afterEnter() { SiteFX.getModule('books')?.init(); },
      beforeLeave() { SiteFX.getModule('books')?.destroy(); },
    },
    {
      namespace: 'about',
      afterEnter() { SiteFX.getModule('about')?.init(); },
      beforeLeave() { SiteFX.getModule('about')?.destroy(); },
    },
  ],
});

// ── INITIAL SETUP (first page load) ───────────────────────
SiteFX.bindCursorHover(document);
SiteFX.setPhase('ready');
