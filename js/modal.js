/* =====================================================================
   Agriturismo La Morò — modal.js
   Dish modal / lightbox: apertura da una card piatto, chiusura via
   Escape / backdrop / X (elementi [data-close]), focus trap e ritorno
   del focus alla card di partenza.

   initDishModal() registra su window.LaMoro.dishModal un'API minima:
     open(card)  → riempie il modal con i dati della card e lo apre
     close()     → chiude il modal
   Il coverflow la usa senza conoscere i dettagli interni del modal.
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  window.LaMoro.initDishModal = function () {
    var modal = document.getElementById('dishModal');
    var modalImg = document.getElementById('dishModalImg');
    var modalCat = document.getElementById('dishModalCat');
    var modalTitle = document.getElementById('dishModalTitle');
    var modalDesc = document.getElementById('dishModalDesc');
    var lastFocused = null;

    function openModal(card) {
      if (!modal || !card) return;
      var img = card.querySelector('.dish__img img');
      modalImg.src = img.getAttribute('src');
      modalImg.alt = img.getAttribute('alt') || '';
      modalCat.textContent = card.querySelector('.dish__cat').textContent;
      modalTitle.textContent = card.querySelector('h3').textContent;
      modalDesc.textContent = card.querySelector('p').textContent;
      lastFocused = card;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      modal.querySelector('.dish-modal__close').focus();
      document.addEventListener('keydown', onModalKeydown, true);
    }
    function closeModal() {
      if (!modal || modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onModalKeydown, true);
      if (lastFocused) lastFocused.focus();
    }
    function onModalKeydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key !== 'Tab') return;
      var f = modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      var list = Array.prototype.filter.call(f, function (el) {
        return !el.disabled && (el.offsetWidth > 0 || el.offsetHeight > 0);
      });
      if (!list.length) { e.preventDefault(); return; }
      var first = list[0], last = list[list.length - 1];
      var a = document.activeElement;
      if (!modal.contains(a)) { e.preventDefault(); first.focus(); return; }   // pull focus back in
      if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    }
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target.closest('[data-close]')) closeModal();
      });
      // clicks inside the panel (not on a data-close element) must not close it
      modal.querySelector('.dish-modal__panel').addEventListener('click', function (e) {
        if (!e.target.closest('[data-close]')) e.stopPropagation();
      });
    }

    window.LaMoro.dishModal = { open: openModal, close: closeModal };
  };
})();
