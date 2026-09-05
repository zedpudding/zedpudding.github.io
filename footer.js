(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  root.classList.add('page-transition-ready', 'page-enter');

  const clearEnter = () => root.classList.remove('page-enter');
  window.setTimeout(clearEnter, 420);

  window.addEventListener('pageshow', (event) => {
    root.classList.remove('page-exit');
    if (event.persisted) {
      root.classList.add('page-enter');
      window.setTimeout(clearEnter, 420);
    }
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;

    const url = new URL(link.href, window.location.href);
    const isSamePageHash = url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash;

    if (url.origin !== window.location.origin || isSamePageHash || !/^https?:$/.test(url.protocol)) return;

    event.preventDefault();
    root.classList.remove('page-enter');
    root.classList.add('page-exit');
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 240);
  });
})();

(() => {
  if (document.querySelector('.bottom-bar')) return;

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const workCases = [
    { href: 'traveler-guitar.html', label: 'Traveler Guitar' },
    { href: 'sunset-marquis.html', label: 'Sunset Marquis' },
    { href: 'hotel-figueroa.html', label: 'Hotel Figueroa' },
    { href: 'killer-networking.html', label: 'Killer Networks' },
    { href: 'clink-hostels.html', label: 'Clink Hostels' },
    { href: 'oxford.html', label: 'Oxford Collection' },
    { href: 'overlook.html', label: 'The Overlook' },
    { href: 'raleigh-studios.html', label: 'Raleigh Studios' },
    { href: 'xbox.html', label: 'XBOX' },
    { href: 'amd.html', label: 'AMD' },
    { href: 'coastal-corridor-alliance.html', label: 'Coastal Corridor' }
  ];
  const workPages = new Set(['work.html', ...workCases.map((page) => page.href)]);
  const links = [
    { href: 'work.html', label: 'Work', current: workPages.has(path) },
    { href: 'about.html', label: 'About', current: path === 'about.html' },
    { href: 'book.html', label: 'Books', current: path === 'book.html' },
    { href: 'contact.html', label: 'Contact', current: path === 'contact.html' }
  ];
  const navLinks = links.map((link, index) => {
    const separator = index ? '<span class="sep">|</span>' : '';
    if (link.href !== 'work.html') {
      return `${separator}<a href="${link.href}"${link.current ? ' class="current"' : ''}>${link.label}</a>`;
    }

    const caseLinks = workCases.map((page) => (
      `<a href="${page.href}"${page.href === path ? ' class="current"' : ''}>${page.label}</a>`
    )).join('');
    const subnav = `<a class="work-subnav-all${path === 'work.html' ? ' current' : ''}" href="work.html">See All Work</a>${caseLinks}`;

    return `${separator}<span class="work-nav-item">
      <button class="work-nav-trigger${link.current ? ' current' : ''}" type="button" aria-haspopup="true">Work</button>
      <span class="work-subnav" aria-label="Work pages">${subnav}</span>
    </span>`;
  }).join('');

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
        ${navLinks}
      </nav>
    </div>
  `;
  document.body.appendChild(bar);

  const workNavItem = bar.querySelector('.work-nav-item');
  const workNavTrigger = bar.querySelector('.work-nav-trigger');
  const workSubnav = bar.querySelector('.work-subnav');

  if (workNavItem && workNavTrigger && workSubnav) {
    workNavTrigger.setAttribute('aria-expanded', 'false');

    const closeWorkSubnav = () => {
      workNavItem.classList.remove('is-open');
      workNavTrigger.setAttribute('aria-expanded', 'false');
    };

    const openWorkSubnav = () => {
      workNavItem.classList.add('is-open');
      workNavTrigger.setAttribute('aria-expanded', 'true');
    };

    workNavTrigger.addEventListener('click', () => {
      if (workNavItem.classList.contains('is-open')) {
        closeWorkSubnav();
      } else {
        openWorkSubnav();
      }
    });

    document.addEventListener('click', (event) => {
      if (!workNavItem.contains(event.target)) closeWorkSubnav();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeWorkSubnav();
      workNavTrigger.focus();
    });
  }

  const currentCaseIndex = workCases.findIndex((page) => page.href === path);
  if (currentCaseIndex >= 0 && !document.querySelector('.work-case-nav')) {
    const previous = workCases[(currentCaseIndex - 1 + workCases.length) % workCases.length];
    const next = workCases[(currentCaseIndex + 1) % workCases.length];
    const pageMain = document.querySelector('main');
    const nav = document.createElement('nav');
    nav.className = 'work-case-nav';
    nav.setAttribute('aria-label', 'Work project navigation');
    nav.innerHTML = `
      <a class="work-case-nav-link work-case-nav-prev" href="${previous.href}" aria-label="Previous project: ${previous.label}">‹</a>
      <a class="work-case-nav-link work-case-nav-grid" href="work.html" aria-label="All work">
        <span aria-hidden="true"></span>
      </a>
      <a class="work-case-nav-link work-case-nav-next" href="${next.href}" aria-label="Next project: ${next.label}">›</a>
    `;
    if (pageMain) {
      pageMain.classList.add('has-work-case-nav');
      pageMain.appendChild(nav);
    } else {
      document.body.appendChild(nav);
    }
  }

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
      track.scrollTo({ left: track.scrollLeft + direction * panelStep(), behavior: 'smooth' });
      window.setTimeout(normalize, 520);
    };

    prev?.addEventListener('click', () => jump(-1));
    next?.addEventListener('click', () => jump(1));
    track.addEventListener('scroll', () => window.requestAnimationFrame(normalize), { passive: true });

    let paused = false;
    let last = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduceMotion ? 18 : 42;

    track.addEventListener('pointerdown', () => { paused = true; });
    track.addEventListener('pointerup', () => {
      paused = false;
      last = performance.now();
    });
    track.addEventListener('pointerleave', () => {
      paused = false;
      last = performance.now();
    });
    track.addEventListener('pointercancel', () => {
      paused = false;
      last = performance.now();
    });

    const tick = (now) => {
      const delta = Math.min(now - last, 80);
      last = now;
      if (!paused && panelStep() > 0 && track.scrollWidth > track.clientWidth) {
        track.scrollLeft += (speed * delta) / 1000;
        normalize();
      }
      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
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
    track.style.scrollSnapType = 'none';

    const scrollStep = () => {
      const firstThumb = galleryThumbs[0];
      if (!firstThumb) return track.clientWidth * 0.8;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return firstThumb.getBoundingClientRect().width + gap;
    };

    prev?.addEventListener('click', () => {
      track.scrollTo({ left: Math.max(0, track.scrollLeft - scrollStep()), behavior: 'auto' });
    });

    next?.addEventListener('click', () => {
      track.scrollTo({ left: track.scrollLeft + scrollStep(), behavior: 'auto' });
    });

    let paused = false;
    let last = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduceMotion ? 18 : 42;

    track.addEventListener('pointerdown', () => { paused = true; });
    track.addEventListener('pointerup', () => {
      paused = false;
      last = performance.now();
    });
    track.addEventListener('pointerleave', () => {
      paused = false;
      last = performance.now();
    });
    track.addEventListener('pointercancel', () => {
      paused = false;
      last = performance.now();
    });

    const tick = (now) => {
      const delta = Math.min(now - last, 80);
      last = now;
      if (!paused && scrollStep() > 0 && track.scrollWidth > track.clientWidth) {
        track.scrollLeft += (speed * delta) / 1000;
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
          track.scrollLeft = 0;
        }
      }
      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
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

(() => {
  const lightbox = document.querySelector('.book-lightbox');
  const image = lightbox?.querySelector('.book-lightbox-image');
  const closeButton = lightbox?.querySelector('.book-lightbox-close');
  const prevButton = lightbox?.querySelector('.book-lightbox-prev');
  const nextButton = lightbox?.querySelector('.book-lightbox-next');
  const thumbs = Array.from(document.querySelectorAll('.downhill-thumb[data-full]'));
  if (!lightbox || !image || !thumbs.length) return;

  let activeThumb = null;
  let activeIndex = 0;

  const close = () => {
    lightbox.hidden = true;
    image.removeAttribute('src');
    image.alt = '';
    document.body.style.overflow = '';
    activeThumb?.focus();
  };

  const show = (index) => {
    activeIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[activeIndex];
    const thumbImage = thumb.querySelector('img');
    activeThumb = thumb;
    image.src = thumb.dataset.full;
    image.alt = thumbImage?.alt || 'Book page preview';
  };

  const open = (thumb) => {
    show(thumbs.indexOf(thumb));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  };

  const move = (direction) => {
    if (lightbox.hidden) return;
    show(activeIndex + direction);
  };

  thumbs.forEach((thumb) => {
    if (thumb.dataset.lightboxBound === 'true') return;
    thumb.dataset.lightboxBound = 'true';
    thumb.addEventListener('click', () => open(thumb));
  });

  closeButton?.addEventListener('click', close);
  prevButton?.addEventListener('click', () => move(-1));
  nextButton?.addEventListener('click', () => move(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  window.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();
