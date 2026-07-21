/* =====================================================================
   Agriturismo La Morò — reveal.js
   Animazioni reveal-on-scroll sugli elementi [data-reveal] via
   IntersectionObserver; con reduced-motion (o senza IO) gli elementi
   sono resi subito visibili.
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  window.LaMoro.initReveal = function () {
    var reduceMotion = window.LaMoro.reduceMotion;
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
  };
})();
