import { CLIPS } from './clipart.js';
import { GRAPHICS } from './graphics.js';
import { clipLabel, commonTags, libraryCutout, libraryThumb, loadClipLibrary } from './clipart-feed.js';
import { designReady, drawWrap, getDesign, whenDesignReady } from './designs.js';
import { filterCatalog, loadCatalog } from './catalog.js';
import { installDropDesigns } from './designs.js';
import { loadDropFeed } from './drops.js';
import { paintProductShot } from './thumbs.js';
import { PRICE, clearDraft, loadDraft, money, saveDraft, setBag } from './store.js';
import { initNav } from './nav.js';
import { shareDesign, showCopyField, toast } from './share.js';
import { previewCanvas, stampWatermark, guardSaves } from './watermark.js';

initNav();

const PX = 6;
const CW = 252 * PX;
const CH = 217 * PX;
const SAFE = 15 * PX;

const FONTS = [
  { name: 'Great Vibes', css: '"Great Vibes", cursive', group: 'Script' },
  { name: 'Pacifico', css: 'Pacifico, cursive', group: 'Script' },
  { name: 'Lobster', css: 'Lobster, cursive', group: 'Script' },
  { name: 'Fredoka', css: 'Fredoka, sans-serif', group: 'Fun' },
  { name: 'Permanent Marker', css: '"Permanent Marker", cursive', group: 'Fun' },
  { name: 'Luckiest Guy', css: '"Luckiest Guy", cursive', group: 'Fun' },
  { name: 'Playfair Display', css: '"Playfair Display", Georgia, serif', group: 'Classic' },
  { name: 'Cinzel', css: 'Cinzel, Georgia, serif', group: 'Classic' },
  { name: 'Cormorant Garamond', css: '"Cormorant Garamond", Georgia, serif', group: 'Classic' },
  { name: 'Libre Baskerville', css: '"Libre Baskerville", Georgia, serif', group: 'Classic' },
  { name: 'Instrument Serif', css: '"Instrument Serif", Georgia, serif', group: 'Classic' },
  { name: 'Montserrat', css: 'Montserrat, Arial, sans-serif', group: 'Classic' },
  { name: 'Outfit', css: 'Outfit, Arial, sans-serif', group: 'Classic' },
  { name: 'Bebas Neue', css: '"Bebas Neue", Impact, sans-serif', group: 'Bold' },
  { name: 'Bungee', css: 'Bungee, Impact, sans-serif', group: 'Bold' },
  { name: 'Oswald', css: 'Oswald, Impact, sans-serif', group: 'Bold' },
];

const INKS = ['#ffffff', '#1a1a1a', '#ff2d8f', '#e7c98a', '#fff4e6', '#1c2748', '#d21f3c', '#1f8a4c', '#24597a', '#f08a24', '#7a4ea3', '#c5c8ce'];

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

fabric.NameText = fabric.util.createClass(fabric.IText, {
  type: 'name-text',
  initialize(text, options) {
    options = options || {};
    this.callSuper('initialize', text, options);
    this.curve = options.curve || 0;
  },
  toObject(extra) {
    return this.callSuper('toObject', ['data', 'curve'].concat(extra || []));
  },
  initDimensions() {
    if (fabric.util.clearFabricFontCache && this.fontFamily) {
      fabric.util.clearFabricFontCache(this.fontFamily);
    }
    this.objectCaching = false;
    this.width = Math.max(this.width || 0, (this.fontSize || 200) * Math.max(1, Array.from(this.text || '').length));
    this.callSuper('initDimensions');
    const text = this.text || '';
    if (text && !text.includes('\n')) {
      const ctx = fabric.util.createCanvasElement().getContext('2d');
      ctx.font = this._getFontDeclaration();
      const metrics = ctx.measureText(text);
      const spacing = (this.charSpacing || 0) / 1000 * this.fontSize * Math.max(0, Array.from(text).length - 1);
      const overhangLeft = Math.max(0, -(metrics.actualBoundingBoxLeft || 0));
      const overhangRight = Math.max(0, (metrics.actualBoundingBoxRight || metrics.width) - metrics.width);
      const measured = metrics.width + spacing + (this.strokeWidth || 0) + overhangLeft + overhangRight;
      this.width = Math.max(this.width || 0, measured, this.fontSize * 0.35);
      const ascent = metrics.actualBoundingBoxAscent || this.fontSize * 0.8;
      const descent = metrics.actualBoundingBoxDescent || this.fontSize * 0.25;
      this.height = Math.max(this.height || 0, ascent + descent + this.fontSize * 0.08, this.fontSize);
    }
    if (this.curve) this.height += (Math.abs(this.curve) / 100) * this.fontSize * 0.9;
    this.dirty = true;
  },
  _render(ctx) {
    if (!this.curve || this.isEditing) {
      this.callSuper('_render', ctx);
      return;
    }
    this._renderArc(ctx);
  },
  _renderArc(ctx) {
    const chars = Array.from(this.text || '');
    const count = chars.length;
    if (!count) return;
    const curve = Math.max(-100, Math.min(100, this.curve || 0));
    const mag = Math.abs(curve) / 100;
    const spread = 0.3 + mag * 1.15;
    const step = count > 1 ? spread / (count - 1) : 0;
    const start = -spread / 2;
    const width = Math.max(this.width, this.fontSize * 0.5 * count);
    const radius = width / Math.max(0.35, spread);
    ctx.save();
    ctx.font = this._getFontDeclaration();
    ctx.fillStyle = this.fill || '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (this.shadow) {
      ctx.shadowColor = this.shadow.color;
      ctx.shadowBlur = this.shadow.blur;
      ctx.shadowOffsetX = this.shadow.offsetX;
      ctx.shadowOffsetY = this.shadow.offsetY;
    }
    const strokeOn = this.stroke && this.strokeWidth > 0;
    if (strokeOn) {
      ctx.lineWidth = this.strokeWidth;
      ctx.strokeStyle = this.stroke;
      ctx.lineJoin = 'round';
    }
    const ySign = curve > 0 ? 1 : -1;
    const points = chars.map((_, i) => {
      const angle = start + step * i;
      return {
        angle,
        x: Math.sin(angle) * radius,
        y: ySign * (1 - Math.cos(angle)) * radius,
      };
    });
    const shift = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    points.forEach((point, i) => {
      ctx.save();
      ctx.translate(point.x, point.y - shift);
      ctx.rotate(point.angle * (curve > 0 ? 1 : -1));
      if (strokeOn) ctx.strokeText(chars[i], 0, 0);
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
    });
    ctx.restore();
  },
});

fabric.NameText.fromObject = function fromObject(object, callback) {
  const clone = Object.assign({}, object);
  if (clone.styles) clone.styles = fabric.util.stylesFromArray(clone.styles, clone.text);
  return fabric.Object._fromObject('NameText', clone, callback, 'text');
};

const params = new URLSearchParams(location.search);
const design = getDesign(params.get('design'));
const mode = design ? 'gallery' : 'custom';
const openedId = design?.id || 'custom';
let baseDesign = design || null;
let bareMonogram = openedId === 'monogram';
function currentId() { return openedId; }

const state = { font: 'Great Vibes', ink: design?.ink || '#ffffff', savedAt: 0, monoStyle: 'circle' };
let canvas;
let viewer = null;
let stack = [];
let index = -1;
let lock = false;
let filling = false;
let typing = false;
let preferHandles = false;
let retainObject = null;
let retainUntil = 0;
let syncFrame = 0;
let savedOk = true;
let warned = false;
let resetArm = 0;

fabric.Object.prototype.set({
  borderColor: '#ff2d8f',
  cornerColor: '#ffffff',
  cornerStrokeColor: '#ff2d8f',
  cornerSize: 22,
  touchCornerSize: 44,
  transparentCorners: false,
  cornerStyle: 'circle',
  borderScaleFactor: 2.4,
  padding: 14,
  rotatingPointOffset: 40,
  centeredRotation: true,
  centeredScaling: true,
  lockScalingFlip: true,
  lockSkewingX: true,
  lockSkewingY: true,
});

function paintRotateHandle(ctx, left, top, styleOverride, fabricObject) {
  const size = (styleOverride && styleOverride.cornerSize) || fabricObject.cornerSize;
  ctx.save();
  ctx.translate(left, top);
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = Math.max(2, size / 9);
  ctx.strokeStyle = '#ff2d8f';
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = '#1a1020';
  ctx.lineWidth = Math.max(1.75, size / 11);
  ctx.lineCap = 'round';
  ctx.arc(0, 1, size * 0.22, 0.6, Math.PI * 1.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.2);
  ctx.lineTo(size * 0.16, -size * 0.16);
  ctx.lineTo(size * 0.02, size * 0.02);
  ctx.stroke();
  ctx.restore();
}

function useTouchControls(proto) {
  const controls = proto && proto.controls;
  if (!controls) return;
  delete controls.ml;
  delete controls.mr;
  delete controls.mt;
  delete controls.mb;
  if (controls.mtr) {
    controls.mtr.withConnection = true;
    controls.mtr.render = paintRotateHandle;
    controls.mtr.cursorStyle = 'crosshair';
  }
}
useTouchControls(fabric.Object.prototype);
useTouchControls(fabric.Text && fabric.Text.prototype);
useTouchControls(fabric.IText && fabric.IText.prototype);

const frame = document.getElementById('art-frame');
canvas = new fabric.Canvas('c', {
  width: CW,
  height: CH,
  enableRetinaScaling: false,
  preserveObjectStacking: true,
  selection: false,
  stopContextMenu: true,
  uniformScaling: true,
  targetFindTolerance: 18,
  backgroundColor: '#140810',
});
guardSaves();
function lockExport(el) {
  if (!el) return;
  el.toDataURL = () => previewCanvas(el, 800).toDataURL('image/jpeg', 0.62);
  el.toBlob = (callback) => previewCanvas(el, 800).toBlob(callback, 'image/jpeg', 0.62);
}
lockExport(canvas.getElement());
lockExport(canvas.upperCanvasEl);

function paintWrap(key) {
  state.wrapKey = key || null;
  const gradient = key && String(key).startsWith('grad:');
  const paintId = gradient ? (baseDesign?.id || 'custom') : (key || baseDesign?.id || 'custom');
  const bare = paintId === 'monogram' && bareMonogram && !gradient;
  const src = drawWrap(gradient ? key : paintId, CW, CH);
  stampWatermark(src.getContext('2d'), src.width, src.height, 'light');
  const img = new fabric.Image(src, { originX: 'left', originY: 'top', evented: false, selectable: false });
  canvas.setBackgroundImage(img, () => {
    canvas.requestRenderAll();
    scheduleSync();
  });
  markActiveDesign();
  if (!gradient && paintId !== 'custom' && !designReady(paintId)) {
    whenDesignReady(paintId).then(() => {
      const current = state.wrapKey || baseDesign?.id || 'custom';
      if (current === paintId) paintWrap(state.wrapKey);
    });
  }
}

