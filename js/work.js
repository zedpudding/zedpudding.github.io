/* ═══════════════════════════════════════════════════════════
   work.js — work page module
═══════════════════════════════════════════════════════════ */
SiteFX.register('work', (() => {
  let _triggers = [];

  function init() {
    SiteFX.initReveal(document);
    SiteFX.initCardTilt(document);

    // Parallax on featured tile images
    document.querySelectorAll('.featured-thumb').forEach(img => {
      const tween = gsap.to(img, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.work-featured-tile'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
      _triggers.push(tween.scrollTrigger);
    });

    // Stagger in the project grid tiles
    gsap.from('.project-tile', {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.project-grid',
        start: 'top 85%',
      },
    });
  }

  function destroy() {
    _triggers.forEach(t => t?.kill());
    _triggers = [];
  }

  return { init, destroy };
})());

// Direct load init
SiteFX.getModule('work').init();
