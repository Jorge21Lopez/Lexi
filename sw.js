// Service worker de Lexi: permite usar la app sin conexión.
// VERSION la sustituye automáticamente el workflow de despliegue (.github/workflows/deploy.yml)
// por una basada en el commit; no hace falta tocarla a mano.
const VERSION = 'lexi-4.0.0';
const SHELL = ['./', './index.html', './app.js', './content.js', './grammar.js', './guides.js', './exams.js', './phrasal.js', './writing.js', './content_en.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './fonts/barlow-400.woff2', './fonts/barlow-500.woff2', './fonts/barlow-600.woff2', './fonts/barlow-700.woff2', './fonts/barlow-condensed-600.woff2', './fonts/barlow-condensed-700.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'lexi-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open('lexi-fonts').then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : undefined)));
});