function takeSnap() {
  return JSON.stringify({
    wrapKey: state.wrapKey,
    baseId: baseDesign?.id || null,
    objects: canvas.toJSON(['data', 'curve']).objects,
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

function flatWrapCanvas() {
  const out = document.createElement('canvas');
  out.width = canvas.getWidth();
  out.height = canvas.getHeight();
  const ctx = out.getContext('2d');
  if (canvas.backgroundColor) {
    ctx.fillStyle = canvas.backgroundColor;
    ctx.fillRect(0, 0, out.width, out.height);
  }
  if (canvas.backgroundImage) canvas.backgroundImage.render(ctx);
  canvas.getObjects().forEach((obj) => {
    if (obj.visible !== false) obj.render(ctx);
  });
  return out;
}

function scheduleSync() {
  cancelAnimationFrame(syncFrame);
  syncFrame = requestAnimationFrame(() => {
    const source = flatWrapCanvas();
    if (viewer) {
      viewer.setWrap(source, { trimmed: false, mark: 'none' });
      document.getElementById('view-stage').dataset.ready = 'true';
    } else {
      const img = document.getElementById('view-fallback');
      img.hidden = false;
      img.src = paintProductShot(source).toDataURL('image/jpeg', 0.8);
    }
  });
}

function isCustom() {
  if (state.wrapKey && String(state.wrapKey).startsWith('grad:')) return true;
  if (!baseDesign) return true;
  return canvas.getObjects().some((obj) => !obj.data?.starter);
}

function updatePrice() {
  const custom = isCustom();
  const value = custom ? PRICE.custom : PRICE.standard;
  document.getElementById('price').textContent = money(value);
  const deskPrice = document.getElementById('desk-price');
  if (deskPrice) deskPrice.textContent = money(value);
  const note = document.getElementById('price-note');
  if (mode === 'custom') note.textContent = 'A design you build is $44.99 CAD.';
  else if (custom) note.textContent = 'Edited designs are $44.99 CAD.';
  else note.textContent = 'This sample as-is is $39.99 CAD. Any edit is $44.99.';
  return value;
}

function textNode(obj) {
  if (!obj) return null;
  if (obj.type === 'name-text' || obj.type === 'i-text') return obj;
  if (obj.data?.kind === 'text' && typeof obj.getObjects === 'function') {
    return obj.getObjects().find((item) => item.data?.role === 'letters' || item.type === 'name-text') || null;
  }
  return null;
}

function isText(obj) {
  return !!textNode(obj);
}

function layerName(obj) {
  if (obj.data?.kind === 'design') return obj.data.name || 'Design';
  if (obj.data?.kind === 'monogram') return `Monogram ${obj.data.initials || ''}`.trim();
  if (isText(obj)) return textNode(obj)?.text || 'Name';
  if (obj.data?.kind === 'clip') return obj.data.name || 'Shape';
  if (obj.data?.kind === 'graphic') return obj.data.name || 'Graphic';
  if (obj.data?.kind === 'photo') return 'Photo';
  return 'Layer';
}

function refreshLayers() {
  const box = document.getElementById('layers');
  const active = canvas.getActiveObject();
  box.replaceChildren();
  const objects = canvas.getObjects();
  const actions = document.getElementById('obj-actions');
  if (actions) actions.hidden = !active;
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
      showSelection(obj);
    });
    box.append(button);
  }
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
  if (data.baseId) baseDesign = getDesign(data.baseId) || baseDesign;
  if (data.baseId && data.baseId !== 'monogram') bareMonogram = false;
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
    closeSheet();
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
  canvas.setDimensions({ width, height: Math.round(width * CH / CW) }, { cssOnly: true });
  const ratio = CW / width;
  const px = (screenPx) => Math.max(1, Math.round(screenPx * ratio));
  fabric.Object.prototype.cornerSize = px(30);
  fabric.Object.prototype.touchCornerSize = px(56);
  fabric.Object.prototype.borderScaleFactor = px(2.6);
  fabric.Object.prototype.padding = px(4);
  fabric.Object.prototype.rotatingPointOffset = px(54);
  const mtrOwners = [fabric.Object, fabric.Text, fabric.IText, fabric.NameText];
  mtrOwners.forEach((klass) => {
    const mtr = klass && klass.prototype && klass.prototype.controls && klass.prototype.controls.mtr;
    if (!mtr) return;
    mtr.offsetY = -px(54);
    mtr.sizeX = px(30);
    mtr.sizeY = px(30);
    mtr.touchSizeX = px(56);
    mtr.touchSizeY = px(56);
  });
  canvas.targetFindTolerance = px(28);
  canvas.requestRenderAll();
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
  if (typeof value === 'string' && /^#([0-9a-f]{6})/i.test(value)) return value.slice(0, 7);
  return '#ffffff';
}

function contrast(hex) {
  const raw = toHex(hex).slice(1);
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#1a1020' : '#ffffff';
}

function touchObject(obj) {
  if (obj?.data?.starter) obj.data.starter = false;
}

function outsideSafe(obj) {
  if (!obj) return false;
  obj.setCoords();
  const box = obj.getBoundingRect(true, true);
  return box.left < SAFE - 2 || box.top < SAFE - 2 || box.left + box.width > CW - SAFE + 2 || box.top + box.height > CH - SAFE + 2;
}

function checkSafe(obj) {
  const warn = document.getElementById('zone-warn');
  const hot = outsideSafe(obj);
  warn.hidden = !hot;
  document.querySelector('.guide.safe').classList.toggle('is-hot', hot);
}

function containText(obj) {
  const node = textNode(obj);
  if (!node) return;
  node.objectCaching = false;
  let guard = 0;
  while (guard < 60) {
    node.initDimensions();
    node.setCoords();
    const box = node.group ? null : node.getBoundingRect(true, true);
    const lines = node.textLines ? node.textLines.length : 1;
    const width = node.getScaledWidth();
    const inside = box
      ? box.left >= -0.5 && box.top >= -0.5 && box.left + box.width <= CW + 0.5 && box.top + box.height <= CH + 0.5
      : width <= CW - 8;
    if (inside && lines <= 1) break;
    if ((node.fontSize || 200) > 48) node.set('fontSize', Math.max(48, (node.fontSize || 200) - 8));
    else if (!node.group) {
      const next = Math.max(0.2, (node.scaleX || 1) * 0.92);
      node.set({ scaleX: next, scaleY: next });
      if (next <= 0.2) break;
    } else break;
    guard += 1;
  }
  if (!node.group) {
    node.setCoords();
    const box = node.getBoundingRect(true, true);
    let dx = 0;
    let dy = 0;
    if (box.left < 0) dx = -box.left;
    if (box.top < 0) dy = -box.top;
    if (box.left + box.width > CW) dx = CW - (box.left + box.width);
    if (box.top + box.height > CH) dy = CH - (box.top + box.height);
    if (dx || dy) node.set({ left: (node.left || 0) + dx, top: (node.top || 0) + dy });
  }
  node.initDimensions();
  node.setCoords();
  node.dirty = true;
  const size = document.getElementById('size');
  const label = document.getElementById('size-label');
  if (size && label && document.activeElement !== size) {
    size.value = String(Math.round(node.fontSize));
    label.textContent = `${Math.round(node.fontSize / PX)} mm`;
  }
}

function keepSelectionVisible() {
  if (!phoneEditing()) return;
  const obj = canvas.getActiveObject();
  const sheet = document.getElementById('sheet');
  if (!obj || !sheet || sheet.dataset.open !== 'true') return;
  const rect = frame.getBoundingClientRect();
  if (!rect.height) return;
  const box = obj.getBoundingRect(true, true);
  const bottom = rect.top + ((box.top + box.height) / CH) * rect.height;
  const limit = sheet.getBoundingClientRect().top - 28;
  if (bottom > limit) {
    viewY -= bottom - limit;
    applyView();
  }
}

function scheduleSyncAndSafe(obj) {
  checkSafe(obj || canvas.getActiveObject());
  scheduleSync();
}

function makeName(meta) {
  const text = new fabric.NameText(meta.text || 'Your name', {
    fontFamily: meta.fontFamily || state.font,
    fontSize: meta.fontSize || 200,
    fontWeight: meta.fontWeight || 'normal',
    fontStyle: meta.fontStyle || 'normal',
    fill: meta.fill || state.ink,
    charSpacing: meta.charSpacing || 0,
    curve: meta.curve || 0,
    textAlign: meta.textAlign || 'center',
    originX: 'center',
    originY: 'center',
    left: meta.left || CW / 2,
    top: meta.top || CH / 2,
    angle: meta.angle || 0,
    editable: !phoneEditing(),
    objectCaching: false,
    data: { kind: 'text', role: 'letters', plaque: 'none', ...(meta.data || {}) },
  });
  applyTextPaint(text, meta);
  return text;
}

function applyTextPaint(obj, meta = {}) {
  const letters = textNode(obj) || obj;
  const outline = meta.outline ?? letters.data?.outline;
  const shadowOn = meta.shadowOn ?? letters.data?.shadowOn;
  const stroke = meta.stroke || letters.data?.outlineColor || '#1a1a1a';
  const strokeWidth = meta.strokeWidth ?? letters.data?.outlineWidth ?? Math.max(6, Math.round((letters.fontSize || 200) / 16));
  const shadowColor = meta.shadowColor || letters.data?.shadowColor || '#1a1a1a';
  if (letters.data) {
    letters.data.outline = !!outline;
    letters.data.shadowOn = !!shadowOn;
    letters.data.outlineColor = stroke;
    letters.data.outlineWidth = strokeWidth;
    letters.data.shadowColor = shadowColor;
  }
  letters.set('paintFirst', 'stroke');
  if (outline) letters.set({ stroke, strokeWidth });
  else letters.set({ stroke: null, strokeWidth: 0 });
  letters.set('shadow', shadowOn
    ? new fabric.Shadow({ color: shadowColor, blur: 16, offsetX: 0, offsetY: 8 })
    : null);
  letters.dirty = true;
  if (letters.initDimensions) letters.initDimensions();
  letters.setCoords();
}

function cleanInitials(value) {
  return (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
}

function letter(text, opts) {
  return new fabric.Text(text, {
    fontFamily: opts.fontFamily,
    fontSize: opts.fontSize,
    fill: opts.fill,
    originX: 'center',
    originY: 'center',
    left: opts.left || 0,
    top: opts.top || 0,
    charSpacing: opts.charSpacing || 0,
  });
}

function ring(radius, strokeWidth, fill) {
  return new fabric.Circle({
    radius,
    fill: 'transparent',
    stroke: fill,
    strokeWidth,
    originX: 'center',
    originY: 'center',
    left: 0,
    top: 0,
  });
}

function buildMonogram(meta) {
  const initials = cleanInitials(meta.initials) || 'A';
  const style = meta.style || 'circle';
  const fontFamily = meta.fontFamily || 'Cinzel';
  const fill = meta.fill || '#fff4e6';
  const fontSize = meta.fontSize || 200;
  const items = [];
  if (style === 'circle' || style === 'vine') {
    items.push(ring(fontSize * 0.78, Math.max(3, fontSize * 0.045), fill));
    items.push(ring(fontSize * 0.64, Math.max(1.5, fontSize * 0.02), fill));
    if (style === 'vine') {
      items.push(new fabric.Path('M -70 30 C -40 -40 40 -40 70 30', {
        fill: 'transparent',
        stroke: fill,
        strokeWidth: Math.max(2, fontSize * 0.03),
        left: 0,
        top: -fontSize * 0.15,
        originX: 'center',
        originY: 'center',
        scaleX: fontSize / 180,
        scaleY: fontSize / 180,
      }));
      items.push(new fabric.Path('M -70 -10 C -30 50 30 50 70 -10', {
        fill: 'transparent',
        stroke: fill,
        strokeWidth: Math.max(2, fontSize * 0.03),
        left: 0,
        top: fontSize * 0.2,
        originX: 'center',
        originY: 'center',
        scaleX: fontSize / 180,
        scaleY: fontSize / 180,
      }));
    }
    items.push(letter(initials, {
      fontFamily,
      fill,
      fontSize: initials.length > 2 ? fontSize * 0.42 : initials.length === 2 ? fontSize * 0.5 : fontSize * 0.7,
      charSpacing: initials.length > 1 ? 40 : 0,
      top: initials.length === 1 ? fontSize * 0.02 : 0,
    }));
  } else if (style === 'stacked') {
    initials.split('').forEach((ch, i) => {
      items.push(letter(ch, {
        fontFamily,
        fill,
        fontSize: fontSize * 0.48,
        top: (i - (initials.length - 1) / 2) * fontSize * 0.52,
      }));
    });
  } else {
    const chars = initials.split('');
    const mid = chars.length === 3 ? chars[1] : chars[chars.length - 1];
    items.push(letter(mid, { fontFamily, fill, fontSize }));
    if (chars.length === 2) {
      items.push(letter(chars[0], { fontFamily, fill, fontSize: fontSize * 0.62, left: -fontSize * 0.38, top: fontSize * 0.08 }));
    }
    if (chars.length === 3) {
      items.push(letter(chars[0], { fontFamily, fill, fontSize: fontSize * 0.56, left: -fontSize * 0.46, top: fontSize * 0.1 }));
      items.push(letter(chars[2], { fontFamily, fill, fontSize: fontSize * 0.56, left: fontSize * 0.46, top: fontSize * 0.1 }));
    }
  }
  return new fabric.Group(items, {
    originX: 'center',
    originY: 'center',
    left: meta.left || CW / 2,
    top: meta.top || CH / 2,
    subTargetCheck: false,
    data: {
      kind: 'monogram',
      initials,
      style,
      fontFamily,
      fill,
      fontSize,
      starter: !!meta.starter,
      locked: !!meta.locked,
    },
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
  return next;
}

function setLocked(obj, locked) {
  obj.set({
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hasControls: !locked,
  });
  if (!obj.data) obj.data = {};
  obj.data.locked = locked;
  const button = document.getElementById('lock');
  if (button) button.textContent = locked ? 'Unlock' : 'Lock';
  canvas.requestRenderAll();
}

function active() {
  return canvas.getActiveObject();
}

function phoneEditing() {
  return window.matchMedia('(max-width: 1099px)').matches;
}

function desktopEditor() {
  return window.matchMedia('(min-width: 1100px)').matches;
}

function armRetain(obj) {
  const next = obj || canvas.getActiveObject() || retainObject;
  if (!next) return;
  retainObject = next;
  retainUntil = Date.now() + 900;
}

function shouldRetain() {
  if (!retainObject || canvas.getObjects().indexOf(retainObject) < 0) return false;
  return typing || Date.now() < retainUntil;
}

function restoreRetained() {
  const obj = retainObject;
  if (!obj || canvas.getObjects().indexOf(obj) < 0) return;
  if (canvas.getActiveObject() === obj) return;
  lock = true;
  canvas.setActiveObject(obj);
  obj.set({ hasControls: !obj.data?.locked, hasBorders: true, selectable: true });
  lock = false;
  canvas.requestRenderAll();
}

function updateHandleBar() {
  const bar = document.getElementById('handle-bar');
  if (!bar) return;
  const obj = canvas.getActiveObject();
  const sheetOpen = document.getElementById('sheet').dataset.open === 'true';
  const panelOpen = !!document.querySelector('.panel[data-open="true"]');
  bar.hidden = !obj || sheetOpen || panelOpen || document.body.classList.contains('typing');
  const edit = document.getElementById('keep-edit');
  if (!edit) return;
  if (isText(obj)) edit.textContent = 'Edit text';
  else if (obj?.data?.kind === 'monogram') edit.textContent = 'Edit monogram';
  else edit.textContent = 'Edit';
}

function parkDock() {
  const dock = document.getElementById('type-dock');
  const slot = document.querySelector('#sheet .sheet-body') || document.getElementById('sheet');
  if (!dock || !slot || dock.parentElement === slot) return;
  const before = document.getElementById('sheet-text');
  if (before && before.parentElement === slot) slot.insertBefore(dock, before);
  else slot.prepend(dock);
}

function blurDock() {
  const focused = document.activeElement;
  if (focused && focused.closest && focused.closest('#type-dock')) focused.blur();
}

function syncFieldToObject(obj) {
  if (!obj) return;
  const node = textNode(obj);
  if (node) {
    const value = document.getElementById('edit-text').value;
    if (node.text !== value) {
      node.set('text', value);
      node.initDimensions();
      containText(node);
      touchObject(node);
      const shape = obj.data?.plaque || node.data?.plaque;
      if (shape && shape !== 'none') applyPlaque(obj, shape);
    }
    return;
  }
  if (obj.data?.kind === 'monogram') {
    const letters = cleanInitials(document.getElementById('mono-letters').value) || 'A';
    if ((obj.data.initials || 'A') !== letters) updateMonogram({ initials: letters });
  }
}

function commitTyped() {
  const snap = takeSnap();
  if (stack[index] === snap) return;
  commit();
}

function closePanels() {
  document.querySelectorAll('.panel').forEach((item) => { item.dataset.open = 'false'; });
  document.querySelectorAll('.tabbar button').forEach((tab) => tab.setAttribute('aria-current', 'false'));
}

function visibleFrame() {
  const vv = window.visualViewport;
  if (!vv) return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  return { top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height };
}

function clearDockPosition() {
  const dock = document.getElementById('type-dock');
  if (!dock) return;
  dock.style.top = '';
  dock.style.left = '';
  dock.style.width = '';
}

function revealActive() {
  if (!typing) return;
  const obj = canvas.getActiveObject() || retainObject;
  const dock = document.getElementById('type-dock');
  const stage = document.getElementById('stage');
  if (!obj || !dock || dock.hidden || !stage) return;
  const rect = frame.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const box = obj.getBoundingRect(true, true);
  const top = rect.top + (box.top / CH) * rect.height;
  const bottom = rect.top + ((box.top + box.height) / CH) * rect.height;
  const limit = dock.getBoundingClientRect().top - 8;
  const ceiling = stage.getBoundingClientRect().top + 8;
  if (limit <= ceiling) return;
  if (bottom > limit || top < ceiling) {
    const mid = (top + bottom) / 2;
    const target = (ceiling + Math.min(limit, ceiling + rect.height)) / 2;
    viewY += target - mid;
    applyView();
  }
}

function syncViewport() {
  const frameBox = visibleFrame();
  const dock = document.getElementById('type-dock');
  const dockH = dock ? Math.ceil(dock.getBoundingClientRect().height || 64) : 64;
  document.documentElement.style.setProperty('--vv-top', frameBox.top + 'px');
  document.documentElement.style.setProperty('--vv-left', frameBox.left + 'px');
  document.documentElement.style.setProperty('--vv-width', frameBox.width + 'px');
  document.documentElement.style.setProperty('--vv-height', frameBox.height + 'px');
  document.documentElement.style.setProperty('--dock-h', dockH + 'px');
  if (dock && typing) {
    dock.hidden = false;
    dock.style.top = (frameBox.top + frameBox.height - dockH) + 'px';
    dock.style.left = frameBox.left + 'px';
    dock.style.width = frameBox.width + 'px';
  }
  if (typing) window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    revealActive();
    requestAnimationFrame(revealActive);
  });
}

function beginTyping() {
  const obj = canvas.getActiveObject();
  if (!phoneEditing() || !obj) return;
  if (typing) {
    syncViewport();
    return;
  }
  typing = true;
  if (obj.isEditing && obj.exitEditing) obj.exitEditing();
  retainObject = obj;
  preferHandles = false;
  obj.set({ hasControls: false, hasBorders: true });
  canvas.requestRenderAll();
  const dock = document.getElementById('type-dock');
  document.body.append(dock);
  dock.hidden = false;
  document.getElementById('edit-text').hidden = !isText(obj);
  document.getElementById('mono-letters').hidden = obj.data?.kind !== 'monogram';
  document.body.classList.add('typing');
  closePanels();
  const field = isText(obj) ? document.getElementById('edit-text') : document.getElementById('mono-letters');
  if (document.activeElement !== field) field.focus({ preventScroll: true });
  syncViewport();
  requestAnimationFrame(syncViewport);
}

function finishTyping(options = {}) {
  const reopen = options.reopen !== false;
  syncFieldToObject(canvas.getActiveObject() || retainObject);
  const obj = canvas.getActiveObject() || retainObject;
  if (!phoneEditing()) {
    if (obj?.isEditing && obj.exitEditing) obj.exitEditing();
    blurDock();
    if (obj && canvas.getObjects().indexOf(obj) >= 0) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }
    commitTyped();
    return;
  }
  typing = false;
  document.body.classList.remove('typing');
  clearDockPosition();
  parkDock();
  retainObject = obj || null;
  retainUntil = Date.now() + 900;
  preferHandles = false;
  blurDock();
  if (obj?.isEditing && obj.exitEditing) obj.exitEditing();
  if (obj && canvas.getObjects().indexOf(obj) >= 0) {
    lock = true;
    canvas.setActiveObject(obj);
    obj.set({ hasControls: !obj.data?.locked, hasBorders: true, selectable: true });
    lock = false;
    canvas.requestRenderAll();
  }
  commitTyped();
  if (reopen && obj) showSelection(obj);
  else {
    closeSheet();
    closePanels();
  }
  keepSelectionVisible();
  updateHandleBar();
  scheduleSync();
}

function showSelection(obj) {
  const sheet = document.getElementById('sheet');
  if (!obj) {
    closeSheet();
    updateHandleBar();
    return;
  }
  if (phoneEditing() && isText(obj)) {
    obj.editable = false;
    if (obj.isEditing && obj.exitEditing) obj.exitEditing();
  }
  if (phoneEditing() && preferHandles && obj === retainObject && !typing) {
    obj.set({ hasControls: !obj.data?.locked, hasBorders: true });
    canvas.requestRenderAll();
    updateHandleBar();
    return;
  }
  const kind = obj.data?.kind === 'monogram' ? 'monogram' : isText(obj) ? 'text' : obj.data?.kind === 'clip' ? 'clip' : obj.data?.kind === 'graphic' ? 'graphic' : obj.data?.kind === 'design' ? 'design' : 'object';
  sheet.dataset.open = 'true';
  sheet.dataset.kind = kind;
  sheet.scrollTop = 0;
  const sheetBody = sheet.querySelector('.sheet-body');
  if (sheetBody) sheetBody.scrollTop = 0;
  document.body.classList.add('sheet-open');
  document.getElementById('sheet-text').hidden = kind !== 'text';
  document.getElementById('sheet-mono').hidden = kind !== 'monogram';
  document.getElementById('sheet-clip').hidden = kind !== 'clip';
  document.getElementById('sheet-graphic').hidden = kind !== 'graphic';
  syncSheetChrome(kind);
  const dock = document.getElementById('type-dock');
  dock.hidden = kind !== 'text' && kind !== 'monogram';
  document.getElementById('edit-text').hidden = kind !== 'text';
  document.getElementById('mono-letters').hidden = kind !== 'monogram';
  document.getElementById('sheet-title').textContent = kind === 'monogram' ? 'Edit monogram' : kind === 'text' ? 'Edit text' : kind === 'clip' ? 'Edit shape' : kind === 'graphic' ? 'Edit graphic' : kind === 'design' ? 'Design layer' : 'Selected';
  document.getElementById('obj-actions').hidden = false;
  document.getElementById('lock').textContent = obj.data?.locked ? 'Unlock' : 'Lock';
  if (kind === 'text' && document.activeElement !== document.getElementById('edit-text')) fillTextSheet(obj);
  if (kind === 'monogram' && document.activeElement !== document.getElementById('mono-letters')) fillMonoSheet(obj);
  const clipDone = document.getElementById('clip-done');
  if (clipDone) clipDone.hidden = kind !== 'graphic' && kind !== 'clip';
  if (kind === 'clip' || kind === 'graphic') setPicker(toHex(obj.data?.fill || obj.data?.tint || '#ffffff'), false);
  if (kind === 'graphic') {
    const removable = obj.data.hasAlpha === false;
    document.getElementById('white-toggle').hidden = !removable;
    document.getElementById('remove-white').checked = !!obj.data.removeWhite;
    document.getElementById('tint-on').setAttribute('aria-pressed', obj.data.tint ? 'true' : 'false');
    document.getElementById('tint-off').setAttribute('aria-pressed', obj.data.tint ? 'false' : 'true');
  }
  const faded = textNode(obj) || obj;
  const pct = Math.round(((faded && faded.opacity != null ? faded.opacity : 1) * 100));
  document.getElementById('opacity').value = String(pct);
  document.getElementById('opacity-label').textContent = `${pct}%`;
  refreshLayers();
  checkSafe(obj);
  updateHandleBar();
}

function syncSheetChrome(kind) {
  const tab = document.querySelector('#text-tabs [aria-pressed="true"]')?.dataset.texttab || 'fonts';
  document.querySelectorAll('[data-textpane]').forEach((pane) => {
    pane.hidden = kind !== 'text' || pane.dataset.textpane !== tab;
  });
  const showColour = kind === 'clip' || kind === 'graphic' || (kind === 'text' && tab === 'colour');
  document.getElementById('colour-tools').hidden = !showColour;
  document.getElementById('look-opacity').hidden = !['text', 'clip', 'graphic', 'photo'].includes(kind);
}

function closeSheet() {
  const sheet = document.getElementById('sheet');
  sheet.dataset.open = 'false';
  sheet.dataset.kind = '';
  document.body.classList.remove('sheet-open');
  document.getElementById('zone-warn').hidden = true;
  document.querySelector('.guide.safe').classList.remove('is-hot');
  refreshLayers();
  updateHandleBar();
}

function fillTextSheet(host) {
  const obj = textNode(host) || host;
  filling = true;
  document.getElementById('edit-text').value = obj.text || '';
  document.getElementById('size').value = String(Math.round(obj.fontSize || 200));
  document.getElementById('size-label').textContent = `${Math.round((obj.fontSize || 200) / PX)} mm`;
  document.getElementById('tracking').value = String(obj.charSpacing || 0);
  document.getElementById('track-label').textContent = String(obj.charSpacing || 0);
  document.getElementById('curve').value = String(obj.curve || 0);
  document.getElementById('curve-label').textContent = String(obj.curve || 0);
  document.getElementById('curve-on').checked = !!obj.curve;
  document.getElementById('ink').value = toHex(obj.fill);
  state.font = obj.fontFamily || state.font;
  highlightFonts(obj.fontFamily);
  press('bold', (obj.fontWeight === 'bold' || obj.fontWeight === 700));
  press('italic', obj.fontStyle === 'italic');
  press('outline', !!obj.data?.outline);
  press('shadow', !!obj.data?.shadowOn);
  document.querySelectorAll('#align-row button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.align === (obj.data?.align || 'center') ? 'true' : 'false');
  });
  document.querySelectorAll('#plaque-shapes button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.plaque === (obj.data?.plaque || 'none') ? 'true' : 'false');
  });
  document.getElementById('plaque-ink').value = toHex(obj.data?.plaqueFill || '#1a1a1a');
  document.getElementById('plaque-edge').checked = !!obj.data?.plaqueEdge;
  const badgeOpacity = Math.round((obj.data?.plaqueOpacity ?? 1) * 100);
  document.getElementById('plaque-opacity').value = String(badgeOpacity);
  document.getElementById('plaque-opacity-label').textContent = `${badgeOpacity}%`;
  document.getElementById('outline-ink').value = toHex(obj.data?.outlineColor || '#1a1a1a');
  document.getElementById('outline-width').value = String(obj.data?.outlineWidth || 8);
  document.getElementById('outline-width-label').textContent = document.getElementById('outline-width').value;
  document.getElementById('shadow-ink').value = toHex(obj.data?.shadowColor || '#1a1a1a');
  setPicker(toHex(obj.fill || '#ffffff'), false);
  filling = false;
  refreshFontPreviews();
}

