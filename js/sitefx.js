/* ═══════════════════════════════════════════════════════════
   SiteFX — orchestration layer
   Phase tracking · Event bus · Ownership registry · Modules
═══════════════════════════════════════════════════════════ */
const SiteFX = (() => {

  // ── PHASE SYSTEM ─────────────────────────────────────────
  const PHASES = ['boot', 'ready', 'enter', 'leave', 'destroy'];
  let _phase = 'boot';
  const _phaseHandlers = Object.fromEntries(PHASES.map(p => [p, new Set()]));

  function setPhase(phase) {
    if (!PHASES.includes(phase)) return;
    _phase = phase;
    _phaseHandlers[phase].forEach(fn => fn());
  }
  function onPhase(phase, fn) {
    _phaseHandlers[phase]?.add(fn);
    return () => _phaseHandlers[phase]?.delete(fn);
  }
  function getPhase() { return _phase; }

  // ── EVENT BUS ─────────────────────────────────────────────
  const _events = {};
  function on(event, fn) {
    (_events[event] ??= new Set()).add(fn);
    return () => _events[event]?.delete(fn);
  }
  function off(event, fn) { _events[event]?.delete(fn); }
  function emit(event, data) { _events[event]?.forEach(fn => fn(data)); }

  // ── OWNERSHIP REGISTRY ────────────────────────────────────
  const _owners = new WeakMap();
  function claim(el, owner) {
    if (_owners.has(el) && _owners.get(el) !== owner) {
      console.warn(`SiteFX: "${owner}" tried to claim element owned by "${_owners.get(el)}"`);
      return false;
    }
    _owners.set(el, owner);
    return true;
  }
  function release(el, owner) {
    if (_owners.get(el) === owner) _owners.delete(el);
  }
  function getOwner(el) { return _owners.get(el); }

  // ── MODULE REGISTRY ────────────────────────────────────────
  const _modules = {};
  function register(namespace, module) { _modules[namespace] = module; }
  function getModule(namespace) { return _modules[namespace]; }

  // ── SCROLL TRIGGER CLEANUP ────────────────────────────────
  function killScrollTriggers() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }

  // ── CURSOR HOVER BINDING ──────────────────────────────────
  function bindCursorHover(root = document) {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    const sel = 'a, button, .project-tile, .work-featured-tile, .featured-tile, .logo-tile, .book-card, .client-cell, .skill-row, .filter-btn, .footer-name';
    root.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  // ── SCROLL REVEAL SETUP ────────────────────────────────────
  function initReveal(container = document) {
    if (typeof ScrollTrigger === 'undefined') return;
    container.querySelectorAll('.will-reveal').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => el.classList.add('is-visible'),
      });
    });
  }

  return {
    setPhase, onPhase, getPhase,
    on, off, emit,
    claim, release, getOwner,
    register, getModule,
    killScrollTriggers,
    bindCursorHover,
    initReveal,
  };
})();
