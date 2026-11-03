import { CATEGORIES, filterDesigns, installDropDesigns } from './designs.js';
import { loadDropFeed } from './drops.js';
import { mountCards } from './cards.js';
import { initNav } from './nav.js';

initNav();

const params = new URLSearchParams(location.search);
const state = {
  cat: CATEGORIES.includes(params.get('cat')) ? params.get('cat') : 'All',
  sort: ['newest', 'popular', 'az'].includes(params.get('sort')) ? params.get('sort') : 'popular',
  q: params.get('q') || '',
};

const cats = document.getElementById('cats');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const empty = document.getElementById('empty');
const search = document.getElementById('q');
const sort = document.getElementById('sort');

search.value = state.q;
sort.value = state.sort;

for (const name of CATEGORIES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = name;
  button.dataset.cat = name;
  button.addEventListener('click', () => {
    state.cat = name;
    render();
  });
  cats.append(button);
}

search.addEventListener('input', () => {
  state.q = search.value;
  render();
});

sort.addEventListener('change', () => {
  state.sort = sort.value;
  render();
});

function writeQuery() {
  const url = new URL(location.href);
  const next = new URLSearchParams();
  if (state.cat !== 'All') next.set('cat', state.cat);
  if (state.sort !== 'popular') next.set('sort', state.sort);
  if (state.q.trim()) next.set('q', state.q.trim());
  url.search = next.toString();
  history.replaceState(null, '', url);
}

const sheet = document.getElementById('filter-sheet');
const openBtn = document.getElementById('open-filters');
const scrim = document.getElementById('filter-scrim');
function setFilters(open) {
  sheet.dataset.open = open ? 'true' : 'false';
  openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (scrim) scrim.hidden = !open;
  document.body.classList.toggle('nav-open', open);
}
openBtn.addEventListener('click', () => setFilters(sheet.dataset.open !== 'true'));
document.getElementById('close-filters').addEventListener('click', () => setFilters(false));
document.getElementById('apply-filters').addEventListener('click', () => setFilters(false));
scrim?.addEventListener('click', () => setFilters(false));

function render() {
  for (const button of cats.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.cat === state.cat ? 'true' : 'false');
  }
  const list = filterDesigns(state);
  count.textContent = list.length + (list.length === 1 ? ' design' : ' designs');
  empty.hidden = list.length > 0;
  mountCards(list, grid);
  const bits = [];
  if (state.cat !== 'All') bits.push(state.cat);
  if (state.sort === 'newest') bits.push('Newest');
  if (state.sort === 'az') bits.push('A–Z');
  openBtn.textContent = bits.length ? `Filters · ${bits.join(', ')}` : 'Filters';
  writeQuery();
}

render();
loadDropFeed().then((rows) => {
  if (!rows.length) return;
  installDropDesigns(rows);
  const known = new Set([...cats.querySelectorAll('button')].map((button) => button.dataset.cat));
  for (const design of rows) {
    if (known.has(design.category)) continue;
    known.add(design.category);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = design.category;
    button.dataset.cat = design.category;
    button.addEventListener('click', () => {
      state.cat = design.category;
      render();
    });
    cats.append(button);
  }
  render();
}).catch(() => {});
document.fonts.ready.then(render);
