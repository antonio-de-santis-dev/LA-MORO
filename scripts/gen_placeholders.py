#!/usr/bin/env python3
"""Genera immagini placeholder eleganti (tono oliva/crema) con i nomi file
definitivi usati dal sito. Sostituisci questi file con le foto reali
mantenendo lo stesso nome: non serve toccare l'HTML.

Uso:  python3 scripts/gen_placeholders.py
Richiede: Pillow  (pip install Pillow)
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

# Palette dal logo
CREAM   = (250, 246, 236)
SAND    = (232, 221, 198)
OLIVE   = (124, 138, 62)
OLIVE_D = (94, 107, 46)
BROWN   = (107, 78, 55)
COTTO   = (176, 99, 59)
DARK    = (27, 28, 18)

def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make(name, w, h, label, c1, c2, dark=False):
    img = Image.new("RGB", (w, h), c1)
    px = img.load()
    # diagonal gradient
    maxd = w + h
    for y in range(h):
        for x in range(0, w, 2):
            t = (x + y) / maxd
            col = lerp(c1, c2, t)
            px[x, y] = col
            if x + 1 < w:
                px[x + 1, y] = col
    d = ImageDraw.Draw(img, "RGBA")

    # soft vignette
    vig = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-w*0.3, -h*0.3, w*1.3, h*1.3], fill=90)
    vig = vig.filter(ImageFilter.GaussianBlur(w//8))
    shade = Image.new("RGB", (w, h), (0, 0, 0))
    img = Image.composite(img, shade, vig.point(lambda p: 255 - (255-p)//3))
    d = ImageDraw.Draw(img, "RGBA")

    cx, cy = w // 2, int(h * 0.44)
    ink = (250, 246, 236) if dark else OLIVE_D
    faint = (*ink, 70)

    # olive branch motif (stem + leaves + olive)
    L = min(w, h) // 5
    d.line([(cx - L, cy - L//3), (cx + L, cy + L//3)], fill=(*ink, 120), width=max(2, w//400))
    for i, frac in enumerate((0.15, 0.45, 0.72)):
        lx = cx - L + int(2 * L * frac)
        ly = cy - L//3 + int((2*L//3) * frac)
        leaf = (lx - L//4, ly - L//5 - L//6, lx + L//4, ly - L//5 + L//6)
        d.ellipse(leaf, outline=(*ink, 150), width=max(2, w//500))
    # olive as the terminal dot
    r = L // 6
    d.ellipse([cx + L - r, cy + L//3 - r, cx + L + r, cy + L//3 + r],
              fill=(*DARK, 200) if not dark else (*OLIVE, 220))

    # label
    f1 = font(max(18, w // 26), bold=True)
    f2 = font(max(13, w // 46))
    tb = d.textbbox((0, 0), label, font=f1)
    tw = tb[2] - tb[0]
    ty = int(h * 0.68)
    d.text((cx - tw//2, ty), label, font=f1, fill=(*ink, 235))
    sub = "foto — sostituisci mantenendo questo nome file"
    sb = d.textbbox((0, 0), sub, font=f2)
    sw = sb[2] - sb[0]
    d.text((cx - sw//2, ty + (tb[3]-tb[1]) + 14), sub, font=f2, fill=(*ink, 150))

    # subtle grain
    import random
    random.seed(hash(name) % 1000)
    gd = ImageDraw.Draw(img, "RGBA")
    for _ in range((w*h)//1400):
        x = random.randint(0, w-1); y = random.randint(0, h-1)
        a = random.randint(0, 16)
        gd.point((x, y), fill=(255, 255, 255, a))

    path = OUT / name
    img.save(path, "JPEG", quality=82, optimize=True)
    print(f"  {name}  ({w}x{h})")

# name, w, h, label, c1, c2, dark
IMAGES = [
    ("hero-giardino-sera.jpg",      1920, 1080, "Giardino la sera tra gli ulivi", OLIVE_D, DARK, True),
    ("chisiamo-ingresso.jpg",       1200, 900,  "Ingresso — insegna La Morò", SAND, OLIVE, False),
    ("antipasto-fritti-misti.jpg",  900, 900,   "Antipasto — fritti misti", CREAM, SAND, False),
    ("involtini-brace-rosmarino.jpg",900, 900,  "Involtini alla brace", SAND, COTTO, False),
    ("orecchiette-cime-rapa.jpg",   900, 900,   "Orecchiette con cime di rapa", CREAM, OLIVE, False),
    ("tagliatelle-ceci.jpg",        900, 900,   "Tagliatelle e ceci", SAND, BROWN, False),
    ("pollo-brace-limone.jpg",      900, 900,   "Pollo alla brace", CREAM, COTTO, False),
    ("grigliata-mista.jpg",         900, 900,   "Grigliata mista", SAND, BROWN, False),
    ("bombette-preparazione.jpg",   900, 900,   "Dietro le quinte — bombette", DARK, OLIVE_D, True),
    ("parmigiana-melanzane.jpg",    900, 900,   "Parmigiana di melanzane", SAND, COTTO, False),
    ("semifreddo-caffe.jpg",        900, 900,   "Semifreddo al caffè", CREAM, BROWN, False),
    ("prodotti-punto-vendita.jpg",  1200, 800,  "Prodotti dell'azienda agricola", OLIVE, OLIVE_D, True),
    ("ambiente-lucine-sera.jpg",    1200, 800,  "Cena tra gli ulivi — sera", OLIVE_D, DARK, True),
    ("ambiente-tramonto-ombrelloni.jpg", 800, 1200, "L'ambiente al tramonto", SAND, COTTO, False),
    ("og-cover.jpg",                1200, 630,  "Agriturismo La Morò", OLIVE_D, DARK, True),
]

if __name__ == "__main__":
    print("Genero placeholder in", OUT)
    for args in IMAGES:
        make(*args)
    print("Fatto.")
