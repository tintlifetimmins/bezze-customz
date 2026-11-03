import { drawWrap, getDesign } from './designs.js';
import { paintProductShot } from './thumbs.js';
import { TumblerViewer } from './tumbler.js';
import { PRICE, clearDraft, loadDraft, money, saveDraft, setBag } from './store.js';
import { initNav } from './nav.js';
import { shareDesign, showCopyField, toast } from './share.js';

initNav();

const PX = 6;
const CW = 252 * PX;
const CH = 217 * PX;

const FONTS = [
  { name: 'Great Vibes', css: '"Great Vibes", cursive', sample: 'Kayla' },
  { name: 'Instrument Serif', css: '"Instrument Serif", Georgia, serif', sample: 'Kayla' },
  { name: 'Cormorant Garamond', css: '"Cormorant Garamond", Georgia, serif', sample: 'Kayla' },
  { name: 'Playfair Display', css: '"Playfair Display", Georgia, serif', sample: 'Kayla' },
  { name: 'Libre Baskerville', css: '"Libre Baskerville", Georgia, serif', sample: 'Kayla' },
  { name: 'Cinzel', css: 'Cinzel, Georgia, serif', sample: 'KAYLA' },
  { name: 'Bebas Neue', css: '"Bebas Neue", Impact, sans-serif', sample: 'KAYLA' },
  { name: 'Outfit', css: 'Outfit, Arial, sans-serif', sample: 'Kayla' },
];

