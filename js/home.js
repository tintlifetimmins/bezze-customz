import { DESIGNS, drawWrap, whenDesignReady, installDropDesigns, currentDropDesigns } from './designs.js';
import { mountCards } from './cards.js';
import { paintProductShot } from './thumbs.js';
import { remaining } from './time.js';
import { nextDropAt, loadDropFeed } from './drops.js';
import { initNav } from './nav.js';

initNav();

const target = nextDropAt(new Date());

function tick() {
  const left = remaining(target);
  const compact = document.getElementById('count-compact');
  if (compact) compact.textContent = left.compact;
  for (const [id, value] of Object.entries({
    d: left.days,
    h: left.hours,
    m: left.mins,
    s: left.secs,
  })) {
    const el = document.getElementById('cd-' + id);
    if (el) el.textContent = String(value).padStart(2, '0');
  }
}

tick();
setInterval(tick, 1000);

const sampleDrops = DESIGNS.filter((design) => design.drop === '014');
const grid = document.getElementById('drop-grid');
const paintDrops = (list = sampleDrops) => mountCards(list, grid);
paintDrops();
loadDropFeed().then((rows) => {
  installDropDesigns(rows);
  const weekly = currentDropDesigns();
  if (weekly.length) {
    const title = document.querySelector('.drop h2');
    if (title) title.textContent = 'This week';
    paintDrops(weekly);
  }
}).catch(() => {});
document.fonts.ready.then(() => paintDrops(currentDropDesigns().length ? currentDropDesigns() : sampleDrops));

const ORDER = DESIGNS.map((design) => design.id);
const TURN_MS = 13500;
const SWAP_MS = 5000;
const SLOW_SWAP_MS = 12000;
const FADE_MS = 800;

function wrapCanvas(id) {
  return drawWrap(id, 1024, 882);
}

async function prepareWrap(id) {
  await whenDesignReady(id);
  return wrapCanvas(id);
}

function mixWraps(mix, from, to, amount) {
  const g = mix.getContext('2d');
  g.globalAlpha = 1;
  g.drawImage(from, 0, 0, mix.width, mix.height);
  if (to && amount > 0) {
    g.globalAlpha = amount;
    g.drawImage(to, 0, 0, mix.width, mix.height);
    g.globalAlpha = 1;
  }
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

async function startHero() {
  const stage = document.getElementById('hero-stage');
  const view = document.getElementById('hero-view');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 799px)').matches;
  let index = 0;
  let currentId = ORDER[0];
  const first = await prepareWrap(currentId);
  const mix = document.createElement('canvas');
  mix.width = 1024;
  mix.height = 882;
  mixWraps(mix, first, null, 0);

  const still = new Image();
  still.src = paintProductShot(first, 280).toDataURL('image/jpeg', 0.72);
  still.alt = '';
  still.className = 'hero-still';
  view.before(still);
  stage.dataset.ready = 'true';

  let viewer = null;
  let fromWrap = first;
  let toWrap = null;
  let fading = false;
  let fadeStart = 0;
  let nextWrapPromise = prepareWrap(ORDER[1 % ORDER.length]);
  let swapAt = 0;
  let last = 0;
  let raf = 0;
  let running = false;

  function label() {
    const design = DESIGNS.find((item) => item.id === currentId);
    view.setAttribute('aria-label', design ? `Open ${design.name} in the editor` : 'Open this design in the editor');
  }

  function openDesign() {
    location.href = `editor.html?design=${encodeURIComponent(currentId)}`;
  }

  function beginFade() {
    if (fading) return;
    fading = true;
    const started = performance.now();
    nextWrapPromise.then((wrap) => {
      toWrap = wrap;
      fadeStart = performance.now();
    });
    fadeStart = started;
  }

  function finishFade() {
    if (!toWrap) return;
    index = (index + 1) % ORDER.length;
    currentId = ORDER[index];
    fromWrap = toWrap;
    toWrap = null;
    fading = false;
    label();
    mixWraps(mix, fromWrap, null, 0);
    if (viewer) viewer.setWrap(mix);
    nextWrapPromise = prepareWrap(ORDER[(index + 1) % ORDER.length]);
    swapAt = performance.now() + (reduced ? SLOW_SWAP_MS : SWAP_MS);
  }

  function frame(now) {
    if (!running || document.hidden) {
      raf = 0;
      return;
    }
    const dt = last ? now - last : 16;
    last = now;
    if (viewer && !viewer.dragging && !reduced) {
      viewer.turn((dt / TURN_MS) * Math.PI * 2);
    }
    if (!fading && now >= swapAt) beginFade();
    if (fading) {
      if (toWrap) {
        const t = Math.min(1, (now - fadeStart) / FADE_MS);
        mixWraps(mix, fromWrap, toWrap, ease(t));
        if (viewer) viewer.setWrap(mix);
        if (t >= 1) finishFade();
      } else if (now - fadeStart > 4000) {
        fading = false;
        swapAt = now + 1000;
      }
    }
    if (viewer) viewer.render();
    raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  label();
  view.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDesign();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else {
      swapAt = performance.now() + (reduced ? SLOW_SWAP_MS : SWAP_MS);
      startLoop();
    }
  });

  const boot = async () => {
    try {
      const { TumblerViewer } = await import('./tumbler.js');
      viewer = new TumblerViewer(view, {
        spin: false,
        distance: narrow ? 82 : 76,
        exposure: 1.05,
        maxPixelRatio: narrow ? 1.15 : 1.5,
      });
      viewer.onRelease = ({ moved }) => {
        if (!moved) openDesign();
      };
      new ResizeObserver(() => viewer.resize()).observe(stage);
      viewer.setWrap(mix);
      viewer.resize();
      still.remove();
      swapAt = performance.now() + (reduced ? SLOW_SWAP_MS : SWAP_MS);
      if (!document.hidden) startLoop();
    } catch (err) {
      console.error(err);
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(() => boot(), { timeout: 1600 });
  else setTimeout(boot, 400);
}

startHero();
