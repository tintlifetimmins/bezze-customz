import { drawDesign } from './designs.js';
import { paintProductShot } from './thumbs.js';

export function mountCards(designs, container) {
  container.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const design of designs) {
    const wrap = document.createElement('canvas');
    wrap.width = 246;
    wrap.height = 211;
    drawDesign(design.id, wrap.getContext('2d'), wrap.width, wrap.height);
    const shot = paintProductShot(wrap, 200);
    const link = document.createElement('a');
    link.className = 'card';
    link.href = `editor.html?design=${encodeURIComponent(design.id)}`;

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const img = new Image();
    img.src = shot.toDataURL('image/jpeg', 0.7);
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    thumb.append(img);
    if (design.badge) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = design.badge;
      thumb.append(badge);
    }

    const name = document.createElement('h2');
    name.textContent = design.name;
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = 'Sample · $39.99';

    link.append(thumb, name, meta);
    frag.append(link);
  }
  container.append(frag);
}
