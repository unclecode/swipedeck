self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('cache-v1').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/icons/icon-192x192.svg'
          // Add other essential files here if needed
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
      // For navigation requests, try to fetch from the network first
      event.respondWith(
        fetch(event.request).catch(() => {
          // If network fails, return cached HTML if available
          return caches.match('/index.html');
        })
      );
    } else {
      // For non-navigation requests, use cache first, then network
      event.respondWith(
        caches.match(event.request).then(response => {
          return response || fetch(event.request);
        })
      );
    }
  });
  
  self.addEventListener('activate', event => {
    const cacheWhitelist = ['cache-v1'];
  
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              // Delete outdated caches
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
  

// self.addEventListener('install', event => {
//     self.skipWaiting(); // Activate the new service worker immediately
//     event.waitUntil(
//       caches.open('cache-v1').then(cache => {
//         return cache.addAll([
//           '/',
//           '/index.html',
//           '/css/styles.css',
//           '/components/Swiper/swiper.css',
//           '/js/App.js',
//           '/icons/icon-192x192.png',
//           '/icons/icon-512x512.png'
//         ]);
//       })
//     );
//   });
  
//   self.addEventListener('activate', event => {
//     event.waitUntil(
//       clients.claim() // Claim all clients immediately
//     );
//   });
  
//   self.addEventListener('fetch', event => {
//     event.respondWith(
//       caches.match(event.request).then(response => {
//         return response || fetch(event.request);
//       })
//     );
//   });
  