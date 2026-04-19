require("dotenv").config()

const express = require("express")
const cors = require("cors")
const multer = require("multer")
const fs = require("fs")
const fsp = require("fs/promises")
const path = require("path")
const crypto = require("crypto")
const { parse } = require("csv-parse/sync")
const googleTTS = require("google-tts-api")

const ROOT = path.resolve(__dirname, "..")
const PORT = Math.max(1, Number(process.env.PORT || 8020) || 8020)
const HOST = process.env.HOST || "0.0.0.0"
const API_BASE_URL = process.env.API_BASE_URL || ""
const CORS_ORIGINS = String(process.env.CORS_ORIGINS || "*")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean)

const UPLOAD_DIR = path.join(ROOT, "assets", "user-images")
const MAP_PATH = path.join(UPLOAD_DIR, "user_images.json")
const ANIMALS_DIR = path.join(ROOT, "assets", "animals")
const ANIMALS_PATH = path.join(ANIMALS_DIR, "animals.json")
const VEGETABLES_DIR = path.join(ROOT, "assets", "vegetables")
const VEGETABLES_PATH = path.join(VEGETABLES_DIR, "vegetables.json")
const DATA_DIR = path.join(ROOT, "assets", "data")
const WORD_SUGGESTIONS_PATH = path.join(DATA_DIR, "word_suggestions.json")

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

const ttsRate = new Map()

function logEvent(kind, detail) {
  const stamp = new Date().toISOString()
  console.log(`[${stamp}] ${kind}: ${detail}`)
}

async function ensureJsonFile(filePath, initialValue) {
  try {
    await fsp.access(filePath, fs.constants.F_OK)
  } catch {
    await fsp.writeFile(filePath, JSON.stringify(initialValue, null, 2), "utf8")
  }
}

async function ensureStorage() {
  await fsp.mkdir(UPLOAD_DIR, { recursive: true })
  await fsp.mkdir(ANIMALS_DIR, { recursive: true })
  await fsp.mkdir(VEGETABLES_DIR, { recursive: true })
  await fsp.mkdir(DATA_DIR, { recursive: true })
  await ensureJsonFile(MAP_PATH, {})
  await ensureJsonFile(ANIMALS_PATH, [])
  await ensureJsonFile(VEGETABLES_PATH, [])
  await ensureJsonFile(WORD_SUGGESTIONS_PATH, [])
}

async function readJsonFile(filePath, fallback) {
  try {
    const raw = await fsp.readFile(filePath, "utf8")
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function writeJsonFile(filePath, data) {
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
}

function sanitizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "") || "img"
}

function buildEntryKey(entry) {
  return [
    String(entry && entry.en || "").trim().toLowerCase(),
    String(entry && entry.ar || "").trim().toLowerCase(),
    String(entry && entry.id || "").trim().toLowerCase()
  ].join("|")
}

function normalizeWordSuggestion(entry) {
  const source = entry && typeof entry === "object" ? entry : {}
  const now = Date.now()
  const status = String(source.status || "pending").trim().toLowerCase() === "updated" ? "updated" : "pending"
  return {
    id: String(source.id || crypto.randomUUID().slice(0, 12)),
    kind: String(source.kind || "word").trim().toLowerCase() || "word",
    request: String(source.request || "").trim(),
    meaning: String(source.meaning || "").trim(),
    category: String(source.category || "").trim(),
    note: String(source.note || "").trim(),
    status,
    ts: Number(source.ts || now) || now,
    updated_at: Number(source.updated_at || 0) || 0
  }
}

async function loadWordSuggestions() {
  const raw = await readJsonFile(WORD_SUGGESTIONS_PATH, [])
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const items = []
  for (const item of raw) {
    const normalized = normalizeWordSuggestion(item)
    if (!normalized.request || seen.has(normalized.id)) continue
    seen.add(normalized.id)
    items.push(normalized)
  }
  return items
}

async function saveWordSuggestions(items) {
  await writeJsonFile(WORD_SUGGESTIONS_PATH, items)
}

function allowTts(ip) {
  const now = Date.now()
  const items = (ttsRate.get(ip) || []).filter(ts => now - ts < 10_000)
  if (items.length >= 5) {
    ttsRate.set(ip, items)
    return false
  }
  items.push(now)
  ttsRate.set(ip, items)
  return true
}

