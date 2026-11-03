import { CATEGORIES, DESIGNS } from './designs.js';

export const THIS_DROP = '014';

function dropId(design) {
  if (design.badge === 'Drop 014') return THIS_DROP;
  return design.drop || null;
}

// Sample catalog in the same shape a future data/manifest.json will use.
export function loadCatalog() {
  return {
    thisDrop: THIS_DROP,
    categories: CATEGORIES,
    designs: DESIGNS.map((design) => ({
      id: design.id,
      name: design.name,
      category: design.category,
      tags: design.tags,
      badge: design.badge || '',
      drop: dropId(design),
      ink: design.ink,
    })),
  };
}

export function filterCatalog(catalog, { q = '', cat = 'All' } = {}) {
  const query = q.trim().toLowerCase();
  return catalog.designs.filter((design) => {
    if (cat && cat !== 'All' && design.category !== cat) return false;
    if (!query) return true;
    const hay = `${design.name} ${design.category} ${design.tags.join(' ')} ${design.badge}`.toLowerCase();
    return hay.includes(query);
  });
}
