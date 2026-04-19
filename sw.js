const STATIC_CACHE = "pembelajaran-static-v17"
const RUNTIME_CACHE = "pembelajaran-runtime-v17"
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
  "assets/data/categories/verbs_2000_examples.json",
  "assets/data/categories/home_objects.json",
  "assets/data/categories/health.json",
  "assets/data/categories/daily_activities.json",
  "assets/data/categories/shopping.json",
  "assets/data/categories/school_office.json",
  "assets/data/categories/worship.json",
  "assets/data/categories/daily_conversation.json",
  "assets/data/categories/question_words.json",
  "assets/data/categories/classroom_phrases.json",
  "assets/data/categories/market_conversation.json",
  "assets/data/categories/daily_foods.json",
  "assets/data/categories/personal_information.json",
  "assets/data/categories/polite_expressions.json",
  "assets/data/categories/directions.json",
  "assets/data/categories/restaurant.json",
  "assets/data/categories/farm_animals.json",
  "assets/data/categories/wild_animals.json",
  "assets/data/categories/birds.json",
  "assets/data/categories/reptiles_amphibians.json",
  "assets/data/categories/sea_animals.json",
  "assets/data/categories/insects_small_animals.json",
  "assets/data/categories/root_vegetables.json",
  "assets/data/categories/leafy_green_vegetables.json",
  "assets/data/categories/legumes_mushrooms.json",
  "assets/data/categories/herbs_spices.json",
  "assets/data/categories/citrus_fruits.json",
  "assets/data/categories/berries_grapes.json",
  "assets/data/categories/orchard_fruits.json",
  "assets/data/categories/tropical_fruits.json",
  "assets/data/categories/exotic_fruits.json",
  "assets/data/categories/small_mammals.json",
  "assets/data/categories/primates.json",
  "assets/data/categories/birds_of_prey.json",
  "assets/data/categories/pet_city_birds.json",
  "assets/data/categories/water_birds.json",
  "assets/data/categories/domestic_birds.json",
  "assets/data/categories/wetland_birds.json",
  "assets/data/categories/unique_birds.json",
  "assets/data/categories/giant_mammals.json",
  "assets/data/categories/big_cats.json",
  "assets/data/categories/hoofed_mammals.json",
  "assets/data/categories/marsupials.json",
  "assets/data/categories/unique_mammals.json",
  "assets/data/categories/marine_mammals.json",
  "assets/data/categories/sharks_rays.json",
  "assets/data/categories/sea_fish.json",
  "assets/data/categories/cephalopods_jellyfish.json",
  "assets/data/categories/shellfish_seafloor.json",
  "assets/data/categories/crocodilians.json",
  "assets/data/categories/lizards.json",
  "assets/data/categories/snakes.json",
  "assets/data/categories/turtles_tortoises.json",
  "assets/data/categories/amphibians.json",
  "assets/user-images/user_images.json",
  "assets/user-images/lime-1774958050-6e57b1.png",
  "assets/user-images/blueberry-1774963701-9e49bf.png",
  "assets/user-images/raspberry-1774958303-1f94cd.png",
  "assets/user-images/papaya-1774958258-7c274b.png",
  "assets/user-images/date-1774957988-e692e0.png",
  "assets/user-images/guava-1774958095-da8d68.png",
  "assets/user-images/dragon-fruit-1774958115-46daad.png",
  "assets/user-images/durian-1774958155-e21eea.png",
  "assets/user-images/jackfruit-1774958161-8fc879.png",
  "assets/user-images/starfruit-1774958170-e5df1a.webp",
  "assets/user-images/longan-1774958201-30c908.png",
  "assets/user-images/lychee-1774958207-a5d96b.png",
  "assets/user-images/rambutan-1774958212-2d3bfc.png",
  "assets/user-images/mangosteen-1774958223-235c55.png",
  "assets/user-images/snake-fruit-1774958239-b64053.png",
  "assets/user-images/tamarind-1774958247-50f089.png",
  "assets/user-images/kiwi-1774958318-6febb2.png",
  "assets/user-images/pomegranate-1774958328-729b5e.png",
  "assets/user-images/armadillo-1774960030-2fd636.png",
  "assets/user-images/anteater-1774960053-6093fb.png",
  "assets/user-images/beaver-1774960128-340778.png",
  "assets/user-images/otter-1774960155-8ec18b.png",
  "assets/user-images/weasel-1774960177-6bfd07.png",
  "assets/user-images/badger-1774960201-5a458f.png",
  "assets/user-images/hedgehog-1774960217-8d99bf.png",
  "assets/user-images/porcupine-1774960235-8a2c62.png",
  "assets/user-images/squirrel-1774960252-c61340.png",
  "assets/user-images/chipmunk-1774960269-f16ab4.png",
  "assets/user-images/hare-1774960292-5ede79.png",
  "assets/user-images/mouse-1774960314-a08d98.png",
  "assets/user-images/rat-1774960336-f4f9c6.png",
  "assets/user-images/bat-1774960361-1062a3.png",
  "assets/user-images/monkey-1774960380-828a11.png",
  "assets/user-images/chimpanzee-1774960397-b240e7.png",
  "assets/user-images/gorilla-1774960412-de26d8.png",
  "assets/user-images/orangutan-1774960432-179199.png",
  "assets/user-images/lemur-1774960450-34c057.png",
  "assets/user-images/eagle-1774960465-a9f27d.png",
  "assets/user-images/hawk-1774960482-dcf434.png",
  "assets/user-images/falcon-1774960502-18e36f.png",
  "assets/user-images/owl-1774960519-cfdc7b.png",
  "assets/user-images/dove-1774961212-d2a931.png",
  "assets/user-images/peacock-1774961229-5f6f0a.png",
  "assets/user-images/flamingo-1774961246-215754.png",
  "assets/user-images/swan-1774961261-db36f5.png",
  "assets/user-images/goose-1774961277-09b7de.png",
  "assets/user-images/duck-1774961297-5d3096.png",
  "assets/user-images/turkey-1774961314-78c59a.png",
  "assets/user-images/chicken-1774961350-e23c21.png",
  "assets/user-images/rooster-1774961368-7732c0.png",
  "assets/user-images/crane-1774961410-0edef7.png",
  "assets/user-images/stork-1774961430-0b069e.png",
  "assets/user-images/heron-1774961450-45a98f.png",
  "assets/user-images/kingfisher-1774961474-11ab84.png",
  "assets/user-images/woodpecker-1774961489-7de095.png",
  "assets/user-images/hummingbird-1774961508-cc4b4e.png",
  "assets/user-images/penguin-1774961527-4e1b88.png",
  "assets/user-images/albatross-1774961546-c917d7.png",
  "assets/user-images/pelican-1774961563-7282bc.png"
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
