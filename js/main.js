/* =====================================================================
   Agriturismo La Morò — main.js (entry point)
   Nessuna logica di funzionalità qui: ogni funzionalità vive nel proprio
   modulo (intro, header, parallax, reveal, modal, coverflow) e si registra
   su window.LaMoro esponendo una funzione init. Questo file si limita a
   chiamare le init nell'ordine corretto.

   Ordine importante: initDishModal() PRIMA di initCoverflow(), perché il
   coverflow usa l'API window.LaMoro.dishModal registrata dal modal.
   ===================================================================== */
(function () {
  'use strict';

  var app = window.LaMoro || {};

  if (app.initIntro)     app.initIntro();
  if (app.initHeader)    app.initHeader();
  if (app.initParallax)  app.initParallax();
  if (app.initReveal)    app.initReveal();
  if (app.initDishModal) app.initDishModal();
  if (app.initCoverflow) app.initCoverflow();

  /* ---------- FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
