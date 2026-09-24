// Service worker do Detalhe Semanal · CEFAN (DSA Ensino)
// Rede primeiro: sempre tenta pegar a versão mais nova; usa o cache só se estiver offline.
const CACHE_NAME = "detalhe-semanal-cefan-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k === "dsa-ensino-cefan-v1" || (k.startsWith("detalhe-semanal-") && k !== CACHE_NAME)).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // Firebase, fontes etc. passam direto
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
