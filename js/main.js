/* =====================================================================
   Agriturismo La Morò — main.js
   Intro, header, mobile nav, parallax, reveal-on-scroll
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- INTRO / PRELOADER ---------- */
  var intro = document.getElementById('intro');
  var introSkip = document.getElementById('introSkip');
  var introDone = false;

  function endIntro() {
    if (introDone) return;
    introDone = true;
    document.body.classList.add('intro-done');
    // remove from DOM after fade
    window.setTimeout(function () {
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    }, 900);
  }

  if (intro) {
    var hold = reduceMotion ? 400 : 2200;
    window.setTimeout(endIntro, hold);
    intro.addEventListener('click', endIntro);
    if (introSkip) introSkip.addEventListener('click', function (e) { e.stopPropagation(); endIntro(); });
    // safety: never trap the user
    window.setTimeout(endIntro, 5000);
  } else {
    document.body.classList.add('intro-done');
  }

  /* ---------- HEADER SCROLL STATE ---------- */
  var header = document.getElementById('siteHeader');
  var hero = document.getElementById('hero');

  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScrollHeader();

  /* ---------- HEADER: HIDDEN OVER HERO, SHOWN AFTER ---------- */
  // Keep the header out of view (and out of the tab order) while the hero
  // is on screen; reveal it once the hero is scrolled away.
  function navMenuIsOpen() {
    var m = document.getElementById('navMenu');
    return !!(m && m.classList.contains('open'));
  }
  function setHeaderHidden(hidden) {
    if (!header) return;
    // never hide the header while the mobile menu is open
    if (navMenuIsOpen()) hidden = false;
    header.classList.toggle('header--hidden', hidden);
  }

  if (header && hero && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // hero still meaningfully visible -> keep header hidden
        var heroVisible = entry.isIntersecting && entry.intersectionRatio > 0.12;
        setHeaderHidden(heroVisible);
      });
    }, { threshold: [0, 0.12, 0.15, 0.5, 1] });
    heroObserver.observe(hero);
  } else if (header && hero) {
    // Fallback: compare scroll position with the hero height
    var fallbackHeader = function () {
      setHeaderHidden(window.scrollY < hero.offsetHeight * 0.85);
    };
    fallbackHeader();
    window.addEventListener('scroll', fallbackHeader, { passive: true });
  } else if (header) {
    // No hero at all: always show the header
    header.classList.remove('header--hidden');
  }

  /* ---------- MOBILE NAV ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function closeNav() {
    if (!navMenu) return;
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('open');
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ---------- PARALLAX ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;

  function updateParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var section = el.parentElement;
      var rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -1..1
      var shift = progress * -40; // px
      el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  function requestParallax() {
    if (!ticking && !reduceMotion) { window.requestAnimationFrame(updateParallax); ticking = true; }
  }

  window.addEventListener('scroll', function () { onScrollHeader(); requestParallax(); }, { passive: true });
  window.addEventListener('resize', requestParallax, { passive: true });
  if (!reduceMotion) updateParallax();

  /* ---------- REVEAL ON SCROLL ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
