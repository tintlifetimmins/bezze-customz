import { getBag } from './store.js';

const CATS = [
  ['All', 'gallery.html'],
  ['Drops', 'gallery.html?cat=Drops'],
  ['Floral', 'gallery.html?cat=Floral'],
  ['Sport', 'gallery.html?cat=Sport'],
  ['Names', 'gallery.html?cat=Names'],
  ['Holiday', 'gallery.html?cat=Holiday'],
];

function currentFile() {
  const last = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  if (!last.includes('.')) return 'index.html';
  return last;
}

function iconMenu() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
}

export function refreshBagCount() {
  const slot = document.getElementById('bag-count');
  if (!slot) return;
  const bag = getBag();
  slot.textContent = '(' + (bag?.qty || 0) + ')';
}

export function initNav() {
  refreshBagCount();
  const btn = document.getElementById('menu-btn');
  if (!btn || document.getElementById('drawer')) {
    if (!btn) return;
  }
  if (!document.getElementById('drawer')) {
    const scrim = document.createElement('div');
    scrim.id = 'scrim';
    scrim.className = 'scrim';
    scrim.hidden = true;
    const drawer = document.createElement('nav');
    drawer.id = 'drawer';
    drawer.className = 'drawer';
    drawer.hidden = true;
    drawer.setAttribute('aria-label', 'Menu');
    const here = currentFile();
    const links = [
      ['Home', 'index.html'],
      ['Gallery', 'gallery.html'],
      ['Bag', 'checkout.html'],
    ];
    const wrap = document.createElement('div');
    wrap.className = 'drawer-inner';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'text-btn';
    close.textContent = 'Close';
    wrap.append(close);
    for (const [label, href] of links) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      if (href.startsWith(here)) a.setAttribute('aria-current', 'page');
      wrap.append(a);
    }
    const label = document.createElement('p');
    label.className = 'label';
    label.textContent = 'Categories';
    wrap.append(label);
    for (const [name, href] of CATS) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = name;
      wrap.append(a);
    }
    drawer.append(wrap);
    document.body.append(scrim, drawer);
    if (!btn.innerHTML.trim()) btn.innerHTML = iconMenu();

    const setOpen = (open) => {
      scrim.hidden = !open;
      drawer.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    };
    btn.addEventListener('click', () => setOpen(drawer.hidden));
    scrim.addEventListener('click', () => setOpen(false));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }
}
