const CACHE_NAME = 'cajas-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './historial.html',
  './logoelrojo.png',
  './js/historial.js',
  './js/script.js',  // remplaza esto por tus archivos reales de JS
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'

];
// Instala el SW y guarda los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Devuelve desde cache si no hay conexión
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});