function fillMonoSheet(obj) {
  filling = true;
  document.getElementById('mono-letters').value = obj.data.initials || 'A';
  document.querySelectorAll('#mono-styles button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.style === obj.data.style ? 'true' : 'false');
  });
  const shown = Math.round((obj.data.fontSize || 200) * (obj.scaleX || 1));
  document.getElementById('mono-size').value = String(shown);
  document.getElementById('mono-size-label').textContent = `${Math.round(shown / PX)} mm`;
  document.getElementById('mono-ink').value = toHex(obj.data.fill || '#fff4e6');
  highlightFonts(obj.data.fontFamily, '#mono-fonts');
  filling = false;
  refreshFontPreviews();
}

function press(name, on) {
  const button = document.querySelector(`#text-toggles [data-toggle="${name}"]`);
  if (button) button.setAttribute('aria-pressed', on ? 'true' : 'false');
}

function highlightFonts(name, root = '#sheet-fonts') {
  document.querySelectorAll(`${root} button`).forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.font === name ? 'true' : 'false');
  });
}

function fontPreviewText(kind) {
  if (kind === 'mono') {
    const letters = (document.getElementById('mono-letters').value || '').trim();
    return letters;
  }
  const typed = (document.getElementById('edit-text').value || '').replace(/\s+/g, ' ').trim();
  if (typed) return typed;
  const obj = active();
  if (isText(obj) && (obj.text || '').trim()) return obj.text.trim();
  return '';
}

