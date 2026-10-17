/**
 * Inti seed dataset statis (assets/) -> Firestore.
 * Dipakai oleh: server/scripts/seed-firestore.js (lokal) dan GET-free endpoint /admin/seed (Cloud Functions).
 * Skema: categories/{id}, entries/{cat}__{n}, meta/catalog, word_suggestions/{id}
 */
const path = require("path")
const fsp = require("fs/promises")

const CHUNK_MAX_BYTES = 700 * 1024 // aman di bawah limit dokumen Firestore 1MB

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fsp.readFile(filePath, "utf8"))
  } catch {
    return fallback
  }
}

async function loadDataset(assetsRoot) {
  const dataDir = path.join(assetsRoot, "data")
  const catalog = await readJson(path.join(dataDir, "catalog.json"), { categories: [] })
  const categories = []
  const allEntries = []

  for (const [order, category] of (catalog.categories || []).entries()) {
    let items = []
    if (category.id === "animals") {
      items = await readJson(path.join(assetsRoot, "animals", "animals.json"), [])
    } else if (category.id === "vegetables") {
      items = await readJson(path.join(assetsRoot, "vegetables", "vegetables.json"), [])
    } else {
      items = await readJson(path.join(dataDir, "categories", `${category.id}.json`), [])
    }
    if (!Array.isArray(items)) items = []
    categories.push({ id: category.id, name: category.name, count: items.length, order })
    for (const item of items) allEntries.push({ ...item, __category: category.id })
  }

  const suggestions = await readJson(path.join(dataDir, "word_suggestions.json"), [])
  return {
    categories,
    allEntries,
    suggestions: Array.isArray(suggestions) ? suggestions : []
  }
}

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

/** Tulis seluruh dataset ke Firestore. Mengembalikan ringkasan jumlah. */
async function seedFirestore({ assetsRoot, db }) {
  const { categories, allEntries, suggestions } = await loadDataset(assetsRoot)

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
    categories: categories.map(category => ({ id: category.id, name: category.name, count: category.count })),
    total: categories.length,
    entryCount: allEntries.length,
    seeded_at: Date.now()
  })
  ops++

  if (ops > 0) await batch.commit()

  // 4. saran kata (opsional)
  let suggestionCount = 0
  if (suggestions.length) {
    let sBatch = db.batch()
    let sOps = 0
    for (const item of suggestions) {
      if (!item || !item.id) continue
      sBatch.set(db.collection("word_suggestions").doc(String(item.id)), item, { merge: true })
      suggestionCount++
      if (++sOps >= 400) { await sBatch.commit(); sBatch = db.batch(); sOps = 0 }
    }
    if (sOps > 0) await sBatch.commit()
  }

  return {
    categories: categories.length,
    entries: allEntries.length,
    entryChunks: chunkCount,
    suggestions: suggestionCount
  }
}

module.exports = { loadDataset, chunkItems, seedFirestore }
