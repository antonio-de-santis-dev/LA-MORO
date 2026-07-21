/* =====================================================================
   Agriturismo La Morò — utils.js
   Helper condivisi tra i moduli. Ogni modulo si registra sul namespace
   globale window.LaMoro; main.js (caricato per ultimo) chiama le init.
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  /* prefers-reduced-motion, valutato una sola volta al caricamento (come
     nell'implementazione originale): usato da intro, parallax, reveal e
     coverflow per attenuare o disattivare le animazioni. */
  window.LaMoro.reduceMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