function refreshFontPreviews() {
  const nameText = fontPreviewText('text');
  const monoText = fontPreviewText('mono');
  document.querySelectorAll('#sheet-fonts .font-chip').forEach((button) => {
    const label = nameText || button.dataset.font;
    button.textContent = label;
    button.title = label;
  });
  document.querySelectorAll('#mono-fonts .font-chip').forEach((button) => {
    const label = monoText || button.dataset.font;
    button.textContent = label;
    button.title = label;
  });
}

function fontButtons(container, onPick) {
  FONTS.forEach((font) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'font-chip';
    button.dataset.font = font.name;
    button.dataset.group = font.group || 'Classic';
    button.style.fontFamily = font.css;
    button.textContent = font.name;
    button.title = font.name;
    button.addEventListener('click', () => onPick(font));
    container.append(button);
  });
  refreshFontPreviews();
}

function paintSwatches(container, onPick) {
  INKS.forEach((color) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.style.background = color;
    button.setAttribute('aria-label', color);
    button.addEventListener('click', () => onPick(color));
    container.append(button);
  });
}

async function ensureFont(name, size = 200) {
  const pxSize = Math.max(12, Math.round(size || 200));
  try {
    await document.fonts.load(`${pxSize}px "${name}"`);
    await document.fonts.ready;
  } catch { /* the canvas falls back if the face is blocked */ }
  if (fabric.util.clearFabricFontCache) fabric.util.clearFabricFontCache(name);
}

async function addText() {
  await ensureFont(state.font);
  const obj = makeName({
    text: 'Your name',
    fontFamily: state.font,
    fontSize: 200,
    fill: state.ink,
    shadowOn: true,
    data: { align: 'center', shadowOn: true },
  });
  canvas.add(obj);
  containText(obj);
  canvas.setActiveObject(obj);
  commit();
  showSelection(obj);
  const field = document.getElementById('edit-text');
  field.focus({ preventScroll: true });
  field.select();
  beginTyping();
}

function liveText(mutate, doCommit, options = {}) {
  let host = active();
  const node = textNode(host);
  if (!node || filling) return;
  mutate(node);
  if (options.contain) containText(node);
  if (options.layout && (host.data?.plaque || node.data?.plaque) && (host.data?.plaque || node.data?.plaque) !== 'none') {
    host = applyPlaque(host, host.data?.plaque || node.data?.plaque);
  }
  touchObject(node);
  node.dirty = true;
  node.setCoords();
  if (host !== node) host.dirty = true;
  canvas.requestRenderAll();
  scheduleSyncAndSafe(host);
  if (doCommit) commit();
}

function plaquePath(shape, width, height) {
  const w = width;
  const h = height;
  if (shape === 'banner') {
    const notch = Math.min(28, w * 0.12);
    return `M ${-w / 2 + notch} ${-h / 2} H ${w / 2 - notch} L ${w / 2} 0 L ${w / 2 - notch} ${h / 2} H ${-w / 2 + notch} L ${-w / 2} 0 Z`;
  }
  const tip = Math.min(36, w * 0.16);
  return `M ${-w / 2 + 24} ${-h / 2} H ${w / 2 - tip} L ${w / 2} 0 L ${w / 2 - tip} ${h / 2} H ${-w / 2 + 24} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 24} V ${-h / 2 + 24} Q ${-w / 2} ${-h / 2} ${-w / 2 + 24} ${-h / 2} Z`;
}

function makePlaque(shape, letters) {
  const data = letters.data || {};
  const width = Math.max(letters.width + 90, letters.fontSize * 1.4);
  const height = Math.max(letters.height + 70, letters.fontSize * 1.15);
  const fill = shape === 'frame' ? 'rgba(0,0,0,0)' : (data.plaqueFill || '#1a1a1a');
  const stroke = data.plaqueEdge ? (data.plaqueStroke || '#ffffff') : null;
  const strokeWidth = data.plaqueEdge ? (data.plaqueStrokeWidth || 8) : 0;
  const opacity = data.plaqueOpacity ?? 1;
  const common = {
    fill,
    stroke,
    strokeWidth,
    opacity,
    originX: 'center',
    originY: 'center',
    left: 0,
    top: 0,
    objectCaching: false,
    data: { role: 'plaque' },
  };
  if (shape === 'circle') return new fabric.Circle({ ...common, radius: Math.max(width, height) / 2 });
  if (shape === 'oval') return new fabric.Ellipse({ ...common, rx: width / 2, ry: height / 2 });
  if (shape === 'banner' || shape === 'label') return new fabric.Path(plaquePath(shape, width, height), common);
  return new fabric.Rect({ ...common, width, height, rx: 28, ry: 28 });
}

let arranging = false;
function applyPlaque(host, shape) {
  if (arranging) return host;
  const letters = textNode(host);
  if (!letters) return host;
  arranging = true;
  const parent = letters.group || host;
  const left = parent.left;
  const top = parent.top;
  const angle = parent.angle || 0;
  const scaleX = parent.scaleX || 1;
  const scaleY = parent.scaleY || 1;
  const data = Object.assign({}, letters.data, { kind: 'text', role: 'letters', plaque: shape || 'none' });
  if (parent !== letters && parent.type === 'group') {
    parent._restoreObjectsState();
    canvas.remove(parent);
    parent.getObjects().forEach((item) => { item.group = undefined; });
  } else canvas.remove(letters);
  letters.group = undefined;
  letters.set({ data, left: 0, top: 0, angle: 0, scaleX: 1, scaleY: 1, originX: 'center', originY: 'center' });
  letters.initDimensions();
  let next = letters;
  if (shape && shape !== 'none') {
    const plate = makePlaque(shape, letters);
    next = new fabric.Group([plate, letters], {
      originX: 'center',
      originY: 'center',
      left,
      top,
      angle,
      scaleX,
      scaleY,
      objectCaching: false,
      subTargetCheck: false,
      data,
    });
  } else {
    letters.set({ left, top, angle, scaleX, scaleY });
  }
  canvas.add(next);
  canvas.setActiveObject(next);
  next.setCoords();
  arranging = false;
  return next;
}

function updateMonogram(patch, doCommit) {
  const obj = active();
  if (!obj || obj.data?.kind !== 'monogram' || filling) return;
  const next = buildMonogram({
    ...obj.data,
    ...patch,
    starter: false,
    left: obj.left,
    top: obj.top,
  });
  next.set({ angle: obj.angle || 0, scaleX: obj.scaleX || 1, scaleY: obj.scaleY || 1 });
  if (obj.data.locked) setLocked(next, true);
  replaceObject(obj, next);
  canvas.requestRenderAll();
  scheduleSyncAndSafe(next);
  if (doCommit) commit();
  else refreshLayers();
}

