export const SHOP_URL_MARK = 'bezzecustomz.ca';

export const PRINT_MM = {
  width: 252,
  height: 217,
  safe: 15,
  urlInset: 4,
};

export function stampPrintUrl(ctx, width, height, url = SHOP_URL_MARK) {
  if (!ctx || !width || !height || !url) return;
  const pxPerMm = height / PRINT_MM.height;
  const dpi = pxPerMm * 25.4;
  const fontPx = Math.max(1, (7 / 72) * dpi);
  ctx.save();
  ctx.font = `400 ${fontPx}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = Math.max(0.4, fontPx * 0.06);
  ctx.fillText(url, width / 2, height - PRINT_MM.urlInset * pxPerMm);
  ctx.restore();
}
