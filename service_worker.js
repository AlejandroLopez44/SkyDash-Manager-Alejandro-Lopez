/**
 * SkyDash-Manager - Service Worker (Resiliencia y Modo Offline)
 * Cachea activos estáticos del lado del cliente para permitir la carga de la interfaz sin red.
 */

const CACHE_NAME = 'skydash-manager-v1';

// Lista de archivos estáticos que se guardarán en la memoria caché del navegador
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/auth.js',
    './js/map.js',
    './js/api.js',
    './js/favorites.js',
    './js/theme.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// 1. EVENTO DE INSTALACIÓN: Descarga y almacena los archivos estáticos en caché
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando y cacheando activos de SkyDash...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting(); // Forzar la activación inmediata
            })
            .catch((error) => {
                console.error('Error cacheando activos en la instalación:', error);
            })
    );
});

// 2. EVENTO DE ACTIVACIÓN: Limpia cachés antiguas si actualizamos la versión de la app
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activado y limpiando cachés antiguas...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché vieja:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. EVENTO FETCH: Intercepta las peticiones y sirve la caché si estamos offline
self.addEventListener('fetch', (event) => {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') return;

    // Estrategia: "Cache First, fallback to Network" para archivos estáticos
    // Para APIs de clima o mapas, intentamos la red primero
    const url = new URL(event.request.url);
    const isApiCall = url.hostname.includes('open-meteo.com') || 
                      url.hostname.includes('openstreetmap.org');

    if (isApiCall) {
        // Para peticiones de datos climáticos o geocodificación: Red primero, si falla, mostrar error controlado
        event.respondWith(
            fetch(event.request).catch(() => {
                console.warn('[Modo Offline] No se pudo conectar con la API externa:', url.hostname);
                // Si la petición falla por falta de internet, devolvemos una respuesta vacía o error controlado
                return new Response(JSON.stringify({ error: "Modo Offline: Sin conexión a internet" }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
    } else {
        // Para archivos de la interfaz (HTML, CSS, JS): Caché primero, luego red
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Devolver desde la caché local al instante
                }
                // Si no está en caché, buscarlo en internet y guardarlo para la próxima
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    console.log('[Modo Offline] Archivo no disponible en caché y sin red.');
                });
            })
        );
    }
});