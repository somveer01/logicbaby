// ==========================================================================
// LogicBaby — Service Worker for Offline PWA Support
// Caches core application assets and serves them offline
// ==========================================================================

const CACHE_NAME = 'logicbaby-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './js/app.js',
  './js/state.js',
  './js/router.js',
  './js/data/questionBank.js',
  './js/data/questionGenerator.js',
  './js/services/storageService.js',
  './js/services/soundService.js',
  './js/services/speechService.js',
  './js/services/badgeService.js',
  './js/views/topbar.js',
  './js/views/dashboard.js',
  './js/views/gameArena.js',
  './js/views/homeworkHub.js',
  './js/views/celebration.js',
  './js/views/parentDashboard.js',
  './js/views/ageSelector.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🧠 LogicBaby: Caching static app assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧠 LogicBaby: Purging old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first, fallback to cache (ensures updates are immediate while preserving offline PWA capability)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
