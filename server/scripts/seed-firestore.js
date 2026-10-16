/**
 * Seed data statis (assets/) ke Firebase Firestore.
 *
 * Jalankan:
 *   cd server
 *   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' node scripts/seed-firestore.js
 *
 * Atau set GOOGLE_APPLICATION_CREDENTIALS ke file service account.
 *Opsional:
 *   STORAGE=firestore  -> paksa mode firestore
 *   node scripts/seed-firestore.js --dry-run   (hanya menampilkan ringkasan)
 */
const path = require("path")
const fs = require("fs")
const fsp = require("fs/promises")

const ROOT = path.resolve(__dirname, "..", "..")
const DATA_DIR = path.join(ROOT, "assets", "data")

const CHUNK_MAX_BYTES = 700 * 1024 // aman di bawah limit dokumen Firestore 1MB

function chunkItems(items, maxBytes) {
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

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fsp.readFile(filePath, "utf8"))
  } catch {
    return fallback
  }
}

async function loadLocalData() {
  const catalog = await readJson(path.join(DATA_DIR, "catalog.json"), { categories: [] })
  const categories = []
  const allEntries = []

  for (const [order, category] of (catalog.categories || []).entries()) {
    let items = []
    if (category.id === "animals") {
      items = await readJson(path.join(ROOT, "assets", "animals", "animals.json"), [])
    } else if (category.id === "vegetables") {
      items = await readJson(path.join(ROOT, "assets", "vegetables", "vegetables.json"), [])
    } else {
      items = await readJson(path.join(DATA_DIR, "categories", `${category.id}.json`), [])
    }
    if (!Array.isArray(items)) items = []
    categories.push({ id: category.id, name: category.name, count: items.length, order })
    for (const item of items) allEntries.push({ ...item, __category: category.id })
  }

  const suggestions = await readJson(path.join(DATA_DIR, "word_suggestions.json"), [])
  return { categories, allEntries, suggestions: Array.isArray(suggestions) ? suggestions : [] }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  const { categories, allEntries, suggestions } = await loadLocalData()
  console.log(`[seed] kategori=${categories.length} entri=${allEntries.length} saran=${suggestions.length}`)

  if (dryRun) {
    for (const category of categories) {
      const items = allEntries.filter(item => item.__category === category.id)
      const chunks = chunkItems(items, CHUNK_MAX_BYTES)
      console.log(`  - ${category.id.padEnd(28)} ${String(category.count).padStart(5)} entri  ${chunks.length} chunk`)
    }
    return
  }

  let admin
  try {
    admin = require("firebase-admin")
  } catch (error) {
    console.error("[seed] firebase-admin belum terpasang. Jalankan `npm install` di folder server.")
    process.exit(1)
  }

  const { parseServiceAccount, isFirestoreConfigured } = require("../db/firestore")
  if (!isFirestoreConfigured()) {
    console.error("[seed] Kredensial Firestore tidak ditemukan.")
    console.error("        Set FIREBASE_SERVICE_ACCOUNT (JSON) atau GOOGLE_APPLICATION_CREDENTIALS lalu ulangi.")
    process.exit(1)
  }

  if (!admin.apps.length) {
    const serviceAccount = parseServiceAccount()
    admin.initializeApp(
      serviceAccount
        ? { credential: admin.credential.cert(serviceAccount) }
        : { projectId: process.env.FIREBASE_PROJECT_ID || undefined }
    )
  }

  const db = admin.firestore()
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`[seed] emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`)
  }

  // 1. categories
  let batch = db.batch()
  let ops = 0
  for (const category of categories) {
    batch.set(db.collection("categories").doc(category.id), {
      id: category.id,
      name: category.name,
      count: category.count,
      order: category.order
    })
    if (++ops >= 400) { await batch.commit(); batch = db.batch(); ops = 0 }
  }

  // 2. entries (per kategori, di-chunk)
  let chunkCount = 0
  for (const category of categories) {
    const items = allEntries.filter(item => item.__category === category.id).map(({ __category, ...rest }) => rest)
    const chunks = chunkItems(items, CHUNK_MAX_BYTES)
    chunks.forEach((chunk, index) => {
      const docId = `${category.id}__${String(index).padStart(3, "0")}`
      batch.set(db.collection("entries").doc(docId), { category: category.id, index, items: chunk })
      chunkCount++
      ops++
    })
    if (ops >= 400) { await batch.commit(); batch = db.batch(); ops = 0 }
  }

  // 3. meta/catalog untuk respon cepat
  batch.set(db.collection("meta").doc("catalog"), {
    categories: categories.map(c => ({ id: c.id, name: c.name, count: c.count })),
    total: categories.length,
    entryCount: allEntries.length,
    seeded_at: Date.now()
  })
  ops++

  if (ops > 0) await batch.commit()
  console.log(`[seed] kategori ditulis: ${categories.length}, chunk entri: ${chunkCount}`)

  // 4. saran kata (opsional, bila file ada)
  if (suggestions.length) {
    let sBatch = db.batch()
    let sOps = 0
    for (const item of suggestions) {
      if (!item || !item.id) continue
      sBatch.set(db.collection("word_suggestions").doc(String(item.id)), item, { merge: true })
      if (++sOps >= 400) { await sBatch.commit(); sBatch = db.batch(); sOps = 0 }
    }
    if (sOps > 0) await sBatch.commit()
    console.log(`[seed] saran kata ditulis: ${suggestions.length}`)
  }

  console.log("[seed] selesai.")
  await admin.app().delete()
}

main().catch(error => {
  console.error("[seed] gagal:", error)
  process.exit(1)
})
