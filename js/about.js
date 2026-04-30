/* ═══════════════════════════════════════════════════════════
   about.js — about page module
═══════════════════════════════════════════════════════════ */
SiteFX.register('about', (() => {

  function init() {
    SiteFX.initReveal(document);

    // Skill rows stagger in
    gsap.from('.skill-row', {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 85%',
      },
    });

    // Client cells cascade in
    gsap.from('.client-cell', {
      opacity: 0,
      scale: 0.92,
      duration: 0.4,
      stagger: 0.04,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.clients-grid',
        start: 'top 85%',
      },
    });
  }

  function destroy() {}

  return { init, destroy };
})());

// Direct load init
SiteFX.getModule('about').init();
