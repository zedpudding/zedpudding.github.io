/* ═══════════════════════════════════════════════════════════
   home.js — home page module
═══════════════════════════════════════════════════════════ */
SiteFX.register('home', (() => {
  let _triggers = [];
  let _resizeFn = null;

  function fitHeroName() {
    document.querySelectorAll('.hero-name-line').forEach(line => {
      line.style.fontSize = '10vw';
      const ratio = (window.innerWidth * 0.9) / line.scrollWidth;
      line.style.fontSize = (10 * ratio) + 'vw';
    });
  }

  function init() {
    fitHeroName();
    _resizeFn = () => fitHeroName();
    window.addEventListener('resize', _resizeFn);

    // Scroll reveals
    SiteFX.initReveal(document);

    // Subtle parallax on featured tiles
    document.querySelectorAll('.featured-tile .featured-thumb').forEach(img => {
      const t = gsap.to(img, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.featured-tile'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
      _triggers.push(t.scrollTrigger);
    });
  }

  function destroy() {
    if (_resizeFn) window.removeEventListener('resize', _resizeFn);
    _triggers.forEach(t => t?.kill());
    _triggers = [];
  }

  return { init, destroy };
})());

// ── PRELOADER (first load only) ────────────────────────────
(function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) {
    // Barba navigation to home — just init directly
    SiteFX.getModule('home').init();
    // Animate hero in without preloader delay
    gsap.timeline({ delay: 0.1 })
      .to('.hero-tag span',       { y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-name-line span', { y: 0, duration: 1,   ease: 'power3.out', stagger: 0.08 }, '-=0.5')
      .to('.hero-desc span',      { y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, '-=0.6')
      .to('.hero-scroll-hint',    { opacity: 0.3, duration: 0.8 }, '-=0.4');
    return;
  }

  // First load — run preloader
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
        // Hero animates in as preloader exits
        gsap.timeline({ delay: 0.3 })
          .to('.hero-tag span',       { y: 0, duration: 0.8, ease: 'power3.out' })
          .to('.hero-name-line span', { y: 0, duration: 1,   ease: 'power3.out', stagger: 0.08 }, '-=0.5')
          .to('.hero-desc span',      { y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, '-=0.6')
          .to('.hero-scroll-hint',    { opacity: 0.3, duration: 0.8 }, '-=0.4');
        // Init scroll behaviours after preloader
        SiteFX.getModule('home').init();
      }, 400);
    }
    if (plPct) plPct.textContent = count;
  }, 55);
})();
