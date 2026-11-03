// Weekly customer drop. Friday 9:00 America/Toronto.
export const DROP_RELEASE = {
  timeZone: 'America/Toronto',
  weekday: 5,
  hour: 9,
  minute: 0,
};

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function zonedParts(date, timeZone) {
  const list = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const out = {};
  for (const part of list) out[part.type] = part.value;
  return {
    weekday: out.weekday,
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour),
    minute: Number(out.minute),
    second: Number(out.second),
  };
}

function offsetAt(utcMs, timeZone) {
  const part = zonedParts(new Date(utcMs), timeZone);
  const asUtc = Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second);
  return asUtc - utcMs;
}

function zonedTime(year, month, day, hour, minute, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const first = guess - offsetAt(guess, timeZone);
  return guess - offsetAt(first, timeZone);
}

export function nextDropAt(from = new Date(), config = DROP_RELEASE) {
  const start = zonedParts(from, config.timeZone);
  for (let add = 0; add < 14; add += 1) {
    const probe = new Date(Date.UTC(start.year, start.month - 1, start.day + add, 12, 0, 0));
    const day = zonedParts(probe, config.timeZone);
    if (WEEKDAYS[day.weekday] !== config.weekday) continue;
    const when = zonedTime(day.year, day.month, day.day, config.hour, config.minute, config.timeZone);
    if (when >= from.getTime()) return new Date(when);
  }
  return new Date(from.getTime() + 7 * 86400000);
}

export function currentDropAt(now = new Date(), config = DROP_RELEASE) {
  const upcoming = nextDropAt(now, config);
  if (upcoming.getTime() === now.getTime()) return upcoming;
  const previous = nextDropAt(new Date(now.getTime() - 7 * 86400000), config);
  return previous.getTime() <= now.getTime() ? previous : null;
}

export function releaseInstant(item, config = DROP_RELEASE) {
  const added = new Date(item.added_at);
  if (item.release === 'instant') return added;
  return nextDropAt(added, config);
}

export function isPublicDrop(item, now = new Date(), config = DROP_RELEASE) {
  if (!item || (item.release !== 'instant' && item.release !== 'next_drop')) return false;
  const added = new Date(item.added_at);
  if (Number.isNaN(added.getTime())) return false;
  return releaseInstant(item, config).getTime() <= now.getTime();
}

function previewSrc(item) {
  const preview = String(item.preview || '');
  if (!preview) return '';
  if (preview.startsWith('drops/')) return preview;
  return `drops/${preview.replace(/^\//, '')}`;
}

export function toDropDesign(item, now = new Date(), config = DROP_RELEASE) {
  if (!isPublicDrop(item, now, config)) return null;
  const at = releaseInstant(item, config);
  const current = currentDropAt(now, config);
  const isCurrent = item.release === 'next_drop' && current && at.getTime() === current.getTime();
  const id = String(item.drive_file_id || item.filename || item.title || '');
  if (!id) return null;
  const src = previewSrc(item);
  return {
    id,
    name: item.title || item.filename || 'New design',
    file: src,
    src,
    category: 'Drops',
    tags: Array.isArray(item.tags) ? item.tags : [],
    fit: 'cover',
    w: Number(item.width) || 800,
    h: Number(item.height) || 800,
    newest: Date.parse(item.added_at) || 0,
    popular: 100,
    drop: isCurrent ? 'current' : (item.release === 'next_drop' ? 'past' : null),
    ink: '#ffffff',
    feed: true,
    release: item.release,
    added_at: item.added_at,
    licensed: item.licensed === true,
    badge: item.licensed === true
      ? 'Test image, not for sale'
      : (isCurrent ? 'This week' : (item.release === 'instant' ? 'New' : '')),
  };
}

export function manifestItems(manifest) {
  if (Array.isArray(manifest)) return manifest;
  if (manifest && Array.isArray(manifest.items)) return manifest.items;
  return [];
}

export function publishDrops(manifest, now = new Date(), config = DROP_RELEASE) {
  const items = manifestItems(manifest);
  const rank = (design) => (design.release === 'instant' ? 0 : design.drop === 'current' ? 1 : 2);
  return items
    .map((item) => toDropDesign(item, now, config))
    .filter(Boolean)
    .sort((a, b) => rank(a) - rank(b) || b.newest - a.newest);
}

export async function loadDropFeed(now = new Date()) {
  try {
    const response = await fetch('drops/manifest.json', { cache: 'no-cache' });
    if (!response.ok) return [];
    const data = await response.json();
    return publishDrops(data, now);
  } catch {
    return [];
  }
}
