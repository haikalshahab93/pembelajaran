;(function () {
  window.DATA = window.DATA || {
    categories: [{ id: "greetings", name: "Sapaan" }],
    entries: { greetings: [] }
  }
  const directionSel = document.getElementById("direction")
  const categorySel = document.getElementById("category")
  const tabs = Array.from(document.querySelectorAll(".tab"))
  const panels = {
    cards: document.getElementById("tab-cards"),
    quiz: document.getElementById("tab-quiz"),
    phrases: document.getElementById("tab-phrases"),
    translate: document.getElementById("tab-translate")
  }
  const cardFront = document.getElementById("card-front")
  const cardBack = document.getElementById("card-back")
  const prevBtn = document.getElementById("prev")
  const nextBtn = document.getElementById("next")
  const flipBtn = document.getElementById("flip")
  const progressText = document.getElementById("progress-text")
  const listenBtn = document.getElementById("listen")
  const voiceResultEl = document.getElementById("voice-result")
  const searchInput = document.getElementById("search")
  const streakEl = document.getElementById("streak")
  const contrastBtn = document.getElementById("contrast")
  const mediaBtn = document.getElementById("media")
  const quizQ = document.getElementById("quiz-question")
  const quizOpts = document.getElementById("quiz-options")
  const quizNext = document.getElementById("quiz-next")
  const quizProgress = document.getElementById("quiz-progress")
  const phrasesList = document.getElementById("phrases-list")
  const tInput = document.getElementById("translate-input")
  const tInfo = document.getElementById("translate-info")
  const tOutEn = document.getElementById("translate-en")
  const tOutAr = document.getElementById("translate-ar")
  const tOutId = document.getElementById("translate-id")
  const tSpeakAr = document.getElementById("translate-speak-ar")
  const tSpeakEn = document.getElementById("translate-speak-en")
  const tSpeakId = document.getElementById("translate-speak-id")
  const tCopy = document.getElementById("translate-copy")
  const tSave = document.getElementById("translate-save")
  const tHistory = document.getElementById("translate-history")
  const tClear = document.getElementById("translate-clear")
  const tAdd = document.getElementById("translate-add")
  const viewer = document.getElementById("image-viewer")
  const viewerImg = document.getElementById("viewer-img")
  const viewerEdit = document.getElementById("viewer-edit")
  const viewerClose = document.getElementById("viewer-close")
  const openSuggestionsBtn = document.getElementById("open-suggestions")
  const suggestionModal = document.getElementById("suggestion-modal")
  const suggestionPanel = document.getElementById("suggestion-panel")
  const suggestionClose = document.getElementById("suggestion-close")
  const openSettingsBtn = document.getElementById("open-settings")
  const settingsModal = document.getElementById("settings-modal")
  const settingsPanel = document.getElementById("settings-panel")
  const settingsClose = document.getElementById("settings-close")
  let viewerItem = null

  const LSKEY = "pembelajar_state"
  const QUIZ_ERROR_KEY = "pembelajar_quiz_errors"
  const LAST_RECOVERY_KEY = "pembelajar_last_recovery"
  const LAST_SESSION_SUMMARY_KEY = "pembelajar_last_session_summary"
  const LAST_SESSION_HISTORY_KEY = "pembelajar_session_history"
  const WORD_SUGGESTION_KEY = "pembelajar_word_suggestions"
  const defaultSrsEntry = {
    level: 1,
    streak: 0,
    attempts: 0,
    correct: 0,
    wrong: 0,
    avgMs: 0,
    lastMs: 0,
    lastWrong: 0,
    lastSeen: 0
  }
  const defaultState = {
    direction: "en-ar",
    category: "greetings",
    cardIndex: 0,
    flipped: false,
    completedToday: 0,
    dayStamp: new Date().toDateString(),
    quiz: { index: 0, correct: 0, total: 0, reviewOnly: false, lastIdx: -1, timerEnabled: false, timerSecs: 30, freePractice: false },
    phrasesPage: 0,
    searchQuery: "",
    studyFilter: "all",
    favoriteKeys: {},
    srs: {},
    audioRate: 1,
    audioPitch: 1,
    dailyGoal: 10
  }
  const CATEGORY_GROUPS = {
    animals: {
      id: "animals",
      name: "Hewan",
      members: [
        "animals", "farm_animals", "wild_animals", "birds", "reptiles_amphibians", "sea_animals",
        "insects_small_animals", "small_mammals", "primates", "birds_of_prey", "pet_city_birds",
        "water_birds", "domestic_birds", "wetland_birds", "unique_birds", "giant_mammals",
        "big_cats", "hoofed_mammals", "marsupials", "unique_mammals", "marine_mammals",
        "sharks_rays", "sea_fish", "cephalopods_jellyfish", "shellfish_seafloor", "crocodilians",
        "lizards", "snakes", "turtles_tortoises", "amphibians"
      ]
    },
    vegetables: {
      id: "vegetables",
      name: "Sayur",
      members: ["vegetables", "root_vegetables", "leafy_green_vegetables", "legumes_mushrooms", "herbs_spices"]
    },
    fruits: {
      id: "fruits",
      name: "Buah",
      members: ["fruits", "citrus_fruits", "berries_grapes", "orchard_fruits", "tropical_fruits", "exotic_fruits"]
    }
  }
  const CATEGORY_GROUP_BY_MEMBER = Object.values(CATEGORY_GROUPS).reduce((acc, group) => {
    group.members.forEach(memberId => { acc[memberId] = group.id })
    return acc
  }, {})
  let state = loadState()
  let WORD_SUGGESTIONS = []
  let WORD_SUGGESTIONS_LOADED = false
  let STUDY_SCOPE_MODE = "all"
  let STUDY_SCOPE_KEYS = null
  let STUDY_SCOPE_LABEL = ""
  let QUIZ_SESSION_SIGNATURE = ""
  let QUIZ_SESSION_KEYS = new Set()
  let QUIZ_SESSION_WRONG_KEYS = new Set()
  let QUIZ_SESSION_ITEMS = []
  let QUIZ_SESSION_WRONG_ITEMS = []
  let QUIZ_SESSION_ELAPSED_TOTAL = 0

  function loadState() {
    try {
      const raw = localStorage.getItem(LSKEY)
      if (!raw) return defaultState
      const s = JSON.parse(raw)
      const merged = Object.assign({}, defaultState, s, {
        quiz: Object.assign({}, defaultState.quiz, s && s.quiz ? s.quiz : {})
      })
      const normalizedSrs = {}
      Object.keys(merged.srs || {}).forEach(k => {
        normalizedSrs[k] = Object.assign({}, defaultSrsEntry, merged.srs[k] || {})
      })
      merged.srs = normalizedSrs
      merged.favoriteKeys = merged.favoriteKeys && typeof merged.favoriteKeys === "object" ? merged.favoriteKeys : {}
      merged.dailyGoal = Math.max(1, Math.min(100, Number(merged.dailyGoal || 10) || 10))
      merged.studyFilter = ["all", "favorites", "hard", "new", "strong"].includes(merged.studyFilter) ? merged.studyFilter : "all"
      return merged
    } catch {
      return defaultState
    }
  }
  function saveState() {
    localStorage.setItem(LSKEY, JSON.stringify(state))
  }
  function notify(msg, kind) {
    let host = document.getElementById("toast-host")
    if (!host) {
      host = document.createElement("div")
      host.id = "toast-host"
      document.body.appendChild(host)
    }
    const el = document.createElement("div")
    el.className = `toast ${kind || "info"}`
    el.textContent = msg
    host.appendChild(el)
    setTimeout(() => {
      if (el.parentElement) el.parentElement.removeChild(el)
    }, 2600)
  }
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return
    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    window.addEventListener("load", () => {
      if (isLocalHost) {
        navigator.serviceWorker.getRegistrations()
          .then(list => Promise.all(list.map(reg => reg.unregister())))
          .catch(() => {})
        if ("caches" in window) {
          caches.keys()
            .then(keys => Promise.all(keys.filter(key => key.startsWith("pembelajaran-")).map(key => caches.delete(key))))
            .catch(() => {})
        }
        return
      }
      navigator.serviceWorker.register(appUrl("sw.js"), { scope: APP_BASE_PATH }).catch(() => {})
    })
  }
  const APP_BASE_URL = new URL("./", window.location.href)
  const APP_BASE_PATH = APP_BASE_URL.pathname.endsWith("/") ? APP_BASE_URL.pathname : `${APP_BASE_URL.pathname}/`
  const API_BASE_STORAGE_KEY = "pembelajar_api_base"
  function normalizeBaseUrl(value) {
    const raw = String(value || "").trim()
    if (!raw) return ""
    try {
      return new URL(raw.endsWith("/") ? raw : `${raw}/`).toString()
    } catch {
      return ""
    }
  }
  function appUrl(path) {
    if (!path) return APP_BASE_URL.toString()
    const raw = String(path)
    if (/^[a-z]+:/i.test(raw)) return raw
    return new URL(raw.replace(/^\/+/, ""), APP_BASE_URL).toString()
  }
  function defaultApiBase() {
    if (/\.github\.io$/i.test(window.location.hostname || "")) return ""
    if (/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || "")) {
      if (window.location.port === "8020" || window.location.port === "8021") return APP_BASE_URL.toString()
      return `${window.location.protocol}//${window.location.hostname}:8020/`
    }
    return APP_BASE_URL.toString()
  }
  function getApiBaseUrl() {
    const configured = normalizeBaseUrl(window.PEMBELAJAR_CONFIG && window.PEMBELAJAR_CONFIG.apiBase || "")
    let stored = ""
    try {
      stored = localStorage.getItem(API_BASE_STORAGE_KEY) || ""
    } catch {}
    return normalizeBaseUrl(stored) || configured || defaultApiBase()
  }
  function getStoredApiBaseUrl() {
    const configured = normalizeBaseUrl(window.PEMBELAJAR_CONFIG && window.PEMBELAJAR_CONFIG.apiBase || "")
    try {
      return normalizeBaseUrl(localStorage.getItem(API_BASE_STORAGE_KEY) || "") || configured
    } catch {
      return configured
    }
  }
  function setStoredApiBaseUrl(value) {
    const normalized = normalizeBaseUrl(value)
    try {
      if (normalized) localStorage.setItem(API_BASE_STORAGE_KEY, normalized)
      else localStorage.removeItem(API_BASE_STORAGE_KEY)
    } catch {}
    return normalized
  }
  function apiUrl(path) {
    const base = getApiBaseUrl()
    if (!base) return ""
    return new URL(String(path || "").replace(/^\/+/, ""), base).toString()
  }
  function notifyApiUnavailable(label) {
    notify(`${label} butuh server backend aktif. Atur URL Server Audio/API di Pengaturan.`, "info")
  }
  function getAudioSupportInfo() {
    const speechReady = !!window.speechSynthesis
    const arabicVoice = !!pickVoice("ar-SA")
    const englishVoice = !!pickVoice("en-US")
    const indonesianVoice = !!pickVoice("id-ID")
    const storedBase = getStoredApiBaseUrl()
    const activeBase = getApiBaseUrl()
    const isGithubPages = /\.github\.io$/i.test(window.location.hostname || "")
    return {
      speechReady,
      arabicVoice,
      englishVoice,
      indonesianVoice,
      storedBase,
      activeBase,
      isGithubPages
    }
  }
  let VOICES = []
  function initVoices() {
    if (!window.speechSynthesis) return
    VOICES = speechSynthesis.getVoices() || []
    speechSynthesis.onvoiceschanged = () => {
      VOICES = speechSynthesis.getVoices() || []
      updateApiSettingsStatus()
    }
    updateApiSettingsStatus()
  }
  function pickVoice(lang) {
    if (!window.speechSynthesis) return null
    const list = VOICES.length ? VOICES : (speechSynthesis.getVoices() || [])
    const lc = (lang || "").toLowerCase()
    let v = list.find(x => (x.lang || "").toLowerCase() === lc)
    if (!v) v = list.find(x => (x.lang || "").toLowerCase().startsWith(lc))
    if (!v) {
      const base = lc.split("-")[0]
      v = list.find(x => (x.lang || "").toLowerCase().startsWith(base))
    }
    return v || null
  }
  function speakLangText(txt, lang) {
    const text = (txt || "").trim()
    if (!text) return
    const ll = (lang || "").toLowerCase()
    const voice = pickVoice(lang)
    const useServer = ll.startsWith("id") || (!window.speechSynthesis) || (ll.startsWith("ar") && !voice)
    if (useServer) {
      const srvLang = ll.startsWith("ar") ? "ar" : (ll.startsWith("en") ? "en" : (ll.startsWith("id") ? "id" : "ar"))
      const key = `${srvLang}|${text}`
      const ttsUrl = apiUrl(`tts?lang=${encodeURIComponent(srvLang)}&text=${encodeURIComponent(text)}`)
      if (!ttsUrl) {
        if ((ll.startsWith("ar") && !voice) || ll.startsWith("id")) {
          notify("Audio ini butuh voice browser yang cocok atau URL Server Audio/API di Pengaturan.", "info")
        }
        if (!window.speechSynthesis) {
          notify("Audio belum tersedia di mode statis", "error")
          return
        }
      } else {
        if (!window.AUDIO_CACHE) window.AUDIO_CACHE = new Map()
        const cache = window.AUDIO_CACHE
        const playUrl = url => { const a = new Audio(url); a.playbackRate = state.audioRate || 1; a.play().catch(() => {}) }
        if (cache.has(key)) {
          playUrl(cache.get(key))
        } else {
          fetch(ttsUrl).then(r => {
            if (!r.ok) throw new Error("tts")
            return r.blob()
          }).then(b => {
            const url = URL.createObjectURL(b)
            cache.set(key, url)
            playUrl(url)
          }).catch(() => {
            notify("Audio belum tersedia, coba lagi", "error")
            const a = new Audio(ttsUrl)
            a.playbackRate = state.audioRate || 1
            a.play().catch(() => {})
          })
        }
        return
      }
    }
    if (!window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    if (voice) u.voice = voice
    u.rate = Math.max(0.5, Math.min(2, state.audioRate || 1))
    u.pitch = Math.max(0.5, Math.min(2, state.audioPitch || 1))
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  }
  const BROKEN_ARABIC_BYTE_MAP = {
    ",": 0x82,
    "\"": 0x84,
    ".": 0x85,
    "^": 0x88,
    "S": 0x8A,
    "Z": 0x8E,
    "'": 0x92,
    "*": 0x95,
    "-": 0x96,
    "~": 0x98,
    "s": 0x9A,
    "z": 0x9E,
    "Y": 0x9F
  }
  const COMMON_ARABIC_CHARS = new Set("ابتثجحخدذرزسشصضطظعغفقكلمنهويءأةآإؤئىلا")
  const ARABIC_TO_LATIN = {
    ا: "a", أ: "a", إ: "i", آ: "a", ء: "a", ؤ: "u", ئ: "i", ى: "a", ة: "h",
    ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z",
    س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q",
    ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y"
  }
  function normalizeTransliterationText(value) {
    return (value || "")
      .toLowerCase()
      .replace(/[āăáàâä]/g, "a")
      .replace(/[īíìîï]/g, "i")
      .replace(/[ūúùûü]/g, "u")
      .replace(/[ḥ]/g, "h")
      .replace(/[ḍ]/g, "d")
      .replace(/[ṣ]/g, "s")
      .replace(/[ṭ]/g, "t")
      .replace(/[ẓ]/g, "z")
      .replace(/[ḳ]/g, "q")
      .replace(/[ġ]/g, "gh")
      .replace(/[ʿʻ]/g, "a")
      .replace(/[ʾ]/g, "a")
      .replace(/[^a-z]+/g, "")
  }
  function transliterateArabicText(value) {
    return Array.from(value || "").map(ch => ARABIC_TO_LATIN[ch] || "").join("")
  }
  function hasArabicLetters(value) {
    return /[\u0600-\u06FF]/.test(value || "")
  }
  function hasBrokenArabicText(value) {
    return /�/.test(value || "")
  }
  function isUsableArabicText(value) {
    const source = (value || "").trim()
    return !!source && hasArabicLetters(source) && !hasBrokenArabicText(source)
  }
  function scoreArabicCandidate(value, transliteration) {
    if (!value) return -1000
    let score = 0
    const arabicChars = Array.from(value).filter(ch => /[\u0600-\u06FF]/.test(ch))
    const commonChars = arabicChars.filter(ch => COMMON_ARABIC_CHARS.has(ch))
    const weirdChars = (value.match(/[A-Za-z�]/g) || []).length
    score += arabicChars.length * 0.5
    score += commonChars.length * 1.2
    score -= weirdChars * 4
    if (/^[\u0600-\u06FF\s.,!?"'()\-؟،؛:]+$/.test(value)) score += 2
    if (transliteration) {
      const lhs = normalizeTransliterationText(transliterateArabicText(value))
      const rhs = normalizeTransliterationText(transliteration)
      if (lhs && rhs) score += similarity(lhs, rhs) * 10
    }
    return score
  }
  function buildArabicRepairCandidates(value) {
    const source = value || ""
    const encoder = new TextEncoder()
    const decoder = new TextDecoder("utf-8")
    let variants = [{ bytes: [], broken: 0 }]
    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i]
      if (ch === "�" && i + 1 < source.length) {
        const next = source[i + 1]
        const byte2 = Object.prototype.hasOwnProperty.call(BROKEN_ARABIC_BYTE_MAP, next) ? BROKEN_ARABIC_BYTE_MAP[next] : null
        if (byte2 !== null) {
          const expanded = []
          variants.forEach(variant => {
            expanded.push({ bytes: variant.bytes.concat([0xD8, byte2]), broken: variant.broken + 1 })
            expanded.push({ bytes: variant.bytes.concat([0xD9, byte2]), broken: variant.broken + 1 })
          })
          variants = expanded.slice(0, 256)
          i += 1
          continue
        }
      }
      const bytes = Array.from(encoder.encode(ch))
      variants = variants.map(variant => ({ bytes: variant.bytes.concat(bytes), broken: variant.broken }))
    }
    return variants.map(variant => ({
      value: decoder.decode(Uint8Array.from(variant.bytes)),
      broken: variant.broken
    }))
  }
  function repairArabicText(value, transliteration) {
    const source = (value || "").trim()
    if (!source || !hasBrokenArabicText(source)) return source
    const candidates = buildArabicRepairCandidates(source)
      .map(candidate => ({
        value: candidate.value,
        score: scoreArabicCandidate(candidate.value, transliteration) + (candidate.broken * 0.2)
      }))
      .sort((a, b) => b.score - a.score)
    return candidates.length ? candidates[0].value : source
  }
  function buildCatalogRepairIndex(entries) {
    const index = new Map()
    const add = (type, key, item) => {
      const normalizedKey = String(key || "").trim().toLowerCase()
      if (!normalizedKey || !isUsableArabicText(item.ar)) return
      const mapKey = `${type}:${normalizedKey}`
      if (!index.has(mapKey)) {
        index.set(mapKey, {
          ar: item.ar,
          tr: item.tr || ""
        })
      }
    }
    Object.values(entries || {}).forEach(list => {
      ;(Array.isArray(list) ? list : []).forEach(entry => {
        const item = Object.assign({}, entry || {})
        item.ar = repairArabicText(item.ar || "", item.tr || "")
        if (!isUsableArabicText(item.ar)) return
        add("enid", `${item.en || ""}|${item.id || ""}`, item)
        add("en", item.en, item)
        add("v1", item.v1, item)
        add("id", item.id, item)
      })
    })
    return index
  }
  function findCatalogRepairCandidate(item, repairIndex) {
    if (!repairIndex) return null
    const keys = [
      ["enid", `${item.en || ""}|${item.id || ""}`],
      ["en", item.en],
      ["v1", item.v1],
      ["id", item.id]
    ]
    for (const [type, key] of keys) {
      const normalizedKey = String(key || "").trim().toLowerCase()
      if (!normalizedKey) continue
      const candidate = repairIndex.get(`${type}:${normalizedKey}`)
      if (candidate && candidate.ar) return candidate
    }
    return null
  }
  function repairCatalogItem(item, repairIndex) {
    const next = Object.assign({}, item || {})
    next.ar = repairArabicText(next.ar || "", next.tr || "")
    next.ex_ar = repairArabicText(next.ex_ar || "", "")
    const candidate = findCatalogRepairCandidate(next, repairIndex)
    if ((!isUsableArabicText(next.ar) || hasBrokenArabicText(next.ar)) && candidate && candidate.ar) next.ar = candidate.ar
    if (!(next.tr || "").trim() && candidate && candidate.tr) next.tr = candidate.tr
    return next
  }
  function normalizeCatalogEntries(entries, categories, repairIndex) {
    const source = (entries && typeof entries === "object") ? entries : {}
    const out = {}
    ;(categories || []).forEach(category => {
      const value = source[category.id]
      out[category.id] = Array.isArray(value) ? value.map(item => repairCatalogItem(item, repairIndex)) : []
    })
    Object.keys(source).forEach(key => {
      if (!(key in out) && Array.isArray(source[key])) out[key] = source[key].map(item => repairCatalogItem(item, repairIndex))
    })
    return out
  }
  function repairCatalogEntriesWithFallback(entries) {
    const source = (entries && typeof entries === "object") ? entries : {}
    const repairIndex = buildCatalogRepairIndex(source)
    const out = {}
    Object.keys(source).forEach(key => {
      out[key] = Array.isArray(source[key]) ? source[key].map(item => repairCatalogItem(item, repairIndex)) : []
    })
    return out
  }
  function sanitizePossiblyBrokenJsonText(raw) {
    return String(raw || "").replace(/^(\s*"[^"]+"\s*:\s*")([\s\S]*?)(")(\s*,?\s*)$/gm, (full, start, value, end, tail) => {
      const escaped = value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, "\\\"")
      return `${start}${escaped}${end}${tail}`
    })
  }
  function parsePossiblyBrokenJsonText(raw) {
    const text = String(raw || "").replace(/^\uFEFF/, "")
    try {
      return JSON.parse(text)
    } catch {
      return JSON.parse(sanitizePossiblyBrokenJsonText(text))
    }
  }
  async function loadCatalogCategory(categoryId, options) {
    const opts = options || {}
    const entryFiles = (DATA && DATA.entryFiles && typeof DATA.entryFiles === "object") ? DATA.entryFiles : {}
    const path = entryFiles[categoryId]
    if (!path) return DATA.entries[categoryId] || []
    let items = []
    try {
      const res = await fetch(appUrl(path), { cache: "no-store" })
      if (res.ok) {
        const json = parsePossiblyBrokenJsonText(await res.text())
        const repairIndex = buildCatalogRepairIndex(DATA && DATA.entries)
        items = Array.isArray(json) ? json.map(item => repairCatalogItem(item, repairIndex)) : []
      }
    } catch {}
    DATA.entries[categoryId] = items
    DATA.entries = repairCatalogEntriesWithFallback(DATA.entries)
    items = DATA.entries[categoryId] || items
    if (categoryId === "animals") window.ANIMALS_IMPORT = items.slice()
    if (categoryId === "vegetables") window.VEGETABLES_IMPORT = items.slice()
    if (opts.rebuild !== false) await rebuildLexiconAsync()
    return items
  }
  async function loadCatalogEntryFiles() {
    const categories = Array.isArray(DATA.categories) ? DATA.categories : []
    await Promise.all(categories.map(category => loadCatalogCategory(category.id, { rebuild: false })))
    DATA.entries = repairCatalogEntriesWithFallback(DATA.entries)
  }
  function srsKey(it) {
    const en = (it.en || "").toLowerCase().trim()
    const ar = (it.ar || "").toLowerCase().trim()
    const idv = (it.id || "").toLowerCase().trim()
    return `${en}|${ar}|${idv}`
  }
  function getStudyFilterMeta(filterValue) {
    const filter = filterValue || state.studyFilter || "all"
    if (filter === "favorites") return { value: "favorites", label: "Favorit", meta: "Menampilkan item yang ditandai favorit" }
    if (filter === "hard") return { value: "hard", label: "Sulit", meta: "Fokus item level rendah atau salah dalam 24 jam terakhir" }
    if (filter === "new") return { value: "new", label: "Baru", meta: "Menampilkan item yang belum pernah dilatih" }
    if (filter === "strong") return { value: "strong", label: "Kuat", meta: "Menampilkan item level tinggi yang sudah stabil" }
    return { value: "all", label: "Semua Item", meta: "Menampilkan seluruh item pada kategori aktif" }
  }
  function isFavoriteItem(it) {
    return !!(it && state.favoriteKeys && state.favoriteKeys[srsKey(it)])
  }
  function getFavoriteCount(items) {
    return (Array.isArray(items) ? items : []).reduce((sum, it) => sum + (isFavoriteItem(it) ? 1 : 0), 0)
  }
  function toggleFavoriteItem(it) {
    if (!it) return false
    const key = srsKey(it)
    const current = !!state.favoriteKeys[key]
    if (current) delete state.favoriteKeys[key]
    else state.favoriteKeys[key] = 1
    saveState()
    refreshStudyViews()
    return !current
  }
  function matchesStudyFilter(it) {
    const filter = state.studyFilter || "all"
    if (filter === "favorites") return isFavoriteItem(it)
    const entry = ensureSRS(it)
    if (filter === "hard") {
      const day = 24 * 60 * 60 * 1000
      const recentWrong = entry.lastWrong && (Date.now() - entry.lastWrong) < day
      return recentWrong || (entry.level || 1) <= 2
    }
    if (filter === "new") return !(entry.attempts || 0)
    if (filter === "strong") return (entry.level || 1) >= 5 && (entry.streak || 0) >= 2
    return true
  }
  function applyStudyFilter(items) {
    if ((state.studyFilter || "all") === "all") return items
    return (Array.isArray(items) ? items : []).filter(matchesStudyFilter)
  }
  function getScopedStudyItems(items) {
    if (!STUDY_SCOPE_KEYS || !STUDY_SCOPE_KEYS.size) return items
    return (Array.isArray(items) ? items : []).filter(it => STUDY_SCOPE_KEYS.has(srsKey(it)))
  }
  function getStudyItemsBase() {
    const raw = state.category === "__all" ? flattenAllItems() : getItems()
    return getScopedStudyItems(raw)
  }
  function ensureSRS(it) {
    const k = srsKey(it)
    if (!state.srs[k]) state.srs[k] = Object.assign({}, defaultSrsEntry)
    else state.srs[k] = Object.assign({}, defaultSrsEntry, state.srs[k] || {})
    return state.srs[k]
  }
  function getSrsUrgency(entry, now) {
    const s = Object.assign({}, defaultSrsEntry, entry || {})
    const day = 24 * 60 * 60 * 1000
    let weight = 7 - Math.min(6, Math.max(1, s.level || 1))
    if (s.lastWrong && (now - s.lastWrong) < day) weight += 3
    if ((s.avgMs || 0) > 0) {
      const baseline = Math.max(5000, (state.quiz.timerSecs || 30) * 500)
      weight += Math.min(3, Math.max(0, (s.avgMs - baseline) / baseline))
    }
    if ((s.attempts || 0) < 3) weight += 1
    weight += Math.max(0, 2 - Math.min(2, (s.streak || 0) * 0.5))
    return Math.max(1, weight)
  }
  function formatElapsed(ms) {
    const secs = Math.max(0.3, (ms || 0) / 1000)
    return `${secs.toFixed(secs >= 10 ? 0 : 1)} dtk`
  }
  function getSrsSnapshot(it) {
    const entry = ensureSRS(it)
    const day = 24 * 60 * 60 * 1000
    const recentWrong = entry.lastWrong && (Date.now() - entry.lastWrong) < day
    const label = recentWrong
      ? "Perlu review"
      : (entry.level <= 2 ? "Masih sulit" : (entry.level <= 4 ? "Sedang latihan" : "Sudah kuat"))
    const tone = recentWrong || entry.level <= 2 ? "hard" : (entry.level <= 4 ? "mid" : "easy")
    const stats = []
    if (entry.attempts) stats.push(`${entry.attempts} latihan`)
    if (entry.avgMs) stats.push(`rata-rata ${formatElapsed(entry.avgMs)}`)
    if (entry.wrong) stats.push(`${entry.wrong} salah`)
    return {
      entry,
      label,
      tone,
      summary: `${label} • Level ${entry.level || 1}`,
      stats: stats.join(" • ")
    }
  }
  function createSrsBadge(it, compact) {
    const snap = getSrsSnapshot(it)
    const badge = document.createElement("div")
    badge.className = `srs-badge srs-${snap.tone}${compact ? " srs-badge-compact" : ""}`
    const title = document.createElement("div")
    title.className = "srs-badge-title"
    title.textContent = snap.summary
    badge.appendChild(title)
    if (!compact && snap.stats) {
      const meta = document.createElement("div")
      meta.className = "srs-badge-meta"
      meta.textContent = snap.stats
      badge.appendChild(meta)
    } else if (snap.stats) {
      badge.title = snap.stats
    }
    return badge
  }
  function srsUpdate(it, result) {
    const cur = ensureSRS(it)
    const meta = typeof result === "object" ? result : { ok: !!result }
    const ok = !!meta.ok
    const elapsedMs = Math.max(300, Math.round(Number(meta.elapsedMs || 0) || 0))
    const now = Date.now()
    cur.attempts = (cur.attempts || 0) + 1
    cur.lastSeen = now
    if (elapsedMs) {
      cur.lastMs = elapsedMs
      cur.avgMs = cur.avgMs ? Math.round(cur.avgMs * 0.65 + elapsedMs * 0.35) : elapsedMs
    }
    if (ok) {
      cur.correct = (cur.correct || 0) + 1
      cur.streak = (cur.streak || 0) + 1
      const fastThreshold = Math.max(2200, (state.quiz.timerSecs || 30) * 350)
      const bonus = elapsedMs && elapsedMs <= fastThreshold ? 2 : 1
      cur.level = Math.min(6, (cur.level || 1) + bonus)
    } else {
      cur.wrong = (cur.wrong || 0) + 1
      cur.streak = 0
      cur.lastWrong = now
      const penalty = meta.timedOut ? 2 : 1
      cur.level = Math.max(1, (cur.level || 1) - penalty)
    }
    saveState()
  }
  function getQuizPool() {
    const all = getStudyItems()
    if (!state.quiz.reviewOnly) return all
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    return all.filter(it => {
      const s = ensureSRS(it)
      return s.lastWrong && (now - s.lastWrong) < day
    })
  }
  function srsPickIndex(arr) {
    if (!arr.length) return -1
    const now = Date.now()
    const weights = arr.map(it => {
      const s = ensureSRS(it)
      return getSrsUrgency(s, now)
    })
    const sum = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * sum
    for (let i = 0; i < arr.length; i++) {
      if (r < weights[i]) return i
      r -= weights[i]
    }
    return Math.floor(Math.random() * arr.length)
  }
  function getStoredQuizErrors() {
    try {
      const raw = localStorage.getItem(QUIZ_ERROR_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
  function setStoredQuizErrors(entries) {
    localStorage.setItem(QUIZ_ERROR_KEY, JSON.stringify(entries || []))
  }
  function pruneQuizErrors(entries) {
    const day = 24 * 60 * 60 * 1000
    const now = Date.now()
    return (entries || []).filter(it => it && it.ts && (now - it.ts) < day).slice(0, 60)
  }
  function getRecentQuizErrors() {
    const all = pruneQuizErrors(getStoredQuizErrors())
    const filtered = state.category === "__all"
      ? all
      : all.filter(it => it.category === state.category)
    return filtered
  }
  function recordQuizError(item, meta) {
    const entries = pruneQuizErrors(getStoredQuizErrors())
    entries.unshift({
      key: srsKey(item),
      category: state.category,
      ts: Date.now(),
      timedOut: !!(meta && meta.timedOut),
      elapsedMs: Math.max(300, Math.round(Number(meta && meta.elapsedMs) || 0)),
      en: item.en || "",
      ar: item.ar || "",
      id: item.id || ""
    })
    setStoredQuizErrors(entries.slice(0, 60))
  }
  function prefetchAudio(text, lang) {
    const t = (text || "").trim()
    if (!t) return
    const ll = (lang || "").toLowerCase()
    const srvLang = ll.startsWith("ar") ? "ar" : (ll.startsWith("en") ? "en" : (ll.startsWith("id") ? "id" : "ar"))
    const key = `${srvLang}|${t}`
    const ttsUrl = apiUrl(`tts?lang=${encodeURIComponent(srvLang)}&text=${encodeURIComponent(t)}`)
    if (!ttsUrl) return
    if (!window.AUDIO_CACHE) window.AUDIO_CACHE = new Map()
    const cache = window.AUDIO_CACHE
    if (cache.has(key)) return
    fetch(ttsUrl).then(r => {
      if (!r.ok) throw new Error("tts")
      return r.blob()
    }).then(b => {
      const url = URL.createObjectURL(b)
      cache.set(key, url)
    }).catch(() => {})
  }
  function ensureDay() {
    const today = new Date().toDateString()
    if (state.dayStamp !== today) {
      state.dayStamp = today
      state.completedToday = 0
      saveState()
    }
  }
  function setDirection(val) {
    state.direction = val
    saveState()
    refreshStudyViews()
  }
  function resetQuizSessionState() {
    state.quiz = Object.assign({}, defaultState.quiz, {
      reviewOnly: state.quiz.reviewOnly,
      timerEnabled: state.quiz.timerEnabled,
      timerSecs: state.quiz.timerSecs,
      freePractice: state.quiz.freePractice
    })
    QUIZ_SESSION_SIGNATURE = ""
    QUIZ_SESSION_KEYS = new Set()
    QUIZ_SESSION_WRONG_KEYS = new Set()
    QUIZ_SESSION_ITEMS = []
    QUIZ_SESSION_WRONG_ITEMS = []
    QUIZ_SESSION_ELAPSED_TOTAL = 0
  }
  function setCategory(val) {
    state.category = val
    state.cardIndex = 0
    state.flipped = false
    STUDY_SCOPE_MODE = "all"
    STUDY_SCOPE_KEYS = null
    STUDY_SCOPE_LABEL = ""
    resetQuizSessionState()
    saveState()
    refreshStudyViews()
  }
  function refreshStudyViews() {
    renderCard()
    renderQuiz()
    renderPhrases()
    renderHeaderStudyStatus()
  }
  function getItems() {
    return getItemsByCategoryId(state.category)
  }
  function currentItem() {
    const items = getStudyItems()
    if (!items.length) return null
    const i = Math.max(0, Math.min(items.length - 1, state.cardIndex))
    return items[i]
  }
  function matchItem(it, q) {
    if (!q) return true
    const query = normalize(q, false)
    const fields = [
      normalize(it.en || "", false),
      normalize(it.id || "", false),
      normalize(it.tr || "", false),
      normalize(it.v1 || "", false),
      normalize(it.v2 || "", false),
      normalize(it.v3 || "", false),
      normalize(it.ex_en || "", false),
      normalize(it.ar || "", true),
      normalize(it.ex_ar || "", true)
    ]
    return fields.some(f => f.includes(query) || similarity(query, f) >= 0.85)
  }
  function filterItems(items) {
    const q = state.searchQuery
    if (!q) return items
    const tagMatch = q.trim().toLowerCase().startsWith("tag:")
    if (tagMatch) {
      const t = q.trim().slice(4).toLowerCase()
      return items.filter(it => {
        const tags = Array.isArray(it.tags) ? it.tags : (typeof it.tags === "string" ? it.tags.split(",") : [])
        return tags.some(x => (x || "").toLowerCase().includes(t))
      })
    }
    return items.filter(it => matchItem(it, q))
  }
  function buildLexicon() {
    const en = new Map(), ar = new Map(), id = new Map()
    const enSet = new Set(), idSet = new Set()
    Object.keys(DATA.entries).forEach(cat => {
      const arr = DATA.entries[cat] || []
      arr.forEach(it => {
        const e = normalize(it.en || "", false)
        const a = normalize(it.ar || "", true)
        const i = normalize(it.id || "", false)
        if (e) {
          en.set(e, it)
          enSet.add(e)
        }
        if (a) ar.set(a, it)
        if (i) {
          id.set(i, it)
          idSet.add(i)
        }
        if (it.v1) {
          const v1 = normalize(it.v1, false)
          const v2 = normalize(it.v2, false)
          const v3 = normalize(it.v3, false)
          if (v1) { en.set(v1, it); enSet.add(v1) }
          if (v2) { en.set(v2, it); enSet.add(v2) }
          if (v3) { en.set(v3, it); enSet.add(v3) }
        }
        const synEn = Array.isArray(it.synonyms_en) ? it.synonyms_en : (typeof it.synonyms_en === "string" ? it.synonyms_en.split(",") : [])
        synEn.forEach(s => {
          const k = normalize(s || "", false)
          if (k) { en.set(k, it); enSet.add(k) }
        })
        const synId = Array.isArray(it.synonyms_id) ? it.synonyms_id : (typeof it.synonyms_id === "string" ? it.synonyms_id.split(",") : [])
        synId.forEach(s => {
          const k = normalize(s || "", false)
          if (k) { id.set(k, it); idSet.add(k) }
        })
      })
    })
    return { en, ar, id, enSet, idSet }
  }
  function lexiconWorkerPayload() {
    return Object.keys(DATA.entries).map(cat => ({ cat, items: DATA.entries[cat] || [] }))
  }
  function assignLexiconFromPlain(obj) {
    if (!obj) return
    LEX = {
      en: new Map(obj.en || []),
      ar: new Map(obj.ar || []),
      id: new Map(obj.id || []),
      enSet: new Set(obj.enSet || []),
      idSet: new Set(obj.idSet || [])
    }
  }
  function rebuildLexiconAsync() {
    if (!window.Worker || !window.URL || !window.Blob) {
      LEX = buildLexicon()
      return Promise.resolve(LEX)
    }
    const src = `
self.onmessage = function (e) {
  const data = e.data || []
  const normalize = (s, isArabic) => {
    if (!s) return ""
    let t = String(s).toLowerCase().trim()
    if (isArabic) t = t.replace(/[\\u064B-\\u065F\\u0670\\u0640]/g, "")
    t = t.replace(/[^\\p{L}\\p{N}\\s]/gu, "")
    t = t.replace(/\\s+/g, " ")
    return t
  }
  const en = [], ar = [], id = []
  const enSet = new Set(), idSet = new Set()
  data.forEach(group => {
    ;(group.items || []).forEach(it => {
      const e = normalize(it.en || "", false)
      const a = normalize(it.ar || "", true)
      const i = normalize(it.id || "", false)
      if (e) { en.push([e, it]); enSet.add(e) }
      if (a) ar.push([a, it])
      if (i) { id.push([i, it]); idSet.add(i) }
      ;["v1","v2","v3"].forEach(k => {
        const v = normalize(it[k] || "", false)
        if (v) { en.push([v, it]); enSet.add(v) }
      })
      const synEn = Array.isArray(it.synonyms_en) ? it.synonyms_en : (typeof it.synonyms_en === "string" ? it.synonyms_en.split(",") : [])
      synEn.forEach(s => {
        const k = normalize(s || "", false)
        if (k) { en.push([k, it]); enSet.add(k) }
      })
      const synId = Array.isArray(it.synonyms_id) ? it.synonyms_id : (typeof it.synonyms_id === "string" ? it.synonyms_id.split(",") : [])
      synId.forEach(s => {
        const k = normalize(s || "", false)
        if (k) { id.push([k, it]); idSet.add(k) }
      })
    })
  })
  self.postMessage({ en, ar, id, enSet: Array.from(enSet), idSet: Array.from(idSet) })
}`
    const blob = new Blob([src], { type: "application/javascript" })
    const url = URL.createObjectURL(blob)
    return new Promise(resolve => {
      try {
        const worker = new Worker(url)
        worker.onmessage = e => {
          assignLexiconFromPlain(e.data)
          worker.terminate()
          URL.revokeObjectURL(url)
          resolve(LEX)
        }
        worker.onerror = () => {
          worker.terminate()
          URL.revokeObjectURL(url)
          LEX = buildLexicon()
          resolve(LEX)
        }
        worker.postMessage(lexiconWorkerPayload())
      } catch {
        URL.revokeObjectURL(url)
        LEX = buildLexicon()
        resolve(LEX)
      }
    })
  }
  let LEX = buildLexicon()
  function prettifySpacing(s, isArabic) {
    if (!s) return ""
    let t = s.replace(/\s+/g, " ").trim()
    t = t.replace(/\s*([.,!?;:])/g, "$1")
    t = t.replace(/([.,!?;:])([^\s])/g, "$1 $2")
    return t
  }
  function containsArabic(s) {
    return /[\u0600-\u06FF]/.test(s)
  }
  function detectLang(s) {
    if (containsArabic(s)) return "ar"
    const toks = normalize(s, false).split(/\s+/).filter(Boolean)
    let enHit = 0, idHit = 0
    toks.forEach(t => {
      if (LEX.enSet.has(t)) enHit++
      if (LEX.idSet.has(t)) idHit++
    })
    if (enHit >= idHit) return "en"
    return "id"
  }
  function arBaseWord(w) {
    let t = normalize(w, true)
    if (t.startsWith("ال")) t = t.slice(2)
    if (t.length > 1 && ("أنت".includes(t[0]) || t[0] === "ن")) t = "ي" + t.slice(1)
    return t
  }
  function splitTokens(s) {
    return s.split(/(\s+|[.,!?;:"'()\-])/)
  }
  function translateText(s) {
    const src = detectLang(s)
    const tokens = splitTokens(s)
    const isSep = t => /\s+|[.,!?;:"'()\-]/.test(t || "")
    const enOut = []
    const arOut = []
    const idOut = []
    const consumed = new Array(tokens.length).fill(false)
    const wordIdx = []
    for (let i = 0; i < tokens.length; i++) if (!isSep(tokens[i])) wordIdx.push(i)
    function markConsumed(startWordPos, wordCount) {
      for (let k = 0; k < wordCount; k++) {
        const wi = wordIdx[startWordPos + k]
        consumed[wi] = true
        const next = wi + 1
        if (next < tokens.length && tokens[next] === " ") consumed[next] = true
      }
    }
    if (src === "ar") {
      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i]
        if (isSep(tok)) {
          enOut.push(tok); arOut.push(tok); idOut.push(tok); continue
        }
        const key = normalize(tok, true)
        const alt = arBaseWord(tok)
        const item = LEX.ar.get(key) || LEX.ar.get(alt)
        enOut.push(item ? (item.en || tok) : tok)
        arOut.push(item ? (item.ar || tok) : tok)
        idOut.push(item ? (item.id || tok) : tok)
      }
    } else {
      let i = 0
      function endIndexForN(n, start) {
        let count = 0, j = start
        while (j < tokens.length && count < n) {
          if (!isSep(tokens[j])) count++
          j++
        }
        return count === n ? j - 1 : start
      }
      while (i < tokens.length) {
        const tok = tokens[i]
        if (isSep(tok)) {
          enOut.push(tok); arOut.push(tok); idOut.push(tok); i++; continue
        }
        let bestItem = null, bestEnd = i
        for (let n = 3; n >= 1; n--) {
          const end = endIndexForN(n, i)
          if (end === i) continue
          const phrase = tokens.slice(i, end + 1).filter(t => !isSep(t)).join(" ")
          const key = normalize(phrase, false)
          const item = src === "en" ? LEX.en.get(key) : LEX.id.get(key)
          if (item) { bestItem = item; bestEnd = end; break }
        }
        if (bestItem) {
          enOut.push(bestItem.en || "")
          arOut.push(bestItem.ar || "")
          idOut.push(bestItem.id || "")
          i = bestEnd + 1
        } else {
          const key = normalize(tok, false)
          const item = src === "en" ? LEX.en.get(key) : LEX.id.get(key)
          enOut.push(item ? (item.en || tok) : tok)
          arOut.push(item ? (item.ar || tok) : tok)
          idOut.push(item ? (item.id || tok) : tok)
          i++
        }
      }
    }
    const en = enOut.join("")
    const ar = arOut.join("")
    const id = idOut.join("")
    const spacedOn = localStorage.getItem("pembelajar_space") === "1"
    const enF = spacedOn ? prettifySpacing(en, false) : en
    const arF = spacedOn ? prettifySpacing(ar, true) : ar
    const idF = spacedOn ? prettifySpacing(id, false) : id
    if (tOutEn) tOutEn.textContent = enF
    if (tOutAr) { tOutAr.textContent = arF; tOutAr.parentElement.parentElement.dir = "rtl" }
    if (tOutId) tOutId.textContent = idF
    if (tInfo) tInfo.textContent = `Deteksi bahasa: ${src.toUpperCase()}`
    const unknown = []
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i]
      if (isSep(tok)) continue
      if (src === "ar") {
        const k = normalize(tok, true)
        const alt = arBaseWord(tok)
        if (!LEX.ar.get(k) && !LEX.ar.get(alt)) unknown.push(tok)
      } else if (src === "en") {
        const k = normalize(tok, false)
        if (!LEX.en.get(k)) unknown.push(tok)
      } else {
        const k = normalize(tok, false)
        if (!LEX.id.get(k)) unknown.push(tok)
      }
    }
    renderAddPanel(Array.from(new Set(unknown)), src)
  }
  function getTranslateHistory() {
    try {
      const raw = localStorage.getItem("pembelajar_translate_history")
      if (!raw) return []
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  function getCustomEntries() {
    try {
      const raw = localStorage.getItem("pembelajar_custom_entries")
      if (!raw) return []
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  function setCustomEntries(arr) {
    localStorage.setItem("pembelajar_custom_entries", JSON.stringify(arr))
    DATA.entries.custom = arr
    rebuildLexiconAsync()
  }
  function imageKey(it) {
    const e = normalize(it.en || "", false)
    const a = normalize(it.ar || "", true)
    const i = normalize(it.id || "", false)
    return `${e}|${a}|${i}`
  }
  function getUserImages() {
    try {
      const raw = localStorage.getItem("pembelajar_images")
      if (!raw) return {}
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  function getLocalWordSuggestionsFallback() {
    try {
      const raw = localStorage.getItem(WORD_SUGGESTION_KEY)
      if (!raw) return []
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  function getWordSuggestions() {
    return WORD_SUGGESTIONS_LOADED ? WORD_SUGGESTIONS.slice() : getLocalWordSuggestionsFallback()
  }
  function setWordSuggestions(arr) {
    const normalized = Array.isArray(arr) ? arr.slice(0, 500) : []
    WORD_SUGGESTIONS = normalized
    WORD_SUGGESTIONS_LOADED = true
    try {
      localStorage.setItem(WORD_SUGGESTION_KEY, JSON.stringify(normalized))
    } catch {}
  }
  function updateSuggestionButtonLabel() {
    if (!openSuggestionsBtn) return
    const items = getWordSuggestions()
    const pending = items.filter(item => String(item && item.status || "pending") !== "updated").length
    openSuggestionsBtn.textContent = pending ? `Saran Kata • ${pending}` : "Saran Kata"
  }
  function wordSuggestionFingerprint(entry) {
    return [
      normalize((entry && entry.kind) || "", false),
      normalize((entry && entry.request) || "", false),
      normalize((entry && entry.meaning) || "", false),
      normalize((entry && entry.category) || "", false),
      normalize((entry && entry.note) || "", false)
    ].join("|")
  }
  function mergeWordSuggestions(existing, incoming) {
    const out = []
    const seen = new Set()
    ;[...(Array.isArray(incoming) ? incoming : []), ...(Array.isArray(existing) ? existing : [])].forEach(entry => {
      if (!entry || typeof entry !== "object") return
      const normalized = {
        id: String(entry.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
        kind: String(entry.kind || "word"),
        request: String(entry.request || "").trim(),
        meaning: String(entry.meaning || "").trim(),
        category: String(entry.category || "").trim(),
        note: String(entry.note || "").trim(),
        status: String(entry.status || "pending").toLowerCase() === "updated" ? "updated" : "pending",
        ts: Number(entry.ts || Date.now()) || Date.now(),
        updated_at: Number(entry.updated_at || 0) || 0
      }
      if (!normalized.request) return
      const fp = wordSuggestionFingerprint(normalized)
      if (seen.has(fp)) return
      seen.add(fp)
      out.push(normalized)
    })
    return out.slice(0, 300)
  }
  function formatSuggestionTime(ts) {
    try {
      return new Date(ts || Date.now()).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "-"
    }
  }
  function exportWordSuggestions() {
    const list = getWordSuggestions()
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pembelajaran_saran_kata.json"
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  async function loadServerWordSuggestions() {
    const endpoint = apiUrl("word-suggestions")
    if (!endpoint) {
      setWordSuggestions(getLocalWordSuggestionsFallback())
      return getWordSuggestions()
    }
    try {
      const res = await fetch(endpoint, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const items = mergeWordSuggestions([], Array.isArray(raw && raw.items) ? raw.items : [])
      setWordSuggestions(items)
      return items
    } catch {
      const fallback = getLocalWordSuggestionsFallback()
      setWordSuggestions(fallback)
      return fallback
    }
  }
  async function submitWordSuggestion(entry) {
    const normalized = mergeWordSuggestions([], [entry])[0]
    if (!normalized) return false
    const endpoint = apiUrl("word-suggestions")
    if (!endpoint) {
      setWordSuggestions(mergeWordSuggestions(getWordSuggestions(), [normalized]))
      return true
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadServerWordSuggestions()
      return true
    } catch {
      notify("Gagal mengirim saran ke server", "error")
      return false
    }
  }
  async function updateWordSuggestionStatus(itemId, status) {
    const nextStatus = String(status || "pending").toLowerCase() === "updated" ? "updated" : "pending"
    const endpoint = apiUrl("word-suggestions-status")
    if (!endpoint) {
      const items = getWordSuggestions().map(item => item.id === itemId ? Object.assign({}, item, {
        status: nextStatus,
        updated_at: nextStatus === "updated" ? Date.now() : 0
      }) : item)
      setWordSuggestions(items)
      renderWordSuggestions()
      return true
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, status: nextStatus })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadServerWordSuggestions()
      renderWordSuggestions()
      return true
    } catch {
      notify("Gagal memperbarui status saran kata", "error")
      return false
    }
  }
  function renderWordSuggestions() {
    const listEl = document.getElementById("word-suggestion-list")
    const infoEl = document.getElementById("word-suggestion-info")
    const countEl = document.getElementById("word-suggestion-count")
    if (!listEl || !infoEl) return
    const items = getWordSuggestions()
    const pending = items.filter(entry => entry.status !== "updated").length
    if (countEl) countEl.textContent = `${items.length} item`
    infoEl.textContent = items.length
      ? `${pending} belum diproses atau belum dicentang selesai. Developer bisa menandai item yang sudah diupdate langsung dari daftar ini.`
      : "Belum ada saran tersimpan di server. Form ini bisa dipakai user untuk meminta kata, frasa, atau tema baru."
    listEl.innerHTML = ""
    updateSuggestionButtonLabel()
    if (!items.length) return
    items.forEach(entry => {
      const item = document.createElement("div")
      item.className = "suggestion-item"
      const head = document.createElement("div")
      head.className = "suggestion-head"
      const meta = document.createElement("div")
      meta.className = "suggestion-meta"
      meta.textContent = `${entry.kind === "topic" ? "Tema" : entry.kind === "phrase" ? "Frasa" : "Kata"} • ${entry.category || "Tanpa kategori"} • ${formatSuggestionTime(entry.ts)}`
      const badge = document.createElement("span")
      badge.className = `suggestion-badge ${entry.status === "updated" ? "is-updated" : "is-pending"}`
      badge.textContent = entry.status === "updated" ? "Sudah diupdate" : "Belum diproses"
      head.appendChild(meta)
      head.appendChild(badge)
      const body = document.createElement("div")
      body.className = "suggestion-body"
      body.textContent = entry.request
      item.appendChild(head)
      item.appendChild(body)
      if (entry.meaning) {
        const meaning = document.createElement("div")
        meaning.className = "suggestion-extra"
        meaning.textContent = `Arti/arah: ${entry.meaning}`
        item.appendChild(meaning)
      }
      if (entry.note) {
        const note = document.createElement("div")
        note.className = "suggestion-extra"
        note.textContent = `Catatan: ${entry.note}`
        item.appendChild(note)
      }
      const actions = document.createElement("label")
      actions.className = "suggestion-toggle"
      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.checked = entry.status === "updated"
      checkbox.onchange = () => {
        checkbox.disabled = true
        updateWordSuggestionStatus(entry.id, checkbox.checked ? "updated" : "pending")
          .finally(() => { checkbox.disabled = false })
      }
      const labelText = document.createElement("span")
      labelText.textContent = "Developer: tandai sudah diupdate"
      actions.appendChild(checkbox)
      actions.appendChild(labelText)
      item.appendChild(actions)
      listEl.appendChild(item)
    })
  }
  async function loadDataCatalog() {
    try {
      const res = await fetch(appUrl("assets/data/catalog.json"), { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j = parsePossiblyBrokenJsonText(await res.text())
      const categories = Array.isArray(j && j.categories) ? j.categories : []
      const entries = normalizeCatalogEntries(j && j.entries, categories)
      const entryFiles = (j && j.entry_files && typeof j.entry_files === "object") ? j.entry_files : {}
      if (!categories.length) throw new Error("Empty catalog")
      window.DATA = {
        categories,
        entries,
        entryFiles
      }
    } catch (error) {
      console.error("Gagal memuat katalog data", error)
      notify("Gagal memuat katalog data", "error")
    }
  }
  async function loadServerImagesMap() {
    try {
      const res = await fetch(appUrl("assets/user-images/user_images.json"), { cache: "no-store" })
      if (!res.ok) return
      const j = await res.json()
      const next = {}
      Object.keys(j || {}).forEach(key => {
        const value = j[key]
        next[key] = typeof value === "string" ? appUrl(value) : value
      })
      window.USER_IMG_MAP = next
    } catch {}
  }
  async function loadServerAnimals() {
    await loadCatalogCategory("animals")
  }
  async function loadServerVegetables() {
    await loadCatalogCategory("vegetables")
  }
  async function importAnimalsFile(file) {
    try {
      const txt = await file.text()
      let count = 0
      let ok = true
      if (file.name.toLowerCase().endsWith(".json")) {
        const arr = JSON.parse(txt)
        if (!Array.isArray(arr)) ok = false
        else {
          count = arr.length
          ok = arr.every(r => r && (r.en || r.ar || r.id))
        }
      } else {
        const rows = txt.split(/\r?\n/)
        count = Math.max(0, rows.length - 1)
        const header = rows[0] || ""
        ok = /(^|,)(en|ar|id)(,|$)/i.test(header)
      }
      if (!ok) {
        notify("Impor gagal: format file tidak valid", "error")
        return false
      }
      const proceed = window.confirm(`Impor ${count} baris ke Hewan?`)
      if (!proceed) return false
      const endpoint = apiUrl("import-animals")
      if (!endpoint) {
        notifyApiUnavailable("Impor hewan")
        return false
      }
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(endpoint, { method: "POST", body: fd })
      if (!res.ok) {
        notify("Impor hewan gagal di server", "error")
        return false
      }
      await loadServerAnimals()
      renderCategoryOptions()
      renderPhrases()
      notify(`Impor hewan berhasil: ${count} item`, "success")
      return true
    } catch {
      notify("Impor hewan gagal", "error")
      return false
    }
  }
  async function importVegetablesFile(file) {
    try {
      const txt = await file.text()
      let count = 0
      let ok = true
      if (file.name.toLowerCase().endsWith(".json")) {
        const arr = JSON.parse(txt)
        if (!Array.isArray(arr)) ok = false
        else {
          count = arr.length
          ok = arr.every(r => r && (r.en || r.ar || r.id))
        }
      } else {
        const rows = txt.split(/\r?\n/)
        count = Math.max(0, rows.length - 1)
        const header = rows[0] || ""
        ok = /(^|,)(en|ar|id)(,|$)/i.test(header)
      }
      if (!ok) {
        notify("Impor gagal: format file tidak valid", "error")
        return false
      }
      const proceed = window.confirm(`Impor ${count} baris ke Sayur?`)
      if (!proceed) return false
      const endpoint = apiUrl("import-vegetables")
      if (!endpoint) {
        notifyApiUnavailable("Impor sayur")
        return false
      }
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(endpoint, { method: "POST", body: fd })
      if (!res.ok) {
        notify("Impor sayur gagal di server", "error")
        return false
      }
      await loadServerVegetables()
      renderCategoryOptions()
      renderPhrases()
      notify(`Impor sayur berhasil: ${count} item`, "success")
      return true
    } catch {
      notify("Impor sayur gagal", "error")
      return false
    }
  }
  async function importLocalDataFile(file) {
    try {
      const raw = JSON.parse(await file.text())
      if (!raw || typeof raw !== "object") throw new Error("invalid")
      const edits = raw.edits && typeof raw.edits === "object" ? raw.edits : {}
      const images = raw.images && typeof raw.images === "object" ? raw.images : {}
      const wordSuggestions = Array.isArray(raw.wordSuggestions) ? raw.wordSuggestions : []
      const favoriteKeys = raw.favoriteKeys && typeof raw.favoriteKeys === "object" ? raw.favoriteKeys : {}
      const importedSrs = raw.srs && typeof raw.srs === "object" ? raw.srs : {}
      saveEdits(Object.assign({}, getEdits(), edits))
      setUserImages(Object.assign({}, getUserImages(), images))
      setWordSuggestions(mergeWordSuggestions(getWordSuggestions(), wordSuggestions))
      state.favoriteKeys = Object.assign({}, state.favoriteKeys || {}, favoriteKeys)
      Object.keys(importedSrs).forEach(k => {
        state.srs[k] = Object.assign({}, defaultSrsEntry, importedSrs[k] || {})
      })
      if (raw.prefs && typeof raw.prefs === "object") {
        if (raw.prefs.audioRate) state.audioRate = Number(raw.prefs.audioRate) || 1
        if (raw.prefs.audioPitch) state.audioPitch = Number(raw.prefs.audioPitch) || 1
        if (raw.prefs.dailyGoal) state.dailyGoal = Math.max(1, Math.min(100, Number(raw.prefs.dailyGoal) || 10))
        if (raw.prefs.studyFilter) state.studyFilter = ["all", "favorites", "hard", "new", "strong"].includes(raw.prefs.studyFilter) ? raw.prefs.studyFilter : "all"
        if (raw.prefs.focusMode !== undefined) {
          localStorage.setItem("pembelajar_focus", raw.prefs.focusMode ? "1" : "0")
        }
        if (raw.prefs.quiz && typeof raw.prefs.quiz === "object") {
          state.quiz.timerEnabled = !!raw.prefs.quiz.timerEnabled
          state.quiz.timerSecs = Number(raw.prefs.quiz.timerSecs || 30) || 30
          state.quiz.freePractice = !!raw.prefs.quiz.freePractice
          state.quiz.reviewOnly = !!raw.prefs.quiz.reviewOnly
        }
      }
      saveState()
      const focusOn = localStorage.getItem("pembelajar_focus") === "1"
      syncFocusModeUI(focusOn)
      const rateSel = document.getElementById("audio-rate")
      if (rateSel) rateSel.value = String(state.audioRate || 1)
      const pitchSel = document.getElementById("audio-pitch")
      if (pitchSel) pitchSel.value = String(state.audioPitch || 1)
      const goalSel = document.getElementById("daily-goal")
      if (goalSel) goalSel.value = String(state.dailyGoal || 10)
      const filterSel = document.getElementById("study-filter")
      if (filterSel) filterSel.value = String(state.studyFilter || "all")
      const timerBtn = document.getElementById("quiz-timer")
      if (timerBtn) timerBtn.setAttribute("aria-pressed", state.quiz.timerEnabled ? "true" : "false")
      const freeBtn = document.getElementById("quiz-free")
      if (freeBtn) freeBtn.setAttribute("aria-pressed", state.quiz.freePractice ? "true" : "false")
      const reviewBtn = document.getElementById("quiz-review")
      if (reviewBtn) reviewBtn.setAttribute("aria-pressed", state.quiz.reviewOnly ? "true" : "false")
      const timerSel = document.getElementById("quiz-timer-secs")
      if (timerSel) timerSel.value = String(state.quiz.timerSecs || 30)
      renderWordSuggestions()
      applyUserEdits()
      await rebuildLexiconAsync()
      renderCard()
      renderQuiz()
      renderPhrases()
      notify("Data lokal berhasil diimpor", "success")
      return true
    } catch {
      notify("Impor data lokal gagal", "error")
      return false
    }
  }
  function setUserImages(obj) {
    try {
      localStorage.setItem("pembelajar_images", JSON.stringify(obj))
    } catch {
      if (voiceResultEl) voiceResultEl.textContent = "Gagal menyimpan gambar (penyimpanan penuh)."
    }
  }
  function getUserImage(it) {
    const key = imageKey(it)
    const server = (window.USER_IMG_MAP && window.USER_IMG_MAP[key]) || ""
    if (server) return server
    const map = getUserImages()
    return map[key] || ""
  }
  function setUserImage(it, dataUrl) {
    const map = getUserImages()
    map[imageKey(it)] = dataUrl
    setUserImages(map)
  }
  function setServerImage(it, url) {
    const key = imageKey(it)
    if (!window.USER_IMG_MAP) window.USER_IMG_MAP = {}
    window.USER_IMG_MAP[key] = url
  }
  async function uploadImageToServer(it, file, override) {
    try {
      const fd = new FormData()
      fd.append("file", file)
      const en = override && override.en !== undefined ? override.en : (it.en || "")
      const ar = override && override.ar !== undefined ? override.ar : (it.ar || "")
      const idv = override && override.id !== undefined ? override.id : (it.id || "")
      fd.append("en", en)
      fd.append("ar", ar)
      fd.append("id", idv)
      const key = imageKey({ en, ar, id: idv })
      const prev = (window.USER_IMG_MAP && window.USER_IMG_MAP[key]) || ""
      if (prev) fd.append("prev", prev)
      const endpoint = apiUrl("upload")
      if (!endpoint) return ""
      const res = await fetch(endpoint, { method: "POST", body: fd })
      if (!res.ok) {
        notify("Unggah gambar ditolak server", "error")
        return ""
      }
      const j = await res.json()
      return j && j.url ? j.url : ""
    } catch {
      notify("Unggah gambar gagal", "error")
      return ""
    }
  }
  function uploadImageFor(it, onSaved) {
    const inp = document.createElement("input")
    inp.type = "file"
    inp.accept = "image/*"
    inp.onchange = e => {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      ;(async () => {
        async function compressImage(file) {
          return new Promise(resolve => {
            try {
              const img = new Image()
              const reader = new FileReader()
              reader.onload = () => {
                img.onload = () => {
                  const maxW = 512
                  const scale = Math.min(1, maxW / img.width)
                  const w = Math.round(img.width * scale)
                  const h = Math.round(img.height * scale)
                  const canvas = document.createElement("canvas")
                  canvas.width = w; canvas.height = h
                  const ctx = canvas.getContext("2d")
                  ctx.drawImage(img, 0, 0, w, h)
                  canvas.toBlob(b => resolve(b || file), "image/jpeg", 0.8)
                }
                img.src = reader.result
              }
              reader.readAsDataURL(file)
            } catch { resolve(file) }
          })
        }
        const blob = await compressImage(f)
        const url = await uploadImageToServer(it, blob)
        if (url) {
          setServerImage(it, url)
          notify("Gambar berhasil diunggah", "success")
          if (onSaved) onSaved()
        } else {
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result
            if (dataUrl) {
              setUserImage(it, String(dataUrl))
              notify("Gambar disimpan lokal", "info")
              if (onSaved) onSaved()
            }
          }
          reader.readAsDataURL(f)
        }
      })()
    }
    inp.click()
  }
  function openViewer(it) {
    const src = getUserImage(it) || it.img
    if (!src || !viewer || !viewerImg) return
    viewerItem = it
    viewerImg.src = src
    viewer.hidden = false
  }
  function ensureCustomCategory() {
    if (!DATA.categories.some(c => c.id === "custom")) {
      DATA.categories.push({ id: "custom", name: "Kosakata Tambahan" })
    }
    const cur = getCustomEntries()
    DATA.entries.custom = cur
  }
  function editsKey(it) {
    const en = (it.en || "").toLowerCase().trim()
    const ar = (it.ar || "").toLowerCase().trim()
    const idv = (it.id || "").toLowerCase().trim()
    return `${en}|${ar}|${idv}`
  }
  function getEdits() {
    try {
      const raw = localStorage.getItem("pembelajar_edits") || "{}"
      const obj = JSON.parse(raw)
      return obj && typeof obj === "object" ? obj : {}
    } catch { return {} }
  }
  function saveEdits(obj) {
    try { localStorage.setItem("pembelajar_edits", JSON.stringify(obj)) } catch {}
  }
  function setEdit(it, override) {
    const map = getEdits()
    map[editsKey(it)] = Object.assign({}, override)
    saveEdits(map)
  }
  function applyUserEdits() {
    const map = getEdits()
    Object.keys(DATA.entries).forEach(cat => {
      const arr = DATA.entries[cat] || []
      arr.forEach(it => {
        const ov = map[editsKey(it)]
        if (ov) {
          if (ov.en !== undefined) it.en = ov.en
          if (ov.ar !== undefined) it.ar = ov.ar
          if (ov.id !== undefined) it.id = ov.id
          if (ov.emoji !== undefined) it.emoji = ov.emoji
        }
      })
    })
  }
  function renderAddPanel(words, src) {
    if (!tAdd) return
    tAdd.innerHTML = ""
    if (!words.length) return
    const hdr = document.createElement("div")
    hdr.className = "translate-info"
    hdr.textContent = "Kata baru tidak ditemukan. Lengkapi terjemahan lalu simpan ke kamus:"
    tAdd.appendChild(hdr)
    const rows = []
    words.forEach(w => {
      const row = document.createElement("div")
      row.className = "add-row"
      const enI = document.createElement("input")
      enI.className = "add-field"
      enI.placeholder = "EN"
      const arI = document.createElement("input")
      arI.className = "add-field"
      arI.placeholder = "AR"
      arI.dir = "rtl"
      const idI = document.createElement("input")
      idI.className = "add-field"
      idI.placeholder = "ID"
      const imgI = document.createElement("input")
      imgI.className = "add-field"
      imgI.placeholder = "Gambar URL (opsional)"
      if (src === "en") enI.value = w
      else if (src === "id") idI.value = w
      else if (src === "ar") { arI.value = w; arI.dir = "rtl" }
      const enSug = document.createElement("div")
      enSug.className = "suggest-list"
      const arSug = document.createElement("div")
      arSug.className = "suggest-list"
      const idSug = document.createElement("div")
      idSug.className = "suggest-list"
      function makeSuggest(lang, val, el, fillAll) {
        el.innerHTML = ""
        const v = (val || "").trim()
        if (!v) return
        const srcKeys = lang === "en" ? Array.from(LEX.en.keys()) : lang === "ar" ? Array.from(LEX.ar.keys()) : Array.from(LEX.id.keys())
        const isAr = lang === "ar"
        const q = normalize(v, isAr)
        const scored = []
        for (let k of srcKeys) {
          const s = similarity(q, k)
          if (k.includes(q) || s >= 0.8) {
            const it = lang === "en" ? LEX.en.get(k) : lang === "ar" ? LEX.ar.get(k) : LEX.id.get(k)
            if (!it) continue
            const text = lang === "en" ? it.en : lang === "ar" ? it.ar : it.id
            if (!text) continue
            scored.push({ it, text, s })
          }
        }
        scored.sort((a, b) => b.s - a.s)
        const top = scored.slice(0, 5)
        top.forEach(x => {
          const itemEl = document.createElement("div")
          itemEl.className = "suggest-item"
          itemEl.textContent = x.text
          itemEl.onclick = () => {
            const it = x.it
            if (fillAll) {
              enI.value = it.en || enI.value
              arI.value = it.ar || arI.value
              idI.value = it.id || idI.value
              enSug.innerHTML = ""
              arSug.innerHTML = ""
              idSug.innerHTML = ""
            }
          }
          el.appendChild(itemEl)
        })
      }
      enI.addEventListener("input", () => makeSuggest("en", enI.value, enSug, true))
      arI.addEventListener("input", () => makeSuggest("ar", arI.value, arSug, true))
      idI.addEventListener("input", () => makeSuggest("id", idI.value, idSug, true))
      const del = document.createElement("button")
      del.className = "ghost"
      del.textContent = "Hapus"
      del.onclick = () => {
        row.remove()
      }
      row.appendChild(enI)
      row.appendChild(arI)
      row.appendChild(idI)
      row.appendChild(imgI)
      const upBtn = document.createElement("button")
      upBtn.className = "ghost"
      upBtn.textContent = "Upload"
      upBtn.onclick = () => {
        const inp = document.createElement("input")
        inp.type = "file"
        inp.accept = "image/*"
        inp.onchange = e => {
          const f = e.target.files && e.target.files[0]
          if (!f) return
          ;(async () => {
            const url = await uploadImageToServer({ en: enI.value, ar: arI.value, id: idI.value }, f, { en: enI.value, ar: arI.value, id: idI.value })
            if (url) {
              imgI.value = url
            } else {
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = reader.result
                if (dataUrl) imgI.value = String(dataUrl)
              }
              reader.readAsDataURL(f)
            }
          })()
        }
        inp.click()
      }
      row.appendChild(upBtn)
      row.appendChild(del)
      const sugWrap = document.createElement("div")
      sugWrap.style.gridColumn = "1 / -1"
      const label = document.createElement("div")
      label.className = "translate-info"
      label.textContent = "Saran terjemahan:"
      sugWrap.appendChild(label)
      const sugGrid = document.createElement("div")
      sugGrid.style.display = "grid"
      sugGrid.style.gridTemplateColumns = "1fr 1fr 1fr"
      sugGrid.style.gap = "8px"
      sugGrid.appendChild(enSug)
      sugGrid.appendChild(arSug)
      sugGrid.appendChild(idSug)
      sugWrap.appendChild(sugGrid)
      rows.push({ enI, arI, idI, imgI })
      tAdd.appendChild(row)
      tAdd.appendChild(sugWrap)
    })
    const act = document.createElement("div")
    act.className = "translate-row"
    const saveAll = document.createElement("button")
    saveAll.className = "primary"
    saveAll.textContent = "Simpan ke Kamus"
    saveAll.onclick = () => {
      const cur = getCustomEntries()
      rows.forEach(r => {
        const enV = r.enI.value.trim()
        const arV = r.arI.value.trim()
        const idV = r.idI.value.trim()
        const imgV = r.imgI.value.trim()
        if (enV || arV || idV) {
          const entry = { en: enV, ar: arV, id: idV }
          if (imgV) entry.img = imgV
          cur.unshift(entry)
        }
      })
      setCustomEntries(cur.slice(0, 500))
      renderCategoryOptions()
      if (tInput && tInput.value) translateText(tInput.value)
      tAdd.innerHTML = ""
      renderPhrases()
    }
    const clearBtn = document.createElement("button")
    clearBtn.className = "ghost"
    clearBtn.textContent = "Batal"
    clearBtn.onclick = () => { tAdd.innerHTML = "" }
    act.appendChild(saveAll)
    act.appendChild(clearBtn)
    tAdd.appendChild(act)
  }
  function setTranslateHistory(arr) {
    localStorage.setItem("pembelajar_translate_history", JSON.stringify(arr.slice(0, 10)))
  }
  function renderTranslateHistory() {
    if (!tHistory) return
    const arr = getTranslateHistory()
    tHistory.innerHTML = ""
    arr.forEach((h, idx) => {
      const div = document.createElement("div")
      div.className = "history-item"
      const lang = document.createElement("div")
      lang.className = "lang"
      lang.textContent = `Sumber: ${h.src.toUpperCase()}`
      const input = document.createElement("div")
      input.className = "text"
      input.textContent = h.input
      const out = document.createElement("div")
      out.className = "text"
      out.textContent = `EN: ${h.en} • AR: ${h.ar} • ID: ${h.id}`
      div.appendChild(lang)
      div.appendChild(input)
      div.appendChild(out)
      div.onclick = () => {
        if (tInput) {
          tInput.value = h.input
          translateText(h.input)
        }
      }
      tHistory.appendChild(div)
    })
  }
  function getDisplayCategoryId(categoryId) {
    return CATEGORY_GROUP_BY_MEMBER[categoryId] || categoryId || ""
  }
  function getCategoryMemberIds(categoryId) {
    const group = CATEGORY_GROUPS[categoryId]
    return group ? group.members.slice() : [categoryId]
  }
  function getDisplayCategories() {
    const out = []
    const added = new Set()
    ;(Array.isArray(DATA.categories) ? DATA.categories : []).forEach(category => {
      const displayId = getDisplayCategoryId(category && category.id)
      if (!displayId || added.has(displayId)) return
      if (CATEGORY_GROUPS[displayId]) {
        out.push({ id: displayId, name: CATEGORY_GROUPS[displayId].name })
      } else {
        out.push(category)
      }
      added.add(displayId)
    })
    return out
  }
  function renderCategoryOptions() {
    categorySel.innerHTML = ""
    const allOpt = document.createElement("option")
    allOpt.value = "__all"
    allOpt.textContent = "Semua Kategori"
    if (state.category === "__all") allOpt.selected = true
    categorySel.appendChild(allOpt)
    getDisplayCategories().forEach(c => {
      const opt = document.createElement("option")
      opt.value = c.id
      opt.textContent = c.name
      if (c.id === state.category) opt.selected = true
      categorySel.appendChild(opt)
    })
  }
  function flattenAllItems() {
    const all = []
    Object.keys(DATA.entries).forEach(cat => {
      const arr = DATA.entries[cat] || []
      arr.forEach(it => all.push(it))
    })
    return all
  }
  function getItemsByCategoryId(categoryId) {
    if (!categoryId || categoryId === "__all") return flattenAllItems()
    return getCategoryMemberIds(categoryId).flatMap(id => DATA.entries[id] || [])
  }
  function getStudyItems() {
    return applyStudyFilter(getStudyItemsBase())
  }
  function getCategoryLabel() {
    if (state.category === "__all") return "Semua Kategori"
    const found = getDisplayCategories().find(c => c.id === state.category)
    return found ? found.name : state.category
  }
  function hasStudyScope() {
    return !!(STUDY_SCOPE_KEYS && STUDY_SCOPE_KEYS.size)
  }
  function setStudyScope(mode, items, label) {
    const keys = Array.from(new Set((items || []).map(it => srsKey(it)).filter(Boolean)))
    STUDY_SCOPE_MODE = mode || "all"
    STUDY_SCOPE_KEYS = keys.length ? new Set(keys) : null
    STUDY_SCOPE_LABEL = keys.length ? (label || "Fokus belajar") : ""
    state.cardIndex = 0
    state.phrasesPage = 0
    saveState()
  }
  function clearStudyScope() {
    STUDY_SCOPE_MODE = "all"
    STUDY_SCOPE_KEYS = null
    STUDY_SCOPE_LABEL = ""
    state.cardIndex = 0
    state.phrasesPage = 0
    saveState()
  }
  function activateStudyScope(mode, items, label, tabId, reviewOnly) {
    setStudyScope(mode, items, label)
    if (mode === "quiz-recovery") {
      const keys = Array.from(new Set((items || []).map(it => srsKey(it)).filter(Boolean)))
      if (keys.length) {
        localStorage.setItem(LAST_RECOVERY_KEY, JSON.stringify({
          keys,
          category: state.category,
          label: label || `Pemulihan salah (${keys.length} item)`,
          ts: Date.now()
        }))
      }
    }
    state.quiz.reviewOnly = !!reviewOnly
    saveState()
    if (tabId) activateTab(tabId)
    refreshStudyViews()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function getStudyScopeTone() {
    if (STUDY_SCOPE_MODE === "quiz-recovery") return "study-mode-danger"
    if (STUDY_SCOPE_MODE === "urgent-session") return "study-mode-warn"
    return "study-mode-neutral"
  }
  function getQuizSessionMetrics(items) {
    const total = (items || []).length
    const attempted = QUIZ_SESSION_KEYS.size
    const wrong = QUIZ_SESSION_WRONG_KEYS.size
    return {
      total,
      attempted,
      wrong,
      remaining: Math.max(0, total - attempted)
    }
  }
  function getStudySessionGoal(total) {
    const size = Math.max(0, Number(total || 0))
    if (!size) return 0
    if (STUDY_SCOPE_MODE === "quiz-recovery") return size
    if (STUDY_SCOPE_MODE === "urgent-session") return Math.min(5, size)
    if (STUDY_SCOPE_MODE === "hard") return Math.min(12, size)
    return Math.min(10, size)
  }
  function getStudySessionStatus(items) {
    const metrics = getQuizSessionMetrics(items)
    const goal = getStudySessionGoal(metrics.total)
    const completed = goal ? Math.min(metrics.attempted, goal) : 0
    return {
      metrics,
      goal,
      completed,
      done: goal > 0 && completed >= goal
    }
  }
  function getCategoryNameById(categoryId) {
    if (!categoryId) return "Lainnya"
    if (categoryId === "__all") return "Semua Kategori"
    const found = getDisplayCategories().find(c => c.id === categoryId)
    return found ? found.name : categoryId
  }
  function getStudyCategorySummary(items) {
    const counts = new Map()
    ;(items || []).forEach(item => {
      const categoryId = getItemCategoryId(item) || "unknown"
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([id, count]) => ({ id, label: getCategoryNameById(id), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }
  function getStudyCategoryStatus(items) {
    const day = 24 * 60 * 60 * 1000
    const now = Date.now()
    const grouped = new Map()
    ;(items || []).forEach(item => {
      const id = getItemCategoryId(item) || "unknown"
      const current = grouped.get(id) || {
        id,
        label: getCategoryNameById(id),
        total: 0,
        practiced: 0,
        recentWrong: 0,
        attempted: 0
      }
      current.total += 1
      const srs = ensureSRS(item)
      if (srs.attempts) current.practiced += 1
      if (srs.lastWrong && (now - srs.lastWrong) < day) current.recentWrong += 1
      if (QUIZ_SESSION_KEYS.has(srsKey(item))) current.attempted += 1
      grouped.set(id, current)
    })
    return Array.from(grouped.values())
      .map(entry => ({
        ...entry,
        remaining: Math.max(0, entry.total - (hasStudyScope() ? entry.attempted : entry.practiced)),
        done: entry.total > 0 && (hasStudyScope() ? entry.attempted >= entry.total : entry.practiced >= entry.total)
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))
  }
  function getActiveTabId() {
    const active = tabs.find(tab => tab.classList.contains("active"))
    return (active && active.dataset && active.dataset.tab) || "cards"
  }
  function filterDashboardCategory(categoryId) {
    if (!categoryId || categoryId === "__all") return
    const targetLabel = getCategoryNameById(categoryId)
    const activeTab = getActiveTabId()
    if (hasStudyScope()) {
      const scopedItems = getStudyItems().filter(item => getItemCategoryId(item) === categoryId)
      if (scopedItems.length) {
        activateStudyScope(STUDY_SCOPE_MODE, scopedItems, `${STUDY_SCOPE_LABEL} • ${targetLabel}`, activeTab, state.quiz.reviewOnly)
        return
      }
    }
    state.category = categoryId
    state.cardIndex = 0
    state.flipped = false
    state.phrasesPage = 0
    if (!hasStudyScope()) resetQuizSessionState()
    saveState()
    refreshStudyViews()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function getSessionRemainingLabel(metrics, reviewOnly) {
    if (!metrics || !metrics.total) return ""
    return reviewOnly ? `Sisa ${metrics.remaining} item review` : `Sisa ${metrics.remaining} item sesi`
  }
  function getStudySessionHistory(limit) {
    try {
      const raw = localStorage.getItem(LAST_SESSION_HISTORY_KEY)
      const arr = raw ? JSON.parse(raw) : []
      const normalized = Array.isArray(arr)
        ? arr.filter(entry => entry && entry.label && entry.total && entry.ts)
          .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))
        : []
      return typeof limit === "number" ? normalized.slice(0, limit) : normalized
    } catch {
      return []
    }
  }
  function getStudySessionItemsFromSummary(summary) {
    if (!summary || !Array.isArray(summary.keys) || !summary.keys.length) return []
    const lookup = new Map()
    flattenAllItems().forEach(it => {
      const key = srsKey(it)
      if (key && !lookup.has(key)) lookup.set(key, it)
    })
    return summary.keys.map(key => lookup.get(key)).filter(Boolean)
  }
  function getWeakCategoryHistory(limit) {
    const history = getStudySessionHistory(limit)
    const grouped = new Map()
    history.forEach(entry => {
      const id = entry && entry.category ? entry.category : ""
      if (!id) return
      const current = grouped.get(id) || {
        id,
        label: getCategoryNameById(id),
        sessions: 0,
        attempted: 0,
        wrong: 0,
        accuracyTotal: 0
      }
      current.sessions += 1
      current.attempted += Number(entry.attempted || 0)
      current.wrong += Number(entry.wrong || 0)
      current.accuracyTotal += Number(entry.accuracy || 0)
      grouped.set(id, current)
    })
    return Array.from(grouped.values())
      .map(entry => ({
        ...entry,
        accuracyAvg: entry.sessions ? Math.round(entry.accuracyTotal / entry.sessions) : 0
      }))
      .sort((a, b) => a.accuracyAvg - b.accuracyAvg || b.wrong - a.wrong || b.sessions - a.sessions)
  }
  function getUrgentStudyItems(limit, categoryId) {
    const now = Date.now()
    return getItemsByCategoryId(categoryId || state.category)
      .map(item => ({ item, urgency: getSrsUrgency(ensureSRS(item), now) }))
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, limit || 5)
      .map(entry => entry.item)
  }
  function getStudyDailyMomentum(limit) {
    const grouped = new Map()
    getStudySessionHistory(Math.max(6, (limit || 5) * 3)).forEach(entry => {
      const dt = new Date(Number(entry.ts || 0))
      const key = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
      const current = grouped.get(key) || {
        key,
        label: dt.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" }),
        sessions: 0,
        attempted: 0,
        wrong: 0,
        accuracyTotal: 0
      }
      current.sessions += 1
      current.attempted += Number(entry.attempted || 0)
      current.wrong += Number(entry.wrong || 0)
      current.accuracyTotal += Number(entry.accuracy || 0)
      grouped.set(key, current)
    })
    return Array.from(grouped.values())
      .map(entry => ({
        ...entry,
        accuracyAvg: entry.sessions ? Math.round(entry.accuracyTotal / entry.sessions) : 0
      }))
      .sort((a, b) => b.key - a.key)
      .slice(0, limit || 5)
  }
  function getAdaptiveWeakCategoryPlan(limit) {
    const weakest = getWeakCategoryHistory(6)[0]
    if (!weakest || !weakest.id) return null
    const now = Date.now()
    const items = getItemsByCategoryId(weakest.id)
      .map(item => {
        const entry = ensureSRS(item)
        const score = getSrsUrgency(entry, now) + ((entry.level || 1) <= 2 ? 500 : 0) + (entry.lastWrong ? 300 : 0)
        return { item, entry, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 6)
      .map(entry => entry.item)
    if (!items.length) return null
    return {
      category: weakest.id,
      label: `Sesi adaptif ${weakest.label} (${items.length} item)`,
      items
    }
  }
  function getStudyRecommendation() {
    const recentErrors = getRecentQuizErrors()
    const lastSession = getLastStudySessionSummary()
    const adaptivePlan = getAdaptiveWeakCategoryPlan(6)
    const urgentItems = getUrgentStudyItems(5)
    if (state.quiz.reviewOnly) {
      return {
        title: "Review 24 jam sedang aktif",
        meta: "Tuntaskan item salah terlebih dahulu sebelum memulai fokus baru.",
        tone: "study-neutral",
        actionLabel: "Lanjut Review",
        action: () => {
          activateTab("quiz")
          refreshStudyViews()
        }
      }
    }
    if (recentErrors.length >= 4) {
      return {
        title: "Prioritaskan review terlebih dahulu",
        meta: `${recentErrors.length} item salah dalam 24 jam terakhir lebih penting daripada membuka fokus baru.`,
        tone: "study-danger",
        actionLabel: "Masuk Review 24 Jam",
        action: () => openRecentQuizReview()
      }
    }
    if (lastSession && lastSession.accuracy < 70) {
      return {
        title: "Ulangi sesi terakhir",
        meta: `Akurasi sesi terakhir ${lastSession.accuracy}% masih rendah, sebaiknya ulangi sebelum lanjut ke sesi baru.`,
        tone: "study-warn",
        actionLabel: "Ulangi di Kuis",
        action: () => reopenLastStudySession("quiz")
      }
    }
    if (adaptivePlan) {
      return {
        title: "Lanjutkan sesi adaptif",
        meta: `Kategori ${getCategoryNameById(adaptivePlan.category)} sedang paling lemah pada riwayat terbaru.`,
        tone: "study-neutral",
        actionLabel: "Mulai Sesi Adaptif",
        action: () => openAdaptiveWeakCategorySession("quiz")
      }
    }
    if (urgentItems.length) {
      return {
        title: "Siap mulai fokus baru",
        meta: `${urgentItems.length} item paling urgent siap dibuka untuk menjaga momentum belajar.`,
        tone: "study-good",
        actionLabel: "Buka Sesi Urgent",
        action: () => activateStudyScope("urgent-session", urgentItems, `Sesi urgent (${urgentItems.length} item)`, "quiz", false)
      }
    }
    return null
  }
  function getLastStudySessionSummary() {
    try {
      const raw = localStorage.getItem(LAST_SESSION_SUMMARY_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || !parsed.label || !parsed.total) return null
      return parsed
    } catch {
      return null
    }
  }
  function saveLastStudySessionSummary(items) {
    if (!(items || []).length) return null
    const attempted = QUIZ_SESSION_KEYS.size
    const wrong = QUIZ_SESSION_WRONG_KEYS.size
    const correct = Math.max(0, attempted - wrong)
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0
    const avgMs = attempted ? Math.round(QUIZ_SESSION_ELAPSED_TOTAL / attempted) : 0
    const summary = {
      label: STUDY_SCOPE_LABEL || `Sesi fokus (${items.length} item)`,
      mode: STUDY_SCOPE_MODE,
      category: state.category,
      keys: Array.from(new Set((QUIZ_SESSION_ITEMS || []).map(it => srsKey(it)).filter(Boolean))),
      total: items.length,
      attempted,
      correct,
      wrong,
      accuracy,
      avgMs,
      ts: Date.now()
    }
    localStorage.setItem(LAST_SESSION_SUMMARY_KEY, JSON.stringify(summary))
    const history = [summary].concat(getStudySessionHistory()).slice(0, 6)
    localStorage.setItem(LAST_SESSION_HISTORY_KEY, JSON.stringify(history))
    return summary
  }
  function resetDashboardCategoryToAll() {
    if (state.category === "__all") return
    state.category = "__all"
    state.cardIndex = 0
    state.flipped = false
    state.phrasesPage = 0
    if (!hasStudyScope()) resetQuizSessionState()
    saveState()
    if (categorySel) categorySel.value = "__all"
    refreshStudyViews()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function reopenLastStudySession(tabId) {
    const summary = getLastStudySessionSummary()
    const items = getStudySessionItemsFromSummary(summary)
    if (!summary || !items.length) return false
    if (summary.category && summary.category !== state.category) {
      state.category = summary.category
      if (categorySel) categorySel.value = summary.category
    }
    activateStudyScope(summary.mode || "repeat-session", items, summary.label || `Sesi fokus (${items.length} item)`, tabId || "quiz", false)
    return true
  }
  function openAdaptiveWeakCategorySession(tabId) {
    const plan = getAdaptiveWeakCategoryPlan(6)
    if (!plan || !plan.items.length) return false
    if (plan.category && plan.category !== state.category) {
      state.category = plan.category
      if (categorySel) categorySel.value = plan.category
    }
    activateStudyScope("adaptive-weak-category", plan.items, plan.label, tabId || "quiz", false)
    return true
  }
  function openRecentQuizReview() {
    const recentErrors = getRecentQuizErrors()
    if (!recentErrors.length) return false
    openStudyReview(recentErrors, [])
    return true
  }
  function toggleRecentQuizReview() {
    if (state.quiz.reviewOnly) {
      state.quiz.reviewOnly = false
      saveState()
      refreshStudyViews()
      notify("Mode review 24 jam dimatikan")
      return true
    }
    const opened = openRecentQuizReview()
    if (opened) notify("Mode review 24 jam diaktifkan")
    return opened
  }
  function ensureStudyModeBanner(panelName) {
    const id = `study-mode-banner-${panelName}`
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement("div")
      el.id = id
      el.className = "study-mode-banner"
      if (panelName === "cards") panels.cards.insertBefore(el, document.getElementById("flashcard"))
      else if (panelName === "quiz") {
        const wrap = document.querySelector("#tab-quiz .quiz-wrap") || panels.quiz
        wrap.insertBefore(el, quizQ)
      } else {
        const controls = document.getElementById("phrases-controls")
        if (controls) panels.phrases.insertBefore(el, controls)
        else panels.phrases.insertBefore(el, phrasesList)
      }
    }
    return el
  }
  function renderStudyModeBanner(panelName, items) {
    const hasFocus = hasStudyScope()
    const hasReview = panelName === "quiz" && state.quiz.reviewOnly
    const lastRecovery = panelName === "phrases" ? getStoredRecoveryScope() : null
    const host = ensureStudyModeBanner(panelName)
    if (!hasFocus && !hasReview && !lastRecovery) {
      host.hidden = true
      host.innerHTML = ""
      return
    }
    const session = getStudySessionStatus(items)
    const metrics = session.metrics
    host.hidden = false
    host.className = `study-mode-banner ${hasFocus ? getStudyScopeTone() : "study-mode-neutral"}`
    host.innerHTML = ""
    const head = document.createElement("div")
    head.className = "study-mode-head"
    const title = document.createElement("div")
    title.className = "study-mode-title"
    title.textContent = hasFocus
      ? STUDY_SCOPE_LABEL
      : hasReview
        ? "Review Kesalahan 24 Jam Aktif"
        : "Recovery Terakhir"
    const meta = document.createElement("div")
    meta.className = "study-mode-meta"
    const parts = []
    if (hasFocus) {
      parts.push(`${metrics.total} item dalam fokus`)
      parts.push(`Progres ${metrics.attempted}/${metrics.total}`)
      parts.push(getSessionRemainingLabel(metrics, false))
      if (session.goal) parts.push(`Target ${session.completed}/${session.goal}`)
      if (session.done) parts.push("Target sesi selesai")
      if (metrics.wrong) parts.push(`${metrics.wrong} perlu pemulihan`)
      else if (metrics.attempted) parts.push("Belum ada kesalahan pada sesi ini")
    } else if (hasReview) {
      parts.push(`${metrics.total} item siap direview`)
      parts.push(getSessionRemainingLabel(metrics, true))
      parts.push("Hanya item salah dalam 24 jam terakhir")
    } else if (lastRecovery) {
      parts.push(`${lastRecovery.items.length} item recovery siap dilanjutkan`)
      parts.push(lastRecovery.label)
    }
    meta.textContent = parts.filter(Boolean).join(" • ")
    head.appendChild(title)
    head.appendChild(meta)
    host.appendChild(head)
    const actions = document.createElement("div")
    actions.className = "study-mode-actions"
    if (hasFocus) {
      const swapBtn = document.createElement("button")
      swapBtn.className = "ghost"
      swapBtn.textContent = panelName === "cards" ? "Latih di Kuis" : "Buka Kartu"
      swapBtn.onclick = () => {
        activateTab(panelName === "cards" ? "quiz" : "cards")
        refreshStudyViews()
      }
      actions.appendChild(swapBtn)
      if (panelName === "phrases") {
        const quizBtn = document.createElement("button")
        quizBtn.className = "ghost"
        quizBtn.textContent = "Latih di Kuis"
        quizBtn.onclick = () => {
          activateTab("quiz")
          refreshStudyViews()
        }
        actions.appendChild(quizBtn)
      }
      const resetBtn = document.createElement("button")
      resetBtn.className = "ghost"
      resetBtn.textContent = "Tampilkan Semua"
      resetBtn.onclick = () => {
        clearStudyScope()
        if (panelName === "quiz") state.quiz.reviewOnly = false
        saveState()
        refreshStudyViews()
      }
      actions.appendChild(resetBtn)
    } else if (hasReview) {
      const exitBtn = document.createElement("button")
      exitBtn.className = "ghost"
      exitBtn.textContent = "Keluar Review"
      exitBtn.onclick = () => {
        state.quiz.reviewOnly = false
        saveState()
        renderQuiz()
      }
      actions.appendChild(exitBtn)
    } else if (lastRecovery) {
      const recoveryBtn = document.createElement("button")
      recoveryBtn.className = "primary"
      recoveryBtn.textContent = "Lanjut Recovery"
      recoveryBtn.onclick = () => reopenStoredRecovery("quiz")
      actions.appendChild(recoveryBtn)
      const cardsBtn = document.createElement("button")
      cardsBtn.className = "ghost"
      cardsBtn.textContent = "Buka di Kartu"
      cardsBtn.onclick = () => reopenStoredRecovery("cards")
      actions.appendChild(cardsBtn)
    }
    host.appendChild(actions)
  }
  function getStoredRecoveryScope() {
    try {
      const raw = localStorage.getItem(LAST_RECOVERY_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || !Array.isArray(parsed.keys) || !parsed.keys.length) return null
      const lookup = new Map()
      flattenAllItems().forEach(it => {
        const key = srsKey(it)
        if (key && !lookup.has(key)) lookup.set(key, it)
      })
      const items = parsed.keys.map(key => lookup.get(key)).filter(Boolean)
      if (!items.length) return null
      return {
        items,
        category: parsed.category || state.category,
        label: parsed.label || `Pemulihan salah (${items.length} item)`,
        ts: Number(parsed.ts || 0)
      }
    } catch {
      return null
    }
  }
  function reopenStoredRecovery(tabId) {
    const snap = getStoredRecoveryScope()
    if (!snap) return
    if (snap.category && snap.category !== state.category) state.category = snap.category
    activateStudyScope("quiz-recovery", snap.items, snap.label, tabId || "quiz", false)
  }
  function ensureHeaderSessionChip() {
    let chip = document.getElementById("header-session-chip")
    if (!chip) {
      chip = document.createElement("button")
      chip.id = "header-session-chip"
      chip.className = "ghost header-session-chip"
      chip.hidden = true
      const controls = document.querySelector(".controls")
      const search = document.getElementById("search")
      if (controls && search) controls.insertBefore(chip, search)
      else if (controls) controls.appendChild(chip)
    }
    return chip
  }
  function ensureHeaderStudyStatus() {
    let el = document.getElementById("header-study-status")
    if (!el) {
      el = document.createElement("div")
      el.id = "header-study-status"
      el.className = "header-study-status"
      const header = document.querySelector(".app-header")
      const controls = document.querySelector(".controls")
      if (header && controls) header.insertBefore(el, controls.nextSibling)
      else if (header) header.appendChild(el)
    }
    return el
  }
  function renderHeaderStudyStatus() {
    const host = ensureHeaderStudyStatus()
    const chip = ensureHeaderSessionChip()
    const lastRecovery = getStoredRecoveryScope()
    const hasFocus = hasStudyScope()
    const hasReview = state.quiz.reviewOnly
    const recentErrors = getRecentQuizErrors()
    const hasReviewAvailable = !hasReview && recentErrors.length > 0
    const lastSession = getLastStudySessionSummary()
    const adaptivePlan = getAdaptiveWeakCategoryPlan(6)
    const recommendation = getStudyRecommendation()
    const focusItems = hasFocus ? getStudyItems() : []
    const reviewItems = hasReview ? getQuizPool() : []
    const focusSession = getStudySessionStatus(hasReview ? reviewItems : focusItems)
    const focusMetrics = focusSession.metrics
    const allCategorySummary = state.category === "__all" ? getStudyCategorySummary(hasFocus ? focusItems : getStudyItems()) : []
    chip.hidden = false
    chip.className = `ghost header-session-chip ${hasFocus ? getStudyScopeTone() : "study-mode-neutral"}`
    if (!hasFocus && !hasReview && !lastRecovery && !hasReviewAvailable) {
      chip.hidden = true
      host.hidden = true
      host.innerHTML = ""
      return
    }
    const currentTab = (tabs.find(t => t.classList.contains("active")) || {}).dataset || {}
    if (hasFocus) {
      chip.textContent = `${STUDY_SCOPE_LABEL} • ${focusSession.completed}/${focusSession.goal || focusMetrics.total}${focusSession.done ? " • selesai" : ""}`
      chip.title = "Buka sesi fokus aktif"
      chip.onclick = () => {
        activateTab(STUDY_SCOPE_MODE === "hard" ? "phrases" : "quiz")
        refreshStudyViews()
      }
    } else if (hasReview) {
      chip.textContent = `Review 24 Jam • ${reviewItems.length} item`
      chip.title = "Buka review kesalahan 24 jam"
      chip.onclick = () => {
        activateTab("quiz")
        refreshStudyViews()
      }
    } else if (lastRecovery) {
      chip.textContent = `Recovery Terakhir • ${lastRecovery.items.length} item • tekan R`
      chip.title = "Lanjutkan recovery terakhir"
      chip.onclick = () => reopenStoredRecovery("quiz")
    } else {
      chip.textContent = `Review 24 Jam • ${recentErrors.length} item • tekan Q`
      chip.title = "Buka review kesalahan 24 jam"
      chip.onclick = () => openRecentQuizReview()
    }
    host.hidden = false
    host.className = `header-study-status ${hasFocus ? getStudyScopeTone() : "study-mode-neutral"}`
    host.innerHTML = ""
    const title = document.createElement("div")
    title.className = "header-study-title"
    if (hasFocus) title.textContent = `Mode Aktif • ${STUDY_SCOPE_LABEL}`
    else if (hasReview) title.textContent = "Mode Aktif • Review Kesalahan 24 Jam"
    else if (lastRecovery) title.textContent = "Recovery Terakhir Tersedia"
    else title.textContent = "Review 24 Jam Tersedia"
    const meta = document.createElement("div")
    meta.className = "header-study-meta"
    const parts = []
    if (hasFocus) {
      parts.push(`${focusItems.length} item`)
      parts.push(`Progres ${focusMetrics.attempted}/${focusMetrics.total}`)
      parts.push(getSessionRemainingLabel(focusMetrics, false))
      if (focusSession.goal) parts.push(`Target ${focusSession.completed}/${focusSession.goal}`)
      if (focusSession.done) parts.push("Sesi siap ditutup")
      if (focusMetrics.wrong) parts.push(`${focusMetrics.wrong} item perlu pemulihan`)
    } else if (hasReview) {
      parts.push(`${reviewItems.length} item untuk direview`)
      parts.push(getSessionRemainingLabel(focusMetrics, true))
      parts.push("Mode kuis sedang dibatasi ke kesalahan 24 jam terakhir")
      parts.push("Shortcut: tekan Q")
    } else if (lastRecovery) {
      parts.push(`${lastRecovery.items.length} item recovery tersimpan`)
      parts.push(lastRecovery.label)
      parts.push("Shortcut: tekan R")
      if (hasReviewAvailable) parts.push(`${recentErrors.length} item review siap dibuka dengan Q`)
    } else if (hasReviewAvailable) {
      parts.push(`${recentErrors.length} item salah dalam 24 jam terakhir`)
      parts.push("Shortcut: tekan Q untuk buka review")
    }
    if (hasReview) parts.push("Shortcut: tekan Q untuk keluar review")
    if (lastSession) parts.push("Shortcut: tekan L untuk ulang sesi terakhir")
    if (adaptivePlan) parts.push("Shortcut: tekan A untuk sesi adaptif")
    if (adaptivePlan) parts.push("Shortcut: tekan Shift+A untuk kartu adaptif")
    if (lastSession) parts.push("Shortcut: tekan Shift+L untuk buka via kartu")
    if (recommendation) parts.push(`Rekomendasi: ${recommendation.title}`)
    if (allCategorySummary.length) parts.push(`${allCategorySummary.length} kategori aktif`)
    meta.textContent = parts.filter(Boolean).join(" • ")
    const actions = document.createElement("div")
    actions.className = "header-study-actions"
    if (hasFocus && currentTab.tab !== "quiz") {
      const quizBtn = document.createElement("button")
      quizBtn.className = "ghost"
      quizBtn.textContent = "Masuk Kuis"
      quizBtn.onclick = () => {
        activateTab("quiz")
        refreshStudyViews()
      }
      actions.appendChild(quizBtn)
    }
    if (hasFocus && currentTab.tab !== "cards") {
      const cardsBtn = document.createElement("button")
      cardsBtn.className = "ghost"
      cardsBtn.textContent = "Buka Kartu"
      cardsBtn.onclick = () => {
        activateTab("cards")
        refreshStudyViews()
      }
      actions.appendChild(cardsBtn)
    }
    if (lastRecovery && (!hasFocus || STUDY_SCOPE_MODE !== "quiz-recovery")) {
      const recoveryBtn = document.createElement("button")
      recoveryBtn.className = "primary"
      recoveryBtn.textContent = "Lanjut Recovery Terakhir"
      recoveryBtn.onclick = () => reopenStoredRecovery("quiz")
      actions.appendChild(recoveryBtn)
    }
    if (hasReviewAvailable) {
      const reviewBtn = document.createElement("button")
      reviewBtn.className = lastRecovery ? "ghost" : "primary"
      reviewBtn.textContent = "Masuk Review 24 Jam"
      reviewBtn.onclick = () => openRecentQuizReview()
      actions.appendChild(reviewBtn)
    }
    if (lastSession) {
      const repeatBtn = document.createElement("button")
      repeatBtn.className = hasReviewAvailable || lastRecovery ? "ghost" : "primary"
      repeatBtn.textContent = "Ulangi Sesi Terakhir"
      repeatBtn.onclick = () => reopenLastStudySession("quiz")
      actions.appendChild(repeatBtn)
      const repeatCardsBtn = document.createElement("button")
      repeatCardsBtn.className = "ghost"
      repeatCardsBtn.textContent = "Ulangi via Kartu"
      repeatCardsBtn.onclick = () => reopenLastStudySession("cards")
      actions.appendChild(repeatCardsBtn)
    }
    if (adaptivePlan) {
      const adaptiveBtn = document.createElement("button")
      adaptiveBtn.className = "ghost"
      adaptiveBtn.textContent = "Sesi Adaptif"
      adaptiveBtn.onclick = () => openAdaptiveWeakCategorySession("quiz")
      actions.appendChild(adaptiveBtn)
      const adaptiveCardsBtn = document.createElement("button")
      adaptiveCardsBtn.className = "ghost"
      adaptiveCardsBtn.textContent = "Adaptif via Kartu"
      adaptiveCardsBtn.onclick = () => openAdaptiveWeakCategorySession("cards")
      actions.appendChild(adaptiveCardsBtn)
    }
    if (recommendation && (!adaptivePlan || recommendation.actionLabel !== "Mulai Sesi Adaptif")) {
      const recommendBtn = document.createElement("button")
      recommendBtn.className = "ghost"
      recommendBtn.textContent = recommendation.actionLabel
      recommendBtn.onclick = () => recommendation.action()
      actions.appendChild(recommendBtn)
    }
    if (state.category !== "__all") {
      const allBtn = document.createElement("button")
      allBtn.className = "ghost"
      allBtn.textContent = "Semua Kategori"
      allBtn.onclick = () => resetDashboardCategoryToAll()
      actions.appendChild(allBtn)
    }
    if (hasFocus || hasReview) {
      const closeBtn = document.createElement("button")
      closeBtn.className = "ghost"
      closeBtn.textContent = hasFocus ? "Akhiri Fokus" : "Keluar Review"
      closeBtn.onclick = () => {
        if (hasFocus) clearStudyScope()
        state.quiz.reviewOnly = false
        saveState()
        refreshStudyViews()
      }
      actions.appendChild(closeBtn)
    }
    host.appendChild(title)
    host.appendChild(meta)
    host.appendChild(actions)
  }
  function ensureStudyDashboard() {
    let el = document.getElementById("study-dashboard")
    if (!el) {
      el = document.createElement("section")
      el.id = "study-dashboard"
      el.className = "study-dashboard"
      const anchor = voiceResultEl || null
      if (anchor && anchor.parentElement === panels.cards) panels.cards.insertBefore(el, anchor)
      else panels.cards.appendChild(el)
    }
    return el
  }
  function buildStudyStat(label, value, meta, tone) {
    const card = document.createElement("div")
    card.className = `study-stat-card${tone ? ` ${tone}` : ""}`
    const labelEl = document.createElement("div")
    labelEl.className = "study-stat-label"
    labelEl.textContent = label
    const valueEl = document.createElement("div")
    valueEl.className = "study-stat-value"
    valueEl.textContent = value
    card.appendChild(labelEl)
    card.appendChild(valueEl)
    if (meta) {
      const metaEl = document.createElement("div")
      metaEl.className = "study-stat-meta"
      metaEl.textContent = meta
      card.appendChild(metaEl)
    }
    return card
  }
  function getItemCategoryId(item) {
    if (!item) return ""
    const targetKey = srsKey(item)
    const found = Object.keys(DATA.entries).find(cat => {
      const arr = DATA.entries[cat] || []
      return arr.some(it => it === item || srsKey(it) === targetKey)
    })
    return getDisplayCategoryId(found || "")
  }
  function openStudyItem(item) {
    if (!item) return
    const targetCategory = getItemCategoryId(item) || state.category
    if (targetCategory && targetCategory !== state.category) {
      state.category = targetCategory
    }
    const items = getItems()
    const targetKey = srsKey(item)
    const idx = items.findIndex(it => it === item || srsKey(it) === targetKey)
    if (idx >= 0) state.cardIndex = idx
    state.flipped = false
    saveState()
    activateTab("cards")
    refreshStudyViews()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function openStudyReview(recentErrors, urgentItems) {
    const firstError = (recentErrors || []).find(it => it && it.category)
    const firstUrgent = (urgentItems || []).length ? urgentItems[0].item : null
    const targetCategory = state.category === "__all"
      ? (firstError && getDisplayCategoryId(firstError.category)) || getItemCategoryId(firstUrgent) || ((getDisplayCategories()[0] || {}).id)
      : state.category
    state.quiz.reviewOnly = true
    clearStudyScope()
    if (targetCategory && targetCategory !== state.category) state.category = targetCategory
    resetQuizSessionState()
    saveState()
    activateTab("quiz")
    renderQuiz()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function renderStudyDashboard() {
    const host = ensureStudyDashboard()
    const baseItems = getStudyItemsBase()
    const items = getStudyItems()
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    let practiced = 0
    let needReview = 0
    let strong = 0
    let avgTotal = 0
    let avgCount = 0
    let lowBand = 0
    let midBand = 0
    let highBand = 0
    const ranked = items.map(it => {
      const entry = ensureSRS(it)
      const recentWrong = entry.lastWrong && (now - entry.lastWrong) < day
      if (entry.attempts) practiced += 1
      if (entry.avgMs) {
        avgTotal += entry.avgMs
        avgCount += 1
      }
      if (recentWrong || entry.level <= 2) needReview += 1
      if (entry.level >= 5 && (entry.streak || 0) >= 2) strong += 1
      if ((entry.level || 1) <= 2) lowBand += 1
      else if ((entry.level || 1) <= 4) midBand += 1
      else highBand += 1
      return { item: it, entry, urgency: getSrsUrgency(entry, now) }
    }).sort((a, b) => b.urgency - a.urgency)
    const recentErrors = getRecentQuizErrors()
    const goal = Number(state.dailyGoal || 10) || 10
    const streakDays = Number(localStorage.getItem("pembelajar_streak_days") || "0")
    const avgMs = avgCount ? Math.round(avgTotal / avgCount) : 0
    const favoriteCount = getFavoriteCount(items)
    const filterMeta = getStudyFilterMeta()
    const focusSession = hasStudyScope() ? getStudySessionStatus(items) : null
    const categorySummary = state.category === "__all" ? getStudyCategorySummary(items) : []
    const categoryStatus = state.category === "__all" ? getStudyCategoryStatus(items) : []
    const lastRecovery = getStoredRecoveryScope()
    const lastSession = getLastStudySessionSummary()
    const sessionHistory = getStudySessionHistory(3)
    const weakCategories = getWeakCategoryHistory(6).slice(0, 3)
    const adaptivePlan = getAdaptiveWeakCategoryPlan(6)
    const momentumHistory = getStudyDailyMomentum(4)
    const recommendation = getStudyRecommendation()
    host.innerHTML = ""
    const hdr = document.createElement("div")
    hdr.className = "study-dashboard-head"
    const title = document.createElement("div")
    title.className = "study-dashboard-title"
    title.textContent = `Progres Belajar • ${getCategoryLabel()}`
    const sub = document.createElement("div")
    sub.className = "study-dashboard-subtitle"
    sub.textContent = `${practiced}/${items.length} item sudah pernah dilatih • ${recentErrors.length} kesalahan kuis 24 jam${favoriteCount ? ` • ${favoriteCount} favorit` : ""}${filterMeta.value !== "all" ? ` • Filter ${filterMeta.label} (${items.length}/${baseItems.length})` : ""}${hasStudyScope() ? ` • ${STUDY_SCOPE_LABEL}` : ""}${focusSession && focusSession.goal ? ` • Target ${focusSession.completed}/${focusSession.goal}` : ""}${categorySummary.length ? ` • ${categorySummary.length} kategori aktif` : ""}`
    hdr.appendChild(title)
    hdr.appendChild(sub)
    host.appendChild(hdr)
    if (state.category !== "__all") {
      const resetRow = document.createElement("div")
      resetRow.className = "study-category-row"
      const resetChip = document.createElement("button")
      resetChip.type = "button"
      resetChip.className = "study-category-chip"
      resetChip.textContent = hasStudyScope() ? "Lihat Semua Kategori dalam Sesi" : "Kembali ke Semua Kategori"
      resetChip.title = "Buka tampilan semua kategori"
      resetChip.onclick = () => resetDashboardCategoryToAll()
      resetRow.appendChild(resetChip)
      host.appendChild(resetRow)
    }
    if (categorySummary.length) {
      const categoryRow = document.createElement("div")
      categoryRow.className = "study-category-row"
      categorySummary.slice(0, 6).forEach(entry => {
        const chip = document.createElement("button")
        chip.type = "button"
        chip.className = "study-category-chip"
        chip.textContent = `${entry.label} • ${entry.count}`
        chip.title = `Filter cepat ke ${entry.label}`
        chip.onclick = () => {
          filterDashboardCategory(entry.id)
        }
        categoryRow.appendChild(chip)
      })
      host.appendChild(categoryRow)
    }
    if (categoryStatus.length) {
      const statusGrid = document.createElement("div")
      statusGrid.className = "study-stat-grid"
      categoryStatus.slice(0, 6).forEach(entry => {
        const value = hasStudyScope() ? `${entry.attempted}/${entry.total}` : `${entry.practiced}/${entry.total}`
        const meta = hasStudyScope()
          ? entry.done
            ? "Sesi kategori selesai"
            : `Sisa ${entry.remaining} item sesi`
          : entry.done
            ? "Semua item kategori sudah pernah dilatih"
            : entry.recentWrong
              ? `${entry.recentWrong} item perlu review`
              : `${entry.remaining} item belum pernah dilatih`
        const tone = entry.done ? "study-good" : entry.recentWrong ? "study-danger" : "study-neutral"
        const statCard = buildStudyStat(entry.label, value, meta, tone)
        statCard.classList.add("study-dashboard-filter")
        statCard.tabIndex = 0
        statCard.title = `Buka filter kategori ${entry.label}`
        statCard.onclick = () => filterDashboardCategory(entry.id)
        statCard.onkeydown = e => {
          if (e.key === "Enter" || e.key === " ") {
            filterDashboardCategory(entry.id)
            e.preventDefault()
          }
        }
        statusGrid.appendChild(statCard)
      })
      host.appendChild(statusGrid)
    }
    const actions = document.createElement("div")
    actions.className = "study-dashboard-actions"
    const reviewBtn = document.createElement("button")
    reviewBtn.className = "primary"
    reviewBtn.textContent = recentErrors.length ? "Latih Review 24 Jam" : "Masuk Mode Review"
    reviewBtn.disabled = !ranked.length
    reviewBtn.onclick = () => openStudyReview(recentErrors, ranked)
    const urgentBtn = document.createElement("button")
    urgentBtn.className = "ghost"
    urgentBtn.textContent = "Buka Item Paling Urgent"
    urgentBtn.disabled = !ranked.length
    urgentBtn.onclick = () => openStudyItem(ranked[0] && ranked[0].item)
    const focusItems = ranked.filter(({ entry }) => {
      const recentWrong = entry.lastWrong && (now - entry.lastWrong) < day
      return recentWrong || (entry.level || 1) <= 2
    }).slice(0, 12).map(x => x.item)
    const focusBtn = document.createElement("button")
    focusBtn.className = "ghost"
    focusBtn.textContent = "Fokus Item Sulit"
    focusBtn.disabled = !focusItems.length
    focusBtn.onclick = () => activateStudyScope("hard", focusItems, `Fokus sulit (${focusItems.length} item)`, "phrases", false)
    const favoriteItems = ranked.filter(({ item }) => isFavoriteItem(item)).slice(0, 12).map(x => x.item)
    const favoriteBtn = document.createElement("button")
    favoriteBtn.className = "ghost"
    favoriteBtn.textContent = favoriteItems.length ? `Latih Favorit (${favoriteItems.length})` : "Latih Favorit"
    favoriteBtn.disabled = !favoriteItems.length
    favoriteBtn.onclick = () => activateStudyScope("favorites", favoriteItems, `Sesi favorit (${favoriteItems.length} item)`, "cards", false)
    const sessionItems = ranked.slice(0, 5).map(x => x.item)
    const sessionBtn = document.createElement("button")
    sessionBtn.className = "ghost"
    sessionBtn.textContent = "Sesi 5 Urgent"
    sessionBtn.disabled = !sessionItems.length
    sessionBtn.onclick = () => activateStudyScope("urgent-session", sessionItems, `Sesi urgent (${sessionItems.length} item)`, "quiz", false)
    const adaptiveBtn = document.createElement("button")
    adaptiveBtn.className = "ghost"
    adaptiveBtn.textContent = adaptivePlan ? `Sesi Adaptif • ${getCategoryNameById(adaptivePlan.category)}` : "Sesi Adaptif"
    adaptiveBtn.disabled = !adaptivePlan
    adaptiveBtn.onclick = () => openAdaptiveWeakCategorySession("quiz")
    const adaptiveCardsBtn = document.createElement("button")
    adaptiveCardsBtn.className = "ghost"
    adaptiveCardsBtn.textContent = adaptivePlan ? `Kartu Adaptif • ${getCategoryNameById(adaptivePlan.category)}` : "Kartu Adaptif"
    adaptiveCardsBtn.disabled = !adaptivePlan
    adaptiveCardsBtn.onclick = () => openAdaptiveWeakCategorySession("cards")
    actions.appendChild(reviewBtn)
    actions.appendChild(urgentBtn)
    actions.appendChild(focusBtn)
    actions.appendChild(favoriteBtn)
    actions.appendChild(sessionBtn)
    actions.appendChild(adaptiveBtn)
    actions.appendChild(adaptiveCardsBtn)
    if (hasStudyScope()) {
      const resetBtn = document.createElement("button")
      resetBtn.className = "ghost"
      resetBtn.textContent = "Tampilkan Semua"
      resetBtn.onclick = () => {
        clearStudyScope()
        refreshStudyViews()
      }
      actions.appendChild(resetBtn)
    }
    host.appendChild(actions)
    if (recommendation) {
      const recommendBox = document.createElement("div")
      recommendBox.className = "study-last-session-card"
      const recommendTitle = document.createElement("div")
      recommendTitle.className = "study-last-session-title"
      recommendTitle.textContent = "Rekomendasi Belajar Berikutnya"
      const recommendMeta = document.createElement("div")
      recommendMeta.className = "study-last-session-meta"
      recommendMeta.textContent = recommendation.meta
      const recommendActions = document.createElement("div")
      recommendActions.className = "study-dashboard-actions"
      const recommendBtn = document.createElement("button")
      recommendBtn.className = recommendation.tone === "study-danger" ? "primary" : "ghost"
      recommendBtn.textContent = recommendation.actionLabel
      recommendBtn.onclick = () => recommendation.action()
      recommendBox.classList.add(recommendation.tone || "study-neutral")
      recommendActions.appendChild(recommendBtn)
      recommendBox.appendChild(recommendTitle)
      recommendBox.appendChild(recommendMeta)
      recommendBox.appendChild(recommendActions)
      host.appendChild(recommendBox)
    }
    if (lastSession) {
      const sessionBox = document.createElement("div")
      sessionBox.className = "study-last-session-card"
      const sessionTitle = document.createElement("div")
      sessionTitle.className = "study-last-session-title"
      sessionTitle.textContent = "Performa Sesi Terakhir"
      const sessionMeta = document.createElement("div")
      sessionMeta.className = "study-last-session-meta"
      const sessionCategory = getCategoryNameById(lastSession.category)
      const sessionTime = lastSession.ts ? new Date(lastSession.ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""
      sessionMeta.textContent = [lastSession.label, sessionCategory, sessionTime].filter(Boolean).join(" • ")
      const sessionGrid = document.createElement("div")
      sessionGrid.className = "study-stat-grid"
      sessionGrid.appendChild(buildStudyStat("Akurasi", `${lastSession.accuracy}%`, `${lastSession.correct}/${lastSession.attempted} jawaban benar`, lastSession.wrong ? "study-warn" : "study-good"))
      sessionGrid.appendChild(buildStudyStat("Respon rata-rata", lastSession.avgMs ? formatElapsed(lastSession.avgMs) : "-", `${lastSession.total} item dalam sesi`, "study-neutral"))
      sessionGrid.appendChild(buildStudyStat("Perlu pemulihan", String(lastSession.wrong), lastSession.wrong ? "Siap dibuka dari ringkasan recovery" : "Tidak ada item yang perlu diulang", lastSession.wrong ? "study-danger" : "study-good"))
      const sessionActions = document.createElement("div")
      sessionActions.className = "study-dashboard-actions"
      const repeatQuizBtn = document.createElement("button")
      repeatQuizBtn.className = "primary"
      repeatQuizBtn.textContent = "Ulangi di Kuis"
      repeatQuizBtn.onclick = () => reopenLastStudySession("quiz")
      const repeatCardsBtn = document.createElement("button")
      repeatCardsBtn.className = "ghost"
      repeatCardsBtn.textContent = "Buka di Kartu"
      repeatCardsBtn.onclick = () => reopenLastStudySession("cards")
      sessionBox.appendChild(sessionTitle)
      sessionBox.appendChild(sessionMeta)
      sessionBox.appendChild(sessionGrid)
      sessionActions.appendChild(repeatQuizBtn)
      sessionActions.appendChild(repeatCardsBtn)
      sessionBox.appendChild(sessionActions)
      host.appendChild(sessionBox)
    }
    if (sessionHistory.length > 1) {
      const trendBox = document.createElement("div")
      trendBox.className = "study-last-session-card"
      const trendTitle = document.createElement("div")
      trendTitle.className = "study-last-session-title"
      trendTitle.textContent = `Tren ${sessionHistory.length} Sesi Terakhir`
      const trendMeta = document.createElement("div")
      trendMeta.className = "study-last-session-meta"
      trendMeta.textContent = sessionHistory.map(entry => `${entry.label} • ${entry.accuracy}%`).join(" • ")
      const accuracyAvg = Math.round(sessionHistory.reduce((sum, entry) => sum + Number(entry.accuracy || 0), 0) / sessionHistory.length)
      const latest = sessionHistory[0]
      const previous = sessionHistory[1]
      const delta = latest && previous ? Number(latest.accuracy || 0) - Number(previous.accuracy || 0) : 0
      const practicedTotal = sessionHistory.reduce((sum, entry) => sum + Number(entry.attempted || 0), 0)
      const wrongTotal = sessionHistory.reduce((sum, entry) => sum + Number(entry.wrong || 0), 0)
      const trendGrid = document.createElement("div")
      trendGrid.className = "study-stat-grid"
      trendGrid.appendChild(buildStudyStat("Akurasi rata-rata", `${accuracyAvg}%`, `${sessionHistory.length} sesi terakhir`, accuracyAvg >= 80 ? "study-good" : accuracyAvg >= 60 ? "study-warn" : "study-danger"))
      trendGrid.appendChild(buildStudyStat("Perubahan terbaru", `${delta > 0 ? "+" : ""}${delta}%`, previous ? `Dibanding sesi sebelumnya ${previous.accuracy}%` : "Belum ada pembanding", delta > 0 ? "study-good" : delta < 0 ? "study-warn" : "study-neutral"))
      trendGrid.appendChild(buildStudyStat("Item dicoba", String(practicedTotal), wrongTotal ? `${wrongTotal} masih salah di ${sessionHistory.length} sesi` : "Tanpa jawaban salah pada rangkaian ini", wrongTotal ? "study-warn" : "study-good"))
      trendBox.appendChild(trendTitle)
      trendBox.appendChild(trendMeta)
      trendBox.appendChild(trendGrid)
      host.appendChild(trendBox)
    }
    if (momentumHistory.length) {
      const momentumBox = document.createElement("div")
      momentumBox.className = "study-last-session-card"
      const momentumTitle = document.createElement("div")
      momentumTitle.className = "study-last-session-title"
      momentumTitle.textContent = "Momentum Harian"
      const momentumMeta = document.createElement("div")
      momentumMeta.className = "study-last-session-meta"
      momentumMeta.textContent = `${momentumHistory.length} hari belajar terakhir`
      const momentumGrid = document.createElement("div")
      momentumGrid.className = "study-stat-grid"
      momentumHistory.forEach(entry => {
        const tone = entry.accuracyAvg >= 80 ? "study-good" : entry.accuracyAvg >= 60 ? "study-warn" : "study-danger"
        momentumGrid.appendChild(buildStudyStat(entry.label, `${entry.attempted} item`, `${entry.sessions} sesi • ${entry.accuracyAvg}% akurasi`, tone))
      })
      momentumBox.appendChild(momentumTitle)
      momentumBox.appendChild(momentumMeta)
      momentumBox.appendChild(momentumGrid)
      host.appendChild(momentumBox)
    }
    if (weakCategories.length) {
      const weakBox = document.createElement("div")
      weakBox.className = "study-last-session-card"
      const weakTitle = document.createElement("div")
      weakTitle.className = "study-last-session-title"
      weakTitle.textContent = "Kategori yang Perlu Dikuatkan"
      const weakMeta = document.createElement("div")
      weakMeta.className = "study-last-session-meta"
      weakMeta.textContent = `Diambil dari ${Math.min(6, getStudySessionHistory().length)} sesi terakhir`
      const weakGrid = document.createElement("div")
      weakGrid.className = "study-stat-grid"
      weakCategories.forEach(entry => {
        const meta = `${entry.wrong} salah • ${entry.sessions} sesi`
        const tone = entry.accuracyAvg >= 80 ? "study-good" : entry.accuracyAvg >= 60 ? "study-warn" : "study-danger"
        const card = buildStudyStat(entry.label, `${entry.accuracyAvg}%`, meta, tone)
        card.classList.add("study-dashboard-filter")
        card.tabIndex = 0
        card.title = `Fokus ke kategori ${entry.label}`
        card.onclick = () => filterDashboardCategory(entry.id)
        card.onkeydown = e => {
          if (e.key === "Enter" || e.key === " ") {
            filterDashboardCategory(entry.id)
            e.preventDefault()
          }
        }
        weakGrid.appendChild(card)
      })
      weakBox.appendChild(weakTitle)
      weakBox.appendChild(weakMeta)
      weakBox.appendChild(weakGrid)
      host.appendChild(weakBox)
    }
    if (lastRecovery) {
      const recoveryBox = document.createElement("div")
      recoveryBox.className = "study-recovery-card"
      const recoveryTitle = document.createElement("div")
      recoveryTitle.className = "study-recovery-title"
      recoveryTitle.textContent = "Recovery Terakhir"
      const recoveryMeta = document.createElement("div")
      recoveryMeta.className = "study-recovery-meta"
      const recoveryCategory = getCategoryNameById(lastRecovery.category)
      recoveryMeta.textContent = `${lastRecovery.items.length} item • ${recoveryCategory} • ${lastRecovery.label}`
      const recoveryActions = document.createElement("div")
      recoveryActions.className = "study-dashboard-actions"
      const recoveryQuizBtn = document.createElement("button")
      recoveryQuizBtn.className = "primary"
      recoveryQuizBtn.textContent = "Lanjut di Kuis"
      recoveryQuizBtn.onclick = () => reopenStoredRecovery("quiz")
      const recoveryCardsBtn = document.createElement("button")
      recoveryCardsBtn.className = "ghost"
      recoveryCardsBtn.textContent = "Buka di Kartu"
      recoveryCardsBtn.onclick = () => reopenStoredRecovery("cards")
      recoveryActions.appendChild(recoveryQuizBtn)
      recoveryActions.appendChild(recoveryCardsBtn)
      recoveryBox.appendChild(recoveryTitle)
      recoveryBox.appendChild(recoveryMeta)
      recoveryBox.appendChild(recoveryActions)
      host.appendChild(recoveryBox)
    }
    const grid = document.createElement("div")
    grid.className = "study-stat-grid"
    grid.appendChild(buildStudyStat("Perlu review", String(needReview), recentErrors.length ? `${recentErrors.length} muncul dari kuis` : "Belum ada kesalahan baru", needReview ? "study-danger" : "study-neutral"))
    grid.appendChild(buildStudyStat("Item kuat", String(strong), items.length ? `${Math.round((strong / items.length) * 100)}% dari kategori` : "Belum ada item", strong ? "study-good" : "study-neutral"))
    grid.appendChild(buildStudyStat("Respon rata-rata", avgMs ? formatElapsed(avgMs) : "-", avgCount ? `${avgCount} item punya data waktu` : "Belum ada data waktu", "study-neutral"))
    grid.appendChild(buildStudyStat("Favorit", String(favoriteCount), favoriteCount ? "Bisa dibuka cepat dari filter atau sesi favorit" : "Belum ada item favorit", favoriteCount ? "study-good" : "study-neutral"))
    grid.appendChild(buildStudyStat("Target harian", `${Math.min(goal, state.completedToday)}/${goal}`, `Hari beruntun ${streakDays}`, state.completedToday >= goal ? "study-good" : "study-neutral"))
    grid.appendChild(buildStudyStat("Filter belajar", filterMeta.label, filterMeta.value === "all" ? "Tidak ada filter tambahan" : `${items.length} item aktif dari ${baseItems.length}`, filterMeta.value === "all" ? "study-neutral" : "study-warn"))
    host.appendChild(grid)
    const bands = document.createElement("div")
    bands.className = "study-level-row"
    bands.appendChild(buildStudyStat("Level 1-2", String(lowBand), "Butuh penguatan", lowBand ? "study-danger" : "study-neutral"))
    bands.appendChild(buildStudyStat("Level 3-4", String(midBand), "Sedang dibangun", midBand ? "study-warn" : "study-neutral"))
    bands.appendChild(buildStudyStat("Level 5-6", String(highBand), "Siap dipertahankan", highBand ? "study-good" : "study-neutral"))
    host.appendChild(bands)
    const urgentWrap = document.createElement("div")
    urgentWrap.className = "study-urgent"
    const urgentTitle = document.createElement("div")
    urgentTitle.className = "study-urgent-title"
    urgentTitle.textContent = "Fokus berikutnya"
    urgentWrap.appendChild(urgentTitle)
    const urgentItems = ranked.slice(0, 3)
    if (!urgentItems.length) {
      const empty = document.createElement("div")
      empty.className = "study-urgent-empty"
      empty.textContent = "Belum ada item untuk ditampilkan"
      urgentWrap.appendChild(empty)
    } else {
      urgentItems.forEach(({ item }) => {
        const row = document.createElement("button")
        row.type = "button"
        row.className = "study-urgent-item"
        row.onclick = () => openStudyItem(item)
        const main = document.createElement("div")
        main.className = "study-urgent-main"
        main.textContent = `${item.en || "-"} • ${item.ar || "-"}`
        const meta = document.createElement("div")
        meta.className = "study-urgent-meta"
        meta.textContent = getSrsSnapshot(item).summary
        row.appendChild(main)
        row.appendChild(meta)
        urgentWrap.appendChild(row)
      })
    }
    host.appendChild(urgentWrap)
  }
  function renderCard() {
    const items = getStudyItems()
    renderStudyModeBanner("cards", items)
    const item = currentItem()
    if (!item) {
      cardFront.textContent = "-"
      cardBack.textContent = "-"
      progressText.textContent = ""
      renderStudyDashboard()
      return
    }
    const front = state.direction === "en-ar" ? item.en : item.ar
    const backA = state.direction === "en-ar" ? item.ar : item.en
    const backT = item.tr
    const frontLang = state.direction === "en-ar" ? "en-US" : "ar-SA"
    const backLang = state.direction === "en-ar" ? "ar-SA" : "en-US"
    cardFront.dir = state.direction === "en-ar" ? "ltr" : "rtl"
    cardBack.dir = state.direction === "en-ar" ? "rtl" : "ltr"
    function createCardSoundButton(title, text, lang) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "card-sound-button"
      btn.setAttribute("aria-label", title)
      btn.title = title
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 00-3-4.243v8.486a4.5 4.5 0 003-4.243zm2.5 0a7 7 0 01-4.666 6.6l-.834-1.8A5 5 0 0020 12a5 5 0 00-6.5-4.8l.834-1.8A7 7 0 0120 12z"/></svg>`
      btn.onclick = e => {
        e.stopPropagation()
        speakLangText(text, lang)
      }
      return btn
    }
    function appendCardMedia(host, html) {
      if (!html) return
      const mediaWrap = document.createElement("div")
      mediaWrap.className = "card-media"
      mediaWrap.innerHTML = html
      host.appendChild(mediaWrap)
    }
    function createCardTextRow(text, dir, lang, title) {
      const row = document.createElement("div")
      row.className = "card-text-row"
      row.dataset.dir = dir
      const value = document.createElement("span")
      value.className = "card-text-value"
      value.dir = dir
      value.textContent = text || "-"
      row.appendChild(value)
      if ((text || "").trim()) row.appendChild(createCardSoundButton(title, text, lang))
      return row
    }
    function createExampleAudioRow(label, text, dir, lang, title) {
      const row = document.createElement("div")
      row.className = "example-audio-row"
      row.dataset.dir = dir
      const tag = document.createElement("span")
      tag.className = "example-audio-label"
      tag.textContent = label
      const value = document.createElement("span")
      value.className = "example-audio-text"
      value.dir = dir
      value.textContent = text
      row.appendChild(tag)
      row.appendChild(value)
      if ((text || "").trim()) row.appendChild(createCardSoundButton(title, text, lang))
      return row
    }
    function appendCardMetaLine(host, text, className) {
      if (!text) return
      const line = document.createElement("div")
      line.className = className
      line.textContent = text
      host.appendChild(line)
    }
    function mediaHtml(it, size) {
      const userImg = getUserImage(it)
      if (userImg) return `<img class="card-image" src="${userImg}" alt="" />`
      if (it.img) return `<img class="card-image" src="${it.img}" alt="" />`
      if (it.emoji) return `<div style="font-size:${size}px;line-height:1">` + it.emoji + `</div>`
      return ""
    }
    const media = (localStorage.getItem("pembelajar_media") !== "0") ? mediaHtml(item, 64) : ""
    cardFront.innerHTML = ""
    appendCardMedia(cardFront, media)
    cardFront.appendChild(createCardTextRow(front, cardFront.dir, frontLang, "Dengar teks kartu depan"))
    const exEN = item.ex_en || ""
    let exAR = item.ex_ar || ""
    if (exAR) {
      const dot = exAR.indexOf(".")
      exAR = dot >= 0 ? exAR.slice(0, dot + 1) : exAR
    }
    const exID = item.ex_id || ""
    cardBack.innerHTML = ""
    appendCardMedia(cardBack, media)
    cardBack.appendChild(createCardTextRow(backA, cardBack.dir, backLang, "Dengar teks kartu belakang"))
    appendCardMetaLine(cardBack, backT || "", "card-meta-line")
    appendCardMetaLine(cardBack, item.id ? `ID: ${item.id}` : "", "card-meta-line")
    appendCardMetaLine(cardBack, item.v1 ? `v1: ${item.v1} • v2: ${item.v2} • v3: ${item.v3}` : "", "card-meta-line")
    if (exEN || exAR || exID) {
      const exBlock = document.createElement("div")
      exBlock.className = "example-row"
      if (exEN) exBlock.appendChild(createExampleAudioRow("EN", exEN, "ltr", "en-US", "Dengar contoh English"))
      if (exAR) exBlock.appendChild(createExampleAudioRow("AR", exAR, "rtl", "ar-SA", "Dengar contoh Arab"))
      if (exID) exBlock.appendChild(createExampleAudioRow("ID", exID, "ltr", "id-ID", "Dengar contoh Indonesia"))
      cardBack.appendChild(exBlock)
    }
    const cardSrs = createSrsBadge(item, false)
    cardSrs.classList.add("card-srs")
    cardBack.appendChild(cardSrs)
    const favoriteBtn = document.createElement("button")
    favoriteBtn.className = isFavoriteItem(item) ? "primary favorite-toggle" : "ghost favorite-toggle"
    favoriteBtn.textContent = isFavoriteItem(item) ? "Hapus dari Favorit" : "Simpan ke Favorit"
    favoriteBtn.onclick = () => {
      const next = toggleFavoriteItem(item)
      notify(next ? "Item ditambahkan ke favorit" : "Item dihapus dari favorit", "success")
    }
    cardBack.appendChild(favoriteBtn)
    const snap = getSrsSnapshot(item)
      const focusMetrics = hasStudyScope() ? getQuizSessionMetrics(items) : null
      const focusRemaining = hasStudyScope() ? getSessionRemainingLabel(focusMetrics, false) : ""
      progressText.textContent = `Kartu ${state.cardIndex + 1} dari ${items.length} • ${snap.summary}${isFavoriteItem(item) ? " • Favorit" : ""}${focusRemaining ? ` • ${focusRemaining}` : ""}`
    const flash = document.getElementById("flashcard")
    flash.style.transform = state.flipped ? "rotateY(180deg)" : "none"
    if (voiceResultEl) voiceResultEl.textContent = ""
    const imgF = cardFront.querySelector(".card-image")
    if (imgF) imgF.onclick = () => openViewer(item)
    const imgB = cardBack.querySelector(".card-image")
    if (imgB) imgB.onclick = () => openViewer(item)
    const hasUserImg = !!getUserImage(item)
    const hasBuiltinImg = !!item.img
    if (!hasUserImg && !hasBuiltinImg) {
      const up = document.createElement("button")
      up.className = "ghost"
      up.textContent = "Unggah Gambar"
      up.onclick = () => uploadImageFor(item, () => { renderCard(); renderPhrases() })
      cardBack.appendChild(up)
    }
    renderStudyDashboard()
  }
  function nextCard() {
    const items = getStudyItems()
    if (!items.length) return
    state.cardIndex = (state.cardIndex + 1) % items.length
    state.flipped = false
    state.completedToday = Math.min(1000, state.completedToday + 1)
    saveState()
    renderCard()
    updateStreak()
  }
  function prevCard() {
    const items = getStudyItems()
    if (!items.length) return
    state.cardIndex = (state.cardIndex - 1 + items.length) % items.length
    state.flipped = false
    saveState()
    renderCard()
  }
  function flipCard() {
    state.flipped = !state.flipped
    saveState()
    renderCard()
  }
  function speakCurrent() {
    const item = currentItem()
    if (!item) return
    const txt = state.direction === "en-ar" ? item.en : item.ar
    const lang = state.direction === "en-ar" ? "en-US" : "ar-SA"
    speakLangText(txt, lang)
  }
  function normalize(s, isArabic) {
    if (!s) return ""
    let t = s.toLowerCase().trim()
    if (isArabic) {
      t = t.replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    }
    t = t.replace(/[^\p{L}\p{N}\s]/gu, "")
    t = t.replace(/\s+/g, " ")
    return t
  }
  function levenshtein(a, b) {
    const m = a.length, n = b.length
    if (m === 0) return n
    if (n === 0) return m
    const dp = new Array(n + 1)
    for (let j = 0; j <= n; j++) dp[j] = j
    for (let i = 1; i <= m; i++) {
      let prev = dp[0]
      dp[0] = i
      for (let j = 1; j <= n; j++) {
        const temp = dp[j]
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j - 1] + 1,
          prev + (a[i - 1] === b[j - 1] ? 0 : 1)
        )
        prev = temp
      }
    }
    return dp[n]
  }
  function similarity(a, b) {
    const maxLen = Math.max(a.length, b.length) || 1
    const dist = levenshtein(a, b)
    return Math.max(0, 1 - dist / maxLen)
  }
  function getItemTags(it) {
    const tags = Array.isArray(it.tags) ? it.tags : (typeof it.tags === "string" ? it.tags.split(",") : [])
    return tags.map(x => String(x || "").trim().toLowerCase()).filter(Boolean)
  }
  function clip(s, n) {
    if (!s) return ""
    if (s.length <= n) return s
    return s.slice(0, n - 1).trimEnd() + "…"
  }
  function listenPronounce() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Rec) {
      if (voiceResultEl) voiceResultEl.textContent = "Peramban tidak mendukung pengenalan suara"
      return
    }
    const item = currentItem()
    if (!item) return
    const target = state.direction === "en-ar" ? item.en : item.ar
    const isArabic = state.direction !== "en-ar"
    const r = new Rec()
    r.lang = isArabic ? "ar-SA" : "en-US"
    r.interimResults = false
    r.maxAlternatives = 1
    if (voiceResultEl) voiceResultEl.textContent = "Mendengarkan..."
    r.onresult = e => {
      const said = e.results[0][0].transcript
      const score = Math.round(similarity(normalize(said, isArabic), normalize(target, isArabic)) * 100)
      const ok = score >= 80
      const color = ok ? "#22c55e" : "#ef4444"
      voiceResultEl.innerHTML = `<span style="color:${color}">Kecocokan ${score}%</span> • Dengar: “${said}”`
    }
    r.onerror = e => {
      if (voiceResultEl) voiceResultEl.textContent = "Gagal mendengar"
    }
    r.onend = () => {}
    r.start()
  }
  function updateStreak() {
    ensureDay()
    const goal = Number(state.dailyGoal || 10) || 10
    const dayCount = state.completedToday
    const days = Number(localStorage.getItem("pembelajar_streak_days") || "0")
    const stamp = localStorage.getItem("pembelajar_streak_stamp") || ""
    const today = new Date().toDateString()
    if (dayCount >= goal && stamp !== today) {
      localStorage.setItem("pembelajar_streak_days", String(days + 1))
      localStorage.setItem("pembelajar_streak_stamp", today)
    }
    const currentDays = Number(localStorage.getItem("pembelajar_streak_days") || "0")
    streakEl.textContent = `Target Harian: ${goal} kartu • Hari beruntun: ${currentDays}`
    renderStudyDashboard()
  }
  function shuffle(arr) {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
  }
  function sampleIndices(n, max, excludeIdx) {
    const set = new Set()
    while (set.size < n) {
      const r = Math.floor(Math.random() * max)
      if (r === excludeIdx) continue
      set.add(r)
    }
    return Array.from(set)
  }
  let QUIZ_TIMER = null
  let QUIZ_STARTED_AT = 0
  function getQuizScoreLabel() {
    return state.quiz.freePractice ? "Latihan bebas" : `Skor: ${state.quiz.correct}/${state.quiz.total}`
  }
  function getQuizProgressLabel(items) {
    const parts = [getQuizScoreLabel()]
    const metrics = getQuizSessionMetrics(items || getQuizPool())
    if (hasStudyScope()) parts.push(getSessionRemainingLabel(metrics, false))
    else if (state.quiz.reviewOnly) parts.push(getSessionRemainingLabel(metrics, true))
    return parts.filter(Boolean).join(" • ")
  }
  function setQuizProgressText(text) {
    quizProgress.textContent = text
  }
  function stopQuizTimer() { if (QUIZ_TIMER) { clearInterval(QUIZ_TIMER); QUIZ_TIMER = null } }
  function startQuizTimer(onExpired) {
    stopQuizTimer()
    if (!state.quiz.timerEnabled) return
    let left = state.quiz.timerSecs || 30
    const label = getQuizProgressLabel()
    setQuizProgressText(`Waktu: ${left}s • ${label}`)
    QUIZ_TIMER = setInterval(() => {
      left -= 1
      if (left <= 0) {
        stopQuizTimer()
        Array.from(quizOpts.children).forEach(x => x.disabled = true)
        if (!state.quiz.freePractice) {
          state.quiz.total += 1
          saveState()
        }
        setQuizProgressText(`Waktu habis • ${getQuizProgressLabel()}`)
        if (onExpired) setTimeout(onExpired, 500)
      } else {
        setQuizProgressText(`Waktu: ${left}s • ${label}`)
      }
    }, 1000)
  }
  function chooseDistractors(items, targetItem, correctText) {
    const candidates = items.filter(it => it !== targetItem)
    const hasImg = (getUserImage(targetItem) || targetItem.img || "")
    const emj = targetItem.emoji || ""
    const first = (state.direction === "en-ar" ? (targetItem.en || "") : (targetItem.ar || "")).trim().charAt(0).toLowerCase()
    const targetTags = new Set(getItemTags(targetItem))
    const filtered = candidates.filter(it => {
      const img = getUserImage(it) || it.img || ""
      const eqImg = !!img && !!hasImg && img === hasImg
      const eqEmoji = (it.emoji || "") && (it.emoji === emj)
      return !eqImg && !eqEmoji
    })
    const semantic = filtered.filter(it => getItemTags(it).some(t => targetTags.has(t)))
    const prefer = (semantic.length ? semantic : filtered).filter(it => {
      const t = (state.direction === "en-ar" ? (it.en || "") : (it.ar || "")).trim().charAt(0).toLowerCase()
      return t === first
    })
    const pool = prefer.length >= 3 ? prefer : (semantic.length >= 3 ? semantic : filtered)
    const ordered = shuffle(pool.length ? pool : candidates)
    const picked = ordered.slice(0, Math.min(3, ordered.length))
    const fallback = candidates.filter(it => !picked.includes(it)).slice(0, Math.max(0, 3 - picked.length))
    return picked.concat(fallback).map(i => state.direction === "en-ar" ? (i.ar || "") : (i.en || "")).filter(Boolean)
  }
  function getQuizQuestionText(item) {
    return state.direction === "en-ar" ? item.en : item.ar
  }
  function getQuizCorrectAnswer(item) {
    return state.direction === "en-ar" ? item.ar : item.en
  }
  function getQuizPromptLang() {
    return state.direction === "en-ar" ? "en-US" : "ar-SA"
  }
  function buildQuizChoices(items, item) {
    const correct = getQuizCorrectAnswer(item)
    const distractors = chooseDistractors(items, item, correct)
    return shuffle([correct, ...distractors]).slice(0, 4)
  }
  function setQuizChoicesDisabled(disabled) {
    Array.from(quizOpts.children).forEach(x => { x.disabled = !!disabled })
  }
  function ensureQuizReviewPanel() {
    let panel = document.getElementById("quiz-review-panel")
    if (!panel) {
      panel = document.createElement("div")
      panel.id = "quiz-review-panel"
      panel.className = "history-item quiz-review-panel"
      const wrap = document.querySelector("#tab-quiz .quiz-wrap") || panels.quiz
      wrap.appendChild(panel)
    }
    return panel
  }
  function renderQuizReviewPanel() {
    const panel = ensureQuizReviewPanel()
    const items = getRecentQuizErrors()
    if (!items.length && !state.quiz.reviewOnly) {
      panel.hidden = true
      panel.innerHTML = ""
      return
    }
    panel.hidden = false
    panel.innerHTML = ""
    const hdr = document.createElement("div")
    hdr.className = "translate-info"
    hdr.textContent = state.quiz.reviewOnly
      ? `Review Kesalahan 24 Jam Aktif • ${items.length} item`
      : `Kesalahan 24 Jam Terakhir • ${items.length} item`
    panel.appendChild(hdr)
    if (!items.length) {
      const empty = document.createElement("div")
      empty.className = "text"
      empty.textContent = "Belum ada kesalahan dalam 24 jam terakhir untuk kategori ini."
      panel.appendChild(empty)
      return
    }
    items.slice(0, 6).forEach(entry => {
      const row = document.createElement("div")
      row.className = "quiz-review-entry"
      const line1 = document.createElement("div")
      line1.className = "lang"
      line1.textContent = `${entry.timedOut ? "Waktu habis" : "Salah jawab"} • ${new Date(entry.ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} • ${formatElapsed(entry.elapsedMs)}`
      const line2 = document.createElement("div")
      line2.className = "text"
      line2.textContent = `EN: ${entry.en || "-"} • ID: ${entry.id || "-"}`
      const line3 = document.createElement("div")
      line3.className = "text"
      line3.dir = "rtl"
      line3.textContent = `AR: ${entry.ar || "-"}`
      row.appendChild(line1)
      row.appendChild(line2)
      row.appendChild(line3)
      panel.appendChild(row)
    })
  }
  function clearQuizFeedback() {
    const prevFb = document.getElementById("quiz-feedback")
    if (prevFb && prevFb.parentElement) prevFb.parentElement.removeChild(prevFb)
  }
  function clearQuizSessionSummary() {
    const prev = document.getElementById("quiz-session-summary")
    if (prev && prev.parentElement) prev.parentElement.removeChild(prev)
  }
  function ensureQuizFeedback() {
    let fb = document.getElementById("quiz-feedback")
    if (!fb) {
      fb = document.createElement("div")
      fb.id = "quiz-feedback"
      fb.className = "history-item"
      const wrap = document.querySelector("#tab-quiz .quiz-wrap") || panels.quiz
      wrap.appendChild(fb)
    }
    fb.innerHTML = ""
    return fb
  }
  function getQuizSessionSignature(items) {
    const keys = (items || []).map(it => srsKey(it)).filter(Boolean).sort().join("|")
    return [state.category, STUDY_SCOPE_MODE, state.quiz.reviewOnly ? "review" : "normal", state.quiz.freePractice ? "free" : "scored", keys].join("::")
  }
  function syncQuizSession(items) {
    const signature = getQuizSessionSignature(items)
    if (signature === QUIZ_SESSION_SIGNATURE) return
    QUIZ_SESSION_SIGNATURE = signature
    QUIZ_SESSION_KEYS = new Set()
    QUIZ_SESSION_WRONG_KEYS = new Set()
    QUIZ_SESSION_ITEMS = (items || []).slice()
    QUIZ_SESSION_WRONG_ITEMS = []
    QUIZ_SESSION_ELAPSED_TOTAL = 0
  }
  function trackQuizAttempt(item, ok, elapsedMs) {
    if (!item || state.quiz.freePractice) return
    const key = srsKey(item)
    if (!key) return
    const isFirstAttempt = !QUIZ_SESSION_KEYS.has(key)
    QUIZ_SESSION_KEYS.add(key)
    if (isFirstAttempt) QUIZ_SESSION_ELAPSED_TOTAL += Math.max(0, Number(elapsedMs || 0))
    if (!ok) {
      QUIZ_SESSION_WRONG_KEYS.add(key)
      if (!QUIZ_SESSION_WRONG_ITEMS.some(it => srsKey(it) === key)) QUIZ_SESSION_WRONG_ITEMS.push(item)
    }
  }
  function shouldShowQuizSessionSummary(items) {
    if (state.quiz.freePractice || !hasStudyScope()) return false
    if (!(items || []).length) return false
    return QUIZ_SESSION_KEYS.size >= items.length
  }
  function renderQuizSessionSummary(items) {
    clearQuizFeedback()
    clearQuizSessionSummary()
    quizOpts.innerHTML = ""
    quizQ.textContent = "Sesi fokus selesai"
    quizQ.dir = "ltr"
    const summary = document.createElement("div")
    summary.id = "quiz-session-summary"
    summary.className = "history-item"
    const title = document.createElement("div")
    title.className = "translate-info"
    title.textContent = STUDY_SCOPE_LABEL || "Ringkasan sesi"
    const sessionSummary = saveLastStudySessionSummary(items) || getLastStudySessionSummary()
    const score = document.createElement("div")
    score.className = "text"
    score.textContent = `${QUIZ_SESSION_KEYS.size}/${items.length} item sudah dicoba • ${QUIZ_SESSION_WRONG_KEYS.size} item masih perlu pemulihan`
    const stats = document.createElement("div")
    stats.className = "quiz-session-stat-grid"
    if (sessionSummary) {
      stats.appendChild(buildStudyStat("Akurasi", `${sessionSummary.accuracy}%`, `${sessionSummary.correct}/${sessionSummary.attempted} benar`, sessionSummary.wrong ? "study-warn" : "study-good"))
      stats.appendChild(buildStudyStat("Respon rata-rata", sessionSummary.avgMs ? formatElapsed(sessionSummary.avgMs) : "-", `${sessionSummary.total} item selesai`, "study-neutral"))
    }
    const detail = document.createElement("div")
    detail.className = "lang"
    detail.textContent = QUIZ_SESSION_WRONG_ITEMS.length
      ? `Fokus berikutnya: ${QUIZ_SESSION_WRONG_ITEMS.slice(0, 3).map(it => it.en || it.ar || "-").join(", ")}`
      : "Semua item pada sesi ini sudah terjawab dengan baik."
    const actions = document.createElement("div")
    actions.className = "quiz-summary-actions"
    if (QUIZ_SESSION_WRONG_ITEMS.length) {
      const retryBtn = document.createElement("button")
      retryBtn.className = "primary"
      retryBtn.textContent = "Latih Ulang yang Salah"
      retryBtn.onclick = () => activateStudyScope("quiz-recovery", QUIZ_SESSION_WRONG_ITEMS, `Pemulihan salah (${QUIZ_SESSION_WRONG_ITEMS.length} item)`, "quiz", false)
      actions.appendChild(retryBtn)
      const cardsBtn = document.createElement("button")
      cardsBtn.className = "ghost"
      cardsBtn.textContent = "Buka di Kartu"
      cardsBtn.onclick = () => activateStudyScope("quiz-recovery", QUIZ_SESSION_WRONG_ITEMS, `Pemulihan salah (${QUIZ_SESSION_WRONG_ITEMS.length} item)`, "cards", false)
      actions.appendChild(cardsBtn)
    }
    const repeatBtn = document.createElement("button")
    repeatBtn.className = "ghost"
    repeatBtn.textContent = "Ulangi Sesi"
    repeatBtn.onclick = () => activateStudyScope(STUDY_SCOPE_MODE, QUIZ_SESSION_ITEMS, STUDY_SCOPE_LABEL || `Sesi fokus (${QUIZ_SESSION_ITEMS.length} item)`, "quiz", false)
    actions.appendChild(repeatBtn)
      const cardsRepeatBtn = document.createElement("button")
      cardsRepeatBtn.className = "ghost"
      cardsRepeatBtn.textContent = "Ulangi via Kartu"
      cardsRepeatBtn.onclick = () => activateStudyScope(STUDY_SCOPE_MODE, QUIZ_SESSION_ITEMS, STUDY_SCOPE_LABEL || `Sesi fokus (${QUIZ_SESSION_ITEMS.length} item)`, "cards", false)
      actions.appendChild(cardsRepeatBtn)
    const finishBtn = document.createElement("button")
    finishBtn.className = "ghost"
    finishBtn.textContent = "Tampilkan Semua"
    finishBtn.onclick = () => {
      clearStudyScope()
      state.quiz.reviewOnly = false
      saveState()
      renderQuiz()
      renderCard()
      renderPhrases()
    }
    actions.appendChild(finishBtn)
    summary.appendChild(title)
    summary.appendChild(score)
    if (stats.children.length) summary.appendChild(stats)
    summary.appendChild(detail)
    summary.appendChild(actions)
    const wrap = document.querySelector("#tab-quiz .quiz-wrap") || panels.quiz
    wrap.appendChild(summary)
    setQuizProgressText(`Sesi fokus selesai • ${QUIZ_SESSION_WRONG_KEYS.size} perlu diulang`)
    renderQuizReviewPanel()
    renderStudyDashboard()
  }
  function buildQuizMediaRow(item, opts) {
    const mediaRow = document.createElement("div")
    mediaRow.style.display = "flex"
    mediaRow.style.alignItems = "center"
    mediaRow.style.gap = "10px"
    const imgSrc = getUserImage(item) || item.img || ""
    if (imgSrc) {
      const im = document.createElement("img")
      im.className = "card-image"
      im.src = imgSrc
      im.style.width = "48px"
      im.style.height = "48px"
      im.onclick = () => openViewer(item)
      mediaRow.appendChild(im)
    } else if (item.emoji) {
      const sp = document.createElement("span")
      sp.textContent = item.emoji
      sp.style.fontSize = "28px"
      mediaRow.appendChild(sp)
    }
    const texts = document.createElement("div")
    const arRow = document.createElement("div")
    arRow.textContent = `AR: ${item.ar || ""}`
    arRow.dir = "rtl"
    const enRow = document.createElement("div")
    enRow.textContent = `EN: ${item.en || ""}`
    const idRow = document.createElement("div")
    idRow.textContent = `ID: ${item.id || ""}`
    texts.appendChild(arRow)
    texts.appendChild(enRow)
    texts.appendChild(idRow)
    if (opts && opts.includeExamples && (item.ex_en || item.ex_ar)) {
      const exEn = document.createElement("div")
      exEn.textContent = `Contoh EN: ${item.ex_en || "-"}`
      texts.appendChild(exEn)
      const exAr = document.createElement("div")
      exAr.textContent = `Contoh AR: ${item.ex_ar || "-"}`
      exAr.dir = "rtl"
      texts.appendChild(exAr)
    }
    if (Array.isArray(item.minimal_pairs) && item.minimal_pairs.length) {
      const mp = document.createElement("div")
      mp.textContent = `Pasangan minimal: ${item.minimal_pairs.join(", ")}`
      texts.appendChild(mp)
    }
    mediaRow.appendChild(texts)
    return mediaRow
  }
  function appendQuizPronunciationPractice(container, item) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Rec) return
    const prac = document.createElement("button")
    prac.className = "ghost"
    prac.textContent = "Latih Pengucapan"
    prac.setAttribute("aria-label", "Latih pengucapan")
    const out = document.createElement("div")
    out.className = "voice-result"
    prac.onclick = () => {
      const r = new Rec()
      const isArabic = state.direction !== "en-ar"
      const target = state.direction === "en-ar" ? (item.ar || "") : (item.en || "")
      r.lang = isArabic ? "ar-SA" : "en-US"
      r.interimResults = false
      r.maxAlternatives = 1
      out.textContent = "Mendengarkan..."
      r.onresult = e => {
        const said = e.results[0][0].transcript
        const score = Math.round(similarity(normalize(said, isArabic), normalize(target, isArabic)) * 100)
        const ok = score >= 80
        const color = ok ? "#22c55e" : "#ef4444"
        out.innerHTML = `<span style="color:${color}">Kecocokan ${score}%</span> • Ucap: “${said}”`
      }
      r.onerror = () => { out.textContent = "Gagal mendengar" }
      r.onend = () => {}
      r.start()
    }
    container.appendChild(prac)
    container.appendChild(out)
  }
  function renderQuizFeedback(item, ok) {
    const fb = ensureQuizFeedback()
    const hdr = document.createElement("div")
    hdr.className = "translate-info"
    hdr.textContent = ok ? "Jawaban benar" : "Jawaban yang benar"
    fb.appendChild(hdr)
    fb.appendChild(createSrsBadge(item, false))
    fb.appendChild(buildQuizMediaRow(item, { includeExamples: !ok }))
    if (!ok) appendQuizPronunciationPractice(fb, item)
  }
  function finalizeQuizAnswer(item, ok, elapsedMs, selectedButton) {
    stopQuizTimer()
    if (selectedButton) selectedButton.classList.add(ok ? "correct" : "wrong")
    setQuizChoicesDisabled(true)
    if (!state.quiz.freePractice) {
      state.quiz.total += 1
      if (ok) state.quiz.correct += 1
    }
    srsUpdate(item, { ok, elapsedMs })
    if (!ok) recordQuizError(item, { elapsedMs })
    trackQuizAttempt(item, ok, elapsedMs)
    saveState()
    const srs = ensureSRS(item)
    setQuizProgressText(`${getQuizProgressLabel()} • Level ${srs.level} • Respon ${formatElapsed(elapsedMs)}`)
    renderQuizFeedback(item, ok)
    renderQuizReviewPanel()
    renderStudyDashboard()
  }
  function handleQuizTimeout(item) {
    const elapsedMs = Math.max(300, Date.now() - QUIZ_STARTED_AT)
    recordQuizError(item, { elapsedMs, timedOut: true })
    srsUpdate(item, { ok: false, elapsedMs, timedOut: true })
    trackQuizAttempt(item, false, elapsedMs)
    renderQuizReviewPanel()
    nextQuiz()
  }
  function handleQuizAnswer(item, choice, button) {
    const ok = choice === getQuizCorrectAnswer(item)
    const elapsedMs = Math.max(300, Date.now() - QUIZ_STARTED_AT)
    finalizeQuizAnswer(item, ok, elapsedMs, button)
  }
  function prefetchNextQuizAudio() {
    const nextPool = getQuizPool()
    if (!nextPool.length) return
    const nextIdx = srsPickIndex(nextPool)
    if (nextIdx < 0) return
    const nextItem = nextPool[nextIdx]
    const nextText = getQuizQuestionText(nextItem)
    const nextLang = getQuizPromptLang()
    prefetchAudio(nextText, nextLang)
  }
  function renderQuiz() {
    const items = getQuizPool()
    syncQuizSession(items)
    renderStudyModeBanner("quiz", items)
    if (!items.length) {
      clearQuizSessionSummary()
      quizQ.textContent = "-"
      quizOpts.innerHTML = ""
      setQuizProgressText("")
      renderQuizReviewPanel()
      renderStudyDashboard()
      return
    }
    if (shouldShowQuizSessionSummary(items)) {
      renderQuizSessionSummary(items)
      return
    }
    clearQuizSessionSummary()
    clearQuizFeedback()
    const idx = srsPickIndex(items)
    const item = idx >= 0 ? items[idx] : null
    if (!item) {
      clearQuizSessionSummary()
      quizQ.textContent = "-"
      quizOpts.innerHTML = ""
      setQuizProgressText("")
      renderQuizReviewPanel()
      renderStudyDashboard()
      return
    }
    const qText = getQuizQuestionText(item)
    QUIZ_STARTED_AT = Date.now()
    quizQ.innerHTML = ""
    quizQ.dir = state.direction === "en-ar" ? "ltr" : "rtl"
    const qSpan = document.createElement("span")
    qSpan.textContent = qText
    const soundBtn = document.createElement("button")
    soundBtn.id = "quiz-sound"
    soundBtn.className = "ghost"
    soundBtn.setAttribute("aria-label", "Dengar Soal")
    soundBtn.title = "Dengar Soal"
    soundBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 00-3-4.243v8.486a4.5 4.5 0 003-4.243zm2.5 0a7 7 0 01-4.666 6.6l-.834-1.8A5 5 0 0020 12a5 5 0 00-6.5-4.8l.834-1.8A7 7 0 0120 12z"/></svg>`
    if (quizQ.dir === "ltr") soundBtn.style.marginLeft = "8px"
    else soundBtn.style.marginRight = "8px"
    soundBtn.onclick = () => {
      speakLangText(qText, getQuizPromptLang())
    }
    quizQ.appendChild(qSpan)
    quizQ.appendChild(soundBtn)
    quizQ.setAttribute("aria-live", "polite")
    state.quiz.lastIdx = idx
    saveState()
    const choices = buildQuizChoices(items, item)
    quizOpts.innerHTML = ""
    choices.forEach(c => {
      const b = document.createElement("button")
      b.className = "quiz-option"
      b.textContent = c
      b.dir = state.direction === "en-ar" ? "rtl" : "ltr"
      b.setAttribute("aria-label", `Pilihan: ${c}`)
      b.onclick = () => handleQuizAnswer(item, c, b)
      quizOpts.appendChild(b)
    })
    prefetchNextQuizAudio()
    setQuizProgressText(getQuizProgressLabel(items))
    renderQuizReviewPanel()
    renderStudyDashboard()
    startQuizTimer(() => handleQuizTimeout(item))
  }
  function nextQuiz() {
    stopQuizTimer()
    state.quiz.index += 1
    saveState()
    renderQuiz()
  }
  let PHRASE_RENDER_JOB = 0
  function speakPhraseText(text, lang) {
    speakLangText(text, lang)
  }
  function createPhraseAudioRow(label, text, dir, lang, title, displayText) {
    const row = document.createElement("div")
    row.className = "phrase-audio-row"
    row.dataset.dir = dir
    const tag = document.createElement("span")
    tag.className = "phrase-audio-label"
    tag.textContent = label
    const value = document.createElement("span")
    value.className = "phrase-audio-text"
    value.dir = dir
    value.textContent = displayText || text || "-"
    row.appendChild(tag)
    row.appendChild(value)
    if ((text || "").trim()) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "card-sound-button"
      btn.setAttribute("aria-label", title)
      btn.title = title
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 00-3-4.243v8.486a4.5 4.5 0 003-4.243zm2.5 0a7 7 0 01-4.666 6.6l-.834-1.8A5 5 0 0020 12a5 5 0 00-6.5-4.8l.834-1.8A7 7 0 0120 12z"/></svg>`
      btn.onclick = e => {
        e.stopPropagation()
        speakPhraseText(text, lang)
      }
      row.appendChild(btn)
    }
    return row
  }
  function createPhraseMedia(it, userImg, mediaOn) {
    if (!mediaOn) return null
    if (userImg) {
      const im = document.createElement("img")
      im.className = "phrase-image"
      im.src = userImg
      return im
    }
    if (it.img) {
      const im = document.createElement("img")
      im.className = "phrase-image"
      im.src = it.img
      return im
    }
    if (it.emoji) {
      const sp = document.createElement("span")
      sp.textContent = it.emoji
      sp.style.fontSize = "20px"
      sp.style.marginRight = "8px"
      return sp
    }
    return null
  }
  function buildPhraseCard(it) {
    const wrap = document.createElement("div")
    wrap.className = "phrase-card"
    const main = document.createElement("div")
    main.className = "phrase-main"
    main.dir = "rtl"
    const mediaOn = localStorage.getItem("pembelajar_media") !== "0"
    const userImg = getUserImage(it)
    const media = createPhraseMedia(it, userImg, mediaOn)
    if (media) main.appendChild(media)
    if (media && media.tagName === "IMG") media.onclick = () => openViewer(it)
    main.appendChild(createPhraseAudioRow("AR", it.ar, "rtl", "ar-SA", "Dengar teks Arab"))
    const sub = document.createElement("div")
    sub.className = "phrase-sub"
    sub.appendChild(createPhraseAudioRow("EN", it.en || "", "ltr", "en-US", "Dengar teks English"))
    if (it.id) sub.appendChild(createPhraseAudioRow("ID", it.id || "", "ltr", "id-ID", "Dengar teks Indonesia"))
    const meta = document.createElement("div")
    meta.className = "phrase-meta"
    meta.textContent = `${it.tr || ""}${it.v1 ? `${it.tr ? " • " : ""}v1:${it.v1} v2:${it.v2} v3:${it.v3}` : ""}`
    if (meta.textContent) sub.appendChild(meta)
    if (it.ex_en || it.ex_ar || it.ex_id) {
      const exBlock = document.createElement("div")
      exBlock.className = "phrase-example-block"
      if (it.ex_en) exBlock.appendChild(createPhraseAudioRow("EN", it.ex_en, "ltr", "en-US", "Dengar contoh English", clip(it.ex_en, 80)))
      if (it.ex_ar) exBlock.appendChild(createPhraseAudioRow("AR", it.ex_ar, "rtl", "ar-SA", "Dengar contoh Arab", clip(it.ex_ar, 70)))
      if (it.ex_id) exBlock.appendChild(createPhraseAudioRow("ID", it.ex_id, "ltr", "id-ID", "Dengar contoh Indonesia", clip(it.ex_id, 80)))
      sub.appendChild(exBlock)
    }
    const act = document.createElement("div")
    act.className = "phrase-actions"
    const favBtn = document.createElement("button")
    favBtn.className = isFavoriteItem(it) ? "primary favorite-toggle" : "ghost favorite-toggle"
    favBtn.textContent = isFavoriteItem(it) ? "Favorit ✓" : "Favorit"
    favBtn.onclick = () => {
      const next = toggleFavoriteItem(it)
      notify(next ? "Item ditambahkan ke favorit" : "Item dihapus dari favorit", "success")
    }
    act.appendChild(favBtn)
    const editBtn = document.createElement("button")
    editBtn.className = "ghost"
    editBtn.textContent = "Edit"
    editBtn.setAttribute("aria-label", "Edit item")
    editBtn.onclick = () => {
      const en = window.prompt("EN:", it.en || "")
      if (en === null) return
      const ar = window.prompt("AR:", it.ar || "")
      if (ar === null) return
      const idv = window.prompt("ID:", it.id || "")
      if (idv === null) return
      const emj = window.prompt("Emoji:", it.emoji || "")
      const ov = { en, ar, id: idv, emoji: emj }
      setEdit(it, ov)
      applyUserEdits()
      rebuildLexiconAsync()
      renderPhrases()
      renderCard()
      notify("Perubahan item disimpan", "success")
    }
    act.appendChild(editBtn)
    if (!userImg && !it.img) {
      const b3 = document.createElement("button")
      b3.className = "ghost"
      b3.textContent = "Tambah Gambar"
      b3.onclick = () => uploadImageFor(it, () => { renderPhrases(); renderCard() })
      act.appendChild(b3)
    }
    const srsBadge = createSrsBadge(it, true)
    srsBadge.classList.add("phrase-srs")
    wrap.appendChild(main)
    wrap.appendChild(sub)
    wrap.appendChild(srsBadge)
    wrap.appendChild(act)
    return wrap
  }
  function renderPhraseChunk(items, offset, jobId) {
    if (jobId !== PHRASE_RENDER_JOB) return
    const fragment = document.createDocumentFragment()
    items.slice(offset, offset + 16).forEach(it => {
      fragment.appendChild(buildPhraseCard(it))
    })
    phrasesList.appendChild(fragment)
    if (offset + 16 < items.length) {
      requestAnimationFrame(() => renderPhraseChunk(items, offset + 16, jobId))
    }
  }
  function renderPhrases() {
    const base = getStudyItems()
    const items = filterItems(base)
    const pageSize = 200
    const totalPages = Math.ceil(items.length / pageSize)
    if (state.phrasesPage >= totalPages) state.phrasesPage = Math.max(0, totalPages - 1)
    const start = state.phrasesPage * pageSize
    const end = Math.min(items.length, start + pageSize)
    let controls = document.getElementById("phrases-controls")
    if (!controls) {
      controls = document.createElement("div")
      controls.id = "phrases-controls"
      controls.className = "phrases-controls"
      const prev = document.createElement("button")
      prev.id = "phrases-prev"
      prev.className = "ghost"
      prev.textContent = "Sebelumnya"
      const next = document.createElement("button")
      next.id = "phrases-next"
      next.className = "ghost"
      next.textContent = "Berikutnya"
      const info = document.createElement("div")
      info.id = "phrases-info"
      info.className = "phrases-info"
      controls.appendChild(prev)
      controls.appendChild(next)
      controls.appendChild(info)
      panels.phrases.insertBefore(controls, phrasesList)
      prev.onclick = () => {
        if (state.phrasesPage > 0) {
          state.phrasesPage -= 1
          saveState()
          renderPhrases()
        }
      }
      next.onclick = () => {
        if (state.phrasesPage < totalPages - 1) {
          state.phrasesPage += 1
          saveState()
          renderPhrases()
        }
      }
    }
    renderStudyModeBanner("phrases", base)
    const info = document.getElementById("phrases-info")
    const filt = state.searchQuery ? ` • Hasil filter: ${items.length} dari ${base.length}` : ""
    const scope = hasStudyScope() ? ` • ${STUDY_SCOPE_LABEL}` : ""
    const recovery = !hasStudyScope() && getStoredRecoveryScope() ? " • Recovery terakhir tersedia" : ""
    info.textContent = `Halaman ${totalPages ? state.phrasesPage + 1 : 0}/${totalPages} • Menampilkan ${end - start} dari ${items.length}${filt}${scope}${recovery}`
    phrasesList.innerHTML = ""
    let importBtn = document.getElementById("phrases-import")
    const canImport = !!apiUrl("import-animals")
    const needImport = (state.category === "animals" || state.category === "vegetables") && canImport
    if (!needImport && importBtn) {
      importBtn.remove()
      importBtn = null
    }
    if (needImport && !importBtn) {
      importBtn = document.createElement("button")
      importBtn.id = "phrases-import"
      importBtn.className = "ghost"
      importBtn.textContent = state.category === "animals" ? "Impor Hewan (CSV/JSON)" : "Impor Sayur (CSV/JSON)"
      importBtn.onclick = () => {
        const inp = document.createElement("input")
        inp.type = "file"
        inp.accept = ".csv,.json"
        inp.onchange = e => {
          const f = e.target.files && e.target.files[0]
          if (!f) return
          if (state.category === "animals") importAnimalsFile(f)
          else importVegetablesFile(f)
        }
        inp.click()
      }
      const controls = document.getElementById("phrases-controls")
      if (controls) controls.appendChild(importBtn)
    }
    const visibleItems = items.slice(start, end)
    const jobId = ++PHRASE_RENDER_JOB
    renderPhraseChunk(visibleItems, 0, jobId)
  }
  function activateTab(id) {
    tabs.forEach(x => x.classList.toggle("active", x.dataset.tab === id))
    Object.keys(panels).forEach(k => {
      panels[k].classList.toggle("active", k === id)
    })
    renderHeaderStudyStatus()
  }
  function initTabShortcutHints() {
    const shortcuts = { cards: "1", quiz: "2", phrases: "3", translate: "4" }
    tabs.forEach(tab => {
      const shortcut = shortcuts[tab.dataset.tab]
      if (shortcut) {
        const label = (tab.textContent || "").trim()
        tab.dataset.shortcut = shortcut
        tab.title = `${label} (tekan ${shortcut})`
        tab.setAttribute("aria-label", `${label}, shortcut ${shortcut}`)
      } else {
        tab.removeAttribute("data-shortcut")
      }
    })
  }
  function goHome() {
    const path = (window.location && window.location.pathname) || APP_BASE_PATH
    const relativePath = path.startsWith(APP_BASE_PATH) ? path.slice(APP_BASE_PATH.length) : path.replace(/^\/+/, "")
    if (relativePath && !/^index\.html$/i.test(relativePath)) {
      window.location.href = appUrl("")
      return
    }
    activateTab("cards")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function syncFocusModeUI(enabled) {
    const on = !!enabled
    localStorage.setItem("pembelajar_focus", on ? "1" : "0")
    document.body.classList.toggle("focus-mode", on)
    const focusBtn = document.getElementById("focus-mode")
    if (focusBtn) {
      focusBtn.setAttribute("aria-pressed", on ? "true" : "false")
      focusBtn.textContent = on ? "Keluar Fokus" : "Fokus Belajar"
    }
    let exitBtn = document.getElementById("focus-exit")
    if (!exitBtn) {
      exitBtn = document.createElement("button")
      exitBtn.id = "focus-exit"
      exitBtn.className = "primary"
      exitBtn.textContent = "Tampilkan Semua Fitur"
      exitBtn.setAttribute("aria-label", "Keluar dari mode fokus")
      exitBtn.onclick = () => syncFocusModeUI(false)
      document.body.appendChild(exitBtn)
    }
    exitBtn.hidden = !on
  }
  function ensureButton(parent, cfg) {
    if (!parent || !cfg || !cfg.id) return null
    let el = document.getElementById(cfg.id)
    if (!el) {
      el = document.createElement("button")
      el.id = cfg.id
      el.className = cfg.className || "ghost"
      if (cfg.text) el.textContent = cfg.text
      if (cfg.ariaLabel) el.setAttribute("aria-label", cfg.ariaLabel)
      if (cfg.insertBefore) parent.insertBefore(el, cfg.insertBefore)
      else if (cfg.prepend) parent.insertBefore(el, parent.firstChild || null)
      else parent.appendChild(el)
    }
    return el
  }
  function ensureSelect(parent, cfg) {
    if (!parent || !cfg || !cfg.id) return null
    let el = document.getElementById(cfg.id)
    if (!el) {
      el = document.createElement("select")
      el.id = cfg.id
      el.className = cfg.className || "ghost"
      ;(cfg.options || []).forEach(opt => {
        const o = document.createElement("option")
        o.value = opt.value
        o.textContent = opt.label
        el.appendChild(o)
      })
      if (cfg.insertBefore) parent.insertBefore(el, cfg.insertBefore)
      else parent.appendChild(el)
    }
    if (cfg.ariaLabel) el.setAttribute("aria-label", cfg.ariaLabel)
    return el
  }
  function ensureTextInput(parent, cfg) {
    if (!parent || !cfg || !cfg.id) return null
    let el = document.getElementById(cfg.id)
    if (!el) {
      el = document.createElement("input")
      el.type = cfg.type || "text"
      el.id = cfg.id
      el.className = cfg.className || "settings-text-input"
      if (cfg.placeholder) el.placeholder = cfg.placeholder
      if (cfg.insertBefore) parent.insertBefore(el, cfg.insertBefore)
      else parent.appendChild(el)
    }
    if (cfg.ariaLabel) el.setAttribute("aria-label", cfg.ariaLabel)
    return el
  }
  function ensureSettingsNote(parent, cfg) {
    if (!parent || !cfg || !cfg.id) return null
    let el = document.getElementById(cfg.id)
    if (!el) {
      el = document.createElement("div")
      el.id = cfg.id
      el.className = cfg.className || "settings-note"
      parent.appendChild(el)
    }
    return el
  }
  function ensureTextarea(parent, cfg) {
    if (!parent || !cfg || !cfg.id) return null
    let el = document.getElementById(cfg.id)
    if (!el) {
      el = document.createElement("textarea")
      el.id = cfg.id
      el.className = cfg.className || "settings-textarea"
      if (cfg.rows) el.rows = cfg.rows
      if (cfg.placeholder) el.placeholder = cfg.placeholder
      parent.appendChild(el)
    }
    if (cfg.ariaLabel) el.setAttribute("aria-label", cfg.ariaLabel)
    return el
  }
  function exportLocalData() {
    const data = {
      edits: getEdits(),
      images: getUserImages(),
      wordSuggestions: getWordSuggestions(),
      favoriteKeys: state.favoriteKeys,
      srs: state.srs,
      prefs: {
        audioRate: state.audioRate || 1,
        audioPitch: state.audioPitch || 1,
        dailyGoal: Number(state.dailyGoal || 10) || 10,
        studyFilter: state.studyFilter || "all",
        focusMode: localStorage.getItem("pembelajar_focus") === "1",
        quiz: {
          timerEnabled: !!state.quiz.timerEnabled,
          timerSecs: Number(state.quiz.timerSecs || 30),
          freePractice: !!state.quiz.freePractice,
          reviewOnly: !!state.quiz.reviewOnly
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pembelajaran_data.json"
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  function exportCsvData() {
    const rows = [["en","ar","id","emoji","tags","synonyms_en","synonyms_id","ex_en","ex_ar","image"]]
    Object.keys(DATA.entries).forEach(cat => {
      ;(DATA.entries[cat] || []).forEach(it => {
        rows.push([
          it.en || "",
          it.ar || "",
          it.id || "",
          it.emoji || "",
          Array.isArray(it.tags) ? it.tags.join("|") : (it.tags || ""),
          Array.isArray(it.synonyms_en) ? it.synonyms_en.join("|") : (it.synonyms_en || ""),
          Array.isArray(it.synonyms_id) ? it.synonyms_id.join("|") : (it.synonyms_id || ""),
          it.ex_en || "",
          it.ex_ar || "",
          getUserImage(it) || it.img || ""
        ])
      })
    })
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pembelajaran_data.csv"
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  function openImportDataDialog() {
    const inp = document.createElement("input")
    inp.type = "file"
    inp.accept = ".json,application/json"
    inp.onchange = e => {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      importLocalDataFile(f)
    }
    inp.click()
  }
  function initQuizControls() {
    const actions = document.querySelector("#tab-quiz .quiz-actions")
    if (!actions) return
    const reviewBtn = ensureButton(actions, {
      id: "quiz-review",
      text: "Review Kesalahan",
      ariaLabel: "Tampilkan review kesalahan",
      insertBefore: quizNext || null
    })
    const timerBtn = ensureButton(actions, {
      id: "quiz-timer",
      text: "Timer",
      ariaLabel: "Aktifkan timer kuis",
      insertBefore: quizNext || null
    })
    const freeBtn = ensureButton(actions, {
      id: "quiz-free",
      text: "Latihan Bebas",
      ariaLabel: "Aktifkan latihan bebas",
      insertBefore: quizNext || null
    })
    const timerSel = ensureSelect(actions, {
      id: "quiz-timer-secs",
      ariaLabel: "Durasi timer kuis",
      insertBefore: quizNext || null,
      options: ["15","30","45","60"].map(v => ({ value: v, label: `${v} detik` }))
    })
    if (reviewBtn) {
      reviewBtn.setAttribute("aria-pressed", state.quiz.reviewOnly ? "true" : "false")
      reviewBtn.onclick = () => {
        state.quiz.reviewOnly = !state.quiz.reviewOnly
        reviewBtn.setAttribute("aria-pressed", state.quiz.reviewOnly ? "true" : "false")
        saveState()
        renderQuiz()
      }
    }
    if (timerBtn) {
      timerBtn.setAttribute("aria-pressed", state.quiz.timerEnabled ? "true" : "false")
      timerBtn.onclick = () => {
        state.quiz.timerEnabled = !state.quiz.timerEnabled
        timerBtn.setAttribute("aria-pressed", state.quiz.timerEnabled ? "true" : "false")
        saveState()
        renderQuiz()
      }
    }
    if (freeBtn) {
      freeBtn.setAttribute("aria-pressed", state.quiz.freePractice ? "true" : "false")
      freeBtn.onclick = () => {
        state.quiz.freePractice = !state.quiz.freePractice
        freeBtn.setAttribute("aria-pressed", state.quiz.freePractice ? "true" : "false")
        saveState()
        renderQuiz()
      }
    }
    if (timerSel) {
      timerSel.value = String(state.quiz.timerSecs || 30)
      timerSel.onchange = e => {
        state.quiz.timerSecs = Number(e.target.value || "30")
        saveState()
        renderQuiz()
      }
    }
  }
  function ensureSettingsSection(sectionId, title) {
    if (!settingsPanel) return null
    let section = document.getElementById(sectionId)
    if (!section) {
      section = document.createElement("section")
      section.id = sectionId
      section.className = "settings-section"
      const heading = document.createElement("div")
      heading.className = "settings-section-title"
      heading.textContent = title
      const grid = document.createElement("div")
      grid.className = "settings-grid"
      grid.id = `${sectionId}-grid`
      section.appendChild(heading)
      section.appendChild(grid)
      settingsPanel.appendChild(section)
    }
    return document.getElementById(`${sectionId}-grid`)
  }
  function closeSettingsModal() {
    if (settingsModal) {
      settingsModal.hidden = true
      settingsModal.setAttribute("hidden", "")
    }
  }
  function openSettingsModal() {
    if (settingsModal) {
      settingsModal.hidden = false
      settingsModal.removeAttribute("hidden")
    }
  }
  function updateApiSettingsStatus() {
    const statusEl = document.getElementById("api-status")
    if (!statusEl) return
    const info = getAudioSupportInfo()
    const lines = []
    if (info.storedBase) lines.push(`Server aktif: ${info.storedBase}`)
    else if (info.isGithubPages) lines.push("GitHub Pages statis: audio Arab perlu URL server audio/API atau voice Arab bawaan browser.")
    else lines.push(`Server aktif: ${info.activeBase || "tidak tersedia"}`)
    lines.push(info.arabicVoice ? "Voice Arab browser: tersedia." : "Voice Arab browser: tidak terdeteksi.")
    lines.push(info.indonesianVoice ? "Voice Indonesia browser: tersedia." : "Voice Indonesia browser: tidak terdeteksi.")
    statusEl.textContent = lines.join(" ")
  }
  function initApiSettingsControls(parent) {
    if (!parent) return
    const input = ensureTextInput(parent, {
      id: "api-base-input",
      ariaLabel: "URL Server Audio atau API",
      placeholder: "https://server-audio-anda.example.com/"
    })
    const saveBtn = ensureButton(parent, {
      id: "api-base-save",
      text: "Simpan Server"
    })
    const resetBtn = ensureButton(parent, {
      id: "api-base-reset",
      text: "Reset Server"
    })
    const testBtn = ensureButton(parent, {
      id: "api-base-test",
      text: "Tes Audio Arab"
    })
    const hint = ensureSettingsNote(parent, {
      id: "api-help",
      className: "settings-note"
    })
    ensureSettingsNote(parent, {
      id: "api-status",
      className: "settings-note settings-note-strong"
    })
    if (input) input.value = getStoredApiBaseUrl()
    if (hint) {
      hint.textContent = "Isi alamat backend yang punya endpoint /tts. Di GitHub Pages, audio Arab biasanya butuh server ini jika browser tidak punya voice Arab bawaan."
    }
    if (saveBtn) {
      saveBtn.onclick = () => {
        const normalized = setStoredApiBaseUrl(input ? input.value : "")
        if (input) input.value = normalized
        updateApiSettingsStatus()
        notify(normalized ? "Server audio/API disimpan" : "URL server tidak valid atau dikosongkan", normalized ? "success" : "error")
      }
    }
    if (resetBtn) {
      resetBtn.onclick = () => {
        setStoredApiBaseUrl("")
        if (input) input.value = ""
        updateApiSettingsStatus()
        notify("Server audio/API direset ke default", "info")
      }
    }
    if (testBtn) {
      testBtn.onclick = () => {
        const sample = "مرحبا"
        const ttsUrl = apiUrl(`tts?lang=ar&text=${encodeURIComponent(sample)}`)
        if (ttsUrl) {
          const audio = new Audio(ttsUrl)
          audio.play()
            .then(() => notify("Tes audio Arab dikirim ke server", "success"))
            .catch(() => notify("Server audio belum merespons atau diblokir browser", "error"))
          return
        }
        speakLangText(sample, "ar-SA")
        notify("Mencoba voice Arab bawaan browser", "info")
      }
    }
    updateApiSettingsStatus()
  }
  function initWordSuggestionControls(parent) {
    if (!parent) return
    parent.className = "suggestion-layout"
    if (!document.getElementById("word-suggestion-form-card")) {
      parent.innerHTML = `
        <section id="word-suggestion-form-card" class="suggestion-card">
          <div class="suggestion-section-title">Kirim Saran Baru</div>
        </section>
        <section id="word-suggestion-list-card" class="suggestion-card">
          <div class="suggestion-list-head">
            <div class="suggestion-section-title">Daftar Saran Server</div>
            <div id="word-suggestion-count" class="suggestion-count">0 item</div>
          </div>
        </section>
      `
    }
    const formCard = document.getElementById("word-suggestion-form-card")
    const listCard = document.getElementById("word-suggestion-list-card")
    const typeSel = ensureSelect(formCard, {
      id: "word-suggestion-kind",
      ariaLabel: "Jenis saran",
      options: [
        { value: "word", label: "Saran: Kata" },
        { value: "phrase", label: "Saran: Frasa" },
        { value: "topic", label: "Saran: Tema" }
      ]
    })
    const requestInput = ensureTextInput(formCard, {
      id: "word-suggestion-request",
      ariaLabel: "Kata, frasa, atau tema yang diminta",
      placeholder: "Contoh: kendaraan darurat, percakapan di bandara"
    })
    const meaningInput = ensureTextInput(formCard, {
      id: "word-suggestion-meaning",
      ariaLabel: "Arti atau tujuan belajar",
      placeholder: "Arti, arah terjemah, atau kebutuhan user"
    })
    const categoryInput = ensureTextInput(formCard, {
      id: "word-suggestion-category",
      ariaLabel: "Kategori target",
      placeholder: "Contoh: transportasi, profesi, percakapan"
    })
    const noteInput = ensureTextarea(formCard, {
      id: "word-suggestion-note",
      rows: 3,
      ariaLabel: "Catatan tambahan saran",
      placeholder: "Tambahkan konteks, contoh kalimat, atau alasan kenapa kata ini dibutuhkan"
    })
    const saveBtn = ensureButton(formCard, {
      id: "word-suggestion-save",
      text: "Simpan Saran"
    })
    const exportBtn = ensureButton(formCard, {
      id: "word-suggestion-export",
      text: "Ekspor Saran"
    })
    const clearBtn = ensureButton(formCard, {
      id: "word-suggestion-clear",
      text: "Hapus Semua Saran"
    })
    const info = ensureSettingsNote(listCard, {
      id: "word-suggestion-info",
      className: "settings-note settings-note-strong"
    })
    let list = document.getElementById("word-suggestion-list")
    if (!list) {
      list = document.createElement("div")
      list.id = "word-suggestion-list"
      list.className = "suggestion-list"
      listCard.appendChild(list)
    }
    if (typeSel && !typeSel.value) typeSel.value = "word"
    if (categoryInput && !categoryInput.value) categoryInput.value = getCategoryLabel()
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const request = String(requestInput && requestInput.value || "").trim()
        const meaning = String(meaningInput && meaningInput.value || "").trim()
        const category = String(categoryInput && categoryInput.value || "").trim()
        const note = String(noteInput && noteInput.value || "").trim()
        const kind = String(typeSel && typeSel.value || "word")
        if (!request) {
          notify("Isi dulu kata, frasa, atau tema yang ingin disarankan", "error")
          return
        }
        const ok = await submitWordSuggestion({
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          kind,
          request,
          meaning,
          category: category || getCategoryLabel(),
          note,
          status: "pending",
          ts: Date.now(),
          updated_at: 0
        })
        if (!ok) return
        if (requestInput) requestInput.value = ""
        if (meaningInput) meaningInput.value = ""
        if (noteInput) noteInput.value = ""
        if (categoryInput) categoryInput.value = getCategoryLabel()
        renderWordSuggestions()
        notify("Saran kata berhasil disimpan", "success")
      }
    }
    if (exportBtn) exportBtn.onclick = () => exportWordSuggestions()
    if (clearBtn) {
      clearBtn.onclick = () => {
        const count = getWordSuggestions().length
        if (!count) {
          notify("Belum ada saran untuk dihapus", "info")
          return
        }
        if (!window.confirm(`Hapus ${count} saran kata yang tersimpan?`)) return
        setWordSuggestions([])
        renderWordSuggestions()
        notify("Cache lokal saran dibersihkan. File server tetap aman.", "info")
      }
    }
    renderWordSuggestions()
    if (info && !getWordSuggestions().length) {
      info.textContent = "Belum ada saran di server. Gunakan form ini agar developer tahu kata, frasa, atau tema apa yang paling dibutuhkan user."
    }
  }
  function ensureSuggestionModalShell() {
    let modal = document.getElementById("suggestion-modal")
    if (!modal) {
      modal = document.createElement("div")
      modal.id = "suggestion-modal"
      modal.className = "modal"
      modal.setAttribute("hidden", "")
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-body suggestion-modal-body">
          <div class="settings-modal-head">
            <div>
              <div class="settings-title">Saran Kata</div>
              <div class="settings-subtitle">Kirim permintaan kata, frasa, atau tema baru dan pantau status prosesnya</div>
            </div>
            <button id="suggestion-close" class="ghost">Tutup</button>
          </div>
          <div id="suggestion-panel" class="suggestion-panel"></div>
        </div>
      `
      document.body.appendChild(modal)
    }
    return modal
  }
  function closeSuggestionModal() {
    const modal = document.getElementById("suggestion-modal")
    if (!modal) return
    modal.hidden = true
    modal.setAttribute("hidden", "")
  }
  function openSuggestionModal() {
    const modal = ensureSuggestionModalShell()
    const panel = document.getElementById("suggestion-panel")
    if (panel && !document.getElementById("word-suggestion-form-card")) initWordSuggestionControls(panel)
    modal.hidden = false
    modal.removeAttribute("hidden")
    loadServerWordSuggestions().then(() => renderWordSuggestions())
  }
  function initSettingsModalControls() {
    if (openSettingsBtn) openSettingsBtn.onclick = () => openSettingsModal()
    if (settingsClose) settingsClose.onclick = () => closeSettingsModal()
    if (settingsModal) {
      settingsModal.addEventListener("click", e => {
        if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) closeSettingsModal()
      })
    }
  }
  function initSuggestionModalControls() {
    ensureSuggestionModalShell()
    if (openSuggestionsBtn) openSuggestionsBtn.onclick = () => openSuggestionModal()
    const closeBtn = document.getElementById("suggestion-close")
    const modal = document.getElementById("suggestion-modal")
    if (closeBtn) closeBtn.onclick = () => closeSuggestionModal()
    if (modal && !modal.dataset.boundClose) {
      modal.dataset.boundClose = "1"
      modal.addEventListener("click", e => {
        if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) closeSuggestionModal()
      })
    }
  }
  function initHeaderControls() {
    const quickGrid = ensureSettingsSection("settings-quick", "Aksi Cepat")
    const displayGrid = ensureSettingsSection("settings-display", "Audio & Tampilan")
    const studyGrid = ensureSettingsSection("settings-study", "Belajar")
    const dataGrid = ensureSettingsSection("settings-data", "Data")
    const apiGrid = ensureSettingsSection("settings-api", "Server Audio/API")
    if (!quickGrid || !displayGrid || !studyGrid || !dataGrid || !apiGrid) return
    const speakBtn = ensureButton(quickGrid, {
      id: "speak",
      text: "Audio Kartu",
      ariaLabel: "Dengar kartu aktif",
      className: "primary"
    })
    const listenBtn = ensureButton(quickGrid, {
      id: "listen",
      text: "Ucapkan",
      ariaLabel: "Latihan pengucapan"
    })
    const homeBtn = ensureButton(quickGrid, {
      id: "go-home",
      text: "Beranda",
      ariaLabel: "Kembali ke halaman utama"
    })
    const focusBtn = ensureButton(quickGrid, {
      id: "focus-mode",
      text: "Fokus Belajar",
      ariaLabel: "Mode fokus belajar"
    })
    const contrastBtn = ensureButton(displayGrid, {
      id: "contrast",
      text: "Kontras Tinggi",
      ariaLabel: "Aktifkan kontras tinggi"
    })
    const mediaBtn = ensureButton(displayGrid, {
      id: "media",
      text: "Tampilkan Gambar",
      ariaLabel: "Tampilkan atau sembunyikan gambar"
    })
    const rateSel = ensureSelect(displayGrid, {
      id: "audio-rate",
      options: ["0.8","1.0","1.2"].map(v => ({ value: v, label: `Kecepatan ${v}x` }))
    })
    const pitchSel = ensureSelect(displayGrid, {
      id: "audio-pitch",
      options: ["0.9","1.0","1.1"].map(v => ({ value: v, label: `Pitch ${v}` }))
    })
    const filterSel = ensureSelect(studyGrid, {
      id: "study-filter",
      ariaLabel: "Filter belajar aktif",
      options: [
        { value: "all", label: "Filter: Semua" },
        { value: "favorites", label: "Filter: Favorit" },
        { value: "hard", label: "Filter: Sulit" },
        { value: "new", label: "Filter: Baru" },
        { value: "strong", label: "Filter: Kuat" }
      ]
    })
    const goalSel = ensureSelect(studyGrid, {
      id: "daily-goal",
      ariaLabel: "Target harian kartu",
      options: ["5", "10", "15", "20", "30"].map(v => ({ value: v, label: `Target ${v}` }))
    })
    const exportBtn = ensureButton(dataGrid, {
      id: "export-data",
      text: "Ekspor Data",
      ariaLabel: "Ekspor data kustom"
    })
    const exportCsvBtn = ensureButton(dataGrid, {
      id: "export-csv",
      text: "Ekspor CSV",
      ariaLabel: "Ekspor data ke CSV"
    })
    const importDataBtn = ensureButton(dataGrid, {
      id: "import-data",
      text: "Impor Data",
      ariaLabel: "Impor data lokal"
    })
    if (speakBtn) speakBtn.onclick = speakCurrent
    if (listenBtn) listenBtn.onclick = listenPronounce
    if (homeBtn) homeBtn.onclick = goHome
    if (exportBtn) exportBtn.onclick = exportLocalData
    if (exportCsvBtn) exportCsvBtn.onclick = exportCsvData
    if (importDataBtn) importDataBtn.onclick = openImportDataDialog
    initApiSettingsControls(apiGrid)
    const fm = localStorage.getItem("pembelajar_focus") === "1"
    syncFocusModeUI(fm)
    if (focusBtn) {
      focusBtn.onclick = () => {
        const cur = localStorage.getItem("pembelajar_focus") === "1"
        syncFocusModeUI(!cur)
      }
    }
    if (rateSel) {
      rateSel.value = String(state.audioRate || 1)
      rateSel.onchange = e => { state.audioRate = Number(e.target.value || "1"); saveState() }
    }
    if (pitchSel) {
      pitchSel.value = String(state.audioPitch || 1)
      pitchSel.onchange = e => { state.audioPitch = Number(e.target.value || "1"); saveState() }
    }
    if (filterSel) {
      filterSel.value = String(state.studyFilter || "all")
      filterSel.title = "Filter belajar"
      filterSel.onchange = e => {
        state.studyFilter = ["all", "favorites", "hard", "new", "strong"].includes(e.target.value) ? e.target.value : "all"
        state.cardIndex = 0
        state.phrasesPage = 0
        saveState()
        refreshStudyViews()
      }
    }
    if (goalSel) {
      goalSel.value = String(state.dailyGoal || 10)
      goalSel.title = "Target harian"
      goalSel.onchange = e => {
        state.dailyGoal = Math.max(1, Math.min(100, Number(e.target.value || "10") || 10))
        saveState()
        updateStreak()
      }
    }
    renderHeaderStudyStatus()
  }
  function refreshMainViews() {
    refreshStudyViews()
    updateStreak()
  }
  function ensureValidCategory() {
    state.category = getDisplayCategoryId(state.category)
    const validCat = getDisplayCategories().some(c => c.id === state.category)
    if (!validCat) {
      if (state.category === "animals_all" || state.category === "animals_extra") state.category = "animals"
      else state.category = "__all"
      saveState()
    }
  }
  function initSearchControls() {
    if (!searchInput) return
    searchInput.value = state.searchQuery || ""
    searchInput.oninput = e => {
      state.searchQuery = e.target.value
      saveState()
      state.phrasesPage = 0
      renderPhrases()
    }
    searchInput.onkeydown = e => {
      if (e.key === "Enter") {
        const base = getStudyItems()
        const idx = base.findIndex(it => matchItem(it, searchInput.value))
        if (idx >= 0) {
          state.cardIndex = idx
          saveState()
          renderCard()
        }
      }
    }
  }
  function speakTranslateOutput(targetEl, lang, allowServerFallback) {
    const txt = targetEl ? targetEl.textContent : ""
    if (!txt) return
    if (allowServerFallback) {
      const ttsUrl = apiUrl(`tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(txt)}`)
      const playServerTTS = () => {
        if (!ttsUrl) return false
        const audio = new Audio(ttsUrl)
        audio.play().catch(() => {})
        return true
      }
      if (!window.speechSynthesis) {
        playServerTTS()
        return
      }
      const v = pickVoice(lang)
      if (!v) {
        if (playServerTTS()) return
      }
      const u = new SpeechSynthesisUtterance(txt)
      u.lang = lang
      u.voice = v
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
      return
    }
    if (!window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(txt)
    u.lang = lang
    const v = pickVoice(lang)
    if (v) u.voice = v
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  }
  async function copyTranslateOutput() {
    const txt = `EN: ${tOutEn ? tOutEn.textContent : ""}\nAR: ${tOutAr ? tOutAr.textContent : ""}\nID: ${tOutId ? tOutId.textContent : ""}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(txt)
      return
    }
    const ta = document.createElement("textarea")
    ta.value = txt
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand("copy") } catch {}
    document.body.removeChild(ta)
  }
  function saveTranslateEntry() {
    const entry = {
      src: detectLang(tInput.value || ""),
      input: tInput.value || "",
      en: tOutEn ? tOutEn.textContent : "",
      ar: tOutAr ? tOutAr.textContent : "",
      id: tOutId ? tOutId.textContent : ""
    }
    if (!entry.input) return
    const arr = getTranslateHistory()
    const newArr = [entry, ...arr].slice(0, 10)
    setTranslateHistory(newArr)
    renderTranslateHistory()
  }
  function initTranslateControls() {
    if (tInput) {
      tInput.oninput = e => translateText(e.target.value)
      tInput.onkeydown = e => {
        if (e.key === "Enter") {
          e.preventDefault()
          if (tSave) tSave.click()
        }
      }
    }
    if (tSpeakAr) tSpeakAr.onclick = () => speakTranslateOutput(tOutAr, "ar-SA", true)
    if (tSpeakEn) tSpeakEn.onclick = () => speakTranslateOutput(tOutEn, "en-US", false)
    if (tSpeakId) tSpeakId.onclick = () => speakTranslateOutput(tOutId, "id-ID", false)
    if (tCopy) tCopy.onclick = () => copyTranslateOutput()
    if (tSave) tSave.onclick = () => saveTranslateEntry()
    if (tClear) {
      tClear.onclick = () => {
        setTranslateHistory([])
        renderTranslateHistory()
      }
    }
    renderTranslateHistory()
    const tSpace = document.getElementById("translate-space")
    if (tSpace) {
      const on = localStorage.getItem("pembelajar_space") === "1"
      tSpace.setAttribute("aria-pressed", on ? "true" : "false")
      tSpace.onclick = () => {
        const cur = localStorage.getItem("pembelajar_space") === "1"
        const next = !cur
        localStorage.setItem("pembelajar_space", next ? "1" : "0")
        tSpace.setAttribute("aria-pressed", next ? "true" : "false")
        if (tInput) translateText(tInput.value || "")
      }
    }
  }
  function closeViewerModal() {
    if (viewer) viewer.hidden = true
    if (viewerImg) viewerImg.src = ""
    viewerItem = null
  }
  function initViewerControls() {
    if (viewer && viewerClose) {
      viewerClose.onclick = () => closeViewerModal()
    }
    if (viewer && viewerEdit) {
      viewerEdit.onclick = () => {
        if (!viewerItem) return
        uploadImageFor(viewerItem, () => {
          const src = getUserImage(viewerItem) || viewerItem.img || ""
          if (viewerImg) viewerImg.src = src
          renderCard()
          renderPhrases()
        })
      }
    }
    if (viewer) {
      viewer.addEventListener("click", e => {
        if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) {
          closeViewerModal()
        }
      })
    }
  }
  async function bootstrapInitialData() {
    await Promise.all([loadServerImagesMap(), loadCatalogEntryFiles()])
    applyUserEdits()
    await rebuildLexiconAsync()
    refreshStudyViews()
  }
  function bindPrimaryControls() {
    directionSel.onchange = e => setDirection(e.target.value)
    categorySel.onchange = e => setCategory(e.target.value)
    prevBtn.onclick = prevCard
    nextBtn.onclick = nextCard
    flipBtn.onclick = flipCard
    const speakBtn = document.getElementById("speak")
    const listenBtn = document.getElementById("listen")
    if (speakBtn) speakBtn.onclick = speakCurrent
    if (listenBtn) listenBtn.onclick = listenPronounce
    quizNext.onclick = nextQuiz
  }
  function initCoreUI() {
    ensureValidCategory()
    directionSel.value = state.direction
    renderCategoryOptions()
    refreshMainViews()
    bindPrimaryControls()
    initSettingsModalControls()
    initSuggestionModalControls()
    initQuizControls()
    initHeaderControls()
    initWordSuggestionControls(document.getElementById("suggestion-panel"))
    initSearchControls()
    initTranslateControls()
    initViewerControls()
    initTabs()
    initTabShortcutHints()
    initContrast()
    initMedia()
    initShortcuts()
  }
  function initTabs() {
    tabs.forEach(t => {
      t.addEventListener("click", () => {
        activateTab(t.dataset.tab)
      })
    })
  }
  function initContrast() {
    const key = "pembelajar_hc"
    const enabled = localStorage.getItem(key) === "1"
    document.body.classList.toggle("hc", !!enabled)
    const contrastBtn = document.getElementById("contrast")
    if (contrastBtn) {
      contrastBtn.setAttribute("aria-pressed", enabled ? "true" : "false")
      contrastBtn.onclick = () => {
        const cur = document.body.classList.toggle("hc")
        localStorage.setItem(key, cur ? "1" : "0")
        contrastBtn.setAttribute("aria-pressed", cur ? "true" : "false")
      }
    }
  }
  function initMedia() {
    const key = "pembelajar_media"
    if (localStorage.getItem(key) === null) localStorage.setItem(key, "1")
    const on = localStorage.getItem(key) !== "0"
    const mediaBtn = document.getElementById("media")
    if (mediaBtn) {
      mediaBtn.setAttribute("aria-pressed", on ? "true" : "false")
      mediaBtn.onclick = () => {
        const cur = localStorage.getItem(key) !== "0"
        const next = !cur
        localStorage.setItem(key, next ? "1" : "0")
        mediaBtn.setAttribute("aria-pressed", next ? "true" : "false")
        renderCard()
        renderPhrases()
      }
    }
  }
  function initShortcuts() {
    document.addEventListener("keydown", e => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : ""
      const isTyping = tag === "input" || tag === "textarea" || tag === "select"
      if (isTyping) return
      if (e.key === "ArrowRight") { nextCard(); e.preventDefault() }
      else if (e.key === "ArrowLeft") { prevCard(); e.preventDefault() }
      else if (e.key === " ") { flipCard(); e.preventDefault() }
      else if (e.key === "/") { if (searchInput) { searchInput.focus(); e.preventDefault() } }
      else if (e.key.toLowerCase() === "t") { if (tInput) { tInput.focus(); e.preventDefault() } }
      else if (e.key === "1") { activateTab("cards"); e.preventDefault() }
      else if (e.key === "2") { activateTab("quiz"); e.preventDefault() }
      else if (e.key === "3") { activateTab("phrases"); e.preventDefault() }
      else if (e.key === "4") { activateTab("translate"); e.preventDefault() }
      else if (e.key.toLowerCase() === "s") {
        const quizActive = panels.quiz && panels.quiz.classList.contains("active")
        if (quizActive) {
          const btn = document.getElementById("quiz-sound")
          if (btn) btn.click()
        } else {
          speakCurrent()
        }
        e.preventDefault()
      }
      else if (e.key.toLowerCase() === "q") {
        if (toggleRecentQuizReview()) e.preventDefault()
      }
      else if (e.key.toLowerCase() === "l") {
        if (reopenLastStudySession(e.shiftKey ? "cards" : "quiz")) e.preventDefault()
      }
      else if (e.key.toLowerCase() === "a") {
        if (openAdaptiveWeakCategorySession(e.shiftKey ? "cards" : "quiz")) e.preventDefault()
      }
      else if (e.key.toLowerCase() === "r") {
        const recovery = getStoredRecoveryScope()
        if (recovery) {
          reopenStoredRecovery("quiz")
          e.preventDefault()
        }
      }
    })
  }
  async function init() {
    await loadDataCatalog()
    initVoices()
    registerServiceWorker()
    ensureDay()
    ensureCustomCategory()
    await bootstrapInitialData()
    await loadServerWordSuggestions()
    initCoreUI()
  }
  init()
})()
