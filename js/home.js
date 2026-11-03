import { DESIGNS, HERO_DESIGN, drawDesign, whenDesignReady } from './designs.js';
import { mountCards } from './cards.js';
import { paintProductShot } from './thumbs.js';
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

const drops = DESIGNS.filter((design) => design.drop === '014');
const grid = document.getElementById('drop-grid');
const paintDrops = () => mountCards(drops, grid);
paintDrops();
document.fonts.ready.then(paintDrops);

async function buildHeroWrap() {
  const canvas = document.createElement('canvas');
  canvas.width = 630;
  canvas.height = 543;
  const ctx = canvas.getContext('2d');
  await whenDesignReady(HERO_DESIGN);
  drawDesign(HERO_DESIGN, ctx, canvas.width, canvas.height);
  try {
    await document.fonts.load('96px "Great Vibes"');
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let size = 96;
    const limit = canvas.width * 0.34;
    ctx.font = size + 'px "Great Vibes", cursive';
    while (size > 52 && ctx.measureText('Kayla').width > limit) {
      size -= 4;
      ctx.font = size + 'px "Great Vibes", cursive';
    }
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
  const still = new Image();
  still.src = paintProductShot(wrap, 280).toDataURL('image/jpeg', 0.72);
  still.alt = 'Sample 20 oz tumbler';
  still.className = 'hero-still';
  view.before(still);
  stage.dataset.ready = 'true';
  const boot = async () => {
    try {
      const { TumblerViewer } = await import('./tumbler.js');
      const viewer = new TumblerViewer(view, { spin: true, distance: 76, exposure: 1.05 });
      new ResizeObserver(() => viewer.resize()).observe(stage);
      viewer.setWrap(wrap);
      requestAnimationFrame(() => {
        viewer.resize();
        still.remove();
      });
    } catch (err) {
      console.error(err);
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(() => boot(), { timeout: 1600 });
  else setTimeout(boot, 700);
}

startHero();
