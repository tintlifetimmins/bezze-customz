# Bezze Customz — test shop

Static test site for a 20 oz custom tumbler shop. Sample artwork only. Checkout does not take payment and nothing is uploaded.

Live site: https://tintlifetimmins.github.io/bezze-customz/

## Pages

- Home, with a live 3D tumbler and a countdown to the next Tuesday 8:00 PM America/Toronto
- Gallery of 16 generated sample designs, with search, category menu, colour chips, and sort
- Editor: full wrap (246 × 211 mm plus 3 mm bleed), safe zone, text, shapes, photo, layers, undo, and a live rotatable preview
- Bag / checkout in test mode, ending on an order confirmation with a PNG of the wrap

Prices are CAD. A gallery design as-is is $39.99. Any edit, or a design started from scratch, is $44.99. Ontario HST (13%) is shown. AI styles are a stub and say “coming soon”.

## Run locally

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/

## Deploy

GitHub Actions workflow `.github/workflows/pages.yml` publishes the site from `main` with GitHub Pages.
