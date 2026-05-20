/// <reference lib="webworker" />

// USTM Academia Service Worker
// Strategy: Network-first for pages, Cache-first for static assets
// Conservative approach: never cache auth, API, or sensitive data

const SW_VERSION = "1.0.0";
const STATIC_CACHE = `ustm-static-v${SW_VERSION}`;
const RUNTIME_CACHE = `ustm-runtime-v${SW_VERSION}`;

// Static assets to precache (app shell)
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/ustm-logo.png",
  "/offline.html",
];

// Patterns that must NEVER be cached
const NEVER_CACHE_PATTERNS = [
  /\/api\//,              // API routes
  /\/admin/,              // Admin dashboard
  /supabase/,             // Supabase auth/data
  /\.supabase\./,         // Supabase domain
  /googleapis\.com/,      // Google Drive API
  /drive\.google\.com/,   // Google Drive files
  /algolia/,              // Algolia search
  /\/auth\//,             // Auth endpoints
  /\/login/,              // Login pages
  /\/oauth/,              // OAuth flows
  /_next\/data/,          // Next.js server data (dynamic)
];

// Install: precache essential static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for pages, cache-first for immutable static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Never cache sensitive patterns
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    return;
  }

  // Cache-first for Next.js immutable static assets (hashed filenames)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for HTML pages (always get fresh content)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stale-while-revalidate for other assets (JS chunks, CSS)
  event.respondWith(staleWhileRevalidate(request));
});

// --- Caching Strategies ---

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page for navigation requests
    const offlinePage = await caches.match("/offline.html");
    if (offlinePage) return offlinePage;

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
