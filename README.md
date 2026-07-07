# Agriturismo La Morò — sito vetrina

Sito **one-page statico** (HTML + CSS + JavaScript vanilla, nessun framework) per
l'Agriturismo La Morò di Frassanito (Otranto, LE): ristorante serale di cucina
salentina e punto vendita di prodotti agricoli autoprodotti.

> Il sito comunica **solo ristorazione + vendita prodotti**. Non c'è alcun
> riferimento a camere o pernottamento.

## Struttura dei file

```
LA-MORO/
├── index.html            ← tutte le sezioni della pagina
├── css/style.css         ← stile, palette, animazioni, responsive
├── js/main.js            ← intro, menù mobile, parallax, reveal
├── assets/images/        ← foto e logo (vedi sotto)
│   ├── logo.svg          ← logo (ricostruito, vedi "Logo")
│   ├── favicon.svg       ← icona scheda browser (oliva + ramoscello)
│   └── *.jpg             ← foto piatti/ambiente (placeholder da sostituire)
├── scripts/gen_placeholders.py  ← rigenera i placeholder (facoltativo)
└── README.md
```

## Come vederlo in locale

Apri semplicemente `index.html` col browser, **oppure** avvia un mini server
(consigliato, così la mappa e i font si caricano correttamente):

```bash
cd LA-MORO
python3 -m http.server 8080
# poi apri http://localhost:8080
```

---

## 1) Sostituire / aggiungere le foto

Le foto vivono in `assets/images/` con **nomi parlanti**. Al momento sono
**placeholder** color oliva: per pubblicare le foto vere ti basta
**sovrascrivere il file mantenendo lo stesso nome** — non devi toccare l'HTML.

| File | Dove appare | Formato consigliato |
|------|-------------|---------------------|
| `hero-giardino-sera.jpg` | Sfondo Hero (giardino con lucine) | orizzontale, ~1920×1080 |
| `chisiamo-ingresso.jpg` | Chi siamo (insegna tra le fioriere) | ~1200×900 |
| `antipasto-fritti-misti.jpg` | Menù · Antipasti | quadrata ~900×900 |
| `involtini-brace-rosmarino.jpg` | Menù · Dalla brace | quadrata |
| `orecchiette-cime-rapa.jpg` | Menù · Primi | quadrata |
| `tagliatelle-ceci.jpg` | Menù · Primi | quadrata |
| `pollo-brace-limone.jpg` | Menù · Secondi | quadrata |
| `grigliata-mista.jpg` | Menù · Secondi | quadrata |
| `parmigiana-melanzane.jpg` | Menù · Il classico | quadrata |
| `semifreddo-caffe.jpg` | Menù · Il dolce | quadrata |
| `bombette-preparazione.jpg` | Dietro le quinte | orizzontale |
| `prodotti-punto-vendita.jpg` | Sfondo sezione Prodotti | orizzontale |
| `ambiente-lucine-sera.jpg` | Ambiente (sera) | orizzontale |
| `ambiente-tramonto-ombrelloni.jpg` | Ambiente (tramonto) | **verticale** ~800×1200 |
| `og-cover.jpg` | Anteprima social (WhatsApp/Facebook) | 1200×630 |

