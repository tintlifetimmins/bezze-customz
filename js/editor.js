import { drawWrap, getDesign } from './designs.js';
import { filterCatalog, loadCatalog } from './catalog.js';
import { paintProductShot } from './thumbs.js';
import { TumblerViewer } from './tumbler.js';
import { PRICE, clearDraft, loadDraft, money, saveDraft, setBag } from './store.js';
import { initNav } from './nav.js';
import { shareDesign, showCopyField, toast } from './share.js';

initNav();

const PX = 6;
const CW = 252 * PX;
const CH = 217 * PX;
const SAFE = 15 * PX;

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

const INKS = ['#ffffff', '#1a1a1a', '#ff2d8f', '#e7c98a', '#fff4e6', '#1c2748', '#f0c9d4', '#d7ecf8'];

const CLIPS = [
  ['Leaf', 'Nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M18 58c10-28 32-40 52-44-4 22-14 46-40 54-2-6-6-8-12-10z"/><path d="M24 52c10-8 20-20 28-34" fill="none" stroke="#fff" stroke-width="2"/></svg>'],
  ['Sprig', 'Nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M40 68c2-16 2-28 0-48" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path fill="#fff" d="M40 50c10-2 16-10 16-10s-8 2-16 8zm0 0c-10-2-16-10-16-10s8 2 16 8zm0-14c9-4 14-12 14-12s-7 3-14 10zm0 0c-9-4-14-12-14-12s7 3 14 10z"/></svg>'],
  ['Bloom', 'Nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><g fill="none" stroke="#fff" stroke-width="2"><circle cx="40" cy="22" r="8"/><circle cx="56" cy="34" r="8"/><circle cx="50" cy="52" r="8"/><circle cx="30" cy="52" r="8"/><circle cx="24" cy="34" r="8"/></g><circle cx="40" cy="38" r="6" fill="#fff"/></svg>'],
  ['Moon', 'Nature', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M46 12a24 24 0 1 0 16 40A20 20 0 0 1 46 12z"/></svg>'],
  ['Star', 'Marks', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M40 8l7.2 18.2L67 28.4 52 40.2l5 19.6L40 50.8 23 59.8l5-19.6L13 28.4l19.8-2.2z"/></svg>'],
  ['Diamond', 'Marks', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M40 8l26 22L40 72 14 30z"/></svg>'],
  ['Crown', 'Marks', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M12 58l8-30 12 14 8-24 8 24 12-14 8 30z"/><path d="M16 62h48" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>'],
  ['Spark', 'Marks', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M40 6l4 26 26 4-26 4-4 34-4-34-26-4 26-4z"/></svg>'],
  ['Ring', 'Frames', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="26" fill="none" stroke="#fff" stroke-width="3"/><circle cx="40" cy="40" r="16" fill="none" stroke="#fff" stroke-width="1.5"/></svg>'],
  ['Crest', 'Frames', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="none" stroke="#fff" stroke-width="2.5" d="M40 10l22 8v18c0 16-10 26-22 32C28 62 18 52 18 36V18z"/></svg>'],
  ['Laurel', 'Frames', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M24 58c-8-10-10-24-6-38 8 4 14 14 16 24 2 8 0 16-2 22 6-2 14-2 22 2-2-8-2-16 2-24 4-10 12-18 20-22-2 14-8 26-16 34" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>'],
  ['Seal', 'Frames', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="22" fill="none" stroke="#fff" stroke-width="2"/><circle cx="40" cy="40" r="28" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 3"/></svg>'],
  ['Heart', 'Celebrate', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M40 66S16 50 12 34c-3-12 6-22 16-18 5 2 8 6 12 10 4-4 7-8 12-10 10-4 19 6 16 18-4 16-28 32-28 32z"/></svg>'],
  ['Ribbon', 'Celebrate', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M18 28h44v10H18z"/><path fill="#fff" d="M30 38l-8 24 10-8 8 10V38zm20 0l8 24-10-8-8 10V38z"/></svg>'],
  ['Wave', 'Celebrate', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M8 44c8-12 12-12 20 0s12 12 20 0 12-12 24 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'],
  ['Burst', 'Celebrate', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path fill="#fff" d="M40 14l4 14 14-6-6 14 14 4-14 4 6 14-14-6-4 14-4-14-14 6 6-14-14-4 14-4-6-14 14 6z"/></svg>'],
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
    this.callSuper('initDimensions');
    if (this.curve) this.height += (Math.abs(this.curve) / 100) * this.fontSize * 0.9;
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
let syncFrame = 0;
let savedOk = true;
let warned = false;
let resetArm = 0;

fabric.Object.prototype.set({
  borderColor: '#ff2d8f',
  cornerColor: '#ffffff',
  cornerStrokeColor: '#ff2d8f',
  cornerSize: 22,
  touchCornerSize: 40,
  transparentCorners: false,
  cornerStyle: 'circle',
  borderScaleFactor: 2.2,
  padding: 12,
  rotatingPointOffset: 36,
  centeredRotation: true,
});

const frame = document.getElementById('art-frame');
canvas = new fabric.Canvas('c', {
  width: CW,
  height: CH,
  enableRetinaScaling: false,
  preserveObjectStacking: true,
  selection: true,
  stopContextMenu: true,
  uniformScaling: true,
  targetFindTolerance: 18,
  backgroundColor: '#140810',
});

function paintWrap(key) {
  state.wrapKey = key || null;
  const gradient = key && String(key).startsWith('grad:');
  const paintId = gradient ? (baseDesign?.id || 'custom') : (key || baseDesign?.id || 'custom');
  const bare = paintId === 'monogram' && bareMonogram && !gradient;
  const src = drawWrap(gradient ? key : paintId, CW, CH, { bare });
  const img = new fabric.Image(src, { originX: 'left', originY: 'top' });
  canvas.setBackgroundImage(img, () => {
    canvas.requestRenderAll();
    scheduleSync();
  });
  markActiveDesign();
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

function scheduleSync() {
  cancelAnimationFrame(syncFrame);
  syncFrame = requestAnimationFrame(() => {
    const selected = canvas.getActiveObjects();
    selected.forEach((obj) => obj.set({ hasControls: false, hasBorders: false }));
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
    selected.forEach((obj) => obj.set({
      hasControls: !obj.data?.locked,
      hasBorders: true,
    }));
    canvas.requestRenderAll();
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
  const note = document.getElementById('price-note');
  if (mode === 'custom') note.textContent = 'A design you build is $44.99 CAD.';
  else if (custom) note.textContent = 'Edited designs are $44.99 CAD.';
  else note.textContent = 'This sample as-is is $39.99 CAD. Any edit is $44.99.';
  return value;
}

function isText(obj) {
  return !!obj && (obj.type === 'name-text' || obj.type === 'i-text' || obj.data?.kind === 'text');
}

function layerName(obj) {
  if (obj.data?.kind === 'design') return obj.data.name || 'Design';
  if (obj.data?.kind === 'monogram') return `Monogram ${obj.data.initials || ''}`.trim();
  if (isText(obj)) return obj.text || 'Name';
  if (obj.data?.kind === 'clip') return obj.data.name || 'Shape';
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
  fabric.Object.prototype.cornerSize = px(28);
  fabric.Object.prototype.touchCornerSize = px(46);
  fabric.Object.prototype.borderScaleFactor = px(2.4);
  fabric.Object.prototype.padding = px(10);
  fabric.Object.prototype.rotatingPointOffset = px(36);
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
    editable: true,
    data: { kind: 'text', ...(meta.data || {}) },
  });
  applyTextPaint(text, meta);
  return text;
}

function applyTextPaint(obj, meta = {}) {
  const outline = meta.outline ?? obj.data?.outline;
  const shadow = meta.shadowOn ?? obj.data?.shadowOn;
  if (obj.data) {
    obj.data.outline = !!outline;
    obj.data.shadowOn = !!shadow;
  }
  obj.set('paintFirst', 'stroke');
  if (outline) {
    obj.set({ stroke: meta.stroke || contrast(obj.fill), strokeWidth: Math.max(2, obj.fontSize / 18) });
  } else {
    obj.set({ stroke: null, strokeWidth: 0 });
  }
  obj.set('shadow', shadow
    ? new fabric.Shadow({ color: 'rgba(0,0,0,.45)', blur: 18, offsetX: 0, offsetY: 10 })
    : null);
  obj.dirty = true;
  if (obj.initDimensions) obj.initDimensions();
  obj.setCoords();
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

function showSelection(obj) {
  const sheet = document.getElementById('sheet');
  if (!obj) {
    closeSheet();
    return;
  }
  const kind = obj.data?.kind === 'monogram' ? 'monogram' : isText(obj) ? 'text' : obj.data?.kind === 'clip' ? 'clip' : obj.data?.kind === 'design' ? 'design' : 'object';
  sheet.dataset.open = 'true';
  sheet.dataset.kind = kind;
  document.body.classList.add('sheet-open');
  document.getElementById('sheet-text').hidden = kind !== 'text';
  document.getElementById('sheet-mono').hidden = kind !== 'monogram';
  document.getElementById('sheet-clip').hidden = kind !== 'clip';
  document.getElementById('sheet-title').textContent = kind === 'monogram' ? 'Edit monogram' : kind === 'text' ? 'Edit text' : kind === 'clip' ? 'Edit shape' : kind === 'design' ? 'Design layer' : 'Selected';
  document.getElementById('obj-actions').hidden = false;
  document.getElementById('lock').textContent = obj.data?.locked ? 'Unlock' : 'Lock';
  if (kind === 'text' && document.activeElement !== document.getElementById('edit-text')) fillTextSheet(obj);
  if (kind === 'monogram' && document.activeElement !== document.getElementById('mono-letters')) fillMonoSheet(obj);
  if (kind === 'clip') document.getElementById('clip-ink').value = toHex(obj.data?.fill || '#ffffff');
  refreshLayers();
  checkSafe(obj);
}

function closeSheet() {
  const sheet = document.getElementById('sheet');
  sheet.dataset.open = 'false';
  sheet.dataset.kind = '';
  document.body.classList.remove('sheet-open');
  document.getElementById('zone-warn').hidden = true;
  document.querySelector('.guide.safe').classList.remove('is-hot');
  refreshLayers();
}

function fillTextSheet(obj) {
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
  filling = false;
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

function fontButtons(container, onPick) {
  FONTS.forEach((font) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'font-chip';
    button.dataset.font = font.name;
    button.style.fontFamily = font.css;
    button.textContent = font.sample;
    button.addEventListener('click', () => onPick(font));
    container.append(button);
  });
}

async function ensureFont(name) {
  try { await document.fonts.load(`200px "${name}"`); } catch { /* fallback */ }
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
  const maxW = 200 * PX;
  let guard = 0;
  while (obj.width > maxW && obj.fontSize > 80 && guard < 30) {
    obj.set('fontSize', obj.fontSize - 8);
    obj.initDimensions();
    guard += 1;
  }
  canvas.add(obj);
  canvas.setActiveObject(obj);
  commit();
  showSelection(obj);
  const field = document.getElementById('edit-text');
  field.focus();
  field.select();
}

function liveText(mutate, doCommit) {
  const obj = active();
  if (!isText(obj) || filling) return;
  mutate(obj);
  touchObject(obj);
  obj.dirty = true;
  obj.setCoords();
  canvas.requestRenderAll();
  scheduleSyncAndSafe(obj);
  if (doCommit) commit();
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
  document.getElementById('mono-letters').focus();
  document.getElementById('mono-letters').select();
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

function exportPrintCanvas() {
  const editing = canvas.getActiveObject();
  if (editing?.exitEditing) editing.exitEditing();
  canvas.discardActiveObject();
  canvas.renderAll();
  const src = canvas.getElement();
  const bleedX = Math.round((3 / 252) * src.width);
  const bleedY = Math.round((3 / 217) * src.height);
  const out = document.createElement('canvas');
  out.width = 1000;
  out.height = Math.round(1000 * (211 / 246));
  out.getContext('2d').drawImage(src, bleedX, bleedY, src.width - bleedX * 2, src.height - bleedY * 2, 0, 0, out.width, out.height);
  return out;
}

function review() {
  const print = exportPrintCanvas();
  let png = print.toDataURL('image/png');
  if (png.length > 3500000) png = print.toDataURL('image/jpeg', 0.86);
  setBag({
    v: 1,
    designId: currentId(),
    title: productTitle(),
    subtitle: `20 oz · ${design?.name || 'Custom wrap'} · Full wrap`,
    unitPrice: updatePrice(),
    qty: 1,
    customized: isCustom(),
    wrapPng: png,
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

const catalog = loadCatalog();
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
  meta.textContent = item.badge ? `Sample · ${item.badge}` : 'Sample';
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
}

function bootUi() {
  fontButtons(document.getElementById('sheet-fonts'), async (font) => {
    state.font = font.name;
    await ensureFont(font.name);
    liveText((obj) => {
      obj.set('fontFamily', font.name);
      obj.initDimensions();
    }, true);
    highlightFonts(font.name);
  });
  fontButtons(document.getElementById('mono-fonts'), async (font) => {
    await ensureFont(font.name);
    updateMonogram({ fontFamily: font.name }, true);
    highlightFonts(font.name, '#mono-fonts');
  });
  paintSwatches(document.getElementById('ink-swatches'), (color) => {
    document.getElementById('ink').value = color;
    liveText((obj) => {
      obj.set('fill', color);
      if (obj.data?.outline) obj.set('stroke', contrast(color));
    }, true);
  });
  paintSwatches(document.getElementById('mono-swatches'), (color) => {
    document.getElementById('mono-ink').value = color;
    updateMonogram({ fill: color }, true);
  });
  paintSwatches(document.getElementById('clip-swatches'), (color) => {
    document.getElementById('clip-ink').value = color;
    const obj = active();
    if (obj?.data?.kind === 'clip') {
      paintClip(obj, color);
      canvas.requestRenderAll();
      commit();
    }
  });

  const cats = document.getElementById('clip-cats');
  ['All', 'Nature', 'Marks', 'Frames', 'Celebrate'].forEach((name, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.dataset.cat = name;
    button.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    button.addEventListener('click', () => {
      cats.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
      filterClips();
    });
    cats.append(button);
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

function filterClips() {
  const cat = document.querySelector('#clip-cats button[aria-pressed="true"]')?.dataset.cat || 'All';
  const query = document.getElementById('shape-q').value.trim().toLowerCase();
  document.querySelectorAll('#shapes button').forEach((button) => {
    const catOk = cat === 'All' || button.dataset.cat === cat;
    const textOk = !query || button.dataset.name.includes(query) || button.dataset.cat.toLowerCase().includes(query);
    button.hidden = !(catOk && textOk);
  });
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
  });
});
document.getElementById('edit-text').addEventListener('change', () => {
  if (isText(active())) commit();
});
document.getElementById('size').addEventListener('input', () => {
  const size = Number(document.getElementById('size').value);
  document.getElementById('size-label').textContent = `${Math.round(size / PX)} mm`;
  liveText((obj) => {
    obj.set('fontSize', size);
    if (obj.data?.outline) obj.set('strokeWidth', Math.max(2, size / 18));
    obj.initDimensions();
  });
});
document.getElementById('size').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('tracking').addEventListener('input', () => {
  const spacing = Number(document.getElementById('tracking').value);
  document.getElementById('track-label').textContent = String(spacing);
  liveText((obj) => {
    obj.set('charSpacing', spacing);
    obj.initDimensions();
  });
});
document.getElementById('tracking').addEventListener('change', () => { if (isText(active())) commit(); });
document.getElementById('curve-on').addEventListener('change', (event) => {
  const on = event.target.checked;
  const slider = document.getElementById('curve');
  if (on && Number(slider.value) === 0) slider.value = '55';
  if (!on) slider.value = '0';
  document.getElementById('curve-label').textContent = slider.value;
  liveText((obj) => { obj.curve = Number(slider.value); obj.initDimensions(); }, true);
});
document.getElementById('curve').addEventListener('input', () => {
  const value = document.getElementById('curve').value;
  document.getElementById('curve-label').textContent = value;
  document.getElementById('curve-on').checked = Number(value) !== 0;
  liveText((obj) => { obj.curve = Number(value); obj.initDimensions(); });
});
document.getElementById('curve').addEventListener('change', () => { if (isText(active())) commit(); });
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
document.getElementById('clip-ink').addEventListener('input', (event) => {
  const obj = active();
  if (obj?.data?.kind !== 'clip') return;
  paintClip(obj, event.target.value);
  canvas.requestRenderAll();
  scheduleSync();
});
document.getElementById('clip-ink').addEventListener('change', () => { if (active()?.data?.kind === 'clip') commit(); });
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
    document.querySelectorAll('.tabbar button').forEach((tab) => {
      tab.setAttribute('aria-current', tab === button ? 'true' : 'false');
    });
    document.querySelectorAll('.panel').forEach((panel) => {
      panel.hidden = panel.id !== `panel-${button.dataset.panel}`;
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
document.getElementById('duplicate').addEventListener('click', duplicate);
document.getElementById('rotate-step').addEventListener('click', rotateStep);
document.getElementById('lock').addEventListener('click', () => {
  const obj = active();
  if (!obj) return;
  setLocked(obj, !obj.data?.locked);
  commit();
});
document.getElementById('sheet-close').addEventListener('click', () => {
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  closeSheet();
});
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
  const png = exportPrintCanvas().toDataURL('image/png');
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
  const coarse = window.matchMedia('(pointer: coarse)').matches;
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
canvas.on('selection:updated', (event) => showSelection(event.selected?.[0] || active()));
canvas.on('selection:cleared', () => { if (!lock) closeSheet(); });

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
  seedMonogram();
  commit();
}

FONTS.forEach((font) => {
  document.fonts.load(`160px "${font.name}"`).catch(() => {});
});
