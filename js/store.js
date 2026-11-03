const BAG = 'bezze-bag';

function read(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const PRICE = { standard: 39.99, custom: 44.99 };

export function money(n) {
  return '$' + (Math.round(n * 100) / 100).toFixed(2);
}

export function quote(unit, qty) {
  const subtotal = Math.round(unit * 100) * qty / 100;
  return { subtotal, total: subtotal };
}

export function getBag() {
  return read(localStorage, BAG) || read(sessionStorage, BAG);
}

export function setBag(item) {
  const raw = JSON.stringify(item);
  try {
    localStorage.setItem(BAG, raw);
    sessionStorage.removeItem(BAG);
    return 'local';
  } catch {
    try {
      sessionStorage.setItem(BAG, raw);
      return 'session';
    } catch {
      return 'memory';
    }
  }
}

export function clearBag() {
  localStorage.removeItem(BAG);
  sessionStorage.removeItem(BAG);
}

export function saveDraft(id, draft) {
  try {
    localStorage.setItem('bezze-draft:' + id, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft(id) {
  return read(localStorage, 'bezze-draft:' + id);
}

export function clearDraft(id) {
  localStorage.removeItem('bezze-draft:' + id);
}

const ORDER = 'bezze-order';

export function saveOrder(order) {
  sessionStorage.setItem(ORDER, JSON.stringify(order));
}

export function loadOrder() {
  return read(sessionStorage, ORDER);
}
