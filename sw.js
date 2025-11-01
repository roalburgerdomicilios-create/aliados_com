/*
 * ===========================
 * aliados_com Service Worker
 * Versión: 2.0.0 - Azul Milenium Edition
 * ===========================
 */

const CACHE_NAME = 'aliados-cache-v2.2.0-responsive-update';
const DATA_CACHE_NAME = 'aliados-com-data-v2.2.0-export-filter';

// URLs estáticas para cachear
const urlsToCache = [
    // Archivos principales
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.webmanifest',
    
    // Assets básicos
    './assets/placeholder-logo.svg',
    './assets/icon-144.png',
    './assets/icon-192.png',
    './assets/icon-72.png',
    
    // Fuentes de Google
    'https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
    'https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3Kz-C8CSKlv.woff2',
    'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Uw-.woff2',
    'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM6Uw-.woff2',
    'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtU6Uw-.woff2',
    'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu56Uw-.woff2',
    'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr6Uw-.woff2',
    
    // Librerías externas
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// URLs dinámicas que se cachearán bajo demanda
const dynamicUrlPatterns = [
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /^https:\/\/cdn\.jsdelivr\.net\//
];

/* ===========================
   INSTALACIÓN DEL SERVICE WORKER
   =========================== */

self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: Cacheando archivos estáticos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalación completada');
                return self.skipWaiting(); // Activar inmediatamente
            })
            .catch(error => {
                console.error('❌ Service Worker: Error en instalación:', error);
            })
    );
});

/* ===========================
   ACTIVACIÓN DEL SERVICE WORKER
   =========================== */

self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Tomar control de todas las páginas
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker: Activación completada');
        })
    );
});

/* ===========================
   MANEJO DE PETICIONES (FETCH)
   =========================== */

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Estrategia para archivos estáticos: Cache First
    if (shouldCacheStatic(event.request)) {
        event.respondWith(cacheFirstStrategy(event.request));
        return;
    }
    
    // Estrategia para APIs externas: Network First con Cache Fallback
    if (shouldCacheDynamic(event.request)) {
        event.respondWith(networkFirstStrategy(event.request));
        return;
    }
    
    // Estrategia para datos localStorage: Solo red
    if (requestUrl.pathname.includes('localStorage') || 
        requestUrl.pathname.includes('indexedDB')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // Estrategia por defecto: Network First
    event.respondWith(networkFirstStrategy(event.request));
});

/* ===========================
   ESTRATEGIAS DE CACHE
   =========================== */

// Cache First: Buscar en cache primero, red como fallback
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            console.log('📋 Service Worker: Sirviendo desde cache:', request.url);
            return cachedResponse;
        }
        
        console.log('🌐 Service Worker: Cache miss, fetcheando:', request.url);
        const networkResponse = await fetch(request);
        
        // Cachear la respuesta si es exitosa
        if (networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('❌ Service Worker: Error en cache-first:', error);
        
        // Fallback para páginas HTML
        if (request.headers.get('accept').includes('text/html')) {
            const cache = await caches.open(CACHE_NAME);
            return cache.match('./index.html');
        }
        
        throw error;
    }
}

// Network First: Intentar red primero, cache como fallback
async function networkFirstStrategy(request) {
    try {
        console.log('🌐 Service Worker: Network first para:', request.url);
        const networkResponse = await fetch(request);
        
        // Cachear respuestas exitosas de recursos dinámicos
        if (networkResponse.status === 200 && shouldCacheDynamic(request)) {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('📋 Service Worker: Network failed, buscando en cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback para páginas HTML
        if (request.headers.get('accept').includes('text/html')) {
            const cache = await caches.open(CACHE_NAME);
            return cache.match('./index.html');
        }
        
        throw error;
    }
}

/* ===========================
   FUNCIONES DE UTILIDAD
   =========================== */

// Determinar si un request debe usar cache estático
function shouldCacheStatic(request) {
    const url = request.url;
    
    // Archivos estáticos del proyecto
    if (url.includes(self.location.origin)) {
        return true;
    }
    
    // Fuentes de Google
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        return true;
    }
    
    return false;
}

// Determinar si un request debe usar cache dinámico
function shouldCacheDynamic(request) {
    return dynamicUrlPatterns.some(pattern => pattern.test(request.url));
}

/* ===========================
   MANEJO DE MENSAJES
   =========================== */

self.addEventListener('message', event => {
    console.log('💬 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({
                type: 'CACHE_SIZE_RESPONSE',
                size: size
            });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({
                type: 'CACHE_CLEARED'
            });
        });
    }
});

/* ===========================
   FUNCIONES DE GESTIÓN DE CACHE
   =========================== */

// Obtener tamaño total del cache
async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
        
        return {
            bytes: totalSize,
            mb: (totalSize / (1024 * 1024)).toFixed(2),
            caches: cacheNames.length
        };
        
    } catch (error) {
        console.error('❌ Service Worker: Error calculando tamaño cache:', error);
        return { bytes: 0, mb: '0.00', caches: 0 };
    }
}

// Limpiar todos los caches
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Service Worker: Todos los caches eliminados');
    } catch (error) {
        console.error('❌ Service Worker: Error limpiando caches:', error);
    }
}

/* ===========================
   MANEJO DE ACTUALIZACIONES
   =========================== */

self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Background sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Sincronización en segundo plano
async function doBackgroundSync() {
    try {
        console.log('🔄 Service Worker: Ejecutando sync en segundo plano...');
        
        // Aquí podrían ir tareas de sincronización
        // Por ejemplo, enviar datos pendientes a un servidor
        
        console.log('✅ Service Worker: Background sync completado');
    } catch (error) {
        console.error('❌ Service Worker: Error en background sync:', error);
    }
}

/* ===========================
   NOTIFICACIONES PUSH (OPCIONAL)
   =========================== */

self.addEventListener('push', event => {
    console.log('📱 Service Worker: Push recibido:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: './assets/icon-192.png',
        badge: './assets/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir aplicación',
                icon: './assets/icon-72.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: './assets/icon-72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('aliados_com', options)
    );
});

self.addEventListener('notificationclick', event => {
    console.log('📱 Service Worker: Notificación clickeada:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

/* ===========================
   LOG DE INICIALIZACIÓN
   =========================== */

console.log('🔧 Service Worker aliados_com v2.0.0 cargado');
console.log('📋 Cache principal:', CACHE_NAME);
console.log('🗃️ Cache de datos:', DATA_CACHE_NAME);
console.log('📦 URLs a cachear:', urlsToCache.length);