const STATIC_CACHE = "pembelajaran-static-v5"
const RUNTIME_CACHE = "pembelajaran-runtime-v5"
const AUDIO_CACHE = "pembelajaran-audio-v1"
const APP_SCOPE_URL = new URL(self.registration.scope)
const APP_SCOPE_PATH = APP_SCOPE_URL.pathname.endsWith("/") ? APP_SCOPE_URL.pathname : `${APP_SCOPE_URL.pathname}/`
const STATIC_ASSET_PATHS = [
  "",
  "index.html",
  "app.js",
  "styles.css",
  "assets/data/catalog.json",
  "assets/data/categories/greetings.json",
  "assets/data/categories/numbers.json",
  "assets/data/categories/weekdays.json",
  "assets/data/categories/basics.json",
  "assets/data/categories/colors.json",
  "assets/data/categories/family.json",
  "assets/data/categories/professions.json",
  "assets/data/categories/verbs_common.json",
  "assets/data/categories/travel.json",
  "assets/data/categories/food_drinks.json",
  "assets/data/categories/fruits.json",
  "assets/data/categories/pronouns.json",
  "assets/data/categories/prepositions.json",
  "assets/data/categories/time.json",
  "assets/data/categories/places.json",
  "assets/data/categories/classroom.json",
  "assets/data/categories/emotions.json",
  "assets/data/categories/weather.json",
  "assets/data/categories/clothing.json",
  "assets/data/categories/body_parts.json",
  "assets/animals/animals.json",
  "assets/vegetables/vegetables.json",
  "assets/data/categories/transportation.json",
  "assets/data/categories/nouns.json",
  "assets/data/categories/adjectives.json",
  "assets/data/categories/verbs_regular.json",
  "assets/data/categories/verbs_irregular.json",
  "assets/data/categories/verbs_irregular_full.json",
  "assets/data/categories/verbs_2000_examples.json"
]
const STATIC_ASSETS = STATIC_ASSET_PATHS.map(path => new URL(path || ".", APP_SCOPE_URL).toString())

self.addEventListener("install", event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE, AUDIO_CACHE].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", event => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  const isAppAsset = url.origin === APP_SCOPE_URL.origin && url.pathname.startsWith(`${APP_SCOPE_PATH}assets/`)
  const isStaticAsset = STATIC_ASSETS.includes(url.toString())
  if (url.pathname.startsWith("/tts")) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async cache => {
        const hit = await cache.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res && res.ok) cache.put(req, res.clone())
        return res
      })
    )
    return
  }
  if (isStaticAsset || isAppAsset) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.ok) {
          const target = isAppAsset ? RUNTIME_CACHE : STATIC_CACHE
          caches.open(target).then(cache => cache.put(req, res.clone()))
        }
        return res
      }))
    )
  }
})
