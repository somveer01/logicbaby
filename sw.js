// ==========================================================================
// LogicBaby — Service Worker for Offline PWA Support
// Caches core application assets and serves them offline
// ==========================================================================

const CACHE_NAME = 'logicbaby-v1';

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
  './js/views/celebration.js',
  './js/views/parentDashboard.js',
  './js/views/ageSelector.js'
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
  // Navigation & asset requests: Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        // Cache successful GET responses from local origin
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Fallback to index.html if navigating offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
