const cache = new Map();

export const DESIGNS = [
  { id: '01-horror', file: '01_horror_Bones_Pattern_9_.webp', name: 'Bones Pattern', category: 'Horror', tags: ['sugar skull', 'day of the dead', 'pattern', 'floral', 'mexican', 'colorful', 'art', 'background'], fit: 'cover', w: 1800, h: 1800, popular: 80, newest: 20, drop: '014', ink: '#ffffff' },
  { id: '02-floral', file: '02_floral_With-Taper145.webp', name: 'Floral', category: 'Floral', tags: ['flowers', 'lilies', 'botanical', 'red', 'pink', 'white', 'spring', 'illustration'], fit: 'cover', w: 2796, h: 2460, popular: 79, newest: 19, drop: '014', ink: '#ffffff' },
  { id: '03-animals-cartoon', file: '03_animals-cartoon_12.webp', name: 'Animals Cartoon', category: 'Animals Cartoon', tags: ['Tom and Jerry', 'cats', 'banana peel', 'cartoon', 'slapstick', 'city street', 'animation'], fit: 'cover', w: 4000, h: 3527, popular: 78, newest: 18, drop: '014', ink: '#ffffff' },
  { id: '04-retro', file: '04_retro_VINTAGE_85_.webp', name: 'Vintage', category: 'Retro', tags: ['los angeles dodgers', 'mlb', 'baseball', 'sports team logo', 'blue', 'grey', 'vintage design', 'poster'], fit: 'cover', w: 2048, h: 1817, popular: 77, newest: 17, drop: '014', ink: '#ffffff' },
  { id: '05-abstract', file: '05_abstract_Tribal_Pattern_31_.webp', name: 'Tribal Pattern', category: 'Abstract', tags: ['pattern', 'abstract', 'ornament', 'ethnic', 'seamless', 'line art', 'design'], fit: 'cover', w: 1800, h: 1800, popular: 76, newest: 16, ink: '#ffffff' },
  { id: '06-typography', file: '06_typography_188.webp', name: 'Typography', category: 'Typography', tags: ['text', 'welcome', 'home', 'pink', 'sign', 'typography', 'black background', 'graphic'], fit: 'center', w: 1408, h: 386, popular: 75, newest: 15, ink: '#ffffff' },
  { id: '07-western-cowboy', file: '07_western-cowboy_23.webp', name: 'Western Cowboy', category: 'Western Cowboy', tags: ['toy story', 'woody', 'jessie', 'bullseye', 'cowboy', 'animation', 'disney', 'pixar'], fit: 'cover', w: 4000, h: 3527, popular: 74, newest: 14, ink: '#ffffff' },
  { id: '08-sports', file: '08_sports_NFL_JUNKIE_11_.webp', name: 'NFL Junkie', category: 'Sports', tags: ['cleveland', 'browns', 'football', 'helmet', 'glitter', 'chocolate', 'sports', 'logo'], fit: 'cover', w: 2048, h: 1762, popular: 73, newest: 13, ink: '#ffffff' },
  { id: '09-cartoon', file: '09_cartoon_19.webp', name: 'Cartoon', category: 'Cartoon', tags: ['marvel', 'superheroes', 'comic', 'spider-man', 'captain america', 'thor', 'vision', 'action'], fit: 'cover', w: 4000, h: 3527, popular: 72, newest: 12, ink: '#ffffff' },
  { id: '10-fantasy', file: '10_fantasy_87.webp', name: 'Fantasy', category: 'Fantasy', tags: ['mario', 'fantasy landscape', 'clouds', 'full moon', 'grass', 'flowers', 'mushrooms', 'palm trees'], fit: 'cover', w: 4000, h: 3527, popular: 71, newest: 11, ink: '#ffffff' },
  { id: '11-halloween', file: '11_halloween_75.webp', name: 'Halloween', category: 'Halloween', tags: ['witches', 'halloween', 'women', 'spooky', 'fantasy', 'costumes', 'magic'], fit: 'cover', w: 4000, h: 3527, popular: 70, newest: 10, ink: '#ffffff' },
  { id: '12-beach', file: '12_beach_67.webp', name: 'Beach', category: 'Beach', tags: ['text', 'quote', 'beach', 'summer', 'typography', 'handwriting', 'black background'], fit: 'cover', w: 1875, h: 1875, popular: 69, newest: 9, ink: '#ffffff' },
  { id: '13-galaxy', file: '13_galaxy_Zodiac_5_.webp', name: 'Zodiac', category: 'Galaxy', tags: ['astrology', 'virgo', 'galaxy', 'woman', 'stars', 'colorful', 'fantasy', 'art'], fit: 'cover', w: 2048, h: 1805, popular: 68, newest: 8, ink: '#ffffff' },
  { id: '14-leopard', file: '14_leopard_Cheetah_Neon_1_.webp', name: 'Cheetah Neon', category: 'Leopard', tags: ['leopard print', 'animal print', 'pattern', 'neon green', 'black', 'textile', 'fashion', 'background'], fit: 'cover', w: 5580, h: 4920, popular: 67, newest: 7, ink: '#ffffff' },
  { id: '15-nature-butterflies', file: '15_nature-butterflies_Patterns_187_.webp', name: 'Patterns', category: 'Nature Butterflies', tags: ['butterflies', 'red', 'insects', 'nature', 'pattern', 'wings', 'animals', 'collage'], fit: 'cover', w: 2790, h: 2460, popular: 66, newest: 6, ink: '#ffffff' },
  { id: '16-patriotic', file: '16_patriotic_Artistic_Images_50_.webp', name: 'Artistic Images', category: 'Patriotic', tags: ['flag', 'usa', 'american flag', 'brick wall', 'texture', 'grunge', 'patriotic'], fit: 'cover', w: 2790, h: 2460, popular: 65, newest: 5, ink: '#ffffff' },
  { id: '17-boho', file: '17_boho_4.webp', name: 'Boho', category: 'Boho', tags: ['mandala', 'pattern', 'ornament', 'colorful', 'abstract', 'vector', 'ethnic', 'design'], fit: 'cover', w: 4000, h: 4000, popular: 64, newest: 4, ink: '#ffffff' },
  { id: '18-camo', file: '18_camo_With-Taper_copy.webp', name: 'Camo', category: 'Camo', tags: ['military', 'soldier', 'mom', 'graphic', 'text', 'camo', 'dog tags', 'army'], fit: 'cover', w: 2796, h: 2460, popular: 63, newest: 3, ink: '#ffffff' },
  { id: '19-pastel', file: '19_pastel_Florals_8.webp', name: 'Florals', category: 'Pastel', tags: ['paper flowers', 'bouquet', 'craft', 'white background', 'floral art', 'pastel colors'], fit: 'cover', w: 2790, h: 2460, popular: 62, newest: 2, ink: '#3a1822' },
  { id: '20-gothic', file: '20_gothic_12.webp', name: 'Gothic', category: 'Gothic', tags: ['wednesday addams', 'gothic', 'school uniform', 'umbrella', 'portrait', 'woman', 'dark', 'tv show'], fit: 'cover', w: 4000, h: 3478, popular: 61, newest: 1, ink: '#ffffff' },
];

