/* ═══════════════════════════════════════════════════════════
   home.js — home page module
═══════════════════════════════════════════════════════════ */
SiteFX.register('home', (() => {
  let _triggers      = [];
  let _resizeFn      = null;
  let _canvasCleanup = null;

  function fitHeroName() {
    document.querySelectorAll('.hero-name-line').forEach(line => {
      line.style.fontSize = '10vw';
      const ratio = (window.innerWidth * 0.9) / line.scrollWidth;
      line.style.fontSize = (10 * ratio) + 'vw';
    });
  }

  function animateHero() {
    gsap.timeline()
      .to('.hero-tag span',       { y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-name-line span', { y: 0, duration: 1,   ease: 'power3.out', stagger: 0.08 }, '-=0.5')
      .to('.hero-tagline span',   { y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, '-=0.6');
  }

  function animateHeroParallax() {
    const t = gsap.to('.hero-name', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    _triggers.push(t.scrollTrigger);
  }

  function animateFooter() {
    const card = document.querySelector('.home-footer-card');
    if (!card) return;

    const title = card.querySelector('.home-footer-title');
    const bolt  = card.querySelector('.home-footer-bolt');
    const links = card.querySelectorAll('.home-footer-link');

    gsap.set(title, { y: 50, opacity: 0 });
    gsap.set(bolt,  { scale: 0, opacity: 0, rotation: -25 });
    gsap.set(links, { y: 20, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 82%' },
    });

    tl.to(title, { y: 0, opacity: 1, duration: 1,   ease: 'power3.out' })
      .to(bolt,  { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.6')
      .to(links, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.1 }, '-=0.4');

    _triggers.push(tl.scrollTrigger);
  }

  // ── SCROLL INDICATOR ──────────────────────────────────────
  function updateIndicator(index) {
    document.querySelectorAll('.si-line').forEach((line, i) => {
      line.classList.toggle('is-active', i === index);
    });
  }

  // ── NAV SECTION SCROLL REVEALS ────────────────────────────
  function animateNavSections() {
    document.querySelectorAll('.nav-section').forEach(section => {
      const panel = section.querySelector('.nav-section-panel');
      const label = section.querySelector('.nav-section-label');
      const copy  = section.querySelector('.nav-section-copy');

      gsap.set(panel, { y: 40, opacity: 0 });
      gsap.set(label, { y: 55, opacity: 0 });
      gsap.set(copy,  { y: 24, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 72%', toggleActions: 'play none none none' },
      });
      tl.to(panel, { y: 0, opacity: 1, duration: 0.9,  ease: 'power3.out' })
        .to(label, { y: 0, opacity: 1, duration: 0.72, ease: 'power3.out' }, '-=0.55')
        .to(copy,  { y: 0, opacity: 1, duration: 0.6,  ease: 'power3.out' }, '-=0.5');

      _triggers.push(tl.scrollTrigger);
    });
  }

  // ── IMAGE PARALLAX + HOVER ────────────────────────────────
  function animateNavParallax() {
    document.querySelectorAll('.nav-section').forEach(section => {
      const img = section.querySelector('.nav-section-img img');
      if (!img) return;

      const t = gsap.fromTo(img,
        { yPercent: 6 },
        { yPercent: -6, ease: 'none', scrollTrigger: {
            trigger: section, start: 'top bottom', end: 'bottom top', scrub: true,
          },
        }
      );
      _triggers.push(t.scrollTrigger);

      section.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.06, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
      });
      section.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1,    duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  // ── SECTION SNAP ──────────────────────────────────────────
  function initSnapScroll() {
    const stops = [
      document.querySelector('.hero'),
      ...document.querySelectorAll('.nav-section'),
    ].filter(Boolean);

    let current = 0;
    let locked  = false;

    updateIndicator(0);

    lenis.on('scroll', ({ scroll }) => {
      if (locked) return;
      let c = 0;
      stops.forEach((el, i) => {
        if (el.offsetTop <= scroll + window.innerHeight * 0.4) c = i;
      });
      if (c !== current) { current = c; updateIndicator(current); }
    });

    function goTo(dir) {
      if (locked) return;
      const next = current + dir;

      if (next >= stops.length) { window._homeWheelHandler = null; return; }
      if (next < 0) return;

      locked  = true;
      current = next;
      updateIndicator(current);
      lenis.scrollTo(stops[current], { duration: 1.1, offset: 0 });

      setTimeout(() => {
        locked = false;
        if (document.querySelector('.hero')) window._homeWheelHandler = handleWheel;
      }, 1350);
    }

    function handleWheel(e) { goTo(e.deltaY > 0 ? 1 : -1); }
    window._homeWheelHandler = handleWheel;

    let hoverTimer = null;
    document.querySelectorAll('.si-line').forEach((line, i) => {
      line.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          if (i >= stops.length || locked) return;
          current = i; updateIndicator(current);
          lenis.scrollTo(stops[current], { duration: 0.9, offset: 0 });
        }, 120);
      });
      line.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      line.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (i >= stops.length || locked) return;
        current = i; updateIndicator(current);
        lenis.scrollTo(stops[current], { duration: 0.9, offset: 0 });
      });
    });

    document.getElementById('scroll-indicator')?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
    });
  }

  // ── CANVAS GRADIENT BACKGROUND ────────────────────────────
  // Five soft greyscale radial-gradient blobs drifting in slow
  // Lissajous paths. Smooth by construction — no hash noise.
  function initCanvasBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'home-canvas-bg';
    Object.assign(canvas.style, {
      position: 'fixed', inset: '0',
      width: '100%', height: '100%',
      zIndex: '0', pointerEvents: 'none',
    });
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    onResize();
    window.addEventListener('resize', onResize);

    // blob: r  = radius as fraction of min(W,H)
    //       lo = darkest greyscale value at edge, hi = brightest at center
    //       fx/fy = angular velocity (radians/second) — kept very low
    //       px/py = initial phase offset
    const blobs = [
      { r: 0.70, hi: 255, lo: 210, fx: 0.018, fy: 0.013, px: 0.00, py: 0.00 },
      { r: 0.60, hi: 250, lo: 205, fx: 0.024, fy: 0.019, px: 2.10, py: 1.40 },
      { r: 0.65, hi: 230, lo: 195, fx: 0.015, fy: 0.022, px: 4.20, py: 2.80 },
      { r: 0.55, hi: 255, lo: 215, fx: 0.021, fy: 0.017, px: 1.50, py: 3.20 },
      { r: 0.50, hi: 220, lo: 190, fx: 0.027, fy: 0.012, px: 3.70, py: 5.10 },
    ];

    let t = 0;

    function draw() {
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(0, 0, W, H);

      const R = Math.min(W, H);
      blobs.forEach(b => {
        // Slow Lissajous orbit — different x/y frequencies = figure-8 style paths
        const x = W * (0.5 + Math.sin(t * b.fx + b.px) * 0.36);
        const y = H * (0.5 + Math.cos(t * b.fy + b.py) * 0.36);
        const r = R * b.r;

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,   `rgba(${b.hi},${b.hi},${b.hi},0.65)`);
        g.addColorStop(0.5, `rgba(${b.hi},${b.hi},${b.hi},0.18)`);
        g.addColorStop(1,   `rgba(${b.lo},${b.lo},${b.lo},0)`);

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      t += 0.012; // seconds of sim-time per frame — blobs orbit every 5–8 min
    }

    gsap.ticker.add(draw);

    _canvasCleanup = () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('resize', onResize);
      canvas.remove();
      _canvasCleanup = null;
    };
  }

  function init() {
    document.body.classList.add('is-home-light');

    lenis.scrollTo(0, { immediate: true });

    fitHeroName();
    _resizeFn = () => fitHeroName();
    window.addEventListener('resize', _resizeFn);

    initCanvasBackground();
    animateHero();
    animateHeroParallax();
    animateNavSections();
    animateNavParallax();
    animateFooter();
    initSnapScroll();
  }

  function destroy() {
    document.body.classList.remove('is-home-light');
    window._homeWheelHandler = null;
    if (_resizeFn) window.removeEventListener('resize', _resizeFn);
    if (_canvasCleanup) _canvasCleanup();
    _triggers.forEach(t => t?.kill());
    _triggers = [];
  }

  return { init, destroy };
})());

// ── PRELOADER (first load only) ────────────────────────────
(function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) {
    SiteFX.getModule('home').init();
    return;
  }

  const plFirst = document.getElementById('pl-first');
  const plLast  = document.getElementById('pl-last');
  const plPct   = document.getElementById('pl-pct');

  gsap.to([plFirst, plLast], { y: 0, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.1 });

  let count = 0;
  const iv = setInterval(() => {
    count += Math.floor(Math.random() * 14) + 3;
    if (count >= 100) {
      count = 100;
      clearInterval(iv);
      setTimeout(() => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power3.inOut',
          onComplete: () => { preloader.style.display = 'none'; },
        });
        setTimeout(() => SiteFX.getModule('home').init(), 300);
      }, 400);
    }
    if (plPct) plPct.textContent = count;
  }, 55);
})();