const CLIPS = [
  ['Star', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M32 4l7.2 16.8L57 23.2 44.2 35l3.6 18L32 44.8 16.2 53l3.6-18L7 23.2l17.8-2.4z"/></svg>'],
  ['Heart', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M32 54S12 42 8 28c-3-10 4-18 13-16 5 1 8 5 11 9 3-4 6-8 11-9 9-2 16 6 13 16-4 14-24 26-24 26z"/></svg>'],
  ['Flower', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="#fff"><circle cx="32" cy="14" r="8"/><circle cx="48" cy="24" r="8"/><circle cx="42" cy="42" r="8"/><circle cx="22" cy="42" r="8"/><circle cx="16" cy="24" r="8"/><circle cx="32" cy="32" r="7"/></g></svg>'],
  ['Leaf', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M12 40c8-22 28-30 42-32-2 16-8 36-30 44-2-6-6-10-12-12z"/><path fill="#111" d="M18 44c8-6 16-16 22-28" stroke="#111" stroke-width="2"/></svg>'],
  ['Crown', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M8 46l6-24 10 12 8-20 8 20 10-12 6 24z"/></svg>'],
  ['Moon', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M36 8a22 22 0 1 0 18 32A18 18 0 0 1 36 8z"/></svg>'],
  ['Diamond', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M32 6l22 18-22 34L10 24z"/></svg>'],
  ['Spark', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M32 2l4 22 22 4-22 4-4 30-4-30-22-4 22-4z"/></svg>'],
  ['Ring', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" fill-rule="evenodd" d="M32 6a26 26 0 1 0 0 52 26 26 0 0 0 0-52zm0 12a14 14 0 1 1 0 28 14 14 0 0 1 0-28z"/></svg>'],
  ['Petal', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M32 6c8 12 20 20 20 32a20 20 0 0 1-40 0C12 26 24 18 32 6z"/></svg>'],
];

const WRAPS = [
  ['#7a0048', '#ff4fa3', 'Fuchsia'],
  ['#24597a', '#d7ecf8', 'Glacier'],
  ['#0e0e10', '#3a3a40', 'Onyx'],
  ['#a86478', '#f6e4ea', 'Blush'],
  ['#b7b1a4', '#f7f3eb', 'Ivory'],
  ['#0c2b22', '#2f7a5c', 'Cedar'],
  ['#c8c8cc', '#f7f7f5', 'Pearl'],
  ['#1b2148', '#c5d0ff', 'Ink'],
];

const params = new URLSearchParams(location.search);
const design = getDesign(params.get('design'));
const mode = design ? 'gallery' : 'custom';
const currentId = () => design?.id || 'custom';

const state = {
  font: 'Great Vibes',
  ink: design?.ink || '#ffffff',
  style: 'shadow',
  wrapKey: null,
  savedAt: 0,
};

const sizeInput = document.getElementById('size');
const inkInput = document.getElementById('ink');
inkInput.value = toHex(state.ink);

let canvas;
let viewer = null;
let stack = [];
let index = -1;
let lock = false;
let syncFrame = 0;
let savedOk = true;
let warned = false;
let resetArm = 0;

fabric.Object.prototype.borderColor = '#ff2d8f';
fabric.Object.prototype.cornerColor = '#ffffff';
fabric.Object.prototype.cornerStrokeColor = '#ff2d8f';
fabric.Object.prototype.cornerSize = 16;
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.borderScaleFactor = 1.6;
fabric.Object.prototype.padding = 8;

const frame = document.getElementById('art-frame');
canvas = new fabric.Canvas('c', {
  width: CW,
  height: CH,
  enableRetinaScaling: false,
  preserveObjectStacking: true,
  selection: true,
  stopContextMenu: true,
  uniformScaling: true,
  backgroundColor: '#140810',
});
canvas.targetFindTolerance = 10;

function paintWrap(key) {
  state.wrapKey = key || null;
  const src = drawWrap(key || currentId(), CW, CH);
  const img = new fabric.Image(src, { originX: 'left', originY: 'top' });
  canvas.setBackgroundImage(img, () => {
    canvas.requestRenderAll();
    scheduleSync();
  });
}

function takeSnap() {
  return JSON.stringify({
    wrapKey: state.wrapKey,
    objects: canvas.toJSON(['data']).objects,
  });
}

function updateHistory() {
  document.getElementById('undo').disabled = index <= 0;
  document.getElementById('redo').disabled = index >= stack.length - 1;
}

function markSaved() {
  state.savedAt = Date.now();
  const el = document.getElementById('saved');
  el.textContent = savedOk ? 'Drag to rotate · saved just now' : 'Drag to rotate · not stored on this device';
}

function scheduleSync() {
  cancelAnimationFrame(syncFrame);
  syncFrame = requestAnimationFrame(() => {
    canvas.renderAll();
    const source = canvas.getElement();
    if (viewer) {
      viewer.setWrap(source, { trimmed: false });
      document.getElementById('view-stage').dataset.ready = 'true';
    } else {
      const img = document.getElementById('view-fallback');
      img.hidden = false;
      img.src = paintProductShot(source).toDataURL('image/jpeg', 0.8);
    }
  });
}

function isCustom() {
  if (mode === 'custom') return true;
  if (state.wrapKey) return true;
  return canvas.getObjects().length > 0;
}

function updatePrice() {
  const custom = isCustom();
  const value = custom ? PRICE.custom : PRICE.standard;
  document.getElementById('price').textContent = money(value);
  const note = document.getElementById('price-note');
  if (mode === 'custom') note.textContent = 'A design you build is $44.99 CAD.';
  else if (custom) note.textContent = 'Edited designs are $44.99 CAD.';
  else note.textContent = 'This sample as-is is $39.99 CAD. Any edit is $44.99.';
  return value;
}

function refreshLayers() {
  const box = document.getElementById('layers');
  const active = canvas.getActiveObject();
  box.replaceChildren();
  const objects = canvas.getObjects();
  document.getElementById('align').disabled = !active;
  document.getElementById('forward').disabled = !active;
  document.getElementById('back').disabled = !active;
  document.getElementById('delete').disabled = !active;
  if (!objects.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'Nothing added yet.';
    box.append(empty);
    return;
  }
  for (const obj of objects.slice().reverse()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'layer';
    button.textContent = layerName(obj);
    if (obj === active) button.setAttribute('aria-current', 'true');
    button.addEventListener('click', () => {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      syncFromSelection();
    });
    box.append(button);
  }
}

function layerName(obj) {
  if (obj.data?.kind === 'arc') return obj.data.text || 'Curved name';
  if (obj.data?.kind === 'text' || obj.type === 'i-text') return obj.text || 'Name';
  if (obj.data?.kind === 'clip') return obj.data.name || 'Shape';
  if (obj.data?.kind === 'photo') return 'Photo';
  return 'Layer';
}

function commit() {
  if (lock) return;
  const snap = takeSnap();
  stack = stack.slice(0, index + 1);
  stack.push(snap);
  if (stack.length > 30) stack.shift();
  index = stack.length - 1;
  const data = JSON.parse(snap);
  savedOk = saveDraft(currentId(), { v: 1, ...data, savedAt: Date.now() });
  if (!savedOk && !warned) {
    warned = true;
    toast('This is too big to keep if you leave. Tap Review before you go.');
  }
  updateHistory();
  updatePrice();
  refreshLayers();
  scheduleSync();
  markSaved();
}

function restore(snap) {
  const data = JSON.parse(snap);
  lock = true;
  canvas.discardActiveObject();
  canvas.getObjects().slice().forEach((obj) => canvas.remove(obj));
  paintWrap(data.wrapKey);
  fabric.util.enlivenObjects(data.objects || [], (objects) => {
    objects.forEach((obj) => canvas.add(obj));
    lock = false;
    canvas.requestRenderAll();
    updatePrice();
    refreshLayers();
    scheduleSync();
    updateHistory();
  });
}

function undo() {
  if (index <= 0) return;
  index -= 1;
  restore(stack[index]);
  markSaved();
}

function redo() {
  if (index >= stack.length - 1) return;
  index += 1;
  restore(stack[index]);
  markSaved();
}

function fit() {
  const width = Math.floor(frame.clientWidth);
  if (!width) return;
  const height = Math.round(width * CH / CW);
  canvas.setDimensions({ width, height }, { cssOnly: true });
}

let lastFit = 0;
new ResizeObserver(() => {
  const width = Math.floor(frame.clientWidth);
  if (!width || Math.abs(width - lastFit) < 2) return;
  lastFit = width;
  fit();
}).observe(frame);
fit();

function toHex(value) {
  if (typeof value === 'string' && value.startsWith('#') && value.length >= 7) return value.slice(0, 7);
  return '#ffffff';
}

function contrast(hex) {
  const raw = toHex(hex).slice(1);
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#1a1020' : '#ffffff';
}

function isTexty(obj) {
  return !!obj && (obj.type === 'i-text' || obj.data?.kind === 'text' || obj.data?.kind === 'arc');
}

function readMeta(obj) {
  if (obj.data?.kind === 'arc') return { ...obj.data, left: obj.left, top: obj.top };
  return {
    text: obj.text,
    fontFamily: obj.fontFamily,
    fontSize: obj.fontSize,
    fill: typeof obj.fill === 'string' ? obj.fill : state.ink,
    style: obj.data?.style || 'none',
    left: obj.left,
    top: obj.top,
  };
}

function paintStyle(obj, style) {
  const apply = (node, size) => {
    node.set({ stroke: null, shadow: null, strokeWidth: 0 });
    if (style === 'shadow') {
      node.set('shadow', new fabric.Shadow({ color: 'rgba(0,0,0,.45)', blur: 14, offsetX: 0, offsetY: 8 }));
    } else if (style === 'outline') {
      node.set({
        stroke: contrast(node.fill),
        strokeWidth: Math.max(2, (size || 80) / 28),
        paintFirst: 'stroke',
      });
    } else if (style === 'glow') {
      node.set('shadow', new fabric.Shadow({ color: node.fill || '#fff', blur: 28, offsetX: 0, offsetY: 0 }));
    }
  };
  if (obj.data?.kind === 'arc') {
    obj.forEachObject((child) => apply(child, child.fontSize));
    obj.dirty = true;
    return;
  }
  apply(obj, obj.fontSize);
}

function buildText(meta) {
  return new fabric.IText(meta.text || 'Your name', {
    fontFamily: meta.fontFamily,
    fontSize: meta.fontSize,
    fill: meta.fill,
    originX: 'center',
    originY: 'center',
    left: meta.left || CW / 2,
    top: meta.top || CH / 2,
    data: { kind: 'text', style: meta.style || 'none', fontFamily: meta.fontFamily, fill: meta.fill },
  });
}

function buildArc(meta) {
  const text = meta.text || 'Your name';
  const chars = [...text];
  const size = meta.fontSize || 200;
  const radius = size * 2.15;
  const spread = Math.min(Math.PI * 0.9, Math.max(0.2, (chars.length - 1) * 0.32));
  const step = chars.length > 1 ? spread / (chars.length - 1) : 0;
  const start = -spread / 2;
  const letters = chars.map((ch, i) => {
    const angle = start + i * step;
    return new fabric.Text(ch, {
      fontFamily: meta.fontFamily,
      fontSize: size,
      fill: meta.fill,
      left: Math.sin(angle) * radius,
      top: -Math.cos(angle) * radius,
      angle: (angle * 180) / Math.PI,
      originX: 'center',
      originY: 'center',
    });
  });
  return new fabric.Group(letters, {
    originX: 'center',
    originY: 'center',
    left: meta.left || CW / 2,
    top: meta.top || CH / 2,
    data: { kind: 'arc', text, fontFamily: meta.fontFamily, fontSize: size, fill: meta.fill, style: 'arc' },
  });
}

function replaceObject(prev, next) {
  const at = canvas.getObjects().indexOf(prev);
  lock = true;
  canvas.remove(prev);
  canvas.add(next);
  if (at >= 0) next.moveTo(at);
  lock = false;
  canvas.setActiveObject(next);
}

function highlightFont() {
  document.querySelectorAll('#fonts button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.font === state.font ? 'true' : 'false');
  });
}

function highlightStyle() {
  document.querySelectorAll('#styles button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.style === state.style ? 'true' : 'false');
  });
}

function syncFromSelection() {
  const obj = canvas.getActiveObject();
  refreshLayers();
  if (!isTexty(obj)) return;
  const meta = readMeta(obj);
  state.font = meta.fontFamily || state.font;
  state.style = meta.style || state.style;
  if (typeof meta.fill === 'string') {
    state.ink = meta.fill;
    inkInput.value = toHex(meta.fill);
  }
  if (meta.fontSize) sizeInput.value = String(meta.fontSize);
  document.getElementById('size-label').textContent = Math.round(Number(sizeInput.value) / PX) + ' mm';
  highlightFont();
  highlightStyle();
}

async function addText() {
  try { await document.fonts.load(`300px "${state.font}"`); } catch { /* fallback font */ }
  const meta = {
    text: 'Your name',
    fontFamily: state.font,
    fontSize: Number(sizeInput.value),
    fill: state.ink,
    style: state.style,
    left: CW / 2,
    top: CH / 2,
  };
  const obj = state.style === 'arc' ? buildArc(meta) : buildText(meta);
  if (obj.type === 'i-text') {
    const maxW = 222 * PX;
    let guard = 0;
    while (obj.width > maxW && obj.fontSize > 80 && guard < 40) {
      obj.set('fontSize', obj.fontSize - 8);
      guard += 1;
    }
    sizeInput.value = String(obj.fontSize);
  }
  paintStyle(obj, state.style);
  canvas.add(obj);
  canvas.setActiveObject(obj);
  commit();
}

function applyStyle(style) {
  state.style = style;
  highlightStyle();
  const obj = canvas.getActiveObject();
  if (!isTexty(obj)) return;
  const meta = readMeta(obj);
  meta.style = style;
  let next = obj;
  if (style === 'arc' && obj.data?.kind !== 'arc') {
    next = buildArc(meta);
    replaceObject(obj, next);
  } else if (style !== 'arc' && obj.data?.kind === 'arc') {
    next = buildText(meta);
    replaceObject(obj, next);
  }
  if (next.data) next.data.style = style;
  paintStyle(next, style);
  canvas.requestRenderAll();
  commit();
}

async function applyFont(font) {
  state.font = font.name;
  highlightFont();
  try { await document.fonts.load(`200px "${font.name}"`); } catch { /* keep going */ }
  const obj = canvas.getActiveObject();
  if (!isTexty(obj)) return;
  if (obj.data?.kind === 'arc') {
    obj.data.fontFamily = font.name;
    obj.forEachObject((child) => child.set('fontFamily', font.name));
    obj.dirty = true;
  } else {
    obj.set('fontFamily', font.name);
    if (obj.data) obj.data.fontFamily = font.name;
  }
  canvas.requestRenderAll();
  commit();
}

function tintSelection(color) {
  state.ink = color;
  const obj = canvas.getActiveObject();
  if (!obj) return;
  if (obj.data?.kind === 'clip') {
    paintClip(obj, color);
  } else if (obj.data?.kind === 'arc') {
    obj.data.fill = color;
    obj.forEachObject((child) => child.set('fill', color));
    obj.dirty = true;
    paintStyle(obj, 'arc');
  } else if (obj.type === 'i-text' || obj.data?.kind === 'text') {
    obj.set('fill', color);
    if (obj.data) obj.data.fill = color;
    paintStyle(obj, obj.data?.style || state.style);
  }
  canvas.requestRenderAll();
}

function paintClip(obj, color) {
  const visit = (node) => {
    if (!node) return;
    if (node.fill && node.fill !== 'none') node.set('fill', color);
    (node._objects || []).forEach(visit);
  };
  visit(obj);
  obj.dirty = true;
}

function loadSVG(svg) {
  return new Promise((resolve) => {
    fabric.loadSVGFromString(svg, (objects, options) => {
      resolve(fabric.util.groupSVGElements(objects, options));
    });
  });
}

async function addClip(name, svg) {
  const obj = await loadSVG(svg);
  obj.set({ originX: 'center', originY: 'center', data: { kind: 'clip', name } });
  obj.scaleToWidth(CW * 0.22);
  obj.set({ left: CW / 2, top: CH / 2 });
  paintClip(obj, state.ink);
  obj.setCoords();
  canvas.add(obj);
  canvas.setActiveObject(obj);
  commit();
}

function loadFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function addPhoto(file) {
  const hint = document.getElementById('photo-hint');
  if (!document.getElementById('rights').checked) {
    toast('Tick the box if you own this photo.');
    return;
  }
  const source = await loadFile(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  const copy = document.createElement('canvas');
  copy.width = Math.max(1, Math.round(source.width * scale));
  copy.height = Math.max(1, Math.round(source.height * scale));
  copy.getContext('2d').drawImage(source, 0, 0, copy.width, copy.height);
  URL.revokeObjectURL(source.src);
  const image = new fabric.Image(copy, {
    originX: 'center',
    originY: 'center',
    left: CW / 2,
    top: CH / 2,
    data: { kind: 'photo', name: 'Photo' },
  });
  image.scaleToWidth(Math.min(CW * 0.62, image.getScaledWidth()));
  canvas.add(image);
  canvas.setActiveObject(image);
  commit();
  const longest = Math.max(source.width, source.height);
  hint.textContent = longest < 1400
    ? 'This photo may look soft when printed. A larger image stays sharper.'
    : 'Your photo stays on this device. Nothing is uploaded.';
}

function removeActive() {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  canvas.remove(obj);
  commit();
}

function alignCenter() {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.center();
  obj.setCoords();
  canvas.requestRenderAll();
  commit();
}

function nudge(dir) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  if (dir > 0) canvas.bringForward(obj);
  else canvas.sendBackwards(obj);
  commit();
}

function productTitle() {
  const text = canvas.getObjects().find((obj) => obj.data?.kind === 'text' || obj.data?.kind === 'arc');
  const label = text ? (text.data?.kind === 'arc' ? text.data.text : text.text) : '';
  const clean = (label || '').trim();
  if (clean && clean !== 'Your name') return `Custom — “${clean}”`;
  if (isCustom()) return design ? `Custom — ${design.name}` : 'Custom tumbler';
  return design.name;
}

function exportPrintCanvas() {
  canvas.discardActiveObject();
  canvas.renderAll();
  const src = canvas.getElement();
  const bleedX = Math.round((3 / 252) * src.width);
  const bleedY = Math.round((3 / 217) * src.height);
  const out = document.createElement('canvas');
  out.width = 1000;
  out.height = Math.round(1000 * (211 / 246));
  out.getContext('2d').drawImage(
    src,
    bleedX,
    bleedY,
    src.width - bleedX * 2,
    src.height - bleedY * 2,
    0,
    0,
    out.width,
    out.height,
  );
  return out;
}

function review() {
  const print = exportPrintCanvas();
  let png = print.toDataURL('image/png');
  if (png.length > 3500000) png = print.toDataURL('image/jpeg', 0.86);
  const unit = updatePrice();
  setBag({
    v: 1,
    designId: currentId(),
    title: productTitle(),
    subtitle: `20 oz · ${design?.name || 'Custom wrap'} · Full wrap`,
    unitPrice: unit,
    qty: 1,
    customized: isCustom(),
    wrapPng: png,
    delivery: 'pickup',
    savedAt: Date.now(),
  });
  location.href = 'checkout.html';
}

function bootUi() {
  const fontRow = document.getElementById('fonts');
  for (const font of FONTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'font-chip';
    button.dataset.font = font.name;
    button.style.fontFamily = font.css;
    button.textContent = font.sample;
    button.addEventListener('click', () => applyFont(font));
    fontRow.append(button);
  }
  highlightFont();
  highlightStyle();

  const shapes = document.getElementById('shapes');
  for (const [name, svg] of CLIPS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shape';
    button.dataset.name = name.toLowerCase();
    button.innerHTML = svg + `<span>${name}</span>`;
    button.addEventListener('click', () => addClip(name, svg));
    shapes.append(button);
  }

  const swatches = document.getElementById('swatches');
  if (design) {
    const original = document.createElement('button');
    original.type = 'button';
    original.className = 'swatch text-swatch';
    original.textContent = 'Original';
    original.addEventListener('click', () => {
      paintWrap(null);
      commit();
    });
    swatches.append(original);
  }
  for (const [bottom, top, label] of WRAPS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.style.background = `linear-gradient(${top}, ${bottom})`;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
      paintWrap(`grad:${bottom},${top}`);
      commit();
    });
    swatches.append(button);
  }
}

bootUi();

document.getElementById('add-text').addEventListener('click', addText);
document.getElementById('styles').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  applyStyle(button.dataset.style);
});
sizeInput.addEventListener('input', () => {
  document.getElementById('size-label').textContent = Math.round(Number(sizeInput.value) / PX) + ' mm';
  const obj = canvas.getActiveObject();
  if (!isTexty(obj)) return;
  const size = Number(sizeInput.value);
  if (obj.data?.kind === 'arc') {
    const base = obj.data.fontSize || size;
    obj.set({ scaleX: size / base, scaleY: size / base });
    obj.setCoords();
  } else {
    obj.set('fontSize', size);
    paintStyle(obj, obj.data?.style || state.style);
  }
  canvas.requestRenderAll();
  scheduleSync();
});
sizeInput.addEventListener('change', () => {
  if (isTexty(canvas.getActiveObject())) commit();
});
inkInput.addEventListener('input', () => {
  tintSelection(inkInput.value);
  scheduleSync();
});
inkInput.addEventListener('change', () => {
  if (canvas.getActiveObject()) commit();
});
document.getElementById('shape-q').addEventListener('input', (event) => {
  const q = event.target.value.trim().toLowerCase();
  document.querySelectorAll('#shapes button').forEach((button) => {
    button.hidden = Boolean(q) && !button.dataset.name.includes(q);
  });
});
document.getElementById('rights').addEventListener('change', (event) => {
  document.getElementById('pick-photo').disabled = !event.target.checked;
});
document.getElementById('pick-photo').addEventListener('click', () => {
  document.getElementById('photo').click();
});
document.getElementById('photo').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (file) addPhoto(file);
});
document.getElementById('ideas').addEventListener('input', (event) => {
  document.getElementById('ideas-count').textContent = String(event.target.value.length);
});
document.querySelectorAll('.tabbar button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tabbar button').forEach((tab) => {
      tab.setAttribute('aria-current', tab === button ? 'true' : 'false');
    });
    document.querySelectorAll('.panel').forEach((panel) => {
      panel.hidden = panel.id !== 'panel-' + button.dataset.panel;
    });
  });
});
document.querySelectorAll('.ai-chips button').forEach((button) => {
  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', on ? 'false' : 'true');
  });
});
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.getElementById('align').addEventListener('click', alignCenter);
document.getElementById('forward').addEventListener('click', () => nudge(1));
document.getElementById('back').addEventListener('click', () => nudge(-1));
document.getElementById('delete').addEventListener('click', removeActive);
document.getElementById('review').addEventListener('click', review);
document.getElementById('turn-left').addEventListener('click', () => viewer && viewer.turn(-0.35));
document.getElementById('turn-right').addEventListener('click', () => viewer && viewer.turn(0.35));
document.getElementById('reset').addEventListener('click', (event) => {
  const button = event.currentTarget;
  if (Date.now() - resetArm > 3000) {
    resetArm = Date.now();
    button.textContent = 'Tap again to clear';
    return;
  }
  button.textContent = 'Start over';
  clearDraft(currentId());
  lock = true;
  canvas.discardActiveObject();
  canvas.getObjects().slice().forEach((obj) => canvas.remove(obj));
  lock = false;
  state.wrapKey = null;
  paintWrap(null);
  stack = [];
  index = -1;
  commit();
});
document.getElementById('share').addEventListener('click', async () => {
  const print = exportPrintCanvas();
  const png = print.toDataURL('image/png');
  const url = new URL(design ? `editor.html?design=${design.id}` : 'editor.html?mode=custom', location.href).href;
  const result = await shareDesign({
    title: 'Bezze Customz',
    text: 'My tumbler design from Bezze Customz (test site)',
    url,
    dataUrl: png,
  });
  if (result === 'copied') toast('Link copied. Edits stay on this device.');
  if (result === 'manual') showCopyField(url);
});

