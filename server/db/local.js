/**
 * Local JSON store.
 *
 * Sumber data statis tetap berada di folder `assets/` seperti sistem lama,
 * tetapi sekarang dibaca lewat antarmuka store yang sama dengan Firestore,
 * sehingga backend bisa berjalan tanpa kredensial saat development.
 */
const fs = require("fs")
const fsp = require("fs/promises")
const path = require("path")

function createLocalStore({ rootDir, dataDir }) {
  const cache = new Map()

  async function readJson(filePath, fallback) {
    const stat = await fsp.stat(filePath).catch(() => null)
    const cacheKey = stat ? `${filePath}:${stat.mtimeMs}:${stat.size}` : filePath
    if (cache.has(cacheKey)) return cache.get(cacheKey)
    let value = fallback
    try {
      value = JSON.parse(await fsp.readFile(filePath, "utf8"))
    } catch {
      value = fallback
    }
    cache.set(cacheKey, value)
    return value
  }

  async function loadCatalog() {
    return readJson(path.join(dataDir, "catalog.json"), { categories: [], entries: {}, entry_files: {} })
  }

  async function loadCategoryItems(categoryId) {
    if (categoryId === "animals") {
      return readJson(path.join(rootDir, "assets", "animals", "animals.json"), [])
    }
    if (categoryId === "vegetables") {
      return readJson(path.join(rootDir, "assets", "vegetables", "vegetables.json"), [])
    }
    const safe = String(categoryId || "").replace(/[^a-z0-9_]+/gi, "")
    if (!safe) return []
    return readJson(path.join(dataDir, "categories", `${safe}.json`), [])
  }

  async function getCatalog() {
    const catalog = await loadCatalog()
    const categories = []
    for (const category of catalog.categories || []) {
      const items = await loadCategoryItems(category.id)
      categories.push({
        id: category.id,
        name: category.name,
        count: Array.isArray(items) ? items.length : 0
      })
    }
    return { categories, total: categories.length }
  }

  async function getEntries(categoryId) {
    const items = await loadCategoryItems(categoryId)
    return Array.isArray(items) ? items : []
  }

  async function getAllEntries() {
    const catalog = await loadCatalog()
    const out = []
    for (const category of catalog.categories || []) {
      const items = await loadCategoryItems(category.id)
      for (const item of items) out.push(item)
    }
    return out
  }

  // --- Saran kata (word suggestions) ---
  async function listSuggestions() {
    const raw = await readJson(path.join(dataDir, "word_suggestions.json"), [])
    return Array.isArray(raw) ? raw : []
  }

  async function saveSuggestions(items) {
    await fsp.writeFile(path.join(dataDir, "word_suggestions.json"), JSON.stringify(items, null, 2), "utf8")
    cache.clear()
  }

  // --- Progres belajar per perangkat ---
  async function getProgress(deviceId) {
    const all = await readJson(path.join(dataDir, "progress.json"), {})
    const key = String(deviceId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)
    if (!key) return null
    return all[key] || null
  }

  async function saveProgress(deviceId, payload) {
    const key = String(deviceId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)
    if (!key) throw new Error("deviceId is required")
    const filePath = path.join(dataDir, "progress.json")
    let all = {}
    try {
      all = JSON.parse(await fsp.readFile(filePath, "utf8"))
    } catch {
      all = {}
    }
    all[key] = payload
    await fsp.writeFile(filePath, JSON.stringify(all, null, 2), "utf8")
    cache.clear()
    return payload
  }

  function healthInfo() {
    return { storage: "json", dataDir, exists: fs.existsSync(dataDir) }
  }

  return {
    kind: "json",
    getCatalog,
    getEntries,
    getAllEntries,
    listSuggestions,
    saveSuggestions,
    getProgress,
    saveProgress,
    healthInfo
  }
}

module.exports = { createLocalStore }
