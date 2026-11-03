import { clearBag, getBag, loadOrder, money, quote, saveOrder, setBag } from './store.js';
import { initNav, refreshBagCount } from './nav.js';
import { shareDesign, showCopyField, toast } from './share.js';
import { guardSaves } from './watermark.js';

initNav();
guardSaves();

const empty = document.getElementById('empty');
const bagView = document.getElementById('bag-view');
const done = document.getElementById('done');
let delivery = 'pickup';
let qty = 1;

function show(which) {
  empty.hidden = which !== 'empty';
  bagView.hidden = which !== 'bag';
  done.hidden = which !== 'done';
}

function renderTotals(unit) {
  const numbers = quote(unit, qty);
  const rows = [
    ['Subtotal', money(numbers.subtotal)],
    [delivery === 'pickup' ? 'Pickup' : 'Ship', delivery === 'pickup' ? 'Free' : '$0.00'],
    ['Total', money(numbers.total) + ' CAD'],
  ];
  const box = document.getElementById('totals');
  box.replaceChildren();
  rows.forEach(([label, value], index) => {
    const name = document.createElement('span');
    name.textContent = label;
    const amount = document.createElement('span');
    amount.textContent = value;
    if (index === rows.length - 1) {
      name.className = 'grand';
      amount.className = 'grand';
    }
    box.append(name, amount);
  });
  document.getElementById('line-price').textContent = money(unit * qty);
  document.getElementById('qty-value').textContent = String(qty);
  return numbers;
}

function setDelivery(next) {
  delivery = next;
  document.getElementById('pick-pickup').setAttribute('aria-pressed', next === 'pickup' ? 'true' : 'false');
  document.getElementById('pick-ship').setAttribute('aria-pressed', next === 'ship' ? 'true' : 'false');
  const bag = getBag();
  if (bag) {
    bag.delivery = next;
    bag.qty = qty;
    setBag(bag);
    renderTotals(bag.unitPrice);
  }
}

function showBag(bag) {
  qty = bag.qty || 1;
  delivery = bag.delivery || 'pickup';
  document.getElementById('line-title').textContent = bag.title;
  document.getElementById('line-sub').textContent = bag.subtitle;
  const shot = document.getElementById('line-shot');
  shot.alt = bag.title + ', watermarked preview';
  shot.draggable = false;
  shot.src = bag.thumb;
  const note = document.getElementById('licensed-note');
  const pay = document.querySelector('#pay button[type="submit"]');
  if (note) note.hidden = !bag.licensed;
  if (pay) pay.disabled = !!bag.licensed;
  setDelivery(delivery);
  show('bag');
}

function fieldError(id, message) {
  const el = document.getElementById(id + '-error');
  el.textContent = message;
  document.getElementById(id).setAttribute('aria-invalid', message ? 'true' : 'false');
}

function showDone(order) {
  show('done');
  document.getElementById('thanks').textContent = 'Thanks, ' + order.customer.name.split(' ')[0] + '.';
  document.getElementById('order-id').textContent = order.id;
  const shot = document.getElementById('done-shot');
  shot.draggable = false;
  shot.src = order.thumb || '';
  shot.alt = 'Watermarked tumbler preview. Not a print file.';
  const when = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(order.placedAt));
  const lines = [
    ['Order', order.id],
    ['Design', order.title],
    ['Email', order.customer.email],
    ['Phone', order.customer.phone],
    ['Delivery', order.delivery === 'pickup' ? 'Pickup in Timmins' : 'Ship with Canada Post (test)'],
    ['Total', money(order.totals.total) + ' CAD'],
    ['Placed', when],
  ];
  const list = document.getElementById('order-lines');
  list.replaceChildren();
  for (const [label, value] of lines) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    list.append(dt, dd);
  }
  clearBag();
  refreshBagCount();
}

document.getElementById('pick-pickup').addEventListener('click', () => setDelivery('pickup'));
document.getElementById('pick-ship').addEventListener('click', () => setDelivery('ship'));
document.getElementById('qty-minus').addEventListener('click', () => {
  qty = Math.max(1, qty - 1);
  const bag = getBag();
  if (!bag) return;
  bag.qty = qty;
  setBag(bag);
  renderTotals(bag.unitPrice);
});
document.getElementById('qty-plus').addEventListener('click', () => {
  qty = Math.min(10, qty + 1);
  const bag = getBag();
  if (!bag) return;
  bag.qty = qty;
  setBag(bag);
  renderTotals(bag.unitPrice);
});

document.getElementById('pay').addEventListener('submit', (event) => {
  event.preventDefault();
  const bag = getBag();
  if (!bag) return;
  if (bag.licensed) {
    const note = document.getElementById('licensed-note');
    if (note) note.hidden = false;
    const pay = event.target.querySelector('button[type="submit"]');
    if (pay) pay.disabled = true;
    return;
  }
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const nameOk = name.length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = phone.replace(/\D/g, '').length >= 10;
  fieldError('name', nameOk ? '' : 'Add the name for this order.');
  fieldError('email', emailOk ? '' : 'Add a real email address.');
  fieldError('phone', phoneOk ? '' : 'Add a phone number, at least 10 digits.');
  if (!nameOk || !emailOk || !phoneOk) return;
  const totals = quote(bag.unitPrice, qty);
  const order = {
    id: 'BZ-' + String(1000 + Math.floor(Math.random() * 9000)),
    title: bag.title,
    subtitle: bag.subtitle,
    design: bag.design || null,
    thumb: bag.thumb,
    licensed: !!bag.licensed,
    delivery,
    qty,
    totals,
    customer: { name, email, phone },
    placedAt: new Date().toISOString(),
  };
  saveOrder(order);
  location.hash = 'confirmed';
  showDone(order);
});

document.getElementById('share-order').addEventListener('click', async () => {
  const order = loadOrder();
  if (!order) return;
  const url = new URL('gallery.html', location.href).href;
  const result = await shareDesign({
    title: 'Bezze Customz',
    text: `My tumbler design from Bezze Customz (test order ${order.id})`,
    url,
  });
  if (result === 'copied') toast('Link copied. No picture is shared.');
  if (result === 'manual') showCopyField(url);
});

const confirmed = location.hash === '#confirmed' ? loadOrder() : null;
if (confirmed) {
  showDone(confirmed);
} else {
  const bag = getBag();
  if (!bag || !bag.thumb) show('empty');
  else showBag(bag);
}
