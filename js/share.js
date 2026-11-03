export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = message;
  el.dataset.show = 'true';
  clearTimeout(el._hide);
  el._hide = setTimeout(() => {
    el.dataset.show = 'false';
  }, 2600);
}

export async function shareDesign({ title, text, url }) {
  const shareUrl = url || location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return 'shared';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'aborted';
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return 'copied';
  } catch {
    return 'manual';
  }
}

export function showCopyField(url) {
  let row = document.querySelector('.copy-fallback');
  if (!row) {
    row = document.createElement('div');
    row.className = 'copy-fallback';
    const input = document.createElement('input');
    input.readOnly = true;
    input.value = url;
    input.setAttribute('aria-label', 'Link to copy');
    row.append(input);
    document.body.append(row);
  }
  const input = row.querySelector('input');
  input.value = url;
  row.hidden = false;
  input.focus();
  input.select();
}
