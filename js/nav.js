import { getBag } from './store.js';

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

function mountTopLinks() {
  const header = document.querySelector('.site-header, .bag-bar, .editor-bar');
  if (!header || header.querySelector('.top-links')) return;
  const nav = document.createElement('nav');
  nav.className = 'top-links';
  nav.setAttribute('aria-label', 'Shop');
  const file = currentFile();
  const bag = getBag();
  const items = [
    ['Home', 'index.html', 'index.html'],
    ['Gallery', 'gallery.html', 'gallery.html'],
    ['Design', 'editor.html?mode=custom', 'editor.html'],
    [`Bag${bag?.qty ? ' ' + bag.qty : ''}`, 'checkout.html', 'checkout.html'],
  ];
  for (const [label, href, match] of items) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (file === match) link.setAttribute('aria-current', 'page');
    nav.append(link);
  }
  const actions = header.querySelector('.header-actions, .bar-actions');
  if (actions) header.insertBefore(nav, actions);
  else header.append(nav);
}

function mountAppNav() {
  if (document.body.classList.contains('editor-app') || document.querySelector('.app-nav')) return;
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.setAttribute('aria-label', 'Shop');
  const file = currentFile();
  const bag = getBag();
  const items = [
    ['Home', 'index.html', 'index.html'],
    ['Gallery', 'gallery.html', 'gallery.html'],
    ['Design', 'editor.html?mode=custom', 'editor.html'],
    [`Bag${bag?.qty ? ' ' + bag.qty : ''}`, 'checkout.html', 'checkout.html'],
  ];
  for (const [label, href, match] of items) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (file === match) link.setAttribute('aria-current', 'page');
    nav.append(link);
  }
  document.body.append(nav);
  document.body.classList.add('has-app-nav');
}

export function initNav() {
  refreshBagCount();
  mountTopLinks();
  mountAppNav();
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
