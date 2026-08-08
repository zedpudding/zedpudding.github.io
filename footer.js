(() => {
  if (document.querySelector('.bottom-bar')) return;

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const workPages = new Set([
    'work.html',
    'traveler-guitar.html',
    'sunset-marquis.html',
    'hotel-figueroa.html',
    'killer-networking.html',
    'clink-hostels.html',
    'oxford.html',
    'overlook.html',
    'fender.html'
  ]);
  const links = [
    { href: 'work.html', label: 'Work', current: workPages.has(path) },
    { href: 'about.html', label: 'About', current: path === 'about.html' },
    { href: 'book.html', label: 'Books', current: path === 'book.html' },
    { href: 'contact.html', label: 'Contact', current: path === 'contact.html' }
  ];

  const bar = document.createElement('div');
  bar.className = 'bottom-bar';
  bar.innerHTML = `
    <div class="bottom-bar-inner">
      <a class="bottom-cat-wrap" href="index.html" aria-label="Home">
        <img class="bottom-cat" src="images/2-Cats-pico.png" alt="Illustration of a cat peeking up">
        <img class="bottom-cat-wink" src="images/2-Cats-pico-wink.png" alt="" aria-hidden="true">
        <img class="bottom-cat-closed" src="images/2-Cats-pico-closed.png" alt="" aria-hidden="true">
        <img class="bottom-cat-half" src="images/2-Cats-pico-half.png" alt="" aria-hidden="true">
      </a>
      <nav class="bottom-nav" aria-label="Primary">
        ${links.map((link, index) => `${index ? '<span class="sep">|</span>' : ''}<a href="${link.href}"${link.current ? ' class="current"' : ''}>${link.label}</a>`).join('')}
      </nav>
    </div>
  `;
  document.body.appendChild(bar);

  const cats = bar.querySelectorAll('.bottom-cat-wrap');
  if (!cats.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let lastMove = '';
  let repeatCount = 0;
  const nextDelay = () => 6500 + Math.random() * 10500;
  const chooseMove = () => {
    let move = Math.random() < 0.45 ? 'love' : 'wink';
    if (move === lastMove) repeatCount += 1;
    else repeatCount = 0;
    if (repeatCount > 1 && Math.random() < 0.7) move = move === 'love' ? 'wink' : 'love';
    repeatCount = move === lastMove ? repeatCount : 0;
    lastMove = move;
    return move;
  };
  const runLoveBlink = () => {
    cats.forEach((cat) => cat.classList.add('is-love-half'));
    window.setTimeout(() => {
      cats.forEach((cat) => {
        cat.classList.remove('is-love-half');
        cat.classList.add('is-loving');
      });
    }, 180);
    window.setTimeout(() => {
      cats.forEach((cat) => {
        cat.classList.remove('is-loving');
        cat.classList.add('is-love-half');
      });
    }, 900);
    window.setTimeout(() => cats.forEach((cat) => cat.classList.remove('is-love-half')), 1120);
    return 1120;
  };
  const runWink = () => {
    cats.forEach((cat) => cat.classList.add('is-winking'));
    window.setTimeout(() => cats.forEach((cat) => cat.classList.remove('is-winking')), 420);
    return 420;
  };
  const animateCat = () => {
    const duration = chooseMove() === 'love' ? runLoveBlink() : runWink();
    window.setTimeout(animateCat, duration + nextDelay());
  };
  window.setTimeout(animateCat, 2800 + Math.random() * 6000);
})();

(() => {
  const clamp = (value) => Math.max(0, Math.min(100, value));

  document.querySelectorAll('.campaign-compare-frame').forEach((frame) => {
    if (frame.dataset.compareBound === 'true') return;
    const range = frame.querySelector('.campaign-compare-range');
    if (!range) return;
    frame.dataset.compareBound = 'true';

    const setCompare = (value) => {
      const percent = clamp(Number(value));
      frame.style.setProperty('--compare', `${percent}%`);
      range.value = String(percent);
    };

    const setFromPointer = (event) => {
      const rect = frame.getBoundingClientRect();
      if (!rect.width) return;
      setCompare(((event.clientX - rect.left) / rect.width) * 100);
    };

    range.addEventListener('input', () => setCompare(range.value));
    range.addEventListener('change', () => setCompare(range.value));

    frame.addEventListener('pointerdown', (event) => {
      frame.setPointerCapture?.(event.pointerId);
      setFromPointer(event);
    });

    frame.addEventListener('pointermove', (event) => {
      if (event.buttons !== 1 && event.pressure === 0) return;
      setFromPointer(event);
    });

    frame.addEventListener('pointerup', (event) => {
      frame.releasePointerCapture?.(event.pointerId);
    });

    setCompare(range.value || 50);
  });
})();

(() => {
  document.querySelectorAll('.website-scroller').forEach((scroller) => {
    if (scroller.dataset.scrollerBound === 'true') return;
    const track = scroller.querySelector('.website-track');
    const prev = scroller.querySelector('.scroller-prev');
    const next = scroller.querySelector('.scroller-next');
    const panels = Array.from(scroller.querySelectorAll('.website-panel'));
    const visiblePanels = panels.filter((panel) => panel.getAttribute('aria-hidden') !== 'true');
    const cyclePanels = visiblePanels.length || panels.length;
    if (!track || !panels.length) return;
    scroller.dataset.scrollerBound = 'true';

    const panelStep = () => {
      const firstPanel = panels[0];
      if (!firstPanel) return track.clientWidth * 0.8;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return firstPanel.getBoundingClientRect().width + gap;
    };

    const cycleWidth = () => panelStep() * cyclePanels;

    const normalize = () => {
      const width = cycleWidth();
      if (!width || panels.length <= cyclePanels) return;
      if (track.scrollLeft >= width) track.scrollLeft -= width;
      if (track.scrollLeft < 0) track.scrollLeft += width;
    };

    const jump = (direction) => {
      normalize();
      if (direction < 0 && track.scrollLeft <= 2 && panels.length > cyclePanels) {
        track.scrollLeft = cycleWidth();
      }
      track.scrollBy({ left: direction * panelStep(), behavior: 'smooth' });
      window.setTimeout(normalize, 520);
    };

    prev?.addEventListener('click', () => jump(-1));
    next?.addEventListener('click', () => jump(1));
    track.addEventListener('scroll', () => window.requestAnimationFrame(normalize), { passive: true });
  });
})();

(() => {
  const galleries = document.querySelectorAll('.ad-gallery');
  const thumbs = Array.from(document.querySelectorAll('.ad-thumb[data-full]'));
  const lightbox = document.querySelector('.ad-lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const closeButton = lightbox?.querySelector('.lightbox-close');
  const prevButton = lightbox?.querySelector('.lightbox-prev');
  const nextButton = lightbox?.querySelector('.lightbox-next');
  let activeThumb = null;
  let activeIndex = 0;

  galleries.forEach((gallery) => {
    if (gallery.dataset.galleryBound === 'true') return;
    const track = gallery.querySelector('.ad-gallery-track');
    const prev = gallery.querySelector('.gallery-prev');
    const next = gallery.querySelector('.gallery-next');
    const galleryThumbs = Array.from(gallery.querySelectorAll('.ad-thumb[data-full]'));
    if (!track) return;
    gallery.dataset.galleryBound = 'true';

    const scrollStep = () => {
      const firstThumb = galleryThumbs[0];
      if (!firstThumb) return track.clientWidth * 0.8;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return firstThumb.getBoundingClientRect().width + gap;
    };

    prev?.addEventListener('click', () => {
      track.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
    });

    next?.addEventListener('click', () => {
      track.scrollBy({ left: scrollStep(), behavior: 'smooth' });
    });
  });

  if (!lightbox || !lightboxImage || !thumbs.length) return;

  const showAd = (index) => {
    activeIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[activeIndex];
    const thumbImage = thumb.querySelector('img');
    activeThumb = thumb;
    lightboxImage.src = thumb.dataset.full;
    lightboxImage.alt = thumbImage?.alt || thumb.dataset.title || 'Gallery image';
  };

  const closeAd = () => {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    lightboxImage.alt = '';
    document.body.style.overflow = '';
    activeThumb?.focus();
  };

  const openAd = (thumb) => {
    showAd(thumbs.indexOf(thumb));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  };

  const moveAd = (direction) => {
    if (lightbox.hidden) return;
    showAd(activeIndex + direction);
  };

  thumbs.forEach((thumb) => {
    if (thumb.dataset.lightboxBound === 'true') return;
    thumb.dataset.lightboxBound = 'true';
    thumb.addEventListener('click', () => openAd(thumb));
  });

  closeButton?.addEventListener('click', closeAd);
  prevButton?.addEventListener('click', () => moveAd(-1));
  nextButton?.addEventListener('click', () => moveAd(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeAd();
  });

  window.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeAd();
    if (event.key === 'ArrowLeft') moveAd(-1);
    if (event.key === 'ArrowRight') moveAd(1);
  });
})();
