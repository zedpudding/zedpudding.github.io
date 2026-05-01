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

      // Hover scale composes with parallax yPercent via GSAP's unified transform
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
  }

  function destroy() {
    document.body.classList.remove('is-home-light');
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
