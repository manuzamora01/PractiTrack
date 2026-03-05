// Instalación del Service Worker
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Obliga a que se actualice al instante
    console.log('[SW] Instalado correctamente');
});

// Activación
self.addEventListener('activate', (e) => {
    console.log('[SW] Activado y listo');
});

// Interceptar peticiones (Requisito obligatorio para instalar PWA)
self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request).catch(() => {
        return new Response("Estás sin conexión.");
    }));
});