**Consigli:**
- Ottimizza le foto prima di caricarle (peso ideale < 300 KB). Strumenti gratuiti:
  [squoosh.app](https://squoosh.app) o [tinyjpg.com](https://tinyjpg.com).
- Vuoi foto ancora più leggere? Salva anche in **.webp** e sostituisci
  l'estensione `.jpg` con `.webp` nel `src` dell'immagine dentro `index.html`.
- Ricordati di aggiornare l'`alt=""` (testo descrittivo) se cambia il soggetto:
  serve per accessibilità e Google.

Per rigenerare i placeholder (se ti servono di nuovo):
```bash
pip install Pillow
python3 scripts/gen_placeholders.py
```

## 2) Il logo

Il file `assets/images/logo.svg` è una **ricostruzione fedele** del logo
(scritta "Agriturismo La Morò" con il ramoscello d'ulivo e l'oliva nera), perché
il `logo.png` originale non era incluso tra i file forniti.

**Per usare il logo ufficiale** basta:
1. Copiare il file ufficiale in `assets/images/logo.png`.
2. In `index.html` sostituire le occorrenze di `assets/images/logo.svg` con
   `assets/images/logo.png` (sono 3: header, intro, footer).

Il logo compatto per il mobile e la favicon usano `favicon.svg` (solo oliva +
ramoscello): puoi sostituirlo con una versione ridotta del logo ufficiale.

## 3) Modificare i testi

Tutti i testi sono direttamente dentro `index.html`, dentro le rispettive
`<section>` (ognuna ha un `id` parlante: `#chi-siamo`, `#menu`, `#prodotti`,
`#ambiente`, `#contatti`). Apri il file con un editor di testo e modifica il
contenuto tra i tag. Da aggiornare sicuramente:

- **Telefono**: cerca `+39 000 000 0000` (compare 2 volte: link `tel:` e testo)
  e inserisci il numero reale. Togli anche la nota *(inserire numero reale)*.
- **Social**: nel footer, i link Instagram / Facebook / TheFork hanno `href="#"`:
  sostituisci `#` con gli URL reali dei profili.

## 4) Aggiornare l'indirizzo nella mappa

La mappa è un **iframe di Google Maps** che non richiede API key. Nella sezione
"Come trovarci" di `index.html` trovi:

```html
<iframe src="https://www.google.com/maps?q=Agriturismo+La+Mor%C3%B2+Frassanito+Otranto&output=embed" ...>
```

Per cambiare posizione, sostituisci il testo dopo `q=` con l'indirizzo o le
coordinate (spazi = `+`, caratteri accentati codificati, es. `ò` = `%C3%B2`).
Aggiorna anche il pulsante **"Apri in Google Maps"** poco sopra, che usa lo
stesso indirizzo nel parametro `query=`.

> **Mappa personalizzata (facoltativa):** per un marker/stile brandizzati serve
> la *Google Maps JavaScript API* con una chiave. Si abilita dalla
> [Google Cloud Console](https://console.cloud.google.com/) → "Maps JavaScript
> API", creando una chiave con restrizione per dominio. L'iframe attuale è più
> che sufficiente per un sito vetrina e funziona subito, senza configurazione.

## 5) Deploy su hosting Aruba (o simile) via FTP

Essendo un sito statico, si carica per intero via FTP nella cartella pubblica.

1. Procurati i dati FTP dal pannello Aruba (host, es. `ftp.tuodominio.it`,
   username e password) e la cartella pubblica (di solito `/` o `httpdocs`).
2. Con un client FTP gratuito come **FileZilla**:
   - Connettiti con host / utente / password.
   - Trascina nella cartella pubblica remota **tutto il contenuto** della
     cartella del sito: `index.html`, `css/`, `js/`, `assets/`.
     *(La cartella `scripts/` e questo `README.md` non sono necessari online: puoi
     ometterli.)*
3. Apri il tuo dominio nel browser per verificare.

Aggiornamenti futuri: modifichi i file in locale e ricarichi via FTP solo quelli
cambiati (es. una foto nuova in `assets/images/`).

---

## Note tecniche

- **Responsive** mobile-first, testato a 375 / 768 / 1440 px.
- **Performance**: immagini in `loading="lazy"`, nessuna libreria esterna pesante.
- **Accessibilità**: markup semantico, `alt` descrittivi, contrasti adeguati,
  rispetto di `prefers-reduced-motion`.
- **SEO**: `title`, meta description, Open Graph e dati strutturati
  `Restaurant` (schema.org) già impostati e pensati per un ristorante.
- **Font**: Playfair Display (titoli) + Cormorant Garamond (corsivi) + Karla
  (testo), caricati da Google Fonts.

<details>
<summary>Skill UI/UX Pro Max (per sviluppo con Claude Code)</summary>

Nel progetto è vendorizzata la skill
[`ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) in
`.claude/skills/`, usata per definire palette e abbinamenti tipografici del sito.
Non ha alcun effetto sul sito pubblicato: riguarda solo l'ambiente di sviluppo.
</details>