async function addMonogram(initials, style) {
  const fontName = 'Cinzel';
  await ensureFont(fontName);
  const obj = buildMonogram({
    initials: cleanInitials(initials) || 'A',
    style: style || state.monoStyle,
    fontFamily: fontName,
    fill: '#fff4e6',
    fontSize: 210,
    left: CW / 2,
    top: CH / 2,
  });
  canvas.add(obj);
  canvas.setActiveObject(obj);
  commit();
  showSelection(obj);
  const field = document.getElementById('mono-letters');
  field.focus({ preventScroll: true });
  field.select();
  beginTyping();
}

function seedMonogram() {
  if (design?.id !== 'monogram') return;
  if (canvas.getObjects().some((obj) => obj.data?.kind === 'monogram')) return;
  canvas.add(buildMonogram({
    initials: 'A',
    style: 'circle',
    fontFamily: 'Cinzel',
    fill: '#fff4e6',
    fontSize: 210,
    starter: true,
    left: CW / 2,
    top: CH / 2,
  }));
}

function paintClip(obj, color) {
  const visit = (node) => {
    if (!node) return;
    if (node.fill && node.fill !== 'none') node.set('fill', color);
    if (node.stroke && node.stroke !== 'none') node.set('stroke', color);
    (node._objects || []).forEach(visit);
  };
  visit(obj);
  if (!obj.data) obj.data = { kind: 'clip' };
  obj.data.fill = color;
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
  obj.set({ originX: 'center', originY: 'center', left: CW / 2, top: CH / 2, data: { kind: 'clip', name, fill: '#ffffff' } });
  obj.scaleToWidth(CW * 0.28);
  paintClip(obj, '#ffffff');
  obj.setCoords();
  canvas.add(obj);
  canvas.setActiveObject(obj);
  commit();
}

function loadGraphic(file) {
  const src = String(file).startsWith('clipart/') ? file : `clipart/${file}`;
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(src, (img) => {
      if (!img) reject(new Error('Could not load graphic'));
      else resolve(img);
    }, { crossOrigin: 'anonymous' });
  });
}

function setWhiteRemoval(obj, on) {
  obj.filters = on ? [new fabric.Image.filters.RemoveColor({ color: '#ffffff', distance: 0.28 })] : [];
  obj.applyFilters();
  if (!obj.data) obj.data = {};
  obj.data.removeWhite = on;
  canvas.requestRenderAll();
}

async function addGraphic(item) {
  const obj = item.library
    ? new fabric.Image(await libraryCutout(item))
    : await loadGraphic(item.file);
  obj.set({
    originX: 'center',
    originY: 'center',
    left: CW / 2,
    top: CH / 2,
    data: {
      kind: 'graphic',
      name: item.name,
      file: item.file,
      hasAlpha: item.library ? true : item.hasAlpha,
      removeWhite: false,
    },
  });
  const maxW = CW * 0.42;
  const maxH = CH * 0.55;
  obj.scaleToWidth(maxW);
  if (obj.getScaledHeight() > maxH) obj.scaleToHeight(maxH);
  obj.set({ left: CW / 2, top: CH / 2 });
  obj.setCoords();
  canvas.add(obj);
  canvas.setActiveObject(obj);
  commit();
  showSelection(obj);
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
  const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
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
  showSelection(image);
  const longest = Math.max(source.width, source.height);
  hint.textContent = longest < 1400
    ? 'This photo may look soft when printed. A larger image stays sharper.'
    : 'Your photo stays on this device. Nothing is uploaded.';
}

function removeActive() {
  const obj = active();
  if (!obj) return;
  if (retainObject === obj) retainObject = null;
  retainUntil = 0;
  preferHandles = false;
  typing = false;
  document.body.classList.remove('typing');
  clearDockPosition();
  canvas.remove(obj);
  closeSheet();
  commit();
}

function alignCenter() {
  const obj = active();
  if (!obj || obj.data?.locked) return;
  obj.center();
  obj.setCoords();
  canvas.requestRenderAll();
  checkSafe(obj);
  commit();
}

function alignEdge(where) {
  const obj = active();
  if (!obj || obj.data?.locked) return;
  obj.setCoords();
  const box = obj.getBoundingRect(true, true);
  const center = obj.getCenterPoint();
  let nextX = center.x;
  if (where === 'left') nextX = SAFE + box.width / 2;
  if (where === 'right') nextX = CW - SAFE - box.width / 2;
  if (where === 'center') nextX = CW / 2;
  obj.setPositionByOrigin(new fabric.Point(nextX, center.y), 'center', 'center');
  if (isText(obj)) {
    obj.set('textAlign', where === 'center' ? 'center' : where);
    if (!obj.data) obj.data = { kind: 'text' };
    obj.data.align = where;
  }
  obj.setCoords();
  canvas.requestRenderAll();
  checkSafe(obj);
  commit();
}

function nudge(dir) {
  const obj = active();
  if (!obj) return;
  if (dir > 0) canvas.bringForward(obj);
  else canvas.sendBackwards(obj);
  commit();
}

function duplicate() {
  const obj = active();
  if (!obj) return;
  obj.clone((clone) => {
    clone.set({ left: (obj.left || 0) + 30, top: (obj.top || 0) + 30 });
    if (clone.data) clone.data = { ...obj.data, starter: false };
    canvas.add(clone);
    canvas.setActiveObject(clone);
    commit();
    showSelection(clone);
  }, ['data', 'curve']);
}

function rotateStep() {
  const obj = active();
  if (!obj || obj.data?.locked) return;
  obj.rotate((obj.angle || 0) + 15);
  obj.setCoords();
  if (isText(obj)) containText(obj);
  canvas.requestRenderAll();
  commit();
}

function productTitle() {
  const text = canvas.getObjects().find((obj) => isText(obj));
  const mono = canvas.getObjects().find((obj) => obj.data?.kind === 'monogram');
  const label = text ? (text.text || '').trim() : '';
  if (label && label !== 'Your name') return `Custom — “${label}”`;
  if (mono && !mono.data.starter) return `Custom — ${mono.data.initials}`;
  if (isCustom()) return design ? `Custom — ${design.name}` : 'Custom tumbler';
  return design ? design.name : 'Custom tumbler';
}

function designRecord() {
  const snap = JSON.parse(takeSnap());
  const strip = (obj) => {
    const copy = { ...obj };
    delete copy.src;
    if (Array.isArray(copy.objects)) copy.objects = copy.objects.map(strip);
    return copy;
  };
  snap.objects = (snap.objects || []).map(strip);
  return snap;
}

function reviewThumb() {
  const preview = previewCanvas(flatWrapCanvas(), 800);
  return {
    preview: preview.toDataURL('image/jpeg', 0.62),
    thumb: paintProductShot(preview, 420).toDataURL('image/jpeg', 0.72),
  };
}

function review() {
  const shots = reviewThumb();
  setBag({
    v: 2,
    designId: baseDesign?.id || currentId(),
    title: productTitle(),
    subtitle: `20 oz · ${baseDesign?.name || design?.name || 'Custom wrap'} · Full wrap`,
    unitPrice: updatePrice(),
    qty: 1,
    customized: isCustom(),
    design: designRecord(),
    thumb: shots.thumb,
    preview: shots.preview,
    delivery: 'pickup',
    savedAt: Date.now(),
  });
  location.href = 'checkout.html';
}

function swapDesign(id) {
  const picked = getDesign(id);
  if (!picked) return;
  baseDesign = picked;
  if (id !== 'monogram') bareMonogram = false;
  state.wrapKey = null;
  paintWrap(null);
  commit();
  renderDesignLists();
}

function addDesignLayer(id) {
  const picked = getDesign(id);
  if (!picked) return;
  const src = drawWrap(id, CW, CH, { bare: false });
  const img = new fabric.Image(src, {
    originX: 'center',
    originY: 'center',
    left: CW / 2,
    top: CH / 2,
    data: { kind: 'design', designId: id, name: picked.name },
  });
  img.scaleToWidth(CW * 0.7);
  const objects = canvas.getObjects();
  let at = 0;
  objects.forEach((obj, index) => {
    if (obj.data?.kind === 'design') at = index + 1;
  });
  canvas.insertAt(img, at, false);
  canvas.setActiveObject(img);
  commit();
  showSelection(img);
}

function designThumb(id) {
  return drawWrap(id, 168, 144, { bare: false }).toDataURL('image/jpeg', 0.82);
}

let catalog = loadCatalog();
const designFilter = { q: '', cat: 'All' };

function designCard(item) {
  const card = document.createElement('article');
  card.className = 'design-card';
  card.dataset.id = item.id;
  const current = (baseDesign?.id || '') === item.id && !state.wrapKey;
  if (current) card.dataset.current = 'true';
  const img = new Image();
  img.src = designThumb(item.id);
  img.alt = '';
  const copy = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = item.name;
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = item.category || 'Sample';
  const actions = document.createElement('div');
  actions.className = 'design-actions';
  const swap = document.createElement('button');
  swap.type = 'button';
  swap.className = 'primary';
  swap.textContent = 'Swap';
  swap.addEventListener('click', () => swapDesign(item.id));
  const add = document.createElement('button');
  add.type = 'button';
  add.textContent = 'Add';
  add.addEventListener('click', () => addDesignLayer(item.id));
  actions.append(swap, add);
  copy.append(title, meta, actions);
  card.append(img, copy);
  return card;
}

function renderDesignLists() {
  const matches = filterCatalog(catalog, designFilter);
  const now = matches.filter((item) => item.drop === catalog.thisDrop);
  const rest = matches.filter((item) => item.drop !== catalog.thisDrop);
  const nowBox = document.getElementById('drop-now');
  const restBox = document.getElementById('drop-rest');
  nowBox.replaceChildren(...now.map(designCard));
  restBox.replaceChildren(...rest.map(designCard));
  const empty = matches.length === 0;
  document.getElementById('design-empty').hidden = !empty;
  document.getElementById('drop-now-title').hidden = now.length === 0;
  nowBox.hidden = now.length === 0;
  document.getElementById('drop-rest-title').hidden = rest.length === 0;
  document.getElementById('drop-rest-note').hidden = rest.length === 0;
  restBox.hidden = rest.length === 0;
  const missing = matches.filter((item) => !designReady(item.id));
  if (missing.length) Promise.all(missing.map((item) => whenDesignReady(item.id))).then(renderDesignLists);
}

function markActiveDesign() {
  const current = baseDesign?.id || '';
  document.querySelectorAll('.design-card').forEach((card) => {
    if (card.dataset.id === current && !state.wrapKey) card.dataset.current = 'true';
    else delete card.dataset.current;
  });
}

