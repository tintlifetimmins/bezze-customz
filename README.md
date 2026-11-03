# Bezze Customz — test shop

Static test site for a 20 oz custom tumbler shop. Sample artwork only. Checkout does not take payment and nothing is uploaded.

Live site: https://tintlifetimmins.github.io/bezze-customz/

## Pages

- Home, with a live 3D tumbler and a countdown to the next Tuesday 8:00 PM America/Toronto
- Gallery of 16 generated sample designs, with search, category menu, colour chips, and sort
- Editor: full wrap (246 × 211 mm plus 3 mm bleed), safe zone, text, shapes, photo, layers, undo, and a live rotatable preview
- Bag / checkout in test mode, ending on an order confirmation with a slowly rotating low-res tumbler preview

Prices are CAD, with no tax. A gallery design as-is is $39.99. Any edit, or a design started from scratch, is $44.99. AI styles are a stub and say “coming soon”.

## Run locally

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/

## Print files

Nothing emails a print file yet, and there is no print renderer. When that is added, every file sent for printing has to go through `stampPrintUrl` in `js/print.js` before it is emailed. The words come from the single constant `SHOP_URL_MARK`, which is `bezzecustomz.ca` until the domain is chosen. The mark is 7pt, low contrast, centered on the bottom edge of the 252 × 217 mm file, 4 mm up from the edge. That sits inside the print area and below the 15 mm safe zone.

## Deploy

GitHub Actions workflow `.github/workflows/pages.yml` publishes the site from `main` with GitHub Pages.
