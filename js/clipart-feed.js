let libraryPromise = null;

function normalize(item) {
  const id = item && item.drive_file_id;
  if (!id) return null;
  const preview = String(item.preview || `previews/${id}.jpg`);
  const file = preview.startsWith('clipart/') ? preview.slice('clipart/'.length) : preview.replace(/^\//, '');
  return {
    id,
    name: item.title || item.filename || 'Clip art',
    file,
    src: `clipart/${file}`,
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
    category: item.category || '',
    hasAlpha: false,
    library: true,
  };
}

export function loadClipLibrary() {
  if (!libraryPromise) {
    libraryPromise = fetch('clipart/manifest.json')
      .then((response) => {
        if (!response.ok) throw new Error('clipart manifest');
        return response.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data && data.items) || [];
        return items.map(normalize).filter(Boolean);
      })
      .catch(() => []);
  }
  return libraryPromise;
}

const DULL_TAGS = new Set(['tumbler', 'drinkware', 'straw', 'cup', 'cups']);
const FILE_WORDS = new Set(['png', 'svg', 'jpg', 'jpeg', 'webp', 'copy']);

export function clipLabel(title) {
  const text = String(title || '').replace(/\s+/g, ' ').trim();
  const words = text.match(/[a-zA-Z]{3,}/g) || [];
  const useful = words.filter((word) => !FILE_WORDS.has(word.toLowerCase()));
  return useful.length ? text : '';
}

export function commonTags(items, limit = 12) {
  const counts = new Map();
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      const key = tag.trim().toLowerCase();
      if (!key || DULL_TAGS.has(key)) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function knockOutWhite(image, maxSize = 800, tolerance = 28) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = Math.min(1, maxSize / Math.max(width, height, 1));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, w, h);
  const frame = ctx.getImageData(0, 0, w, h);
  const data = frame.data;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const thresh = 255 - tolerance;
  const near = (index) => data[index] >= thresh && data[index + 1] >= thresh && data[index + 2] >= thresh;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const pixel = y * w + x;
    if (seen[pixel]) return;
    if (!near(pixel * 4)) return;
    seen[pixel] = 1;
    stack.push(pixel);
  };
  for (let x = 0; x < w; x += 1) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y += 1) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const pixel = stack.pop();
    data[pixel * 4 + 3] = 0;
    const x = pixel % w;
    const y = (pixel - x) / w;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  ctx.putImageData(frame, 0, 0);
  return canvas;
}

const thumbCache = new Map();
const cutoutCache = new Map();

export function libraryThumb(item) {
  const key = item.id || item.src;
  if (!thumbCache.has(key)) {
    thumbCache.set(key, loadImage(item.src).then((img) => knockOutWhite(img, 180).toDataURL('image/png')));
  }
  return thumbCache.get(key);
}

export function libraryCutout(item) {
  const key = item.id || item.src;
  if (!cutoutCache.has(key)) {
    cutoutCache.set(key, loadImage(item.src).then((img) => knockOutWhite(img, 800)));
  }
  return cutoutCache.get(key);
}
