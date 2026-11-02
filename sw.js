// 更新するときは VERSION と index.html の v= と ver. を同じ番号に上げる。
// 番号が変わると新しいファイル一式を取得してから入れ替わる。
const VERSION = 13;
const CACHE_PREFIX = "gaman-chokin-";
const CACHE = `${CACHE_PREFIX}${VERSION}`;
const ASSETS = [
  "./",
  `app.js?v=${VERSION}`,
  `style.css?v=${VERSION}`,
  "manifest.webmanifest",
  "icon-180.png",
  "icon-512.png",
  ...["egg", "fire-1", "fire-2", "fire-3", "leaf-1", "leaf-2", "leaf-3", "water-1", "water-2", "water-3"].map(
    (name) => `chara/${name}.png`,
  ),
];

self.addEventListener("install", (event) => {
  // ブラウザのキャッシュを通さず、同じ版のファイルをそろえる。1つでも失敗すれば今の版のまま
  const requests = ASSETS.map((asset) => new Request(asset, { cache: "reload" }));
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(requests))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// 電波が弱くてもすぐ開けるよう、保存済みのファイルを先に使う
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  const key = request.mode === "navigate" ? "./" : request;
  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(key))
      .then((cached) => cached ?? fetch(request)),
  );
});
