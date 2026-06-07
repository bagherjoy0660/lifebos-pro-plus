const CACHE_NAME = "lifebospro-v6.8";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.bundle.js",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
