#!/usr/bin/env python3
"""Fichiers dérivés des concepts (à lancer depuis la racine du dépôt).

  derives.py photos             photos de assets/photos-site notées ≥ 6 (CATALOGUE.md) → concepts/shared/photos/
  derives.py bouteilles         détourages de archive/accueil → concepts/shared/bouteilles/
  derives.py trait SRC DEST     garde le trait d'encre d'un dessin aquarellé (fond transparent)
  derives.py teinte SRC DEST HEX  recolore le lavis d'un dessin dans la teinte HEX (le trait reste)
  derives.py inverse SRC DEST HEX_FOND HEX_ENCRE  motif clair sur fond foncé (toile de Jouy)
  derives.py blanc SRC DEST [MARGE]  dessin sur papier blanc → PNG transparent, recadré au dessin
"""
import re
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SHARED = ROOT / 'concepts/shared'


def photos(max_side=1800, quality=80):
    cat = (ROOT / 'assets/photos-site/CATALOGUE.md').read_text()
    rows = re.findall(r'^\| \d+\s+\| `([^`]+)`\s+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\| \*\*([\d.]+)\*\*', cat, re.M)
    out = SHARED / 'photos'
    out.mkdir(parents=True, exist_ok=True)
    keep = [name for name, note in rows if float(note) >= 6.0]
    for name in keep:
        im = ImageOps.exif_transpose(Image.open(ROOT / 'assets/photos-site' / name)).convert('RGB')
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        im.save(out / name, 'JPEG', quality=quality, optimize=True, progressive=True)
    # Photo d'archive du pressoir (1927), sans sa légende imprimée.
    src = ROOT / 'archive/accueil/design-graphique/img/pressoir-1927.jpg'
    if src.exists():
        im = Image.open(src).convert('RGB')
        im.crop((0, 0, im.width, int(im.height * 0.885))).save(out / 'histoire-pressoir-lejeune-1927.jpg', 'JPEG', quality=88)
    print(f'{len(keep)} photos → {out}')


def bouteilles():
    out = SHARED / 'bouteilles'
    out.mkdir(parents=True, exist_ok=True)
    src = ROOT / 'archive/accueil/design-graphique/img'
    for f in sorted(src.glob('bouteille-*.webp')):
        shutil.copy(f, out / f.name.replace('bouteille-', ''))
    print('bouteilles →', sorted(p.name for p in out.iterdir()))


def _ink_alpha(rgb):
    """Opacité du trait : sombre et peu saturé = encre ; lavis clair = transparent."""
    a = rgb.astype(np.float32) / 255
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    return np.clip((0.62 - lum) / 0.42, 0, 1)


def trait(src, dest, ink='#2E2620'):
    im = np.asarray(Image.open(src).convert('RGB'))
    alpha = _ink_alpha(im)
    r, g, b = (int(ink[i:i + 2], 16) for i in (1, 3, 5))
    out = np.zeros((*alpha.shape, 4), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = r, g, b
    out[..., 3] = (alpha * 255).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(dest, optimize=True)


def teinte(src, dest, hexcol):
    """Garde la luminosité du lavis, impose la teinte ; le trait sombre est préservé."""
    im = Image.open(src).convert('RGB')
    hsv = np.asarray(im.convert('HSV')).astype(np.float32)
    target = Image.new('RGB', (1, 1), hexcol).convert('HSV').getpixel((0, 0))
    ink = _ink_alpha(np.asarray(im))
    wash = (hsv[..., 1] > 18) & (ink < 0.5)
    hsv[..., 0] = np.where(wash, target[0], hsv[..., 0])
    hsv[..., 1] = np.where(wash, np.clip(hsv[..., 1] * 0.5 + target[1] * 0.6, 0, 255), hsv[..., 1])
    Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB').save(dest, quality=88)


def inverse(src, dest, fond, encre):
    im = np.asarray(Image.open(src).convert('L')).astype(np.float32) / 255
    f = np.array([int(fond[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
    e = np.array([int(encre[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
    t = (1 - im)[..., None]  # 1 = encre
    out = f * (1 - t) + e * t
    Image.fromarray(out.astype(np.uint8), 'RGB').save(dest, quality=88)


def blanc(src, dest, marge='24'):
    """« Couleur vers alpha » du blanc : le lavis devient transparent sans liseré, puis recadrage."""
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    # Fond légèrement teinté par le modèle : on le ramène au blanc avant l'extraction.
    paper = np.percentile(a.reshape(-1, 3), 99, axis=0)
    a = np.clip(a * (255 / np.maximum(paper, 1)), 0, 255)
    alpha = np.max(255 - a, axis=2) / 255
    alpha = np.where(alpha < 0.04, 0, alpha)
    safe = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip((a - 255 * (1 - safe)) / safe, 0, 255)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    box = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    if box:
        m = int(marge)
        box = (max(0, box[0] - m), max(0, box[1] - m), min(im.width, box[2] + m), min(im.height, box[3] + m))
        im = im.crop(box)
    im.save(dest, optimize=True)


if __name__ == '__main__':
    cmd, *args = sys.argv[1:] or ['']
    {'photos': photos, 'bouteilles': bouteilles, 'trait': trait, 'teinte': teinte, 'inverse': inverse, 'blanc': blanc}[cmd](*args)
