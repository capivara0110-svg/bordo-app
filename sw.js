const CACHE_NAME = "bordo-pwa-cache-v1";
const ASSETS = [
  "/bordo_landing.html",
  "/bordo_login.jsx",
  "/bordo_gestor.jsx",
  "/bordo_onboarding.jsx",
  "/bordo_notificacoes.jsx",
  "/manifest.json",
  "/icon.svg",
];

const isMobileDevice = () =>
  typeof self.navigator !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(self.navigator.userAgent || "");

self.addEventListener("install", (event) => {
  if (!isMobileDevice()) {
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  if (!isMobileDevice()) {
    return;
  }
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (!isMobileDevice() || event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return networkResponse;
        })
        .catch(() => caches.match("/bordo_landing.html"));
    })
  );
});
