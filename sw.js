/* 조선 디펜스 offline worker.
   The game is one big page, so it is kept in a cache and served from there when the phone has no signal.
   With a signal the page is always asked from the network first, so a new version shows up on the next launch.
   The friend-play server, fonts aside, and the other game in this repository (observer-dodge) are never touched. */
const VER = '908469b5fa';
const CACHE = 'jd-' + VER;
const FONTS = 'jd-fonts';
const CORE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const SCOPE = new URL(self.registration.scope).pathname;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('jd-') && k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isPage = url => url.pathname === SCOPE || url.pathname === SCOPE + 'index.html';

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./'));
}

/* the page: network first, but a phone on a weak signal gets the saved copy after 4 seconds */
function pageFirst(req, url) {
  return new Promise(resolve => {
    let done = false;
    const give = r => { if (!done && r) { done = true; resolve(r); } };
    const slow = setTimeout(() => fromCache(req).then(give), 4000);
    fetch(req).then(res => {
      clearTimeout(slow);
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(isPage(url) ? './' : req, copy));
      }
      give(res);
    }).catch(() => {
      clearTimeout(slow);
      fromCache(req).then(r => { if (!done) { done = true; resolve(r || Response.error()); } });
    });
  });
}

/* fonts: the saved copy right away, refreshed in the background */
function fontCache(req) {
  return caches.open(FONTS).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(fontCache(req)); return; }
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE) || url.pathname.startsWith(SCOPE + 'observer-dodge')) return;
  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/sw.js')) return;
  if (req.mode === 'navigate') { e.respondWith(pageFirst(req, url)); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
