let libraryPromise = null;

function normalize(item) {
  const id = item && item.drive_file_id;
  if (!id) return null;
  const preview = String(item.preview || `previews/${id}.jpg`);
  const file = preview.startsWith('clipart/') ? preview.slice('clipart/'.length) : preview.replace(/^\//, '');
  return {
    id,
    name: item.title || item.filename || 'Clip art',
    file,
    src: `clipart/${file}`,
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
    category: item.category || '',
    hasAlpha: false,
    library: true,
  };
}

export function loadClipLibrary() {
  if (!libraryPromise) {
    libraryPromise = fetch('clipart/manifest.json')
      .then((response) => {
        if (!response.ok) throw new Error('clipart manifest');
        return response.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data && data.items) || [];
        return items.map(normalize).filter(Boolean);
      })
      .catch(() => []);
  }
  return libraryPromise;
}

export function commonTags(items, limit = 12) {
  const counts = new Map();
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      const key = tag.trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}
