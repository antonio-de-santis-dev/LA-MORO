/* =====================================================================
   Agriturismo La Morò — main.js
   Intro, header, mobile nav, parallax, reveal-on-scroll
   ===================================================================== */
(function () {
  'use strict';

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

  /* ---------- DISHES COVERFLOW (3D) + MODAL ---------- */
  (function initCoverflow() {
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

    window.addEventListener('resize', function () { setActive(active); }, { passive: true });

    /* ---------- MODAL ---------- */
    var modal = document.getElementById('dishModal');
    var modalImg = document.getElementById('dishModalImg');
    var modalCat = document.getElementById('dishModalCat');
    var modalTitle = document.getElementById('dishModalTitle');
    var modalDesc = document.getElementById('dishModalDesc');
    var lastFocused = null;

    function openModal(i) {
      if (!modal) return;
      var card = cards[i];
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
  })();

  /* ---------- SOTTO PRENOTAZIONE (tabs verticali) ---------- */
  (function initPrenota() {
    var tablist = document.querySelector('.prenota__tags');
    var panel = document.getElementById('prenotaPanel');
    if (!tablist || !panel) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    // NUMERO DI TELEFONO — placeholder. Da sostituire QUI, in un UNICO punto,
    // col numero reale (es. '+393209677022'). Il link tel: viene generato da qui.
    var PRENOTA_TEL = '+390000000000';

    // dati prodotti (facili da modificare): nome, prezzo, unità, descrizione IT, EN,
    // immagine (img) e testo alternativo (alt, descrittivo in italiano).
    var IMG_DIR = 'assets/images/Imagini-i-piatti-su-prenotazione/';
    var PRODOTTI = [
      { nome: 'Agnello',             prezzo: '€ 15,00', unita: 'a porzione', it: '',                     en: '',           img: 'Agnello.png',                    alt: 'Un agnello in un prato fiorito' },
      { nome: 'Pollo ruspante',      prezzo: '€ 15,00', unita: 'a porzione', it: '',                     en: '',           img: 'Polo-Ruspante.jpeg',             alt: 'Galline ruspanti in un campo' },
      { nome: 'Coniglio',            prezzo: '€ 13,00', unita: 'a porzione', it: '',                     en: '',           img: 'coniglio-ariete.jpg',            alt: 'Un coniglio' },
      { nome: 'Pezzetti di cavallo', prezzo: '€ 14,00', unita: 'a porzione', it: '',                     en: '',           img: 'Cavalo.jpeg',                    alt: 'Un cavallo al galoppo in un prato' },
      { nome: 'Bruscatizzi',         prezzo: '€ 13,00', unita: '',           it: 'interiora di agnello', en: 'Lamb offal', img: 'turcinelli-puglia-ricetta.jpg',  alt: 'Turcinelli (interiora di agnello) alla brace' },
      { nome: 'Municeddhe',          prezzo: '€ 11,00', unita: '',           it: 'lumache di terra',     en: 'Land snails',img: 'Municede.jpeg',                  alt: 'Municeddhe (lumache) in salsa di pomodoro' }
    ];

    var elName   = document.getElementById('prenotaName');
    var elAmount = document.getElementById('prenotaAmount');
    var elUnit   = document.getElementById('prenotaUnit');
    var elDesc   = document.getElementById('prenotaDesc');
    var elEn     = document.getElementById('prenotaEn');
    var elImg    = document.getElementById('prenotaImg');
    var ghost    = document.querySelector('.prenota__img-ghost');   // layer per il crossfade
    var callBtn  = document.getElementById('prenotaCall');

    // numero centralizzato: un solo punto da cambiare
    if (callBtn) callBtn.href = 'tel:' + PRENOTA_TEL;

    // PRELOAD di tutte le immagini: al cambio prodotto la foto è già in cache,
    // così il crossfade non mostra lampi bianchi né scatti di caricamento.
    PRODOTTI.forEach(function (p) { var im = new Image(); im.src = IMG_DIR + p.img; });

    // MODELLO: attivazione su HOVER/FOCUS = ANTEPRIMA (cambia il pannello SUBITO,
    // senza debounce, con crossfade morbido dell'immagine); click/Invio = FISSA.
    // All'uscita da hover/focus si torna sempre al prodotto FISSATO (default).
    var fixedIndex = 0;
    var shownIndex = 0;
    var CROSSFADE_MS = 420;      // durata dissolvenza immagine (ease-out)
    var commitTimer = null;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // aggiorna SOLO i testi dell'overlay (nome/prezzo/descrizione) — istantaneo
    function fillText(i) {
      var p = PRODOTTI[i]; if (!p) return;
      elName.textContent = p.nome;
      elAmount.textContent = p.prezzo;
      if (p.unita) { elUnit.textContent = p.unita; elUnit.hidden = false; }
      else { elUnit.textContent = ''; elUnit.hidden = true; }
      if (p.it) { elDesc.textContent = p.it; elDesc.hidden = false; }
      else { elDesc.textContent = ''; elDesc.hidden = true; }
      if (p.en) { elEn.textContent = p.en; elEn.hidden = false; }
      else { elEn.textContent = ''; elEn.hidden = true; }
      // il pannello resta etichettato dal prodotto FISSATO (non dall'anteprima)
      panel.setAttribute('aria-labelledby', tabs[fixedIndex].id);
    }

    // CROSSFADE dell'immagine: il ghost mostra la NUOVA foto e parte SUBITO
    // (nessun delay/debounce) sfumando in ~.42s ease-out sopra #prenotaImg (foto
    // corrente); a fine transizione committa su #prenotaImg. Con reduced-motion è
    // un cambio istantaneo.
    function setImage(i) {
      var p = PRODOTTI[i]; if (!p || !elImg) return;
      var src = IMG_DIR + p.img;
      if (reduceMotion || !ghost) {
        elImg.src = src; elImg.alt = p.alt || p.nome;
        if (ghost) ghost.style.opacity = '0';
        return;
      }
      if (commitTimer) window.clearTimeout(commitTimer);
      ghost.style.transition = 'none';
      ghost.style.opacity = '0';
      ghost.src = src;                                 // preloaded → istantaneo
      void ghost.offsetWidth;                          // reflow: reazione immediata
      ghost.style.transition = 'opacity ' + CROSSFADE_MS + 'ms ease-out';
      ghost.style.opacity = '1';
      commitTimer = window.setTimeout(function () {
        elImg.src = src; elImg.alt = p.alt || p.nome;
        ghost.style.transition = 'none';
        ghost.style.opacity = '0';
      }, CROSSFADE_MS + 30);
    }

    // mostra il prodotto i (testo istantaneo + immagine in crossfade)
    function show(i) {
      if (i === shownIndex) return;
      shownIndex = i;
      fillText(i);
      setImage(i);
    }

    function preview(i) { show(i); }                  // hover/focus → anteprima immediata
    function revertToFixed() { show(fixedIndex); }    // uscita → torna al fissato (default)

    // FISSA il prodotto i (click / Invio / Spazio): diventa lo stato forte persistente
    function fix(i) {
      fixedIndex = i;
      tabs.forEach(function (t, idx) {
        var on = idx === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');   // roving: Tab rientra sul fissato
      });
      show(i);
    }

    // sposta il focus (e quindi il roving tabindex) su un tag, mostrando l'anteprima
    function focusTab(i) {
      tabs.forEach(function (t, idx) { t.setAttribute('tabindex', idx === i ? '0' : '-1'); });
      tabs[i].focus();                                 // → l'handler 'focus' fa preview(i)
    }

    tabs.forEach(function (t, i) {
      // CLICK / TAP = fissa (per <button>, Invio e Spazio generano 'click')
      t.addEventListener('click', function () { fix(i); });
      // FOCUS da tastiera = anteprima (coerente con l'hover)
      t.addEventListener('focus', function () { preview(i); });
      // HOVER = anteprima IMMEDIATA (nessun debounce/delay), solo con puntatore fine
      if (canHover) {
        t.addEventListener('mouseenter', function () { preview(i); });
      }
    });

    // uscita dall'HOVER dall'intera lista → torna al fissato (default)
    if (canHover) {
      tablist.addEventListener('mouseleave', function () { revertToFixed(); });
    }

    // uscita dal FOCUS dalla lista (tastiera) → torna al fissato e riporta il
    // roving tabindex sul fissato, così un successivo Tab rientra sul fissato
    tablist.addEventListener('focusout', function (e) {
      if (!tablist.contains(e.relatedTarget)) {
        tabs.forEach(function (t, idx) { t.setAttribute('tabindex', idx === fixedIndex ? '0' : '-1'); });
        revertToFixed();
      }
    });

    // tastiera: le frecce muovono il FOCUS (roving) → anteprima; Invio/Spazio = click = fissa
    tablist.addEventListener('keydown', function (e) {
      var cur = tabs.indexOf(document.activeElement);
      if (cur < 0) cur = fixedIndex;
      var next;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': next = (cur + 1) % tabs.length; break;
        case 'ArrowUp':
        case 'ArrowLeft':  next = (cur - 1 + tabs.length) % tabs.length; break;
        case 'Home':       next = 0; break;
        case 'End':        next = tabs.length - 1; break;
        default: return;
      }
      e.preventDefault();
      focusTab(next);
    });

    // CAROSELLO AUTO (solo mobile): duplico i tag come CLONI decorativi, così la
    // track CSS può fare il loop infinito senza salto (translateX -50% = una copia).
    // I cloni sono aria-hidden e non focusabili → non alterano la tablist per gli
    // screen reader; su desktop restano nascosti (display:none via [data-clone]).
    tabs.forEach(function (t) {
      var c = t.cloneNode(true);
      c.removeAttribute('id');                 // niente id duplicati
      c.setAttribute('data-clone', '');
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('tabindex', '-1');
      tablist.appendChild(c);
    });

    // stato iniziale coerente col markup (primo prodotto, fissato)
    fillText(0);
    if (ghost) ghost.style.opacity = '0';
  })();

  /* ---------- FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
