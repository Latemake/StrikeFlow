const CACHE = 'fightwise-v57';
const ASSETS = [
  './index.html',
  './privacy-policy.html',
  './manifest.json',
  './FightWise logo.png',
  './FightWise text.png',
  './Fightwise app icon.png',
  './click-soundeffect.mp3',
  './Unlock 50+ workouts with premium AD.png',
  './Sparring photo.png',
  './Training photo.png',
  './Round Bell START.mp3',
  './Round Bell END.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
