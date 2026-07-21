/* =====================================================================
   Agriturismo La Morò — coverflow.js
   Carosello 3D "Coverflow" dei piatti: trasformazioni per offset,
   frecce, tastiera, drag/swipe (Pointer Events) e apertura del dish
   modal sulla card attiva (via l'API window.LaMoro.dishModal, quindi
   initDishModal() va chiamata PRIMA di initCoverflow()).
   ===================================================================== */
(function () {
  'use strict';

  window.LaMoro = window.LaMoro || {};

  window.LaMoro.initCoverflow = function () {
    var reduceMotion = window.LaMoro.reduceMotion;
    var root = document.getElementById('dishCoverflow');
    var stage = document.getElementById('coverflowStage');
    if (!root || !stage) return;
    var viewport = root.querySelector('.coverflow__viewport');
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.coverflow__card'));
    if (!cards.length) return;
    var prevBtn = root.querySelector('.coverflow__arrow--prev');
    var nextBtn = root.querySelector('.coverflow__arrow--next');

    var active = 0;
    var LOOP = false; // agli estremi le frecce si disabilitano (vedi documentazione)

    // apre il dish modal sulla card indicata (API registrata da initDishModal)
    function openModal(i) {
      if (window.LaMoro.dishModal) window.LaMoro.dishModal.open(cards[i]);
    }

    // --- tuning read from the CSS custom properties (single source of truth) ---
    var cardW = 300, scaleSide = .84, rotate = 38, tzBase = -170, offsetRatio = .62;
    function readTuning() {
      var cs = getComputedStyle(root);
      function n(name, fb) { var v = parseFloat(cs.getPropertyValue(name)); return isNaN(v) ? fb : v; }
      // card width can't be parsed da clamp(): la misuriamo dalla card reale.
      // USARE offsetWidth (larghezza di layout), NON getBoundingClientRect().width:
      // quest'ultima include la transform 3D (scale/rotate), quindi su una card già
      // trasformata restituirebbe la larghezza PROIETTATA (più piccola) e falserebbe
      // il calcolo di translateX. offsetWidth ignora la transform → sempre corretta.
      cardW = cards[0].offsetWidth || 300;
      scaleSide   = n('--coverflow-scale-side', .84);
      rotate      = n('--coverflow-rotate', 38);
      tzBase      = n('--coverflow-translate-z', -170);
      offsetRatio = n('--coverflow-offset-x', .62);
    }

    // continuous transform for a (possibly fractional) signed offset a = i - center
    function styleFor(card, a) {
      var aa = Math.abs(a);
      var sign = a < 0 ? -1 : (a > 0 ? 1 : 0);
      if (aa >= 3.2) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.transform = 'translateX(' + (sign * cardW) + 'px) scale(.6)';
        card.style.zIndex = '90';
        return;
      }
      // simmetrico per costruzione (dipende solo da |a| e dal segno).
      // ±2: poco più larghe delle ±1 (lateral) ma MOLTO più arretrate (depth),
      // così restano un accenno dietro e non sfuggono ai lati.
      var lateral = aa <= 1 ? aa : 1 + (aa - 1) * 0.42;
      var depth   = aa <= 1 ? aa : 1 + (aa - 1) * 1.4;
      var tx = sign * cardW * offsetRatio * lateral;
      var tz = reduceMotion ? 0 : tzBase * depth;
      var ry = reduceMotion ? 0 : -sign * rotate * Math.min(aa, 1);
      var sc = aa <= 1 ? 1 - (1 - scaleSide) * aa : Math.max(0.55, scaleSide - (aa - 1) * 0.14);
      var op = aa <= 1 ? 1 - 0.28 * aa : Math.max(0, 0.72 - 0.45 * (aa - 1));
      card.style.transform =
        'translateX(' + tx.toFixed(1) + 'px) translateZ(' + tz.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
      card.style.opacity = op.toFixed(3);
      card.style.zIndex = String(100 - Math.round(aa));
      card.style.pointerEvents = aa >= 2.5 ? 'none' : 'auto';
    }
    function render(center) {
      for (var i = 0; i < cards.length; i++) styleFor(cards[i], i - center);
    }

    function updateArrows() {
      if (prevBtn) prevBtn.disabled = !LOOP && active <= 0;
      if (nextBtn) nextBtn.disabled = !LOOP && active >= cards.length - 1;
    }
    function setActive(i, focusIt) {
      if (LOOP) { i = (i % cards.length + cards.length) % cards.length; }
      else { i = Math.max(0, Math.min(cards.length - 1, i)); }
      active = i;
      readTuning();
      render(active);
      cards.forEach(function (c, idx) {
        c.setAttribute('tabindex', idx === active ? '0' : '-1');
        c.classList.toggle('is-active', idx === active);
        c.setAttribute('aria-hidden', Math.abs(idx - active) >= 3 ? 'true' : 'false');
      });
      updateArrows();
      if (focusIt) cards[active].focus();
    }

    // arrows
    if (prevBtn) prevBtn.addEventListener('click', function () { setActive(active - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { setActive(active + 1); });

    // click / focus on a card
    var dragMoved = false;
    cards.forEach(function (card, i) {
      card.addEventListener('click', function () {
        if (dragMoved) { dragMoved = false; return; }
        if (i === active) openModal(i); else setActive(i, true);
      });
      card.addEventListener('focus', function () { if (i !== active) setActive(i); });
    });

    // keyboard (carousel focused)
    root.addEventListener('keydown', function (e) {
      var onCard = document.activeElement && document.activeElement.classList.contains('coverflow__card');
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); setActive(active - 1, true); break;
        case 'ArrowRight': e.preventDefault(); setActive(active + 1, true); break;
        case 'Home':       e.preventDefault(); setActive(0, true); break;
        case 'End':        e.preventDefault(); setActive(cards.length - 1, true); break;
        case 'Enter':
        case ' ':
          if (onCard) { e.preventDefault(); openModal(active); }
          break;
      }
    });

    // drag / swipe (Pointer Events: mouse + touch)
    // NB: NIENTE setPointerCapture — cattura il puntatore e dirotta l'evento
    // 'click' lontano dalla card, impedendo l'apertura del modal. Usiamo invece
    // listener a livello di window, così il drag continua anche se il puntatore
    // esce dalla viewport e il click sulla card resta integro.
    var DRAG_THRESHOLD = 8;   // px prima che un movimento conti come drag (non click)
    var down = false, startX = 0, stepPx = 200, dragging = false;

    function onPointerMove(e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > DRAG_THRESHOLD) {
        dragging = true; dragMoved = true;
        stage.classList.add('is-dragging');
      }
      if (dragging) {
        var offset = -dx / stepPx;
        var center = LOOP ? active + offset : Math.max(0, Math.min(cards.length - 1, active + offset));
        render(center);
      }
    }
    function onPointerUp(e) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      if (!down) return;
      down = false;
      if (dragging) {
        stage.classList.remove('is-dragging');
        var dx = (e && typeof e.clientX === 'number') ? e.clientX - startX : 0;
        var offset = -dx / stepPx;
        if (Math.abs(offset) < 0.25) setActive(active);        // sotto soglia: torna indietro
        else setActive(active + (offset > 0 ? Math.ceil(offset) : Math.floor(offset)));
      }
      dragging = false;
      // se non è stato un drag, non facciamo nulla: parte il 'click' che apre il
      // modal (card attiva) o centra la card (card laterale)
    }
    // guardia su viewport (unico elemento del coverflow non garantito, a
    // differenza di root/stage/cards già guardati sopra): se .coverflow__viewport
    // mancasse, senza questo controllo addEventListener lancerebbe e, con le init
    // sequenziali in main.js, bloccherebbe il codice successivo (es. anno footer).
    // Con l'elemento presente (caso reale) il comportamento è identico a prima;
    // se assente il drag è disattivato ma frecce/tastiera/posizionamento restano.
    if (viewport) {
      viewport.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        down = true; dragMoved = false; dragging = false;
        startX = e.clientX;
        readTuning();
        stepPx = Math.max(80, cardW * offsetRatio * 1.5);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      });
    }

    window.addEventListener('resize', function () { setActive(active); }, { passive: true });

    // init: parte da una card CENTRALE, non dalla prima, così la vista iniziale
    // è simmetrica (adiacenti a sinistra e a destra) invece che sbilanciata a destra.
    //
    // Anti-FOUC: il PRIMO posizionamento avviene con le transizioni spente
    // (classe .no-transition) e le card ancora invisibili (.coverflow è opacity:0).
    // Così le card non animano dallo stato impilato iniziale (transform:none) verso
    // la geometria Coverflow: sono già distese al primo paint. Dopo un reflow forzato
    // riattiviamo le transizioni e, dentro un requestAnimationFrame, sveliamo il
    // carosello con .is-ready (fade opacity). Nessun flash impilato è mai visibile.
    stage.classList.add('no-transition');
    setActive(Math.floor((cards.length - 1) / 2));
    void stage.offsetWidth;                 // reflow: "congela" le posizioni appena impostate
    stage.classList.remove('no-transition');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { root.classList.add('is-ready'); });
    });
  };
})();
