/* =====================================================================
   Agriturismo La Morò — parallax.js
   Effetto parallax sugli elementi [data-parallax] (hero, prodotti),
   con throttling via requestAnimationFrame e rispetto di
   prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  window.LaMoro.initParallax = function () {
    var reduceMotion = window.LaMoro.reduceMotion;
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

    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax, { passive: true });
    if (!reduceMotion) updateParallax();
  };
})();