export const CATEGORIES = ['All', ...DESIGNS.map((design) => design.category)];

export const HERO_DESIGN = '02-floral';

function slot(id) {
  if (cache.has(id)) return cache.get(id);
  const design = getDesign(id);
  const entry = { img: null, ready: !design?.file, waiters: [] };
  cache.set(id, entry);
  if (!design?.file) return entry;
  const img = new Image();
  img.decoding = 'async';
  const finish = () => {
    entry.ready = true;
    entry.waiters.splice(0).forEach((resolve) => resolve());
  };
  img.onload = () => {
    entry.img = img;
    finish();
  };
  img.onerror = finish;
  img.src = 'previews/' + design.file;
  return entry;
}

export function whenDesignReady(id) {
  const entry = slot(id);
  if (entry.ready) return Promise.resolve();
  return new Promise((resolve) => entry.waiters.push(resolve));
}

export function designReady(id) {
  return !!slot(id).ready;
}

DESIGNS.forEach((design) => slot(design.id));

export function getDesign(id) {
  return DESIGNS.find((design) => design.id === id) || null;
}

function paintCustom(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#2a1020');
  g.addColorStop(0.45, '#6d1244');
  g.addColorStop(1, '#ff2d8f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function paintPreview(ctx, img, w, h, fit) {
  ctx.fillStyle = '#101012';
  ctx.fillRect(0, 0, w, h);
  if (!img || !img.naturalWidth) return;
  const scale = fit === 'center'
    ? Math.min(w / img.naturalWidth, h / img.naturalHeight)
    : Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function drawDesign(id, ctx, w, h) {
  const design = getDesign(id);
  const entry = design ? slot(id) : null;
  if (!design || !entry?.img) {
    paintCustom(ctx, w, h);
    return;
  }
  paintPreview(ctx, entry.img, w, h, design.fit);
}

export function filterDesigns({ q = '', cat = 'All', sort = 'popular' } = {}) {
  const query = q.trim().toLowerCase();
  const list = DESIGNS.filter((design) => {
    if (cat && cat !== 'All' && design.category !== cat) return false;
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
  if (key && String(key).startsWith('grad:')) {
    const [bottom, top] = key.slice(5).split(',');
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    drawDesign(key || 'custom', ctx, w, h);
  }
  return canvas;
}
