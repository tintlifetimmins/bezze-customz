function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tiles = new Map();

function grainTile(alpha, seed) {
  const key = alpha + ':' + seed;
  if (tiles.has(key)) return tiles.get(key);
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const g = tile.getContext('2d');
  const img = g.createImageData(128, 128);
  const rand = mulberry32(seed + 99);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 170 + Math.floor(rand() * 80);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = Math.floor(rand() * alpha);
  }
  g.putImageData(img, 0, 0);
  tiles.set(key, tile);
  return tile;
}

function grain(ctx, w, h, alpha, seed) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile(alpha, seed), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function vignette(ctx, w, h, alpha) {
  const g = ctx.createRadialGradient(w / 2, h * 0.46, w * 0.15, w / 2, h * 0.5, w * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function fillGrad(ctx, w, h, stops, vertical = true) {
  const g = vertical
    ? ctx.createLinearGradient(0, 0, 0, h)
    : ctx.createLinearGradient(0, 0, w, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function flowers(ctx, w, h, color, count, scale = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, w * 0.0015);
  for (let i = 0; i < count; i += 1) {
    const x = ((i * 397) % 1000) / 1000 * w;
    const y = ((i * 733) % 1000) / 1000 * h;
    const s = w * (0.012 + (i % 5) * 0.003) * scale;
    ctx.beginPath();
    for (let k = 0; k < 6; k += 1) {
      const a = (k / 6) * Math.PI * 2 + i * 0.2;
      ctx.ellipse(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.95, s * 0.38, a, 0, Math.PI * 2);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function glow(ctx, w, h, color, cx, cy, r) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawRose(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#7a0040'], [0.45, '#c2006b'], [1, '#e8158a']]);
  glow(ctx, w, h, 'rgba(255,70,160,.55)', w / 2, h * 0.48, w * 0.55);
  flowers(ctx, w, h, 'rgba(255,210,230,.34)', 34, 1);
  vignette(ctx, w, h, 0.28);
  grain(ctx, w, h, 36, 1);
}

function drawGlacier(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#d7ecf8'], [0.42, '#7eb4d4'], [1, '#24597a']]);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth = Math.max(1, w * 0.003);
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, h * (0.08 + i * 0.1));
    ctx.bezierCurveTo(w * 0.3, h * (0.02 + i * 0.1), w * 0.6, h * (0.16 + i * 0.1), w, h * (0.06 + i * 0.1));
    ctx.stroke();
  }
  ctx.restore();
  vignette(ctx, w, h, 0.2);
  grain(ctx, w, h, 28, 2);
}

function drawAurora(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#1b1040'], [0.4, '#5b2a86'], [0.72, '#147a86'], [1, '#123044']], false);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = Math.max(1, w * 0.004);
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(w * (0.2 + i * 0.22), h * 0.55, w * (0.18 + i * 0.04), Math.PI * 1.05, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.restore();
  vignette(ctx, w, h, 0.35);
  grain(ctx, w, h, 32, 3);
}

function drawOnyx(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#2c2c31'], [0.55, '#0c0c0e'], [1, '#19191c']], false);
  ctx.strokeStyle = 'rgba(255,255,255,.07)';
  ctx.lineWidth = Math.max(1, w * 0.003);
  for (let i = -6; i < 18; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * w * 0.12, 0);
    ctx.lineTo(i * w * 0.12 + w * 0.42, h);
    ctx.stroke();
  }
  vignette(ctx, w, h, 0.4);
  grain(ctx, w, h, 34, 4);
}

function drawBlush(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#f6e4ea'], [0.5, '#e4b3c2'], [1, '#b76d84']]);
  const rand = mulberry32(5);
  for (let i = 0; i < 18; i += 1) {
    const x = rand() * w;
    const y = rand() * h;
    const r = w * (0.05 + rand() * 0.07);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  flowers(ctx, w, h, 'rgba(120,50,70,.28)', 16, 1.3);
  grain(ctx, w, h, 22, 5);
}

function drawMidnight(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#140910'], [0.5, '#2a1024'], [1, '#10080e']]);
  flowers(ctx, w, h, 'rgba(214,140,170,.4)', 22, 1.15);
  glow(ctx, w, h, 'rgba(255,45,143,.18)', w * 0.5, h * 0.4, w * 0.4);
  vignette(ctx, w, h, 0.45);
  grain(ctx, w, h, 30, 6);
}

function drawPetal(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#fff6f2'], [0.55, '#f0c2c0'], [1, '#d9899a']]);
  flowers(ctx, w, h, 'rgba(160,60,80,.35)', 20, 1.4);
  ctx.strokeStyle = 'rgba(120,40,55,.35)';
  ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76);
  grain(ctx, w, h, 20, 7);
}

function drawSage(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#e4efe6'], [0.6, '#8eaa96'], [1, '#3e5c49']]);
  ctx.save();
  ctx.strokeStyle = 'rgba(20,50,32,.35)';
  ctx.lineWidth = Math.max(1, w * 0.003);
  for (let i = 0; i < 7; i += 1) {
    const x = w * (0.18 + (i % 4) * 0.2);
    const y = h * (0.22 + Math.floor(i / 4) * 0.38);
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.12);
    ctx.quadraticCurveTo(x + w * 0.02, y, x, y - h * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + w * 0.04, y, w * 0.035, w * 0.016, -0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x - w * 0.04, y + h * 0.03, w * 0.035, w * 0.016, 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  grain(ctx, w, h, 24, 8);
}

function drawCourt(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#1c1d22'], [1, '#0e0f13']]);
  ctx.fillStyle = '#ff2d8f';
  ctx.fillRect(0, h * 0.42, w, h * 0.045);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.fillRect(0, h * 0.48, w, Math.max(2, h * 0.008));
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = Math.max(2, w * 0.012);
  ctx.font = `600 ${w * 0.34}px Outfit, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('01', w / 2, h * 0.62);
  ctx.restore();
  grain(ctx, w, h, 26, 9);
}

function drawVelvet(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#4a1830'], [0.45, '#2a0d1c'], [1, '#140810']]);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.55);
  ctx.fillStyle = 'rgba(255,180,200,.16)';
  ctx.fillRect(-w, -h * 0.08, w * 2, h * 0.16);
  ctx.fillStyle = '#ff2d8f';
  ctx.fillRect(-w, -h * 0.012, w * 2, h * 0.024);
  ctx.restore();
  vignette(ctx, w, h, 0.35);
  grain(ctx, w, h, 30, 10);
}

function starStroke(ctx, x, y, r, color, width) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.42;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawNorth(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#243056'], [0.5, '#14182c'], [1, '#0c101c']]);
  starStroke(ctx, w / 2, h * 0.46, w * 0.16, 'rgba(255,255,255,.8)', Math.max(2, w * 0.004));
  starStroke(ctx, w * 0.22, h * 0.28, w * 0.035, 'rgba(180,200,255,.7)', Math.max(1, w * 0.003));
  starStroke(ctx, w * 0.78, h * 0.66, w * 0.028, 'rgba(180,200,255,.55)', Math.max(1, w * 0.003));
  vignette(ctx, w, h, 0.4);
  grain(ctx, w, h, 28, 11);
}

function drawMonogram(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#1a120c'], [0.5, '#0e0c0a'], [1, '#221812']]);
  ctx.strokeStyle = 'rgba(232,206,168,.45)';
  ctx.lineWidth = Math.max(1, w * 0.003);
  ctx.strokeRect(w * 0.14, h * 0.14, w * 0.72, h * 0.72);
  ctx.fillStyle = 'rgba(255,244,230,.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${w * 0.46}px "Instrument Serif", Georgia, serif`;
  ctx.fillText('A', w / 2, h * 0.5);
  grain(ctx, w, h, 26, 12);
}

function drawSerif(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#f4f0e8'], [1, '#d9d2c6']]);
  ctx.fillStyle = '#1a1612';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${w * 0.09}px Cinzel, Georgia, serif`;
  ctx.fillText('NAME', w / 2, h * 0.46);
  ctx.fillRect(w * 0.3, h * 0.56, w * 0.4, Math.max(1, h * 0.004));
  ctx.font = `500 ${w * 0.035}px "Libre Baskerville", Georgia, serif`;
  ctx.fillText('SAMPLE', w / 2, h * 0.63);
  grain(ctx, w, h, 18, 13);
}

function drawMaple(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#6e1c2c'], [0.5, '#3d1018'], [1, '#24090e']]);
  ctx.fillStyle = 'rgba(232,196,122,.85)';
  const cx = w / 2;
  const cy = h / 2;
  const R = w * 0.28;
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.92);
    ctx.rotate(a);
    const s = w * 0.012;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.62, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.62, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.02, 0, Math.PI * 2);
  ctx.fill();
  vignette(ctx, w, h, 0.35);
  grain(ctx, w, h, 28, 14);
}

function sprig(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s);
  ctx.quadraticCurveTo(x + s * 0.08, y, x, y - s);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const yy = y + s * 0.55 - i * s * 0.32;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + s * 0.42, yy - s * 0.16);
    ctx.moveTo(x, yy);
    ctx.lineTo(x - s * 0.42, yy - s * 0.16);
    ctx.stroke();
  }
}

function drawCedar(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#16382c'], [0.55, '#0d241c'], [1, '#081610']]);
  ctx.strokeStyle = 'rgba(236,232,214,.7)';
  ctx.lineWidth = Math.max(1, w * 0.003);
  sprig(ctx, w * 0.32, h * 0.48, h * 0.16);
  sprig(ctx, w * 0.68, h * 0.5, h * 0.12);
  vignette(ctx, w, h, 0.4);
  grain(ctx, w, h, 26, 15);
}

function drawEmber(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#2a0a0c'], [0.5, '#7a1e24'], [1, '#140608']]);
  ctx.strokeStyle = 'rgba(232,196,122,.75)';
  ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.strokeRect(w * 0.12, h * 0.1, w * 0.76, h * 0.8);
  ctx.strokeRect(w * 0.16, h * 0.14, w * 0.68, h * 0.72);
  glow(ctx, w, h, 'rgba(255,120,60,.25)', w / 2, h * 0.7, w * 0.45);
  grain(ctx, w, h, 30, 16);
}

function drawCustom(ctx, w, h) {
  fillGrad(ctx, w, h, [[0, '#2a1020'], [0.42, '#6d1244'], [1, '#ff2d8f']]);
  glow(ctx, w, h, 'rgba(255,255,255,.18)', w / 2, h * 0.42, w * 0.35);
  vignette(ctx, w, h, 0.25);
  grain(ctx, w, h, 24, 17);
}

const DRAW = {
  'rose-noir': drawRose,
  glacier: drawGlacier,
  aurora: drawAurora,
  onyx: drawOnyx,
  'blush-matte': drawBlush,
  'midnight-bloom': drawMidnight,
  'soft-petal': drawPetal,
  'sage-quiet': drawSage,
  'court-line': drawCourt,
  'velvet-lane': drawVelvet,
  'north-star': drawNorth,
  monogram: drawMonogram,
  'serif-line': drawSerif,
  'maple-hour': drawMaple,
  'cedar-snow': drawCedar,
  'ember-eve': drawEmber,
  custom: drawCustom,
};

export const DESIGNS = [
  { id: 'rose-noir', name: 'Rose Noir', category: 'Drops', colour: 'pink', matte: false, tags: ['pink', 'floral', 'fuchsia', 'drop'], popular: 98, newest: 16, badge: 'Drop 014', ink: '#ffffff' },
  { id: 'glacier', name: 'Glacier', category: 'Drops', colour: 'blue', matte: false, tags: ['blue', 'cool', 'drop'], popular: 90, newest: 15, badge: 'Drop 014', ink: '#102433' },
  { id: 'aurora', name: 'Aurora Line', category: 'Drops', colour: 'blue', matte: false, tags: ['blue', 'purple', 'gradient', 'drop'], popular: 84, newest: 14, badge: 'Drop 014', ink: '#ffffff' },
  { id: 'onyx', name: 'Onyx', category: 'Drops', colour: 'dark', matte: true, tags: ['black', 'dark', 'matte', 'bestseller'], popular: 96, newest: 4, badge: 'Bestseller', ink: '#ffffff' },
  { id: 'blush-matte', name: 'Blush Matte', category: 'Floral', colour: 'pink', matte: true, tags: ['pink', 'floral', 'matte', 'blush'], popular: 88, newest: 13, badge: 'Drop 014', ink: '#3a1822' },
  { id: 'midnight-bloom', name: 'Midnight Bloom', category: 'Floral', colour: 'dark', matte: false, tags: ['floral', 'dark', 'night'], popular: 76, newest: 9, ink: '#ffffff' },
  { id: 'soft-petal', name: 'Soft Petal', category: 'Floral', colour: 'pink', matte: false, tags: ['floral', 'pink', 'light'], popular: 70, newest: 8, ink: '#3a1822' },
  { id: 'sage-quiet', name: 'Sage Quiet', category: 'Floral', colour: 'green', matte: true, tags: ['green', 'leaf', 'matte', 'calm'], popular: 64, newest: 6, ink: '#102218' },
  { id: 'court-line', name: 'Court Line', category: 'Sport', colour: 'dark', matte: false, tags: ['sport', 'dark', 'stripe'], popular: 86, newest: 11, ink: '#ffffff' },
  { id: 'velvet-lane', name: 'Velvet Lane', category: 'Sport', colour: 'pink', matte: false, tags: ['sport', 'wine', 'pink'], popular: 74, newest: 10, ink: '#ffffff' },
  { id: 'north-star', name: 'North Star', category: 'Sport', colour: 'blue', matte: false, tags: ['navy', 'star', 'blue'], popular: 68, newest: 5, ink: '#ffffff' },
  { id: 'monogram', name: 'Monogram', category: 'Names', colour: 'dark', matte: false, tags: ['name', 'letter', 'gold'], popular: 92, newest: 12, ink: '#fff4e6' },
  { id: 'serif-line', name: 'Serif Line', category: 'Names', colour: 'light', matte: true, tags: ['name', 'ivory', 'type', 'matte'], popular: 66, newest: 7, ink: '#1a1612' },
  { id: 'maple-hour', name: 'Maple Hour', category: 'Holiday', colour: 'dark', matte: false, tags: ['holiday', 'gold', 'red'], popular: 73, newest: 3, ink: '#f3e2b0' },
  { id: 'cedar-snow', name: 'Cedar & Snow', category: 'Holiday', colour: 'green', matte: false, tags: ['holiday', 'green', 'winter'], popular: 71, newest: 2, ink: '#f4f1e6' },
  { id: 'ember-eve', name: 'Ember Eve', category: 'Holiday', colour: 'dark', matte: false, tags: ['holiday', 'gold', 'night'], popular: 69, newest: 1, ink: '#f3e2b0' },
];

export const CATEGORIES = ['All', 'Drops', 'Floral', 'Sport', 'Names', 'Holiday'];

export const COLOUR_CHIPS = [
  { id: 'all', label: 'All colours' },
  { id: 'pink', label: 'Pink' },
  { id: 'blue', label: 'Blue' },
  { id: 'dark', label: 'Dark' },
  { id: 'green', label: 'Green' },
  { id: 'matte', label: 'Matte' },
];

export function getDesign(id) {
  return DESIGNS.find((design) => design.id === id) || null;
}

export function drawDesign(id, ctx, w, h) {
  const draw = DRAW[id] || drawCustom;
  draw(ctx, w, h);
}

export function filterDesigns({ q = '', cat = 'All', colour = 'all', sort = 'popular' } = {}) {
  const query = q.trim().toLowerCase();
  const list = DESIGNS.filter((design) => {
    if (cat && cat !== 'All' && design.category !== cat) return false;
    if (colour === 'matte' && !design.matte) return false;
    if (colour && colour !== 'all' && colour !== 'matte' && design.colour !== colour) return false;
    if (!query) return true;
    const hay = `${design.name} ${design.category} ${design.tags.join(' ')}`.toLowerCase();
    return hay.includes(query);
  });
  if (sort === 'newest') list.sort((a, b) => b.newest - a.newest);
  else if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => b.popular - a.popular);
  return list;
}

export function drawWrap(key, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (key && key.startsWith('grad:')) {
    const [a, b] = key.slice(5).split(',');
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, b);
    g.addColorStop(1, a);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 26, 21);
  } else {
    drawDesign(key || 'custom', ctx, w, h);
  }
  return canvas;
}