function bootDesigns() {
  const cats = document.getElementById('design-cats');
  catalog.categories.forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.dataset.cat = name;
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    button.addEventListener('click', () => {
      designFilter.cat = name;
      cats.querySelectorAll('button').forEach((item) => {
        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
      });
      renderDesignLists();
    });
    cats.append(button);
  });
  document.getElementById('design-q').addEventListener('input', (event) => {
    designFilter.q = event.target.value;
    renderDesignLists();
  });
  renderDesignLists();
  loadDropFeed().then((rows) => {
    if (!rows.length) return;
    installDropDesigns(rows);
    const wanted = new URLSearchParams(location.search).get('design');
    const picked = wanted ? getDesign(wanted) : null;
    if (picked?.feed && baseDesign?.id !== picked.id) {
      baseDesign = picked;
      bareMonogram = false;
      state.wrapKey = null;
      paintWrap(null);
    }
    catalog = loadCatalog();
    const known = new Set([...cats.querySelectorAll('button')].map((button) => button.dataset.cat));
    for (const name of catalog.categories) {
      if (known.has(name)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = name;
      button.dataset.cat = name;
      button.addEventListener('click', () => {
        designFilter.cat = name;
        cats.querySelectorAll('button').forEach((item) => {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        renderDesignLists();
      });
      cats.append(button);
    }
    renderDesignLists();
  }).catch(() => {});
}

const RECENT_KEY = 'bezze-recent-colours';
let pickerLock = false;

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  const byte = (n) => Math.round(255 * f(n)).toString(16).padStart(2, '0');
  return `#${byte(0)}${byte(8)}${byte(4)}`;
}

function hexToHsl(hex) {
  const raw = toHex(hex).slice(1);
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const delta = max - min;
  let h = 0;
  let s = 0;
  if (delta) {
    s = delta / (1 - Math.abs(2 * light - 1));
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(light * 100) };
}

function recentColours() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function paintRecent() {
  const box = document.getElementById('recent-swatches');
  box.replaceChildren();
  recentColours().forEach((color) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.style.background = color;
    button.setAttribute('aria-label', color);
    button.addEventListener('click', () => setPicker(color, true));
    box.append(button);
  });
}

function rememberColour(hex) {
  const color = toHex(hex);
  const list = recentColours().filter((item) => item !== color);
  list.unshift(color);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  paintRecent();
}

function setPicker(hex, apply) {
  const color = toHex(hex);
  const hsl = hexToHsl(color);
  pickerLock = true;
  document.getElementById('ink').value = color;
  document.getElementById('hex-ink').value = color;
  document.getElementById('hue').value = String(hsl.h);
  document.getElementById('sat').value = String(hsl.s);
  document.getElementById('light').value = String(hsl.l);
  document.getElementById('hue-label').textContent = String(hsl.h);
  document.getElementById('sat-label').textContent = `${hsl.s}%`;
  document.getElementById('light-label').textContent = `${hsl.l}%`;
  pickerLock = false;
  if (apply) applyPickedColour(color);
}

function tintGraphic(obj, color) {
  const kept = (obj.filters || []).filter((filter) => filter.type !== 'BlendColor');
  if (color) kept.push(new fabric.Image.filters.BlendColor({ color, mode: 'tint', alpha: 0.9 }));
  obj.filters = kept;
  obj.applyFilters();
  if (!obj.data) obj.data = { kind: 'graphic' };
  obj.data.tint = color || null;
  obj.data.fill = color || obj.data.fill;
  obj.dirty = true;
}

function applyPickedColour(color) {
  const obj = active();
  if (!obj) return;
  const kind = obj.data?.kind;
  if (isText(obj)) {
    liveText((node) => {
      node.set('fill', color);
      if (node.data?.outline && !node.data.outlineColor) node.set('stroke', color);
    }, false);
    return;
  }
  if (kind === 'clip') {
    paintClip(obj, color);
    canvas.requestRenderAll();
    scheduleSync();
    return;
  }
  if (kind === 'graphic') {
    tintGraphic(obj, color);
    document.getElementById('tint-on').setAttribute('aria-pressed', 'true');
    document.getElementById('tint-off').setAttribute('aria-pressed', 'false');
    canvas.requestRenderAll();
    scheduleSync();
  }
}

function bootUi() {
  fontButtons(document.getElementById('sheet-fonts'), async (font) => {
    state.font = font.name;
    await ensureFont(font.name, active()?.fontSize || 200);
    liveText((obj) => {
      obj.set('fontFamily', font.name);
      obj.initDimensions();
    }, true, { contain: true, layout: true });
    highlightFonts(font.name);
  });
  fontButtons(document.getElementById('mono-fonts'), async (font) => {
    await ensureFont(font.name);
    updateMonogram({ fontFamily: font.name }, true);
    highlightFonts(font.name, '#mono-fonts');
  });
  paintSwatches(document.getElementById('ink-swatches'), (color) => setPicker(color, true));
  paintSwatches(document.getElementById('outline-swatches'), (color) => {
    document.getElementById('outline-ink').value = color;
    liveText((obj) => applyTextPaint(obj, { stroke: color, outline: true }), true, { layout: true });
    document.querySelector('#text-toggles [data-toggle="outline"]').setAttribute('aria-pressed', 'true');
  });
  paintSwatches(document.getElementById('shadow-swatches'), (color) => {
    document.getElementById('shadow-ink').value = color;
    liveText((obj) => applyTextPaint(obj, { shadowColor: color, shadowOn: true }), true);
    document.querySelector('#text-toggles [data-toggle="shadow"]').setAttribute('aria-pressed', 'true');
  });
  paintSwatches(document.getElementById('plaque-swatches'), (color) => {
    document.getElementById('plaque-ink').value = color;
    const host = active();
    const node = textNode(host);
    if (!node) return;
    node.data.plaqueFill = color;
    const shape = host.data?.plaque && host.data.plaque !== 'none' ? host.data.plaque : 'round';
    applyPlaque(host, shape);
    canvas.requestRenderAll();
    commit();
  });
  paintRecent();
  document.getElementById('font-groups').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    document.querySelectorAll('#font-groups button').forEach((item) => {
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    const group = button.dataset.group;
    document.querySelectorAll('#sheet-fonts .font-chip').forEach((chip) => {
      chip.hidden = group !== 'All' && chip.dataset.group !== group;
    });
  });
  document.getElementById('text-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    document.querySelectorAll('#text-tabs button').forEach((item) => {
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    syncSheetChrome('text');
  });
  paintSwatches(document.getElementById('mono-swatches'), (color) => {
    document.getElementById('mono-ink').value = color;
    updateMonogram({ fill: color }, true);
  });

  const shapes = document.getElementById('shapes');
  CLIPS.forEach(([name, category, svg]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shape';
    button.dataset.name = name.toLowerCase();
    button.dataset.cat = category;
    button.innerHTML = `${svg}<span>${name}</span>`;
    button.addEventListener('click', () => addClip(name, svg));
    shapes.append(button);
  });
  paintClipTags(['All']);
  filterClips();
  loadClipLibrary().then((items) => {
    clipLibrary = items;
    paintClipTags(['All', ...commonTags(items)]);
    filterClips();
  });

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
  WRAPS.forEach(([bottom, top, label]) => {
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
  });
}

let clipLibrary = [];
let clipTag = 'All';
let clipList = [];
let clipShown = 0;
let clipObserver = null;
const CLIP_PAGE = 60;

function clipQuery() {
  return document.getElementById('shape-q').value.trim().toLowerCase();
}

function scrollClipTop() {
  const panel = document.getElementById('panel-clip');
  if (panel) panel.scrollTop = 0;
}

function paintClipTags(tags) {
  const cats = document.getElementById('clip-cats');
  cats.replaceChildren();
  tags.forEach((name) => {
    const value = name === 'All' ? 'All' : name.toLowerCase();
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name === 'All' ? 'All' : name;
    button.dataset.tag = value;
    button.setAttribute('aria-pressed', clipTag === value ? 'true' : 'false');
    button.addEventListener('click', () => {
      clipTag = value;
      cats.querySelectorAll('button').forEach((item) => {
        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
      });
      filterClips();
    });
    cats.append(button);
  });
}

function graphicMatches(item) {
  const query = clipQuery();
  const name = (item.name || '').toLowerCase();
  const category = (item.category || '').toLowerCase();
  const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());
  const tagOk = clipTag === 'All' || tags.includes(clipTag) || category === clipTag;
  const queryOk = !query || name.includes(query) || category.includes(query) || tags.some((tag) => tag.includes(query));
  return tagOk && queryOk;
}

function shapeMatches(button) {
  const query = clipQuery();
  const name = button.dataset.name || '';
  const category = (button.dataset.cat || '').toLowerCase();
  const tagOk = clipTag === 'All' || category === clipTag || name.includes(clipTag);
  const queryOk = !query || name.includes(query) || category.includes(query);
  return tagOk && queryOk;
}

function graphicButton(item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'graphic';
  button.dataset.name = (item.name || '').toLowerCase();
  button.dataset.cat = item.category || '';
  button.dataset.tags = (item.tags || []).join(' ').toLowerCase();
  if (item.library) button.dataset.library = 'true';
  const img = new Image();
  const label = clipLabel(item.name);
  img.alt = label;
  img.decoding = 'async';
  if (item.library) libraryThumb(item).then((url) => { img.src = url; }).catch(() => {});
  else img.src = item.src || `clipart/${item.file}`;
  button.append(img);
  if (label) {
    const title = document.createElement('b');
    title.textContent = label;
    button.append(title);
  }
  button.addEventListener('click', () => addGraphic(item));
  return button;
}

function showMoreClips() {
  const box = document.getElementById('graphics');
  const sentinel = box.querySelector('.clip-sentinel');
  const slice = clipList.slice(clipShown, clipShown + CLIP_PAGE);
  if (!slice.length) {
    if (sentinel) sentinel.hidden = true;
    return;
  }
  const frag = document.createDocumentFragment();
  slice.forEach((item) => frag.append(graphicButton(item)));
  clipShown += slice.length;
  if (sentinel) box.insertBefore(frag, sentinel);
  else box.append(frag);
  if (sentinel) sentinel.hidden = clipShown >= clipList.length;
}

function renderClipGrid() {
  const box = document.getElementById('graphics');
  clipList = GRAPHICS.filter(graphicMatches).concat(clipLibrary.filter(graphicMatches));
  clipShown = 0;
  box.replaceChildren();
  const sentinel = document.createElement('div');
  sentinel.className = 'clip-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  box.append(sentinel);
  const panel = document.getElementById('panel-clip');
  if (!clipObserver) {
    clipObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) showMoreClips();
    }, { root: panel, rootMargin: '280px' });
  }
  clipObserver.disconnect();
  clipObserver.observe(sentinel);
  showMoreClips();
}

function filterClips() {
  document.querySelectorAll('#shapes button').forEach((button) => {
    button.hidden = !shapeMatches(button);
  });
  renderClipGrid();
  scrollClipTop();
}

function closeClipPanel() {
  const panel = document.getElementById('panel-clip');
  if (panel) {
    panel.scrollTop = 0;
    panel.dataset.open = 'false';
  }
  const tab = document.querySelector('[data-panel="clip"]');
  if (tab) tab.setAttribute('aria-current', 'false');
  preferHandles = true;
  const obj = active();
  if (obj) obj.set({ hasControls: !obj.data?.locked, hasBorders: true });
  closeSheet();
  canvas.requestRenderAll();
}

bootUi();
bootDesigns();

