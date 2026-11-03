function roundRect(g, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + radius, y);
  g.arcTo(x + w, y, x + w, y + h, radius);
  g.arcTo(x + w, y + h, x, y + h, radius);
  g.arcTo(x, y + h, x, y, radius);
  g.arcTo(x, y, x + w, y, radius);
  g.closePath();
}

export function paintProductShot(wrap) {
  const W = 420;
  const H = 640;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  const cx = W / 2;
  const topRx = 70;
  const botRx = 62;
  const bodyTop = 128;
  const bodyBot = 548;

  g.save();
  g.filter = 'blur(16px)';
  g.fillStyle = 'rgba(0,0,0,.5)';
  g.beginPath();
  g.ellipse(cx, bodyBot + 22, 86, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();

  const trace = () => {
    g.beginPath();
    g.moveTo(cx - topRx, bodyTop);
    g.lineTo(cx - botRx, bodyBot - 10);
    g.quadraticCurveTo(cx, bodyBot + 26, cx + botRx, bodyBot - 10);
    g.lineTo(cx + topRx, bodyTop);
    g.closePath();
  };

  g.save();
  trace();
  g.clip();
  const sw = wrap.width * 0.5;
  const sx = (wrap.width - sw) / 2;
  g.drawImage(wrap, sx, 0, sw, wrap.height, cx - topRx - 8, bodyTop - 4, topRx * 2 + 16, bodyBot - bodyTop + 20);
  const sheen = g.createLinearGradient(cx - topRx, 0, cx + topRx, 0);
  sheen.addColorStop(0, 'rgba(0,0,0,.5)');
  sheen.addColorStop(0.2, 'rgba(255,255,255,.2)');
  sheen.addColorStop(0.48, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.78, 'rgba(0,0,0,.12)');
  sheen.addColorStop(1, 'rgba(0,0,0,.48)');
  g.fillStyle = sheen;
  g.fillRect(0, bodyTop, W, bodyBot - bodyTop + 30);
  const vert = g.createLinearGradient(0, bodyTop, 0, bodyBot);
  vert.addColorStop(0, 'rgba(255,255,255,.18)');
  vert.addColorStop(0.25, 'rgba(255,255,255,0)');
  vert.addColorStop(1, 'rgba(0,0,0,.25)');
  g.fillStyle = vert;
  g.fillRect(0, bodyTop, W, bodyBot);
  g.restore();

  const lidY = bodyTop - 4;
  const lidRx = topRx + 6;
  const lidRy = 20;
  const metal = g.createLinearGradient(cx - lidRx, lidY - 30, cx + lidRx, lidY + 20);
  metal.addColorStop(0, '#8e949e');
  metal.addColorStop(0.35, '#f7f7f8');
  metal.addColorStop(0.6, '#c5c8ce');
  metal.addColorStop(1, '#9aa0a8');
  g.fillStyle = metal;
  g.beginPath();
  g.ellipse(cx, lidY, lidRx, lidRy, 0, 0, Math.PI * 2);
  g.fill();

  g.beginPath();
  g.ellipse(cx, lidY - 12, lidRx * 0.82, lidRy * 0.72, 0, 0, Math.PI * 2);
  const cap = g.createLinearGradient(cx - lidRx, lidY - 30, cx + lidRx, lidY);
  cap.addColorStop(0, '#d5d8de');
  cap.addColorStop(0.45, '#ffffff');
  cap.addColorStop(1, '#b4b8c0');
  g.fillStyle = cap;
  g.fill();

  g.fillStyle = 'rgba(20,20,24,.55)';
  roundRect(g, cx - 18, lidY - 18, 36, 7, 3);
  g.fill();

  g.strokeStyle = 'rgba(255,255,255,.35)';
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(cx, lidY, lidRx - 1, lidRy - 1, 0, Math.PI * 1.05, Math.PI * 1.95);
  g.stroke();

  return canvas;
}
