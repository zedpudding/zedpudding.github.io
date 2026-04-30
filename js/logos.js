/* ═══════════════════════════════════════════════════════════
   logos.js — logo archive + filter
═══════════════════════════════════════════════════════════ */
SiteFX.register('logos', (() => {

  function initFilter() {
    const btns  = document.querySelectorAll('.filter-btn');
    const tiles = document.querySelectorAll('.logo-tile');
    const count = document.querySelector('.logo-count');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;

        // Update button active state
        btns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        // Filter tiles
        let visible = 0;
        tiles.forEach(tile => {
          const match = cat === 'all' || tile.dataset.category === cat;
          tile.classList.toggle('is-hidden', !match);
          if (match) visible++;
        });

        if (count) count.textContent = `${visible} marks`;

        // Animate visible tiles back in
        gsap.from('.logo-tile:not(.is-hidden)', {
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
          stagger: 0.03,
          ease: 'power2.out',
        });
      });
    });
  }

  function init() {
    SiteFX.initReveal(document);
    initFilter();

    // Entrance animation
    gsap.from('.logo-tile', {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.logo-grid',
        start: 'top 85%',
      },
    });
  }

  function destroy() {}

  return { init, destroy };
})());

// Direct load init
SiteFX.getModule('logos').init();