document.getElementById('add-text').addEventListener('click', addText);
document.getElementById('add-mono').addEventListener('click', () => {
  addMonogram(document.getElementById('mono-new').value, state.monoStyle);
});
document.getElementById('mono-pick').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  state.monoStyle = button.dataset.style;
  document.querySelectorAll('#mono-pick button').forEach((item) => {
    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
  });
});
document.getElementById('edit-text').addEventListener('input', () => {
  liveText((obj) => {
    obj.set('text', document.getElementById('edit-text').value);
    obj.initDimensions();
  }, false, { contain: true, layout: true });
  refreshFontPreviews();
  if (typing) requestAnimationFrame(revealActive);
});
document.getElementById('edit-text').addEventListener('change', () => {
  if (isText(active())) commit();
});
function watchTypeField(field) {
  field.addEventListener('focus', () => beginTyping());
  field.addEventListener('compositionend', () => {
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      finishTyping();
    }
  });
  field.addEventListener('focusout', () => {
    armRetain();
    if (!phoneEditing()) return;
    setTimeout(() => {
      if (!typing) return;
      const el = document.activeElement;
      if (el && el.closest && el.closest('#type-dock')) return;
      finishTyping();
    }, 80);
  });
}
watchTypeField(document.getElementById('edit-text'));
watchTypeField(document.getElementById('mono-letters'));
const typeDone = document.getElementById('type-done');
let typeDoneAt = 0;
function pressDone(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const now = Date.now();
  if (now - typeDoneAt < 400) return;
  typeDoneAt = now;
  setTimeout(() => finishTyping({ reopen: true }), 30);
}
typeDone.addEventListener('pointerdown', (event) => event.preventDefault());
typeDone.addEventListener('pointerup', pressDone);
typeDone.addEventListener('click', pressDone);
document.getElementById('keep-edit').addEventListener('click', () => {
  preferHandles = false;
  const obj = active();
  if (obj) showSelection(obj);
});
document.getElementById('keep-delete').addEventListener('click', removeActive);
if (window.visualViewport) {
  const onViewport = () => {
    if (!phoneEditing()) return;
    armRetain();
    if (typing) syncViewport();
  };
  window.visualViewport.addEventListener('resize', onViewport);
  window.visualViewport.addEventListener('scroll', onViewport);
}
document.getElementById('size').addEventListener('input', () => {
  const size = Number(document.getElementById('size').value);
  document.getElementById('size-label').textContent = `${Math.round(size / PX)} mm`;
  liveText((obj) => {
    obj.set('fontSize', size);
    if (obj.data?.outline) obj.set('strokeWidth', obj.data.outlineWidth || Math.max(6, size / 16));
    obj.initDimensions();
  }, false, { contain: true, layout: true });
});
document.getElementById('size').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('tracking').addEventListener('input', () => {
  const spacing = Number(document.getElementById('tracking').value);
  document.getElementById('track-label').textContent = String(spacing);
  liveText((obj) => {
    obj.set('charSpacing', spacing);
    obj.initDimensions();
  }, false, { contain: true, layout: true });
});
document.getElementById('tracking').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('curve-on').addEventListener('change', (event) => {
  const on = event.target.checked;
  const slider = document.getElementById('curve');
  if (on && Number(slider.value) === 0) slider.value = '55';
  if (!on) slider.value = '0';
  document.getElementById('curve-label').textContent = slider.value;
  liveText((obj) => { obj.curve = Number(slider.value); obj.initDimensions(); }, true, { contain: true, layout: true });
});
document.getElementById('curve').addEventListener('input', () => {
  const value = document.getElementById('curve').value;
  document.getElementById('curve-label').textContent = value;
  document.getElementById('curve-on').checked = Number(value) !== 0;
  liveText((obj) => { obj.curve = Number(value); obj.initDimensions(); }, false, { layout: true });
});
document.getElementById('curve').addEventListener('change', () => { if (isText(active())) commit(); });
function pickerHex() {
  return hslToHex(Number(document.getElementById('hue').value), Number(document.getElementById('sat').value), Number(document.getElementById('light').value));
}
['hue', 'sat', 'light'].forEach((id) => {
  document.getElementById(id).addEventListener('input', () => {
    if (pickerLock) return;
    document.getElementById(`${id}-label`).textContent = id === 'hue' ? document.getElementById(id).value : `${document.getElementById(id).value}%`;
    setPicker(pickerHex(), true);
  });
  document.getElementById(id).addEventListener('change', () => rememberColour(document.getElementById('ink').value));
});
document.getElementById('hex-ink').addEventListener('change', () => {
  const raw = document.getElementById('hex-ink').value.trim();
  const hex = raw.startsWith('#') ? raw : `#${raw}`;
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
  setPicker(hex, true);
  rememberColour(hex);
  if (isText(active()) || active()?.data?.kind === 'clip' || active()?.data?.kind === 'graphic') commit();
});
document.getElementById('opacity').addEventListener('input', () => {
  const pct = Number(document.getElementById('opacity').value);
  document.getElementById('opacity-label').textContent = `${pct}%`;
  const host = active();
  const node = textNode(host) || host;
  if (!node) return;
  node.set('opacity', pct / 100);
  node.dirty = true;
  canvas.requestRenderAll();
  scheduleSync();
});
document.getElementById('opacity').addEventListener('change', () => commit());
document.getElementById('outline-ink').addEventListener('input', (event) => {
  liveText((obj) => applyTextPaint(obj, { stroke: event.target.value, outline: true }), false, { layout: true });
});
document.getElementById('outline-ink').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('outline-width').addEventListener('input', () => {
  const width = Number(document.getElementById('outline-width').value);
  document.getElementById('outline-width-label').textContent = String(width);
  liveText((obj) => applyTextPaint(obj, { strokeWidth: width, outline: width > 0 }), false, { layout: true });
});
document.getElementById('outline-width').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('shadow-ink').addEventListener('input', (event) => {
  liveText((obj) => applyTextPaint(obj, { shadowColor: event.target.value, shadowOn: true }), false);
});
document.getElementById('shadow-ink').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('plaque-shapes').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  document.querySelectorAll('#plaque-shapes button').forEach((item) => {
    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
  });
  const host = active();
  if (!isText(host)) return;
  applyPlaque(host, button.dataset.plaque);
  canvas.requestRenderAll();
  scheduleSync();
  commit();
});
document.getElementById('plaque-ink').addEventListener('input', (event) => {
  const host = active();
  const node = textNode(host);
  if (!node) return;
  node.data.plaqueFill = event.target.value;
  const shape = host.data?.plaque && host.data.plaque !== 'none' ? host.data.plaque : 'round';
  applyPlaque(host, shape);
  canvas.requestRenderAll();
});
document.getElementById('plaque-ink').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('plaque-edge').addEventListener('change', (event) => {
  const host = active();
  const node = textNode(host);
  if (!node) return;
  node.data.plaqueEdge = event.target.checked;
  node.data.plaqueStroke = node.data.plaqueStroke || '#ffffff';
  const shape = host.data?.plaque && host.data.plaque !== 'none' ? host.data.plaque : 'frame';
  applyPlaque(host, shape);
  canvas.requestRenderAll();
  commit();
});
document.getElementById('plaque-opacity').addEventListener('input', () => {
  const pct = Number(document.getElementById('plaque-opacity').value);
  document.getElementById('plaque-opacity-label').textContent = `${pct}%`;
  const host = active();
  const node = textNode(host);
  if (!node) return;
  node.data.plaqueOpacity = pct / 100;
  if (host.data?.plaque && host.data.plaque !== 'none') {
    applyPlaque(host, host.data.plaque);
    canvas.requestRenderAll();
  }
});
document.getElementById('plaque-opacity').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('tint-on').addEventListener('click', () => {
  const obj = active();
  if (obj?.data?.kind !== 'graphic') return;
  tintGraphic(obj, document.getElementById('ink').value || '#ff2d8f');
  document.getElementById('tint-on').setAttribute('aria-pressed', 'true');
  document.getElementById('tint-off').setAttribute('aria-pressed', 'false');
  canvas.requestRenderAll();
  commit();
});
document.getElementById('tint-off').addEventListener('click', () => {
  const obj = active();
  if (obj?.data?.kind !== 'graphic') return;
  tintGraphic(obj, null);
  document.getElementById('tint-on').setAttribute('aria-pressed', 'false');
  document.getElementById('tint-off').setAttribute('aria-pressed', 'true');
  canvas.requestRenderAll();
  commit();
});
document.getElementById('ink').addEventListener('input', (event) => {
  liveText((obj) => {
    obj.set('fill', event.target.value);
    if (obj.data?.outline) obj.set('stroke', contrast(event.target.value));
  });
});
document.getElementById('ink').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('text-toggles').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const on = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', on ? 'true' : 'false');
  const toggle = button.dataset.toggle;
  liveText((obj) => {
    if (!obj.data) obj.data = { kind: 'text' };
    if (toggle === 'bold') obj.set('fontWeight', on ? 'bold' : 'normal');
    if (toggle === 'italic') obj.set('fontStyle', on ? 'italic' : 'normal');
    if (toggle === 'outline') applyTextPaint(obj, { outline: on, shadowOn: obj.data.shadowOn, stroke: contrast(obj.fill) });
    if (toggle === 'shadow') applyTextPaint(obj, { outline: obj.data.outline, shadowOn: on, stroke: obj.stroke });
    obj.initDimensions();
  }, true);
});
document.getElementById('align-row').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  alignEdge(button.dataset.align);
  document.querySelectorAll('#align-row button').forEach((item) => {
    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
  });
});
document.getElementById('mono-letters').addEventListener('input', () => {
  const letters = cleanInitials(document.getElementById('mono-letters').value);
  updateMonogram({ initials: letters || 'A' });
  refreshFontPreviews();
});
document.getElementById('mono-letters').addEventListener('change', () => {
  if (active()?.data?.kind === 'monogram') commit();
});
document.getElementById('mono-styles').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  updateMonogram({ style: button.dataset.style }, true);
  document.querySelectorAll('#mono-styles button').forEach((item) => {
    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
  });
});
document.getElementById('mono-ink').addEventListener('input', (event) => updateMonogram({ fill: event.target.value }));
document.getElementById('mono-ink').addEventListener('change', () => { if (active()?.data?.kind === 'monogram') commit(); });
document.getElementById('mono-size').addEventListener('input', () => {
  const size = Number(document.getElementById('mono-size').value);
  document.getElementById('mono-size-label').textContent = `${Math.round(size / PX)} mm`;
  const obj = active();
  if (!obj || obj.data?.kind !== 'monogram' || filling) return;
  const base = obj.data.fontSize || 200;
  obj.set({ scaleX: size / base, scaleY: size / base });
  touchObject(obj);
  obj.setCoords();
  canvas.requestRenderAll();
  scheduleSyncAndSafe(obj);
});
document.getElementById('mono-size').addEventListener('change', () => { if (active()?.data?.kind === 'monogram') commit(); });
document.getElementById('remove-white').addEventListener('change', (event) => {
  const obj = active();
  if (obj?.data?.kind !== 'graphic' || obj.data.hasAlpha !== false) return;
  setWhiteRemoval(obj, event.target.checked);
  commit();
});
document.getElementById('shape-q').addEventListener('input', filterClips);
document.getElementById('rights').addEventListener('change', (event) => {
  document.getElementById('pick-photo').disabled = !event.target.checked;
});
document.getElementById('pick-photo').addEventListener('click', () => document.getElementById('photo').click());
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
    const name = button.dataset.panel;
    const panel = document.getElementById(`panel-${name}`);
    const open = panel.dataset.open === 'true';
    document.querySelectorAll('.panel').forEach((item) => { item.dataset.open = 'false'; });
    document.querySelectorAll('.tabbar button').forEach((tab) => tab.setAttribute('aria-current', 'false'));
    if (!open) {
      panel.dataset.open = 'true';
      panel.scrollTop = 0;
      button.setAttribute('aria-current', 'true');
      closeSheet();
    }
    updateHandleBar();
  });
});

function showStage(mode) {
  if (desktopEditor()) {
    document.getElementById('art-zoom').hidden = false;
    document.getElementById('view-stage').hidden = false;
    document.getElementById('fit-view').hidden = false;
    ensureViewer().then((ready) => ready && ready.resize());
    return;
  }
  const flat = mode === 'flat';
  document.getElementById('art-zoom').hidden = !flat;
  document.getElementById('view-stage').hidden = flat;
  document.getElementById('view-flat').setAttribute('aria-pressed', flat ? 'true' : 'false');
  document.getElementById('view-3d').setAttribute('aria-pressed', flat ? 'false' : 'true');
  document.getElementById('fit-view').hidden = !flat;
  if (!flat) ensureViewer().then((ready) => ready && ready.resize());
}
document.getElementById('view-flat').addEventListener('click', () => showStage('flat'));
document.getElementById('view-3d').addEventListener('click', () => showStage('3d'));

