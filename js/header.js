/* =====================================================================
   Agriturismo La Morò — header.js
   Header sticky: stato "scrolled", nascosto sopra l'hero (via
   IntersectionObserver, con fallback) e toggle della nav mobile.
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  window.LaMoro.initHeader = function () {
    /* ---------- HEADER SCROLL STATE ---------- */
    var header = document.getElementById('siteHeader');
    var hero = document.getElementById('hero');

    function onScrollHeader() {
      if (!header) return;
      if (window.scrollY > 60) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });

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
  };
})();
