/**
 * Membangun lexicon kompak untuk fitur Terjemah.
 * Payload berupa object { en: {key: [en, ar, id]}, ar: {...}, id: {...} }
 * sehingga jauh lebih kecil daripada seluruh entri (3MB -> ~260KB).
 */

function normalizeText(value, isArabic) {
  if (!value) return ""
  let text = String(value).toLowerCase().trim()
  if (isArabic) text = text.replace(/[\u064B-\u065F\u0670\u0640]/g, "")
  text = text.replace(/[^\p{L}\p{N}\s]/gu, "")
  return text.replace(/\s+/g, " ").trim()
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === "string") return value.split(",")
  return []
}

function buildLexiconPayload(entries) {
  const en = Object.create(null)
  const ar = Object.create(null)
  const id = Object.create(null)

  const put = (map, key, item) => {
    if (!key || map[key]) return
    map[key] = [item.en || "", item.ar || "", item.id || ""]
  }

  for (const item of Array.isArray(entries) ? entries : []) {
    if (!item || typeof item !== "object") continue
    put(en, normalizeText(item.en, false), item)
    put(ar, normalizeText(item.ar, true), item)
    put(id, normalizeText(item.id, false), item)
    for (const field of ["v1", "v2", "v3"]) {
      put(en, normalizeText(item[field], false), item)
    }
    for (const synonym of toArray(item.synonyms_en)) {
      put(en, normalizeText(synonym, false), item)
    }
    for (const synonym of toArray(item.synonyms_id)) {
      put(id, normalizeText(synonym, false), item)
    }
  }

  return {
    en,
    ar,
    id,
    stats: { en: Object.keys(en).length, ar: Object.keys(ar).length, id: Object.keys(id).length }
  }
}

function createLexiconCache(store) {
  let payload = null
  let building = null

  async function get() {
    if (payload) return payload
    if (!building) {
      building = (async () => {
        const entries = await store.getAllEntries()
        payload = buildLexiconPayload(entries)
        return payload
      })().finally(() => {
        building = null
      })
    }
    return building
  }

  function invalidate() {
    payload = null
  }

  return { get, invalidate }
}

module.exports = { buildLexiconPayload, createLexiconCache, normalizeText }
