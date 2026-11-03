import { customerDesigns } from './designs.js';

export const THIS_DROP = '014';

function dropId(design) {
  if (design.drop) return design.drop;
  if (design.badge === 'Drop 014') return THIS_DROP;
  return null;
}

export function loadCatalog() {
  const designs = customerDesigns();
  const categories = ['All', ...new Set(designs.map((design) => design.category))];
  const hasCurrent = designs.some((design) => design.drop === 'current');
  return {
    thisDrop: hasCurrent ? 'current' : THIS_DROP,
    categories,
    designs: designs.map((design) => ({
      id: design.id,
      name: design.name,
      category: design.category,
      tags: design.tags,
      badge: design.badge || '',
      drop: dropId(design),
      ink: design.ink,
      licensed: !!design.licensed,
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
