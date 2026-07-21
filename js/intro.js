/* =====================================================================
   Agriturismo La Morò — intro.js
   Preloader/intro con il logo: scroll sempre in cima al reload, fine
   intro (timeout/click/skip) e allineamento del logo intro sul logo hero.
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  window.LaMoro.initIntro = function () {
    var reduceMotion = window.LaMoro.reduceMotion;

    /* ---------- ALWAYS START THE VISIT AT THE TOP (full intro) ----------
       Reloading must always show the intro with the centred logo from the top
       of the page — never mid-page behind the intro. So:
       1) disable the browser's automatic scroll restoration,
       2) strip any URL hash (else the browser jumps to that section on load),
       3) force the scroll position to the top.
       Done as early as possible, before the intro is shown or measured. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (window.location.hash) {
      // remove the hash without navigating, so no anchor jump happens
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

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
      // While the intro is on screen, keep the page pinned to the top even if the
      // browser tries to restore scroll on the load event.
      var pinTop = function () { if (!introDone) window.scrollTo(0, 0); };
      window.addEventListener('load', pinTop);
      window.addEventListener('scroll', pinTop, { passive: true });

      var hold = reduceMotion ? 400 : 2200;
      window.setTimeout(endIntro, hold);
      intro.addEventListener('click', endIntro);
      if (introSkip) introSkip.addEventListener('click', function (e) { e.stopPropagation(); endIntro(); });
      // safety: never trap the user
      window.setTimeout(endIntro, 5000);
    } else {
      document.body.classList.add('intro-done');
    }

    /* ---------- ALIGN INTRO LOGO OVER HERO LOGO ---------- */
    // Pin the intro logo to the exact on-screen rect of the hero logo so that,
    // when the intro fades into the hero, the logo does not jump or resize.
    // The hero logo is flow-centred (its offset from the viewport centre varies
    // with viewport width and text wrapping), so we match its measured rect
    // rather than guessing a constant offset.
    var introLogo = document.getElementById('introLogo');
    var heroLogo = document.querySelector('.hero__title--logo img');

    function alignIntroLogo() {
      if (introDone || !introLogo || !heroLogo) return;
      var r = heroLogo.getBoundingClientRect();
      if (!r.width) return;
      introLogo.style.position = 'fixed';
      introLogo.style.top = r.top + 'px';
      introLogo.style.left = r.left + 'px';
      introLogo.style.width = r.width + 'px';
      introLogo.style.height = 'auto';
      introLogo.style.margin = '0';
    }

    if (introLogo && heroLogo) {
      alignIntroLogo();
      window.addEventListener('load', alignIntroLogo);
      window.addEventListener('resize', alignIntroLogo, { passive: true });
      // re-align once webfonts settle (they change the eyebrow height above the logo)
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignIntroLogo);
    }
  };
})();
