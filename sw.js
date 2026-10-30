/**
 * UniverSOS — Service Worker Offline-First (PWA Cache Engine)
 * Versión: universos-v2.8-offline
 */

const CACHE_NAME = 'universos-v2.8-offline';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon.svg',
    './css/variables.css',
    './css/base.css',
    './css/components.css',
    './css/modals.css',
    './js/sanitizer.js',
    './js/sm2.js',
    './js/state.js',
    './js/modals.js',
    './js/math-render.js',
    './js/render.js',
    './js/exam-generator.js',
    './js/skill-tree.js',
    './js/edit.js',
    './js/import-export.js',
    './js/ai.js',
    './js/search.js',
    './js/cloud-sync.js',
    './js/app.js'
];

// 1. Instalación: Cachear núcleo estático
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// 2. Activación: Purgar cachés antiguas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Estrategia de Intercepción de Peticiones
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // No cachear APIs en tiempo real (Supabase REST o Gemini API)
    if (url.hostname.includes('supabase.co') || 
        url.hostname.includes('googleapis.com') ||
        url.pathname.includes('/rest/v1/')) {
        return;
    }

    // Para fuentes tipográficas de Google Fonts o CDN de MathJax: Stale-While-Revalidate
    if (url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdn.jsdelivr.net')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return networkResponse;
                }).catch(() => null);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // Para recursos estáticos locales: Cache First con fallback a Network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Fallback offline para navegación principal
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