function normalizeImportedRecord(record) {
  if (!record || typeof record !== "object") return null
  const item = {
    en: String(record.en || "").trim(),
    ar: String(record.ar || "").trim(),
    id: String(record.id || "").trim(),
    emoji: String(record.emoji || "").trim(),
    tags: Array.isArray(record.tags)
      ? record.tags.map(v => String(v || "").trim()).filter(Boolean)
      : String(record.tags || "").split(",").map(v => v.trim()).filter(Boolean),
    synonyms_en: Array.isArray(record.synonyms_en)
      ? record.synonyms_en.map(v => String(v || "").trim()).filter(Boolean)
      : String(record.synonyms_en || "").split(",").map(v => v.trim()).filter(Boolean),
    synonyms_id: Array.isArray(record.synonyms_id)
      ? record.synonyms_id.map(v => String(v || "").trim()).filter(Boolean)
      : String(record.synonyms_id || "").split(",").map(v => v.trim()).filter(Boolean)
  }
  return item.en || item.ar || item.id ? item : null
}

function parseImportBuffer(buffer, filename) {
  const ext = path.extname(String(filename || "")).toLowerCase()
  const text = buffer.toString("utf8")
  if (ext === ".json") {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.map(normalizeImportedRecord).filter(Boolean) : []
  }
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  })
  return rows.map(normalizeImportedRecord).filter(Boolean)
}

async function mergeImportedData(filePath, importedItems) {
  const existing = await readJsonFile(filePath, [])
  const map = new Map()
  for (const item of Array.isArray(existing) ? existing : []) {
    const normalized = normalizeImportedRecord(item)
    if (!normalized) continue
    map.set(buildEntryKey(normalized), normalized)
  }
  for (const item of importedItems) map.set(buildEntryKey(item), item)
  const merged = Array.from(map.values())
  await writeJsonFile(filePath, merged)
  return { imported: importedItems.length, total: merged.length }
}

function sendError(res, status, message) {
  res.status(status).json({ ok: false, error: message })
}

