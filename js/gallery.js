import { CATEGORIES, COLOUR_CHIPS, filterDesigns } from './designs.js';
import { mountCards } from './cards.js';
import { initNav } from './nav.js';

initNav();

const params = new URLSearchParams(location.search);
const state = {
  cat: CATEGORIES.includes(params.get('cat')) ? params.get('cat') : 'All',
  colour: COLOUR_CHIPS.some((chip) => chip.id === params.get('colour')) ? params.get('colour') : 'all',
  sort: ['newest', 'popular', 'az'].includes(params.get('sort')) ? params.get('sort') : 'popular',
  q: params.get('q') || '',
};

const cats = document.getElementById('cats');
const colours = document.getElementById('colours');
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

for (const chip of COLOUR_CHIPS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = chip.label;
  button.dataset.colour = chip.id;
  button.addEventListener('click', () => {
    state.colour = chip.id;
    render();
  });
  colours.append(button);
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
  if (state.colour !== 'all') next.set('colour', state.colour);
  if (state.sort !== 'popular') next.set('sort', state.sort);
  if (state.q.trim()) next.set('q', state.q.trim());
  url.search = next.toString();
  history.replaceState(null, '', url);
}

function render() {
  for (const button of cats.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.cat === state.cat ? 'true' : 'false');
  }
  for (const button of colours.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.colour === state.colour ? 'true' : 'false');
  }
  const list = filterDesigns(state);
  count.textContent = list.length + (list.length === 1 ? ' design' : ' designs');
  empty.hidden = list.length > 0;
  mountCards(list, grid);
  writeQuery();
}

render();
document.fonts.ready.then(render);
