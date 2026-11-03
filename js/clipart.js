const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`;
const fill = (d) => svg(`<path fill="#fff" d="${d}"/>`);

export const CLIP_CATEGORIES = ['All', 'Hearts', 'Florals', 'Stars', 'Sports', 'Animals', 'Seasonal', 'Frames'];

export const CLIPS = [
  ['Heart', 'Hearts', fill('M32 54S14 42 10 28C7 18 14 10 23 12c5 1 7 5 9 8 2-3 4-7 9-8 9-2 16 6 13 16-4 14-22 26-22 26z')],
  ['Two hearts', 'Hearts', fill('M22 46S10 38 8 28c-1-7 4-12 10-10 3 1 5 3 6 5 1-2 3-4 6-5 6-2 11 3 10 10-2 10-18 18-18 18zm22-6s8-6 9-12c1-5-3-9-7-8-2 1-4 2-5 4-1-2-3-3-5-4-5-1-9 3-8 8 1 6 16 12 16 12z')],
  ['Open heart', 'Hearts', svg('<path d="M32 52S16 40 12 28c-3-8 3-16 12-14 4 1 7 4 8 7 1-3 4-6 8-7 9-2 15 6 12 14-4 12-20 24-20 24z" fill="none" stroke="#fff" stroke-width="3"/>')],
  ['Slim heart', 'Hearts', fill('M32 56S18 44 16 32c-2-10 4-16 12-14 3 1 5 3 6 5 1-2 3-4 6-5 8-2 14 4 12 14-2 12-20 24-20 24z')],
  ['Heart locket', 'Hearts', svg('<path fill="#fff" d="M32 50S18 40 15 30c-2-8 3-14 10-12 3 1 5 3 7 5 2-2 4-4 7-5 7-2 12 4 10 12-3 10-17 20-17 20z"/><circle cx="32" cy="30" r="4" fill="none" stroke="#111" stroke-width="2"/>')],
  ['Tiny hearts', 'Hearts', fill('M20 28s-6-5-7-10c-1-4 2-7 5-6 2 1 3 2 4 3 1-1 2-2 4-3 3-1 6 2 5 6-1 5-11 10-11 10zm24 16s-6-5-7-10c-1-4 2-7 5-6 2 1 3 2 4 3 1-1 2-2 4-3 3-1 6 2 5 6-1 5-11 10-11 10z')],

  ['Bloom', 'Florals', svg('<g fill="#fff"><circle cx="32" cy="16" r="7"/><circle cx="48" cy="26" r="7"/><circle cx="42" cy="42" r="7"/><circle cx="22" cy="42" r="7"/><circle cx="16" cy="26" r="7"/><circle cx="32" cy="32" r="6"/></g>')],
  ['Tulip', 'Florals', fill('M22 30c0-10 6-18 10-22 4 4 10 12 10 22 0 6-4 10-10 10s-10-4-10-10zm8 12h4v16h-4z')],
  ['Leaf', 'Florals', fill('M16 46C28 20 44 12 54 8 50 28 40 46 22 54c-2-4-4-6-6-8z')],
  ['Rose', 'Florals', svg('<path fill="none" stroke="#fff" stroke-width="3" d="M32 44c-8 0-14-6-14-12 0-8 8-10 10-16 2 6 10 8 10 16 0 6-6 12-6 12z"/><circle cx="32" cy="30" r="4" fill="#fff"/>')],
  ['Daisy', 'Florals', svg('<g fill="#fff"><ellipse cx="32" cy="14" rx="5" ry="8"/><ellipse cx="32" cy="50" rx="5" ry="8"/><ellipse cx="14" cy="32" rx="8" ry="5"/><ellipse cx="50" cy="32" rx="8" ry="5"/><ellipse cx="18" cy="18" rx="5" ry="8" transform="rotate(-40 18 18)"/><ellipse cx="46" cy="18" rx="5" ry="8" transform="rotate(40 46 18)"/><ellipse cx="18" cy="46" rx="5" ry="8" transform="rotate(40 18 46)"/><ellipse cx="46" cy="46" rx="5" ry="8" transform="rotate(-40 46 46)"/><circle cx="32" cy="32" r="6"/></g>')],
  ['Sprig', 'Florals', svg('<path d="M34 56C34 40 32 28 30 12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path fill="#fff" d="M30 40c8-2 14-8 14-8s-6 1-12 6c-2 2-2 4-2 2zm0-12c8-3 12-10 12-10s-6 2-10 8c-2 2-2 4-2 2zM30 40c-8-2-14-8-14-8s6 1 12 6c2 2 2 4 2 2z"/>')],

  ['Star', 'Stars', fill('M32 6l6.2 16.4L56 24.2 42.4 34.6l4.4 17L32 42.8 17.2 51.6l4.4-17L8 24.2l17.8-1.8z')],
  ['Spark', 'Stars', fill('M32 4l3.2 20.2L56 28l-20.8 3.2L32 52l-3.2-20.8L8 28l20.8-3.8z')],
  ['North star', 'Stars', fill('M32 4l4 18 10-14-4 18 18 2-16 8 14 12-18-4 2 18-10-14-8 16-2-18-18 6 12-14L6 30l18-4-12-16 14 12z')],
  ['Star frame', 'Stars', svg('<circle cx="32" cy="32" r="26" fill="none" stroke="#fff" stroke-width="2"/><path fill="#fff" d="M32 14l3.4 9h9.4l-7.6 5.6 2.9 9L32 32.2 24 37.6l2.9-9L19.2 23h9.4z"/>')],
  ['Twin stars', 'Stars', fill('M22 10l3 8 8 .6-6.2 4.6 2.2 8L22 27l-6.8 4.2 2.2-8L11 18.6l8-.6zm22 22l3 8 8 .6-6.2 4.6 2.2 8L44 49l-6.8 4.2 2.2-8L33 40.6l8-.6z')],
  ['Burst', 'Stars', fill('M32 8l2 10 8-6-2 10 10 2-8 6 8 6-10 2 4 10-8-6-4 10-4-10-8 6 4-10-10-2 8-6-8-6 10-2-2-10 8 6z')],

  ['Ball', 'Sports', svg('<circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="3"/><path d="M32 12v40M14 24c8 6 28 6 36 0M14 40c8-6 28-6 36 0" fill="none" stroke="#fff" stroke-width="2"/>')],
  ['Medal', 'Sports', svg('<circle cx="32" cy="38" r="14" fill="#fff"/><path fill="#fff" d="M22 10h8l2 14h-12zm12 0h8l2 14H34z"/><circle cx="32" cy="38" r="6" fill="none" stroke="#111" stroke-width="2"/>')],
  ['Pennant', 'Sports', fill('M14 10h6v44h-6zm6 2l30 12-30 12z')],
  ['Stripes', 'Sports', svg('<path fill="#fff" d="M10 18h44v6H10zm0 12h44v6H10zm0 12h44v6H10z"/>')],
  ['Chevron', 'Sports', svg('<path d="M12 24l20 14 20-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M12 36l20 14 20-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>')],
  ['Finish flag', 'Sports', svg('<path fill="#fff" d="M16 8h4v48h-4z"/><path fill="#fff" d="M20 10h8v8h-8zm8 8h8v8h-8zm-8 8h8v8h-8zm8 8h8v8h-8z"/><path fill="none" stroke="#fff" stroke-width="2" d="M20 10h16v32H20z"/>')],

  ['Bird', 'Animals', fill('M10 36c12-2 18-10 22-18 2 6 8 10 16 10-6 2-8 8-6 14-8-4-16-4-24 0 2-4 0-8-8-6z')],
  ['Butterfly', 'Animals', fill('M32 18c-8-10-20-8-22 2s8 14 16 12c-2 8-2 16 6 20 8-4 8-12 6-20 8 2 18 2 20-8s-12-14-20-6c-2 0-4 0-6 0z')],
  ['Fish', 'Animals', fill('M12 32l16-12c10 4 18 4 26 0-2 6-2 14 0 20-8-4-16-4-26 0zm34-2l8-6v16z')],
  ['Deer', 'Animals', fill('M24 20l-4-10 4 2 2-8 2 8 4-2-2 10c6 2 12 8 12 16v16h-6V40h-4v12h-6V36c0-6-4-12-8-16z')],
  ['Swan', 'Animals', fill('M18 42c0-14 10-26 22-28 2 8-2 14-8 18 8 2 14 8 14 16 0 6-6 10-14 10H22c-6 0-10-4-4-16z')],
  ['Horse', 'Animals', fill('M18 46V28c0-8 6-16 16-18l4 8 8-2-2 10c4 2 8 8 8 14v6h-8l-2 10h-8l2-12H22l-4 12z')],

  ['Snowflake', 'Seasonal', svg('<g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M32 8v48M12 20l40 24M12 44l40-24"/><path d="M32 16l-4-4M32 16l4-4M32 48l-4 4M32 48l4 4M18 24l-6-2M18 24l-2-6M46 40l6 2M46 40l2 6M18 40l-6 2M18 40l-2 6M46 24l6-2M46 24l2-6"/></g>')],
  ['Pine', 'Seasonal', fill('M32 6l14 16H36l10 12H34l12 14H18L30 34H20l10-12H18zM28 48h8v10h-8z')],
  ['Maple', 'Seasonal', fill('M32 6l4 12 12-4-6 12 12 2-12 6 6 12-12-4-4 14-4-14-12 4 6-12-12-6 12-2-6-12 12 4z')],
  ['Sun', 'Seasonal', svg('<circle cx="32" cy="32" r="10" fill="#fff"/><g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M14 50l6-6"/></g>')],
  ['Moon', 'Seasonal', fill('M36 10a22 22 0 1 0 14 36A18 18 0 0 1 36 10z')],
  ['Bauble', 'Seasonal', svg('<path fill="#fff" d="M28 10h8v6h-8z"/><circle cx="32" cy="36" r="18" fill="#fff"/><path d="M20 32h24M32 18v36" stroke="#111" stroke-width="1.5" opacity=".35"/>')],

  ['Circle', 'Frames', svg('<circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-width="3"/>')],
  ['Double ring', 'Frames', svg('<circle cx="32" cy="32" r="24" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="32" cy="32" r="16" fill="none" stroke="#fff" stroke-width="1.6"/>')],
  ['Shield', 'Frames', svg('<path d="M32 8l18 6v14c0 14-8 22-18 28C22 50 14 42 14 28V14z" fill="none" stroke="#fff" stroke-width="3"/>')],
  ['Laurel', 'Frames', svg('<path d="M20 50c-6-8-8-18-4-30 6 4 10 12 12 20 1 6 0 12-2 16 4-2 10-2 16 2-1-6-1-12 2-18 3-8 8-14 14-18-1 12-6 22-12 28" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>')],
  ['Diamond frame', 'Frames', svg('<path d="M32 8l20 24-20 24L12 32z" fill="none" stroke="#fff" stroke-width="3"/>')],
  ['Arch', 'Frames', svg('<path d="M16 52V30a16 16 0 0 1 32 0v22" fill="none" stroke="#fff" stroke-width="3"/><path d="M12 52h40" stroke="#fff" stroke-width="3" stroke-linecap="round"/>')],
];
