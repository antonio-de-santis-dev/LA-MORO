# Carosello "Coverflow 3D" dei piatti — guida

Spiegazione per chi non ha scritto il codice. Riguarda la sezione **"La cucina"**
della home (`index.html`), le card dei piatti e il modal di dettaglio.

## 1. Com'è strutturato (HTML / CSS / JS)

**HTML** (`index.html`, dentro `<section id="menu">`):

```
.coverflow                      ← contenitore + prospettiva 3D
├─ button.coverflow__arrow--prev   ← freccia sinistra
├─ .coverflow__viewport            ← "finestra" che ritaglia (overflow hidden)
│   └─ .coverflow__stage           ← palco 3D (perspective + preserve-3d)
│       └─ article.dish.coverflow__card  × 8   ← le card (posizionate in assoluto)
└─ button.coverflow__arrow--next   ← freccia destra
```

Ogni card contiene, come prima: immagine in alto (`.dish__img`), poi
`.dish__cat` (es. "ANTIPASTI"), titolo `<h3>` e descrizione `<p>`.

Il **modal** è in fondo alla pagina (prima di `</body>`): `#dishModal` con
backdrop scuro, pannello `role="dialog"`, pulsante di chiusura, e i campi
immagine/categoria/titolo/descrizione che il JS riempie al volo.

**CSS** (`css/style.css`): blocco *"Dishes Coverflow (3D)"* per il carosello e
blocco *"Dish modal / lightbox"* per il modal.

**JS** (`js/main.js`): un unico blocco `initCoverflow()` che gestisce
trasformazioni, frecce, tastiera, drag/swipe e modal.

## 2. Il cuore dell'effetto: la trasformazione di ogni card

Non c'è scroll. C'è un **indice attivo** (`active`): la card centrale. Per ogni
card si calcola l'**offset** rispetto al centro:

```
a = indice_card − centro        (può essere frazionario durante il drag)
```

Da `a` (e dal suo valore assoluto `aa = |a|`) si ricava la trasformazione, nella
funzione `styleFor(card, a)`:

- **translateX**: sposta la card di lato. Cresce con l'offset ma si "comprime"
  oltre la prima posizione, così le card si sovrappongono invece di allontanarsi.
- **translateZ** (negativo): spinge le laterali *indietro* nella profondità.
- **rotateY**: le inclina verso il centro. Segno **opposto** a sinistra e a destra
  (`-sign * rotate`), è ciò che dà il look "Coverflow".
- **scale**: rimpicciolisce le laterali (1 al centro, `--coverflow-scale-side` a ±1).
- **opacity**: 1 al centro, ~.7 a ±1, ~.4 a ±2, 0 da ±3 in poi (card nascoste).
- **z-index**: `100 − round(aa)`, così la centrale sta **davanti** e le adiacenti
  passano **dietro** di lei.

Le formule sono **continue**: funzionano anche con `a` frazionario, ed è per
questo che durante il trascinamento le card seguono il dito in modo fluido.

Cambiare card = cambiare `active` e richiamare `render()`: la transizione CSS
(`--coverflow-speed`) anima il movimento.

## 3. Le VARIABILI CHIAVE (dove metto le mani)

Stanno in `css/style.css`, sul selettore **`.coverflow`** (sono variabili CSS).
Il JS le rilegge da lì: **basta cambiarle qui**, non serve toccare il JavaScript.

| Variabile | Cosa fa | Se la aumento… |
|---|---|---|
| `--coverflow-speed` | durata transizione | il cambio card è più lento/morbido |
| `--coverflow-card-width` | larghezza card | card più grandi (l'altezza si adegua) |
| `--coverflow-perspective` | profondità prospettica | 3D più "piatto" (valore alto) o più marcato (basso) |
| `--coverflow-scale-side` | scala delle adiacenti | laterali più grandi (vicino a 1) o più piccole |
| `--coverflow-rotate` | angolo `rotateY` laterali | inclinazione più forte delle card laterali |
| `--coverflow-translate-z` | arretramento in Z | laterali più lontane/dietro (più negativo) |
| `--coverflow-offset-x` | spostamento laterale (frazione della card) | card più distanziate o più sovrapposte |

> Nota tecnica: `--coverflow-card-width` usa `clamp()` e non è leggibile
> direttamente dal JS, quindi la larghezza viene **misurata** dalla card reale.
> Tutte le altre variabili vengono lette come numeri.

I valori sono ritoccati automaticamente per **tablet** (≤1024px, 3D attenuato) e
**mobile** (≤640px, card centrale larga, effetto ridotto, frecce nascoste) nei
rispettivi `@media`.

## 4. Aggiungere o togliere un piatto

Nel `index.html`, dentro `.coverflow__stage`, ogni piatto è un blocco:

```html
<article class="dish coverflow__card" data-index="N" tabindex="-1"
         aria-roledescription="piatto" aria-label="Categoria: Titolo">
  <div class="dish__img"><img src="assets/images/FILE.jpg" loading="lazy" alt="…"></div>
  <div class="dish__body">
    <span class="dish__cat">CATEGORIA</span>
    <h3>Titolo del piatto</h3>
    <p>Descrizione.</p>
  </div>
</article>
```

- **Aggiungere**: copia un blocco `<article>`, cambia immagine/categoria/titolo/
  descrizione e l'`aria-label`. L'attributo `data-index` è solo indicativo: il JS
  ricalcola gli indici da solo, quindi non è critico che sia progressivo (ma è
  buona norma tenerlo in ordine).
- **Togliere**: elimina l'intero blocco `<article>`.

Non serve modificare CSS o JS: il carosello si adatta al numero di card.

## 5. Cosa NON toccare (accessibilità)

- **Le frecce sono `<button>` con `aria-label`**: non trasformarle in `<div>` e
  non rimuovere le label.
- Il modal ha `role="dialog"`, `aria-modal="true"` e `aria-labelledby="dishModalTitle"`:
  l'`id="dishModalTitle"` sull'`<h3>` del modal deve restare (collega titolo e dialog).
- Il pulsante di chiusura ha `aria-label` e l'attributo `data-close`: gli elementi
  con `data-close` (backdrop e X) sono quelli che chiudono il modal — non rimuoverli.
- Le card hanno `tabindex` gestito dal JS (0 sulla attiva, -1 sulle altre): non
  aggiungere `tabindex` a mano.
- Il **focus trap** e il **ritorno del focus** alla card sono gestiti in JS: non
  serve fare nulla, ma non rimuovere gli `id` degli elementi del modal.
- Lo **scroll lock** usa la classe `body.modal-open`: è indipendente dallo scroll
  lock dell'intro (`body:not(.intro-done)`), non vanno mischiati.
- `prefers-reduced-motion`: con questa impostazione il 3D si appiattisce
  automaticamente (niente rotazioni/profondità) e le transizioni si annullano.
  È voluto: non forzare le animazioni.
