// UI icons are SVG geometry, so phone keyboards/fonts cannot turn them into emoji.
const paths = {
  arrowUpRight: '<path d="M6 18 18 6M6 6h12v12"/>',
  arrowRight: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
  arrowLeft: '<path d="M20 12H4m7-7-7 7 7 7"/>',
  arrowDown: '<path d="M12 4v16m-7-7 7 7 7-7"/>',
  arrowUp: '<path d="M12 20V4m-7 7 7-7 7 7"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21"/>'
};
export function icon(name, extraClass = '') {
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon icon-${name}${extraClass?' '+extraClass:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
