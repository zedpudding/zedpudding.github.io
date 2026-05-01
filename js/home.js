/* ═══════════════════════════════════════════════════════════
   home.js — home page module
═══════════════════════════════════════════════════════════ */
SiteFX.register('home', (() => {
  let _triggers = [];
  let _resizeFn  = null;

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

  // ── PANEL HOVER ───────────────────────────────────────────
  function initPanelHover() {
    document.querySelectorAll('.nav-section').forEach(section => {
      const img = section.querySelector('.nav-section-img img');
      if (!img) return;
      section.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.06, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
      });
      section.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1,    duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  // ── LOOPED PANELS ─────────────────────────────────────────
  // All nav-sections are stacked (position:absolute, inset:0).
  // Wheel events cycle through them with a scale+slide GSAP transition.
  // Lenis is blocked during transitions via the capture-phase interceptor.
  function initLoopedPanels() {
    const navSectionsEl = document.querySelector('.nav-sections');
    const heroEl        = document.querySelector('.hero');
    const panels        = gsap.utils.toArray('.nav-section');
    if (!panels.length || !navSectionsEl) return;

    let currentIdx = -1; // -1 = hero is active, 0..n = panel index
    let locked     = false;

    // Hide all panels initially
    gsap.set(panels, { autoAlpha: 0, yPercent: 0, scale: 1 });
    updateIndicator(0);

    // ── transition ──
    function showPanel(idx, dir) {
      const entering = panels[idx];
      const leaving  = currentIdx >= 0 ? panels[currentIdx] : null;

      const enterLabel = entering.querySelector('.nav-section-label');
      const enterCopy  = entering.querySelector('.nav-section-copy');
      const leaveLabel = leaving?.querySelector('.nav-section-label');
      const leaveCopy  = leaving?.querySelector('.nav-section-copy');

      locked     = true;
      currentIdx = idx;
      updateIndicator(idx + 1);

      const tl = gsap.timeline({ onComplete: () => { locked = false; } });

      // ── outgoing: panel shrinks, label + copy slide out ──
      if (leaving) {
        tl.to(leaving, {
          yPercent : dir > 0 ? -7 : 7,
          scale    : 0.88,
          autoAlpha: 0,
          duration : 0.55,
          ease     : 'power2.in',
        }, 0);
        if (leaveLabel) tl.to(leaveLabel, { y: dir > 0 ? -28 : 28, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
        if (leaveCopy)  tl.to(leaveCopy,  { y: dir > 0 ? -14 : 14, opacity: 0, duration: 0.28, ease: 'power2.in' }, 0.05);
      }

      // ── incoming: panel scales in, then label rises, then copy follows ──
      const enterStart = leaving ? 0.22 : 0;

      gsap.set(entering, { yPercent: dir > 0 ? 9 : -9, scale: 0.93, autoAlpha: 0 });
      if (enterLabel) gsap.set(enterLabel, { y: dir > 0 ? 55 : -55, opacity: 0 });
      if (enterCopy)  gsap.set(enterCopy,  { y: dir > 0 ? 26 : -26, opacity: 0 });

      tl.to(entering, {
        yPercent : 0,
        scale    : 1,
        autoAlpha: 1,
        duration : 0.85,
        ease     : 'power3.out',
      }, enterStart);

      if (enterLabel) tl.to(enterLabel, {
        y        : 0,
        opacity  : 1,
        duration : 0.72,
        ease     : 'power3.out',
      }, enterStart + 0.3);

      if (enterCopy) tl.to(enterCopy, {
        y        : 0,
        opacity  : 1,
        duration : 0.6,
        ease     : 'power3.out',
      }, enterStart + 0.46);
    }

    // ── directional navigation ──
    function goTo(dir) {
      if (locked) return;

      // ── hero → first panel ──
      if (currentIdx === -1 && dir > 0) {
        locked = true;
        lenis.scrollTo(navSectionsEl, { duration: 0.85, offset: 0 });
        setTimeout(() => { showPanel(0, 1); }, 380);
        return;
      }

      const next = currentIdx + dir;

      // ── past last panel → release to footer ──
      if (next >= panels.length) {
        window._homeWheelHandler = null;
        return;
      }

      // ── before first panel → back to hero ──
      if (next < 0) {
        locked = true;
        gsap.to(panels[currentIdx], {
          yPercent : 7,
          scale    : 0.9,
          autoAlpha: 0,
          duration : 0.5,
          ease     : 'power2.in',
          onComplete() {
            currentIdx = -1;
            updateIndicator(0);
            lenis.scrollTo(heroEl, { duration: 0.75, offset: 0 });
            setTimeout(() => {
              locked = false;
              if (document.querySelector('.hero')) window._homeWheelHandler = handleWheel;
            }, 950);
          },
        });
        return;
      }

      showPanel(next, dir);
    }

    // ── index navigation (indicator clicks) ──
    function goToIndex(targetIdx) {
      if (locked) return;

      if (targetIdx === 0) {
        // Back to hero
        if (currentIdx >= 0) {
          locked = true;
          gsap.to(panels[currentIdx], {
            yPercent : 7,
            scale    : 0.9,
            autoAlpha: 0,
            duration : 0.5,
            ease     : 'power2.in',
            onComplete() {
              currentIdx = -1;
              updateIndicator(0);
              lenis.scrollTo(heroEl, { duration: 0.75 });
              setTimeout(() => {
                locked = false;
                if (document.querySelector('.hero')) window._homeWheelHandler = handleWheel;
              }, 950);
            },
          });
        } else {
          lenis.scrollTo(heroEl, { duration: 0.75 });
        }
        return;
      }

      const panelIdx = targetIdx - 1;
      if (panelIdx >= panels.length) return;

      if (currentIdx === -1) {
        // From hero to a specific panel
        locked = true;
        lenis.scrollTo(navSectionsEl, { duration: 0.85 });
        setTimeout(() => { showPanel(panelIdx, 1); }, 380);
      } else {
        showPanel(panelIdx, panelIdx > currentIdx ? 1 : -1);
      }
    }

    function handleWheel(e) { goTo(e.deltaY > 0 ? 1 : -1); }
    window._homeWheelHandler = handleWheel;

    // Re-enable handler if user scrolled back from footer via normal lenis scroll
    lenis.on('scroll', ({ scroll }) => {
      if (locked) return;
      if (!window._homeWheelHandler && document.querySelector('.hero')) {
        const navTop = navSectionsEl.offsetTop;
        if (scroll <= navTop + 50) {
          window._homeWheelHandler = handleWheel;
          // Reset panels if back at hero level
          if (scroll < navTop - 100 && currentIdx >= 0) {
            gsap.set(panels[currentIdx], { autoAlpha: 0, yPercent: 0, scale: 1 });
            currentIdx = -1;
            updateIndicator(0);
          }
        }
      }
    });

    // ── Indicator hover / click ──
    let hoverTimer = null;
    document.querySelectorAll('.si-line').forEach((line, i) => {
      line.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => { goToIndex(i); }, 120);
      });
      line.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      line.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToIndex(i);
      });
    });

    document.getElementById('scroll-indicator')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  function init() {
    document.body.classList.add('is-home-light');

    lenis.scrollTo(0, { immediate: true });

    fitHeroName();
    _resizeFn = () => fitHeroName();
    window.addEventListener('resize', _resizeFn);

    animateHero();
    animateHeroParallax();
    initPanelHover();
    animateFooter();
    initLoopedPanels();
  }

  function destroy() {
    document.body.classList.remove('is-home-light');
    window._homeWheelHandler = null;
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
