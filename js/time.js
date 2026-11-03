const TZ = 'America/Toronto';

function parts(date) {
  const list = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
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

function offsetAt(utcMs) {
  const p = parts(new Date(utcMs));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - utcMs;
}

function torontoLocalToUtc(year, month, day, hour, minute) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const first = guess - offsetAt(guess);
  return guess - offsetAt(first);
}

export function nextTuesdayEight(from = new Date()) {
  const start = parts(from);
  for (let add = 0; add < 8; add += 1) {
    const probe = new Date(Date.UTC(start.year, start.month - 1, start.day + add, 16, 0, 0));
    const day = parts(probe);
    if (day.weekday !== 'Tue') continue;
    const when = torontoLocalToUtc(day.year, day.month, day.day, 20, 0);
    if (when > from.getTime()) return new Date(when);
  }
  return new Date(from.getTime() + 7 * 86400000);
}

export function remaining(target, now = Date.now()) {
  const total = Math.max(0, target.getTime() - now);
  const seconds = Math.floor(total / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return {
    days,
    hours,
    mins,
    secs,
    compact: `${pad(days)}:${pad(hours)}:${pad(mins)}:${pad(secs)}`,
  };
}
