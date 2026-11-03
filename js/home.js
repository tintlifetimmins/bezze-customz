import { DESIGNS, drawDesign } from './designs.js';
import { mountCards } from './cards.js';
import { paintProductShot } from './thumbs.js';
import { TumblerViewer } from './tumbler.js';
import { nextTuesdayEight, remaining } from './time.js';
import { initNav } from './nav.js';

initNav();

const target = nextTuesdayEight();

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

const drops = DESIGNS.filter((design) => design.badge === 'Drop 014');
const grid = document.getElementById('drop-grid');
const paintDrops = () => mountCards(drops, grid);
paintDrops();
document.fonts.ready.then(paintDrops);

async function buildHeroWrap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1008;
  canvas.height = 868;
  const ctx = canvas.getContext('2d');
  drawDesign('rose-noir', ctx, canvas.width, canvas.height);
  try {
    await document.fonts.load('118px "Great Vibes"');
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '118px "Great Vibes", cursive';
    ctx.shadowColor = 'rgba(0,0,0,.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    ctx.fillText('Kayla', canvas.width / 2, canvas.height * 0.52);
  } catch {
    /* The rose wrap still shows if the script font is blocked. */
  }
  return canvas;
}

async function startHero() {
  const stage = document.getElementById('hero-stage');
  const view = document.getElementById('hero-view');
  const wrap = await buildHeroWrap();
  try {
    const viewer = new TumblerViewer(view, { spin: true, distance: 76, exposure: 1.05 });
    new ResizeObserver(() => viewer.resize()).observe(stage);
    viewer.setWrap(wrap);
    requestAnimationFrame(() => {
      viewer.resize();
      stage.dataset.ready = 'true';
    });
  } catch (err) {
    console.error(err);
    const img = new Image();
    img.src = paintProductShot(wrap).toDataURL('image/jpeg', 0.9);
    img.alt = 'Sample 20 oz tumbler';
    view.replaceWith(img);
    stage.dataset.ready = 'true';
  }
}

startHero();
