const CACHE = 'fightwise-v90';
const ASSETS = [
  './index.html',
  './onboarding.js?v=84',
  './onboarding.css?v=84',
  './training-sports.js?v=84',
  './training-audio.js?v=84',
  './coach-rounds.js?v=89',
  './coach-rounds.css?v=87',
  './coach-audio-manifest.js?v=84',
  './coach-maya-manifest.js?v=84',
  './coach-rounds-audio-manifest.js?v=87',
  './privacy-policy.html',
  './manifest.json',
  './FightWise logo.png',
  './FightWise text.png',
  './Fightwise app icon.png',
  './click-soundeffect.mp3',
  './Unlock 50+ workouts with premium AD.png',
  './Sparring simple.png',
  './Training simple.png',
  './Coach Rounds simple.png',
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
    caches.open(CACHE).then(cache => Promise.all(['./coach-audio/manifest.json','./coach-audio-maya/manifest.json','./coach-rounds-audio/manifest.json','./coach-rounds-audio-maya/manifest.json'].map(url => fetch(url).then(r => r.json()))).then(manifests => cache.addAll([...ASSETS, ...manifests.flatMap(manifest => Object.values(manifest))])))
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


