const CACHE_NAME = "daily-mind-expander-v3";
const BRIEFING_STORAGE_KEY = "daily-mind-expander-briefing-payload";

const urlsToCache = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await Promise.allSettled(urlsToCache.map((url) => cache.add(url)));
      } catch (err) {
        console.warn("SW: cache populate failed (non-fatal):", err);
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

async function storeBriefingForClients(briefing) {
  if (!briefing) return;
  const clientList = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  for (const client of clientList) {
    client.postMessage({ type: "briefing-received", briefing });
  }
}

self.addEventListener("push", (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: "Daily Mind Expander", body: event.data.text() };
    }
  }

  const title = payload.title || "Daily Mind Expander";
  const options = {
    body: payload.body || "Novo briefing disponível.",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "daily-mind-expander",
    data: payload.data || {},
    requireInteraction: false,
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      storeBriefingForClients(payload.data?.briefing),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            "focus" in client &&
            new URL(client.url).origin === self.location.origin
          ) {
            client.postMessage({
              type: "briefing-received",
              briefing: event.notification.data?.briefing,
            });
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
