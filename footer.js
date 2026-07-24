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
