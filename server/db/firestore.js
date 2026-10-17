/**
 * Firestore store (firebase-admin).
 *
 * Dipakai saat kredensial Firebase tersedia (misalnya production di Render).
 * Skema:
 *   categories/{categoryId}      -> { id, name, order, count }
 *   entries/{categoryId}__{n}    -> { category, index, items: [...] }   (dibagi chunk agar < 1MB)
 *   word_suggestions/{id}        -> entri saran kata
 *   custom_words/{key}           -> kata yang ditambahkan pengguna/admin dari aplikasi
 *   progress/{deviceId}          -> { deviceId, data, updated_at }
 *   meta/catalog                 -> ringkasan kategori (dibuat oleh seed, diperbarui saat impor)
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

/** Kunci dedupe antar entri kategori. */
function entryKey(item) {
  return [String(item.en || "").toLowerCase(), String(item.ar || "").toLowerCase(), String(item.id || "").toLowerCase()].join("|")
}

/** Bagi items ke chunk — aman di bawah limit dokumen Firestore 1MB. */
function chunkItems(items, maxBytes = 700 * 1024) {
  const chunks = []
  let current = []
  let size = 2
  for (const item of items) {
    const itemSize = Buffer.byteLength(JSON.stringify(item)) + 1
    if (current.length && size + itemSize > maxBytes) {
      chunks.push(current)
      current = []
      size = 2
    }
    current.push(item)
    size += itemSize
  }
  if (current.length) chunks.push(current)
  return chunks.length ? chunks : [[]]
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
    customWords: "custom_words",
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
    // kata custom ikut masuk leksikon
    for (const word of await listCustomWords()) out.push(word)
    return out
  }

  // ---------- tulis data (impor admin / tambah bahan) ----------

  /**
   * Tulis ulang seluruh entri satu kategori ke Firestore, lalu perbarui
   * jumlah kategori di doc categories + meta/catalog.
   * Dipakai oleh fitur impor admin supaya tambahan bahan tersimpan permanen
   * di Firestore (bukan file lokal/temp yang hilang saat deploy).
   */
  async function replaceCategoryEntries(categoryId, items) {
    const safe = String(categoryId || "").replace(/[^a-z0-9_]+/gi, "")
    if (!safe || !Array.isArray(items)) throw new Error("categoryId dan items wajib")

    let batch_ = db.batch()
    let ops = 0
    const commit = async () => { await batch_.commit(); batch_ = db.batch(); ops = 0 }

    // 1. hapus semua doc chunk lama kategori ini
    const old = await db.collection(COLLECTIONS.entries).where("category", "==", safe).get()
    for (const doc of old.docs) {
      if (ops >= 400) await commit()
      batch_.delete(doc.ref)
      ops++
    }

    // 2. tulis chunk baru
    const chunks = chunkItems(items)
    for (let index = 0; index < chunks.length; index++) {
      if (ops >= 400) await commit()
      const docId = `${safe}__${String(index).padStart(3, "0")}`
      batch_.set(db.collection(COLLECTIONS.entries).doc(docId), { category: safe, index, items: chunks[index] })
      ops++
    }

    // 3. jumlah di doc categories/{id}
    if (ops >= 400) await commit()
    batch_.set(db.collection(COLLECTIONS.categories).doc(safe), { id: safe, count: items.length }, { merge: true })
    await commit()

    // 4. perbarui meta/catalog — jumlah kategori lama & daftarkan kategori baru
    const metaRef = db.collection(COLLECTIONS.meta).doc("catalog")
    const metaDoc = await metaRef.get()
    if (metaDoc.exists) {
      const meta = metaDoc.data()
      const categories = (meta.categories || []).slice()
      const hit = categories.find(category => category.id === safe)
      if (hit) hit.count = items.length
      else categories.push({ id: safe, name: safe, count: items.length })
      meta.categories = categories
      meta.total = categories.length
      await metaRef.set(meta)
    }
    reset()
    return { category: safe, items: items.length, chunks: chunks.length }
  }

  // ---------- kata custom (tambah kata dari aplikasi) ----------

  async function listCustomWords() {
    const snapshot = await db.collection(COLLECTIONS.customWords).orderBy("created_at", "desc").limit(1000).get()
    return snapshot.docs.map(doc => doc.data())
  }

  async function saveCustomWord(item) {
    const entry = {
      en: String(item.en || "").trim(),
      ar: String(item.ar || "").trim(),
      id: String(item.id || "").trim()
    }
    if (!entry.en && !entry.ar && !entry.id) throw new Error("minimal satu bahasa harus terisi")
    const key = [entry.en, entry.ar, entry.id].join("|")
    await db.collection(COLLECTIONS.customWords).doc(key).set({
      ...entry,
      deviceId: String(item.deviceId || "").slice(0, 80),
      created_at: Date.now()
    }, { merge: true })
    reset()
    return entry
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

  // Hapus cache in-memory (catalog & entries) — dipakai setelah seed/impor data baru.
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
    replaceCategoryEntries,
    listCustomWords,
    saveCustomWord,
    listSuggestions,
    saveSuggestions,
    getProgress,
    saveProgress,
    reset,
    healthInfo
  }
}

module.exports = { createFirestoreStore, isFirestoreConfigured, parseServiceAccount, entryKey }