const zoomLayer = document.getElementById('art-zoom');
let viewX = 0;
let viewY = 0;
let viewScale = 1;
function applyView() {
  zoomLayer.style.transform = `translate(${viewX}px, ${viewY}px) scale(${viewScale})`;
}
document.getElementById('fit-view').addEventListener('click', () => {
  viewX = 0;
  viewY = 0;
  viewScale = 1;
  applyView();
});
const pointers = new Map();
let pinch = null;
let pan = null;
zoomLayer.addEventListener('touchstart', (event) => {
  for (const touch of event.changedTouches) pointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale: viewScale, x: viewX, y: viewY };
  }
}, { passive: true });
zoomLayer.addEventListener('touchmove', (event) => {
  for (const touch of event.changedTouches) {
    if (pointers.has(touch.identifier)) pointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
  }
  if (pointers.size >= 2 && pinch) {
    event.preventDefault();
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    viewScale = Math.min(3.2, Math.max(1, pinch.scale * dist / pinch.dist));
    applyView();
  }
}, { passive: false });
function forgetTouch(event) {
  for (const touch of event.changedTouches) pointers.delete(touch.identifier);
  if (pointers.size < 2) pinch = null;
}
zoomLayer.addEventListener('touchend', forgetTouch);
zoomLayer.addEventListener('touchcancel', forgetTouch);
canvas.on('mouse:down', (opt) => {
  if (opt.target || pointers.size > 1) { pan = null; return; }
  const point = opt.e.touches ? opt.e.touches[0] : opt.e;
  pan = { x: point.clientX, y: point.clientY };
});
canvas.on('mouse:move', (opt) => {
  if (!pan || pointers.size > 1) return;
  const point = opt.e.touches ? opt.e.touches[0] : opt.e;
  if (!point) return;
  viewX += point.clientX - pan.x;
  viewY += point.clientY - pan.y;
  pan = { x: point.clientX, y: point.clientY };
  applyView();
});
canvas.on('mouse:up', () => { pan = null; });
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
document.getElementById('duplicate').addEventListener('click', duplicate);
document.getElementById('rotate-step').addEventListener('click', rotateStep);
document.getElementById('lock').addEventListener('click', () => {
  const obj = active();
  if (!obj) return;
  setLocked(obj, !obj.data?.locked);
  commit();
});
document.getElementById('clip-done').addEventListener('click', () => closeClipPanel());
document.getElementById('sheet-close').addEventListener('click', () => {
  if (phoneEditing()) finishTyping({ reopen: false });
  else {
    const obj = active();
    if (obj?.isEditing && obj.exitEditing) obj.exitEditing();
    closeSheet();
  }
});
document.getElementById('review').addEventListener('click', review);
document.getElementById('add-cart').addEventListener('click', review);
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
  baseDesign = design || null;
  bareMonogram = openedId === 'monogram';
  paintWrap(null);
  seedMonogram();
  stack = [];
  index = -1;
  closeSheet();
  commit();
});
document.getElementById('share').addEventListener('click', async () => {
  const url = new URL(design ? `editor.html?design=${design.id}` : 'editor.html?mode=custom', location.href).href;
  const result = await shareDesign({
    title: 'Bezze Customz',
    text: 'My tumbler design from Bezze Customz (test site)',
    url,
  });
  if (result === 'copied') toast('Link copied. The design stays on this device.');
  if (result === 'manual') showCopyField(url);
});

canvas.on('object:modified', (event) => {
  document.getElementById('axis').classList.remove('show');
  document.getElementById('axis-x').classList.remove('show');
  if (event.target) touchObject(event.target);
  checkSafe(event.target);
  commit();
});
canvas.on('text:changed', (event) => {
  const field = document.getElementById('edit-text');
  if (event.target && document.activeElement !== field) field.value = event.target.text || '';
  scheduleSyncAndSafe(event.target);
});
canvas.on('text:editing:entered', () => {
  const obj = active();
  if (isText(obj)) showSelection(obj);
});
canvas.on('text:editing:exited', () => {
  if (isText(active())) commit();
});
canvas.on('mouse:dblclick', (opt) => {
  const obj = opt.target;
  if (!isText(obj)) return;
  showSelection(obj);
  const coarse = phoneEditing();
  const field = document.getElementById('edit-text');
  if (coarse) {
    if (obj.exitEditing) obj.exitEditing();
    field.focus();
    field.select();
  } else if (!obj.isEditing && obj.enterEditing) {
    obj.enterEditing();
    if (obj.selectAll) obj.selectAll();
  }
});
canvas.on('object:moving', (event) => {
  const obj = event.target;
  if (!obj) return;
  const center = obj.getCenterPoint();
  const axis = document.getElementById('axis');
  const axisX = document.getElementById('axis-x');
  let x = center.x;
  let y = center.y;
  const snap = Math.abs(x - CW / 2) < 16;
  const snapY = Math.abs(y - CH / 2) < 16;
  if (snap) x = CW / 2;
  if (snapY) y = CH / 2;
  if (snap || snapY) obj.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
  axis.classList.toggle('show', snap);
  axisX.classList.toggle('show', snapY);
  scheduleSyncAndSafe(obj);
});
canvas.on('object:scaling', (event) => scheduleSyncAndSafe(event.target));
canvas.on('object:rotating', (event) => scheduleSyncAndSafe(event.target));
canvas.on('selection:created', (event) => showSelection(event.selected?.[0] || active()));
canvas.on('selection:updated', (event) => {
  preferHandles = false;
  showSelection(event.selected?.[0] || active());
});
canvas.on('selection:cleared', () => {
  if (lock) return;
  if (shouldRetain()) {
    queueMicrotask(restoreRetained);
    return;
  }
  preferHandles = false;
  closeSheet();
});

window.addEventListener('keydown', (event) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  }
  const obj = active();
  if ((event.key === 'Delete' || event.key === 'Backspace') && obj && !obj.isEditing) {
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

let viewerPromise = null;
function ensureViewer() {
  if (viewer) return Promise.resolve(viewer);
  if (!viewerPromise) {
    viewerPromise = import('./tumbler.js').then(({ TumblerViewer }) => {
      const view = document.getElementById('view3d');
      const stage = document.getElementById('view-stage');
      viewer = new TumblerViewer(view, { spin: false, distance: 58, exposure: 1.05 });
      new ResizeObserver(() => viewer.resize()).observe(stage);
      viewer.resize();
      scheduleSync();
      return viewer;
    }).catch((err) => {
      console.error(err);
      document.getElementById('view3d').hidden = true;
      document.getElementById('view-fallback').hidden = false;
      return null;
    });
  }
  return viewerPromise;
}

const draft = loadDraft(currentId());
if (draft && draft.v === 1 && (draft.wrapKey || (draft.objects && draft.objects.length))) {
  stack = [JSON.stringify({ wrapKey: draft.wrapKey || null, objects: draft.objects || [] })];
  index = 0;
  restore(stack[0]);
  updateHistory();
} else {
  paintWrap(null);
  seedMonogram();
  commit();
}

FONTS.forEach((font) => {
  document.fonts.load(`160px "${font.name}"`).then(() => {
    if (fabric.util.clearFabricFontCache) fabric.util.clearFabricFontCache(font.name);
  }).catch(() => {});
});
document.fonts.addEventListener('loadingdone', () => {
  canvas.getObjects().forEach((obj) => {
    const node = textNode(obj);
    if (!node || typeof node.initDimensions !== 'function') return;
    if (fabric.util.clearFabricFontCache) fabric.util.clearFabricFontCache(node.fontFamily);
    node.initDimensions();
    containText(obj);
  });
  canvas.requestRenderAll();
  scheduleSync();
});

if (desktopEditor()) {
  showStage('both');
  const designs = document.getElementById('panel-designs');
  if (designs && designs.dataset.open !== 'true') document.querySelector('[data-panel="designs"]').click();
}
window.matchMedia('(min-width: 1100px)').addEventListener('change', () => {
  showStage(desktopEditor() ? 'both' : 'flat');
  placeToolTabs();
});

function placeToolTabs() {
  const tabs = document.querySelector('.tabbar');
  if (!tabs) return;
  const height = desktopEditor() ? tabs.offsetHeight : 0;
  document.documentElement.style.setProperty('--tool-tabs', height + 'px');
}
placeToolTabs();
new ResizeObserver(placeToolTabs).observe(document.querySelector('.tabbar'));
window.addEventListener('resize', placeToolTabs);

window.__bezze = {
  read() {
    const obj = canvas.getActiveObject();
    const canvasEl = canvas.upperCanvasEl;
    const rect = canvasEl.getBoundingClientRect();
    const scale = rect.width / canvas.getWidth();
    let box = null;
    if (obj) {
      obj.setCoords();
      const bound = obj.getBoundingRect(true, true);
      const point = (name) => {
        const spot = obj.oCoords && obj.oCoords[name];
        if (!spot) return null;
        return { x: rect.left + spot.x * scale, y: rect.top + spot.y * scale };
      };
      box = {
        cx: rect.left + (bound.left + bound.width / 2) * scale,
        cy: rect.top + (bound.top + bound.height / 2) * scale,
        left: rect.left + bound.left * scale,
        top: rect.top + bound.top * scale,
        right: rect.left + (bound.left + bound.width) * scale,
        bottom: rect.top + (bound.top + bound.height) * scale,
        br: point('br'),
        mtr: point('mtr'),
      };
    }
    return {
      typing: document.body.classList.contains('typing'),
      sheetOpen: document.getElementById('sheet').dataset.open === 'true',
      tool: document.querySelector('.panel[data-open="true"]')?.id || '',
      text: (textNode(obj) || obj)?.text || '',
      lines: (textNode(obj) || obj)?.textLines ? (textNode(obj) || obj).textLines.length : 0,
      opacity: Math.round((((textNode(obj) || obj)?.opacity ?? 1) * 100)),
      plaque: obj?.data?.plaque || 'none',
      outline: !!(textNode(obj) || obj)?.data?.outline,
      kind: obj?.data?.kind || '',
      selected: !!obj,
      left: obj ? obj.left : null,
      top: obj ? obj.top : null,
      angle: obj ? obj.angle || 0 : null,
      scaleX: obj ? obj.scaleX || 1 : null,
      textWidth: obj && obj.getScaledWidth ? Math.round(obj.getScaledWidth()) : null,
      safeWidth: CW - SAFE * 2,
      canvasWidth: CW,
      canvasHeight: CH,
      canvasBox: obj ? (() => {
        const boundBox = obj.getBoundingRect(true, true);
        return {
          left: boundBox.left,
          top: boundBox.top,
          right: boundBox.left + boundBox.width,
          bottom: boundBox.top + boundBox.height,
        };
      })() : null,
      controls: obj ? Object.keys(obj.controls) : [],
      box,
      objects: canvas.getObjects().map((item) => ({
        kind: item.data?.kind || '',
        text: item.text || '',
        left: item.left,
        top: item.top,
        angle: item.angle || 0,
        scaleX: item.scaleX || 1,
      })),
      focused: document.activeElement ? document.activeElement.id : '',
    };
  },
  cutoutCorners() {
    const obj = canvas.getActiveObject();
    const el = obj && obj.getElement && obj.getElement();
    if (!el || !el.width || !el.height) return null;
    const sample = document.createElement('canvas');
    sample.width = el.width;
    sample.height = el.height;
    const ctx = sample.getContext('2d');
    ctx.drawImage(el, 0, 0);
    return [[0, 0], [el.width - 1, 0], [0, el.height - 1], [el.width - 1, el.height - 1]]
      .map(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3]);
  },
};