function resolvePublicUrl(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/")
  if (!API_BASE_URL) return normalized
  return new URL(normalized.replace(/^\/+/, ""), API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`).toString()
}

async function createApp() {
  await ensureStorage()

  const app = express()

  app.use(cors({
    origin(origin, callback) {
      if (!origin || !CORS_ORIGINS.length || CORS_ORIGINS.includes("*") || CORS_ORIGINS.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error("Origin not allowed by CORS"))
    }
  }))
  app.use(express.json({ limit: "2mb" }))
  app.use(express.urlencoded({ extended: true }))

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "pembelajaran-backend", port: PORT })
  })

  app.get("/word-suggestions", async (_req, res) => {
    try {
      const items = await loadWordSuggestions()
      items.sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))
      res.json({ items, total: items.length })
    } catch (error) {
      logEvent("word_suggestions_get_error", error.message)
      sendError(res, 500, "Failed to load word suggestions")
    }
  })

  app.post("/word-suggestions", async (req, res) => {
    try {
      const entry = normalizeWordSuggestion(req.body)
      if (!entry.request) {
        sendError(res, 400, "Request is required")
        return
      }
      const items = await loadWordSuggestions()
      const next = [entry, ...items.filter(item => item.id !== entry.id)].slice(0, 500)
      await saveWordSuggestions(next)
      logEvent("word_suggestions_add_ok", entry.request.slice(0, 80))
      res.json({ ok: true, item: entry, total: next.length })
    } catch (error) {
      logEvent("word_suggestions_add_error", error.message)
      sendError(res, 500, "Failed to save word suggestion")
    }
  })

  app.post("/word-suggestions-status", async (req, res) => {
    try {
      const itemId = String(req.body && req.body.id || "").trim()
      const status = String(req.body && req.body.status || "pending").trim().toLowerCase()
      if (!itemId) {
        sendError(res, 400, "id is required")
        return
      }
      if (!["pending", "updated"].includes(status)) {
        sendError(res, 400, "status must be pending or updated")
        return
      }
      const items = await loadWordSuggestions()
      let updated = null
      const next = items.map(item => {
        if (item.id !== itemId) return item
        updated = Object.assign({}, item, {
          status,
          updated_at: status === "updated" ? Date.now() : 0
        })
        return updated
      })
      if (!updated) {
        sendError(res, 404, "Suggestion not found")
        return
      }
      await saveWordSuggestions(next)
      logEvent("word_suggestions_status_ok", `${itemId}:${status}`)
      res.json({ ok: true, item: updated })
    } catch (error) {
      logEvent("word_suggestions_status_error", error.message)
      sendError(res, 500, "Failed to update suggestion status")
    }
  })

  app.get("/tts", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "0.0.0.0"
      if (!allowTts(ip)) {
        sendError(res, 429, "Too Many Requests")
        return
      }
      const text = String(req.query.text || "").trim()
      const inputLang = String(req.query.lang || "ar").trim().toLowerCase()
      const lang = inputLang.startsWith("en") ? "en" : inputLang.startsWith("id") ? "id" : "ar"
      if (!text) {
        sendError(res, 400, "Text is required")
        return
      }
      const ttsUrl = googleTTS.getAudioUrl(text, {
        lang,
        slow: false,
        host: "https://translate.google.com"
      })
      const audioRes = await fetch(ttsUrl)
      if (!audioRes.ok) {
        sendError(res, 502, "TTS generation failed")
        return
      }
      res.setHeader("Content-Type", "audio/mpeg")
      res.setHeader("Cache-Control", "no-store")
      const buffer = Buffer.from(await audioRes.arrayBuffer())
      res.end(buffer)
    } catch (error) {
      logEvent("tts_error", error.message)
      sendError(res, 500, "Unexpected server error")
    }
  })

  app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file
      if (!file || !file.buffer) {
        sendError(res, 400, "No file provided")
        return
      }
      if (!String(file.mimetype || "").startsWith("image/")) {
        sendError(res, 400, "Invalid MIME type")
        return
      }
      const ext = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].includes(path.extname(file.originalname || "").toLowerCase())
        ? path.extname(file.originalname || "").toLowerCase()
        : ".png"
      const en = String(req.body.en || "")
      const ar = String(req.body.ar || "")
      const idValue = String(req.body.id || "")
      const prev = String(req.body.prev || "")
      const base = sanitizeName(en || idValue || "img")
      const uniq = `${base}-${Date.now()}-${crypto.randomUUID().slice(0, 6)}${ext}`
      const outPath = path.join(UPLOAD_DIR, uniq)
      await fsp.writeFile(outPath, file.buffer)
      const mapping = await readJsonFile(MAP_PATH, {})
      const key = `${en.toLowerCase()}|${ar.toLowerCase()}|${idValue.toLowerCase()}`
      const url = `/assets/user-images/${uniq}`
      mapping[key] = url
      await writeJsonFile(MAP_PATH, mapping)
      if (prev) {
        try {
          const oldPath = path.normalize(path.join(ROOT, prev.replace(/^\/+/, "")))
          if (oldPath.startsWith(UPLOAD_DIR) && oldPath !== outPath && fs.existsSync(oldPath)) {
            await fsp.unlink(oldPath)
          }
        } catch {}
      }
      logEvent("upload_ok", url)
      res.json({ url: resolvePublicUrl(url) })
    } catch (error) {
      logEvent("upload_error", error.message)
      sendError(res, 500, "Upload failed")
    }
  })

  app.post("/import-animals", upload.single("file"), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        sendError(res, 400, "No file provided")
        return
      }
      const importedItems = parseImportBuffer(req.file.buffer, req.file.originalname)
      const summary = await mergeImportedData(ANIMALS_PATH, importedItems)
      logEvent("import_animals_ok", `count=${summary.imported} total=${summary.total}`)
      res.json({ count: summary.imported, total: summary.total })
    } catch (error) {
      logEvent("import_animals_error", error.message)
      sendError(res, 400, "Failed to import animals data")
    }
  })

  app.post("/import-vegetables", upload.single("file"), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        sendError(res, 400, "No file provided")
        return
      }
      const importedItems = parseImportBuffer(req.file.buffer, req.file.originalname)
      const summary = await mergeImportedData(VEGETABLES_PATH, importedItems)
      logEvent("import_vegetables_ok", `count=${summary.imported} total=${summary.total}`)
      res.json({ count: summary.imported, total: summary.total })
    } catch (error) {
      logEvent("import_vegetables_error", error.message)
      sendError(res, 400, "Failed to import vegetables data")
    }
  })

  app.use(express.static(ROOT, {
    extensions: ["html"]
  }))

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      sendError(res, 404, "Not Found")
      return
    }
    res.sendFile(path.join(ROOT, "index.html"))
  })

  return app
}

async function start() {
  const app = await createApp()
  app.listen(PORT, HOST, () => {
    console.log(`Express backend ready at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/`)
  })
}

start().catch(error => {
  console.error(error)
  process.exit(1)
})
