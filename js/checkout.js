import { clearBag, getBag, loadOrder, money, quote, saveOrder, setBag } from './store.js';
import { paintProductShot } from './thumbs.js';
import { initNav, refreshBagCount } from './nav.js';
import { shareDesign, showCopyField, toast } from './share.js';

initNav();

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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function shotFromPng(src) {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  return paintProductShot(canvas).toDataURL('image/jpeg', 0.86);
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

async function showBag(bag) {
  qty = bag.qty || 1;
  delivery = bag.delivery || 'pickup';
  document.getElementById('line-title').textContent = bag.title;
  document.getElementById('line-sub').textContent = bag.subtitle;
  document.getElementById('line-shot').alt = bag.title + ', sample preview';
  try {
    document.getElementById('line-shot').src = await shotFromPng(bag.wrapPng);
  } catch {
    document.getElementById('line-shot').src = bag.wrapPng;
  }
  setDelivery(delivery);
  show('bag');
}

function fieldError(id, message) {
  const el = document.getElementById(id + '-error');
  el.textContent = message;
  document.getElementById(id).setAttribute('aria-invalid', message ? 'true' : 'false');
}

async function showDone(order) {
  show('done');
  document.getElementById('thanks').textContent = 'Thanks, ' + order.customer.name.split(' ')[0] + '.';
  document.getElementById('order-id').textContent = order.id;
  document.getElementById('proof').src = order.wrapPng;
  document.getElementById('proof').alt = 'Print preview of your wrap';
  const download = document.getElementById('download');
  download.href = order.wrapPng;
  const png = order.wrapPng.startsWith('data:image/png');
  download.download = png ? 'bezze-design.png' : 'bezze-design.jpg';
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
  try {
    document.getElementById('done-shot').src = await shotFromPng(order.wrapPng);
    document.getElementById('done-shot').alt = 'Tumbler preview of your design';
  } catch {
    document.getElementById('done-shot').hidden = true;
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
    wrapPng: bag.wrapPng,
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
    dataUrl: order.wrapPng,
  });
  if (result === 'copied') toast('Link copied. Your picture stays on this device.');
  if (result === 'manual') showCopyField(url);
});

const confirmed = location.hash === '#confirmed' ? loadOrder() : null;
if (confirmed) {
  showDone(confirmed);
} else {
  const bag = getBag();
  if (!bag || !bag.wrapPng) show('empty');
  else showBag(bag);
}
