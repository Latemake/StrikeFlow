const CACHE = 'fightwise-v118';
const ASSETS = [
  './index.html',
  './tv-display.css?v=105',
  './tv-display.js?v=105',
  './onboarding.js?v=113',
  './onboarding.css?v=98',
  './training-sports.js?v=84',
  './training-audio.js?v=84',
  './coach-rounds.js?v=118',
  './coach-rounds.css?v=117',
  './coach-audio-manifest.js?v=84',
  './coach-maya-manifest.js?v=84',
  './coach-rounds-audio-manifest.js?v=112',
  './privacy-policy.html',
  './manifest.json?v=116',
  './FightWise logo.png?v=94',
  './FightWise text.png?v=94',
  './favicon.ico?v=116',
  './fightwise-neon-512.png',
  './fightwise-neon-maskable-512.png',
  './fightwise-neon-touch-180.png',
  './click-soundeffect.mp3',
  './Unlock 50+ workouts with premium AD.png',
  './Sparring simple.png?v=95',
  './Training simple.png?v=95',
  './Coach Rounds simple.png?v=95',
  './Coach Max.png',
  './Coach Maya.png',
  './Intensity Light.svg',
  './Intensity Steady.svg',
  './Intensity Hard.svg',
  './Round Bell START.mp3',
  './Round Bell END.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => Promise.all(['./coach-audio/manifest.json','./coach-audio-maya/manifest.json','./coach-rounds-audio/manifest.json','./coach-rounds-audio-maya/manifest.json'].map(url => fetch(url, {cache:'no-cache'}).then(r => r.json()))).then(manifests => cache.addAll([...ASSETS, ...manifests.flatMap(manifest => Object.values(manifest))])))
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
    const isHome = new URL(e.request.url).pathname === new URL(self.registration.scope).pathname;
    const offlinePage = isHome ? './index.html' : e.request;
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.open(CACHE).then(cache => cache.match(offlinePage, { ignoreSearch: true }))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});


