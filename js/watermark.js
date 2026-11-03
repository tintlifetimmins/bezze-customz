const MARK = 'BEZZE CUSTOMZ · PREVIEW';

export function stampWatermark(ctx, width, height) {
  if (!ctx || !width || !height) return;
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 5);
  const size = Math.max(16, Math.round(Math.min(width, height) / 14));
  ctx.font = `700 ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, Math.round(size / 8));
  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  const stepX = ctx.measureText(MARK).width + size * 1.4;
  const stepY = size * 2.6;
  for (let y = -height * 1.4; y < height * 1.4; y += stepY) {
    for (let x = -width * 1.4; x < width * 1.4; x += stepX) {
      ctx.strokeText(MARK, x, y);
      ctx.fillText(MARK, x, y);
    }
  }
  ctx.restore();
}

export function previewCanvas(source, max = 800) {
  const longest = Math.max(source.width, source.height);
  const scale = Math.min(1, max / longest);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  stampWatermark(ctx, canvas.width, canvas.height);
  return canvas;
}

export function guardSaves(root = document) {
  root.addEventListener('contextmenu', (event) => {
    const target = event.target;
    if (!target || !target.tagName) return;
    const tag = target.tagName;
    if (tag === 'CANVAS' || tag === 'IMG') event.preventDefault();
  }, true);
  root.addEventListener('dragstart', (event) => {
    const target = event.target;
    if (target && target.tagName === 'IMG') event.preventDefault();
  }, true);
}
