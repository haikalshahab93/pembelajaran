/**
 * Lapisan akses API backend Express.
 * Prioritas base URL: override pengguna -> app.config.js / env -> same origin (proxy dev).
 */

export function normalizeBaseUrl(value) {
  const raw = String(value || "").trim()
  if (!raw) return ""
  return raw.endsWith("/") ? raw : `${raw}/`
}

export function getStoredApiBase() {
  try {
    return normalizeBaseUrl(localStorage.getItem("pembelajar_api_base"))
  } catch {
    return ""
  }
}

export function setStoredApiBase(value) {
  try {
    const normalized = normalizeBaseUrl(value)
    if (normalized) localStorage.setItem("pembelajar_api_base", normalized)
    else localStorage.removeItem("pembelajar_api_base")
  } catch {}
}

export function getApiBaseUrl() {
  const stored = getStoredApiBase()
  if (stored) return stored
  const configured = normalizeBaseUrl(
    (typeof window !== "undefined" && window.PEMBELAJAR_CONFIG && window.PEMBELAJAR_CONFIG.apiBase) ||
      import.meta.env.VITE_API_BASE ||
      ""
  )
  return configured
}

export function apiUrl(path) {
  const clean = String(path || "").replace(/^\/+/, "")
  const base = getApiBaseUrl()
  return base ? `${base}${clean}` : `/${clean}`
}

/** URL relatif aset statis (fallback bila backend tidak tersedia). */
export function appUrl(path) {
  const base = import.meta.env.BASE_URL || "./"
  const clean = String(path || "").replace(/^\.\/+/, "").replace(/^\/+/, "")
  return `${base}${clean}`
}

async function parseJson(res) {
  const type = String(res.headers.get("content-type") || "")
  if (!type.includes("json")) throw new Error(`Unexpected response ${res.status}`)
  return res.json()
}

/**
 * GET JSON dengan fallback ke file statis lokal (client/public/data).
 * @param {string} path       path API, mis. "api/catalog"
 * @param {string} fallback   path statis relatif, mis. "data/catalog.json"
 */
export async function getJson(path, fallback) {
  let lastError = null
  try {
    const res = await fetch(apiUrl(path), { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await parseJson(res)
  } catch (error) {
    lastError = error
  }
  if (fallback) {
    try {
      const res = await fetch(appUrl(fallback))
      if (res.ok) return await res.json()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error("Gagal memuat data")
}

export async function sendJson(method, path, body, extraHeaders) {
  const res = await fetch(apiUrl(path), {
    method,
    headers: Object.assign({ "Content-Type": "application/json" }, extraHeaders || {}),
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  const data = await parseJson(res).catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data && data.error ? data.error : `HTTP ${res.status}`)
    error.status = res.status
    throw error
  }
  return data
}

// ---------- endpoint spesifik ----------

export function fetchCatalog() {
  return getJson("api/catalog", "data/catalog.json")
}

export function fetchEntries(categoryId) {
  const id = encodeURIComponent(categoryId)
  if (categoryId === "animals" || categoryId === "vegetables") {
    return getJson(`api/entries/${id}`, `data/${categoryId}.json`)
  }
  return getJson(`api/entries/${id}`, `data/categories/${id}.json`)
}

export function fetchLexicon() {
  return getJson("api/lexicon")
}

export function fetchHealth() {
  return getJson("api/health")
}

export function fetchSuggestions() {
  return getJson("word-suggestions", "data/word_suggestions.json")
}

export function submitSuggestion(entry) {
  return sendJson("POST", "word-suggestions", entry)
}

export function updateSuggestionStatus(id, status, adminToken) {
  return sendJson("POST", "word-suggestions-status", { id, status }, {
    "x-admin-token": adminToken || ""
  })
}

export function fetchProgress(deviceId) {
  return getJson(`api/progress/${encodeURIComponent(deviceId)}`)
}

/** Simpan kata tambahan ke backend — selama berjalan, kata masuk Firestore (persemaran data) */
export function saveCustomWord(word, deviceId) {
  return sendJson("POST", "api/custom-words", { ...word, deviceId })
}

export function saveProgress(deviceId, payload) {
  return sendJson("PUT", `api/progress/${encodeURIComponent(deviceId)}`, payload)
}

export function aiTranslate(text, sourceLang, options) {
  return sendJson("POST", "ai/translate", Object.assign({ text, sourceLang }, options || {}))
}

export function aiSuggestionDraft(fields) {
  return sendJson("POST", "ai/word-suggestion-draft", fields || {})
}

export function adminLogin(username, password) {
  return sendJson("POST", "admin/login", { username, password })
}

export function adminLogout() {
  return sendJson("POST", "admin/logout", {})
}

export function adminSession(token) {
  return sendJson("GET", "admin/session", undefined, token ? { "x-admin-token": token } : {})
}

// ---------- audio ----------

export function ttsUrl(text, lang) {
  return apiUrl(`tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`)
}

const audioCache = new Map()

export async function fetchTtsObjectUrl(text, lang) {
  const key = `${lang}|${text}`
  if (audioCache.has(key)) return audioCache.get(key)
  const res = await fetch(ttsUrl(text, lang))
  if (!res.ok) throw new Error("TTS gagal")
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  audioCache.set(key, url)
  return url
}

export function apiAvailable() {
  return Boolean(getApiBaseUrl()) || typeof window !== "undefined"
}
