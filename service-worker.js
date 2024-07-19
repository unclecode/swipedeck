self.addEventListener('install', event => {
    self.skipWaiting(); // Activate the new service worker immediately
    event.waitUntil(
      caches.open('cache-v1').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/styles.css',
          '/components/Swiper/swiper.css',
          '/js/App.js',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('activate', event => {
    event.waitUntil(
      clients.claim() // Claim all clients immediately
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  