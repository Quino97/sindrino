export function googleFormEmbed(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !/^\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform\/?$/.test(url.pathname)) return '';
    url.search = '?embedded=true'; url.hash = ''; return url.href;
  } catch { return ''; }
}