canvas.on('object:modified', () => {
  document.getElementById('axis').classList.remove('show');
  commit();
});
canvas.on('text:changed', () => scheduleSync());
canvas.on('object:moving', (event) => {
  const obj = event.target;
  if (!obj) return;
  const center = obj.getCenterPoint();
  const axis = document.getElementById('axis');
  if (Math.abs(center.x - CW / 2) < 18) {
    obj.setPositionByOrigin(new fabric.Point(CW / 2, center.y), 'center', 'center');
    axis.classList.add('show');
  } else axis.classList.remove('show');
  scheduleSync();
});
canvas.on('object:scaling', () => scheduleSync());
canvas.on('object:rotating', () => scheduleSync());
canvas.on('selection:created', syncFromSelection);
canvas.on('selection:updated', syncFromSelection);
canvas.on('selection:cleared', refreshLayers);

window.addEventListener('keydown', (event) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  }
  const active = canvas.getActiveObject();
  if ((event.key === 'Delete' || event.key === 'Backspace') && active && !active.isEditing) {
    event.preventDefault();
    removeActive();
  }
});

setInterval(() => {
  if (!state.savedAt) return;
  const seconds = Math.round((Date.now() - state.savedAt) / 1000);
  const el = document.getElementById('saved');
  if (!savedOk) return;
  if (seconds < 8) el.textContent = 'Drag to rotate · saved just now';
  else if (seconds < 60) el.textContent = `Drag to rotate · saved ${seconds}s ago`;
  else el.textContent = `Drag to rotate · saved ${Math.floor(seconds / 60)}m ago`;
}, 4000);

try {
  const view = document.getElementById('view3d');
  const stage = document.getElementById('view-stage');
  viewer = new TumblerViewer(view, { spin: false, distance: 58, exposure: 1.05 });
  new ResizeObserver(() => viewer.resize()).observe(stage);
  requestAnimationFrame(() => viewer.resize());
} catch (err) {
  console.error(err);
  document.getElementById('view3d').hidden = true;
  document.getElementById('view-fallback').hidden = false;
}

const draft = loadDraft(currentId());
if (draft && draft.v === 1 && (draft.wrapKey || (draft.objects && draft.objects.length))) {
  stack = [JSON.stringify({ wrapKey: draft.wrapKey || null, objects: draft.objects || [] })];
  index = 0;
  restore(stack[0]);
  updateHistory();
} else {
  paintWrap(null);
  commit();
}

FONTS.forEach((font) => {
  document.fonts.load(`160px "${font.name}"`).catch(() => {});
});

document.getElementById('size-label').textContent = Math.round(Number(sizeInput.value) / PX) + ' mm';
