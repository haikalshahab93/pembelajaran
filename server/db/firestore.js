/**
 * Firestore store (firebase-admin).
 *
 * Dipakai saat kredensial Firebase tersedia (misalnya production di Render).
 * Skema:
 *   categories/{categoryId}      -> { id, name, order, count }
 *   entries/{categoryId}__{n}    -> { category, index, items: [...] }   (dibagi chunk agar < 1MB)
 *   word_suggestions/{id}        -> entri saran kata
 *   progress/{deviceId}          -> { deviceId, data, updated_at }
 *   meta/catalog                 -> ringkasan kategori (dibuat oleh seed)
 */

function isFirestoreConfigured(env = process.env) {
  if (env.FIRESTORE_EMULATOR_HOST) return true
  if (env.FIREBASE_SERVICE_ACCOUNT || env.FIREBASE_SERVICE_ACCOUNT_JSON) return true
  if (env.GOOGLE_APPLICATION_CREDENTIALS) return true
  if (env.GOOGLE_APPLICATION_CREDENTIALS_JSON && env.FIREBASE_PROJECT_ID) return true
  // Di dalam Cloud Functions (dalam Google Cloud), credentials aplikasi bawaan (metadata)
  // tersedia otomatis — tidak butuh file service account.
  if (env.K_SERVICE || env.FUNCTION_TARGET || env.GCLOUD_PROJECT || env.GCP_PROJECT) return true
  return false
}

function parseServiceAccount(env = process.env) {
  const raw = env.FIREBASE_SERVICE_ACCOUNT || env.FIREBASE_SERVICE_ACCOUNT_JSON || env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!raw) return null
  const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT bukan JSON valid: ${error.message}`)
  }
}

function createFirestoreStore({ env = process.env, rootDir, dataDir } = {}) {
  // require bertahap supaya mode JSON tetap jalan bila firebase-admin belum terpasang.
  const admin = require("firebase-admin")

  if (!admin.apps.length) {
    const serviceAccount = parseServiceAccount(env)
    const config = serviceAccount
      ? { credential: admin.credential.cert(serviceAccount), projectId: serviceAccount.project_id }
      : env.GOOGLE_APPLICATION_CREDENTIALS_JSON && env.FIREBASE_PROJECT_ID
        ? {
            credential: admin.credential.cert(JSON.parse(
              Buffer.from(env.GOOGLE_APPLICATION_CREDENTIALS_JSON, "base64").toString("utf8")
            )),
            projectId: env.FIREBASE_PROJECT_ID
          }
        : { projectId: env.FIREBASE_PROJECT_ID || undefined }
    admin.initializeApp(config)
  }

  const db = admin.firestore()
  const cache = new Map()

  const COLLECTIONS = {
    categories: "categories",
    entries: "entries",
    suggestions: "word_suggestions",
    progress: "progress",
    meta: "meta"
  }

  async function getCatalog() {
    if (cache.has("catalog")) return cache.get("catalog")
    const meta = await db.collection(COLLECTIONS.meta).doc("catalog").get()
    if (meta.exists) {
      const value = meta.data()
      cache.set("catalog", value)
      return value
    }
    const snapshot = await db.collection(COLLECTIONS.categories).orderBy("order").get()
    const categories = snapshot.docs.map(doc => {
      const data = doc.data()
      return { id: data.id || doc.id, name: data.name || doc.id, count: Number(data.count || 0) }
    })
    const value = { categories, total: categories.length }
    cache.set("catalog", value)
    return value
  }

  async function getEntries(categoryId) {
    const safe = String(categoryId || "").replace(/[^a-z0-9_]+/gi, "")
    if (!safe) return []
    const key = `entries:${safe}`
    if (cache.has(key)) return cache.get(key)
    // tanpa orderBy agar tidak butuh composite index Firestore
    const snapshot = await db
      .collection(COLLECTIONS.entries)
      .where("category", "==", safe)
      .get()
    const items = []
    snapshot.docs
      .sort((a, b) => Number(a.data().index || 0) - Number(b.data().index || 0))
      .forEach(doc => {
        const chunk = doc.data().items || []
        for (const item of chunk) items.push(item)
      })
    cache.set(key, items)
    return items
  }

  async function getAllEntries() {
    const catalog = await getCatalog()
    const out = []
    for (const category of catalog.categories || []) {
      const items = await getEntries(category.id)
      for (const item of items) out.push(item)
    }
    return out
  }

  async function listSuggestions() {
    const snapshot = await db.collection(COLLECTIONS.suggestions).orderBy("ts", "desc").limit(500).get()
    return snapshot.docs.map(doc => doc.data())
  }

  async function saveSuggestions(items) {
    const incoming = Array.isArray(items) ? items : []
    const snapshot = await db.collection(COLLECTIONS.suggestions).limit(500).get()
    const existingIds = new Set(snapshot.docs.map(doc => doc.id))
    const incomingIds = new Set(incoming.map(item => String(item.id)))

    const collection = db.collection(COLLECTIONS.suggestions)
    const ops = []
    for (const id of existingIds) {
      if (!incomingIds.has(id)) ops.push({ kind: "delete", ref: collection.doc(id) })
    }
    for (const item of incoming) {
      ops.push({ kind: "set", ref: collection.doc(String(item.id)), data: item })
    }

    // Firestore batch dibatasi 500 operasi per batch.
    for (let i = 0; i < ops.length; i += 400) {
      const batch = db.batch()
      for (const op of ops.slice(i, i + 400)) {
        if (op.kind === "delete") batch.delete(op.ref)
        else batch.set(op.ref, op.data, { merge: true })
      }
      await batch.commit()
    }
    return items
  }

  async function getProgress(deviceId) {
    const key = String(deviceId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)
    if (!key) return null
    const doc = await db.collection(COLLECTIONS.progress).doc(key).get()
    if (!doc.exists) return null
    const data = doc.data()
    return data.payload || null
  }

  async function saveProgress(deviceId, payload) {
    const key = String(deviceId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)
    if (!key) throw new Error("deviceId is required")
    await db.collection(COLLECTIONS.progress).doc(key).set({
      deviceId: key,
      payload,
      updated_at: Date.now()
    }, { merge: true })
    return payload
  }

  // Hapus cache in-memory (catalog & entries) — dipakai setelah seed data baru.
  function reset() {
    cache.clear()
  }

  function healthInfo() {
    return {
      storage: "firestore",
      projectId: admin.app().options.projectId || "",
      emulator: !!env.FIRESTORE_EMULATOR_HOST
    }
  }

  return {
    kind: "firestore",
    getCatalog,
    getEntries,
    getAllEntries,
    listSuggestions,
    saveSuggestions,
    getProgress,
    saveProgress,
    reset,
    healthInfo
  }
}

module.exports = { createFirestoreStore, isFirestoreConfigured, parseServiceAccount }
