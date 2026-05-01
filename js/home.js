/* ═══════════════════════════════════════════════════════════
   home.js — home page module
═══════════════════════════════════════════════════════════ */
SiteFX.register('home', (() => {
  let _triggers = [];
  let _snapObs  = null;
  let _resizeFn = null;

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

  function animateNavSections() {
    document.querySelectorAll('.nav-section').forEach(section => {
      const panel = section.querySelector('.nav-section-panel');
      const label = section.querySelector('.nav-section-label');
      const copy  = section.querySelector('.nav-section-copy');

      gsap.set(panel, { y: 50, opacity: 0 });
      gsap.set(label, { y: 20 });
      gsap.set(copy,  { y: 24, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(panel, { y: 0, opacity: 1, duration: 1,   ease: 'power3.out' })
        .to(label, { y: 0,              duration: 0.7, ease: 'power3.out' }, '-=0.6')
        .to(copy,  { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5');

      _triggers.push(tl.scrollTrigger);
    });
  }

  function animateNavParallax() {
    document.querySelectorAll('.nav-section').forEach(section => {
      const img = section.querySelector('.nav-section-img img');
      if (!img) return;

      const t = gsap.fromTo(img,
        { yPercent: 5 },
        {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
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
      scrollTrigger: {
        trigger: card,
        start: 'top 82%',
      },
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

  // ── SECTION SNAP ──────────────────────────────────────────
  function initSnapScroll() {
    const stops = [
      document.querySelector('.hero'),
      ...document.querySelectorAll('.nav-section'),
    ].filter(Boolean);

    let current = 0;
    let locked  = false;

    updateIndicator(0);

    // Keep current in sync when user free-scrolls (e.g. into footer and back)
    lenis.on('scroll', ({ scroll }) => {
      if (locked) return;
      stops.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.25) current = i;
      });
    });

    function goTo(dir) {
      if (locked) return;
      const next = current + dir;
      if (next >= stops.length || next < 0) return;

      locked = true;

      // Squish the departing panel
      const fromPanel = stops[current].querySelector?.('.nav-section-panel');
      if (fromPanel) {
        gsap.to(fromPanel, {
          scale: 0.88,
          duration: 0.55,
          ease: 'power2.in',
        });
      }

      current = next;
      updateIndicator(current);
      lenis.scrollTo(stops[current], { duration: 1.05, offset: 0 });

      // Restore squished panel after it scrolls out of view
      setTimeout(() => {
        if (fromPanel) gsap.set(fromPanel, { scale: 1 });
        locked = false;
      }, 1350);
    }

    // Click on a dash → snap directly to that section
    document.querySelectorAll('.si-line').forEach((line, i) => {
      line.addEventListener('click', () => {
        if (i >= stops.length || i === current) return;
        locked = true;
        const fromPanel = stops[current].querySelector?.('.nav-section-panel');
        if (fromPanel) {
          gsap.to(fromPanel, { scale: 0.88, duration: 0.55, ease: 'power2.in' });
        }
        current = i;
        updateIndicator(current);
        lenis.scrollTo(stops[current], { duration: 1.05, offset: 0 });
        setTimeout(() => {
          if (fromPanel) gsap.set(fromPanel, { scale: 1 });
          locked = false;
        }, 1350);
      });
    });

    _snapObs = Observer.create({
      target: window,
      type: 'wheel,touch',
      onDown: () => goTo(1),
      onUp:   () => goTo(-1),
      tolerance: 10,
      preventDefault: true,
    });
  }

  function init() {
    document.body.classList.add('is-home-light');
    fitHeroName();
    _resizeFn = () => fitHeroName();
    window.addEventListener('resize', _resizeFn);

    animateHero();
    animateHeroParallax();
    animateNavSections();
    animateNavParallax();
    animateFooter();
    initSnapScroll();
  }

  function destroy() {
    document.body.classList.remove('is-home-light');
    if (_resizeFn) window.removeEventListener('resize', _resizeFn);
    _triggers.forEach(t => t?.kill());
    _triggers = [];
    if (_snapObs) { _snapObs.kill(); _snapObs = null; }
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
