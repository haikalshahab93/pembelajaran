/**
 * Logika bahasa: normalisasi, deteksi bahasa, lexicon, dan penerjemah kamus.
 * Dipindahkan dari app.js sistem lama menjadi fungsi murni.
 */

export function normalize(value, isArabic) {
  if (!value) return ""
  let text = String(value).toLowerCase().trim()
  if (isArabic) text = text.replace(/[\u064B-\u065F\u0670\u0640]/g, "")
  text = text.replace(/[^\p{L}\p{N}\s]/gu, "")
  return text.replace(/\s+/g, " ").trim()
}

export function containsArabic(value) {
  return /[\u0600-\u06FF]/.test(String(value || ""))
}

export function prettifySpacing(value, isArabic) {
  if (!value) return ""
  let text = value.replace(/\s+/g, " ").trim()
  text = text.replace(/\s*([.,!?;:])/g, "$1")
  text = text.replace(/([.,!?;:])([^\s])/g, "$1 $2")
  return text
}

function arBaseWord(word) {
  let text = normalize(word, true)
  if (text.startsWith("\u0627\u0644")) text = text.slice(2)
  return text
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === "string") return value.split(",")
  return []
}

export function emptyLexicon() {
  return { en: new Map(), ar: new Map(), id: new Map(), enSet: new Set(), idSet: new Set() }
}

function put(map, set, key, item) {
  if (!key || map.has(key)) return
  map.set(key, [item.en || "", item.ar || "", item.id || ""])
  if (set) set.add(key)
}

/** Bangun lexicon dari daftar entri (dipakai sebagai fallback offline). */
export function buildLexicon(entries) {
  const lex = emptyLexicon()
  for (const item of Array.isArray(entries) ? entries : []) {
    addEntryToLexicon(lex, item)
  }
  return lex
}

export function addEntryToLexicon(lex, item) {
  if (!item) return lex
  put(lex.en, lex.enSet, normalize(item.en, false), item)
  put(lex.ar, null, normalize(item.ar, true), item)
  put(lex.id, lex.idSet, normalize(item.id, false), item)
  for (const field of ["v1", "v2", "v3"]) {
    put(lex.en, lex.enSet, normalize(item[field], false), item)
  }
  for (const synonym of toArray(item.synonyms_en)) {
    put(lex.en, lex.enSet, normalize(synonym, false), item)
  }
  for (const synonym of toArray(item.synonyms_id)) {
    put(lex.id, lex.idSet, normalize(synonym, false), item)
  }
  return lex
}

/** Konversi payload lexicon dari API menjadi struktur Map. */
export function lexiconFromPayload(payload) {
  const lex = emptyLexicon()
  if (!payload) return lex
  const fill = (target, set, source) => {
    if (!source) return
    const pairs = Array.isArray(source) ? source : Object.entries(source)
    for (const [key, value] of pairs) {
      target.set(key, value)
      if (set) set.add(key)
    }
  }
  fill(lex.en, lex.enSet, payload.en)
  fill(lex.ar, null, payload.ar)
  fill(lex.id, lex.idSet, payload.id)
  return lex
}

export function detectLang(text, lex) {
  if (containsArabic(text)) return "ar"
  const tokens = normalize(text, false).split(" ").filter(Boolean)
  let enHit = 0
  let idHit = 0
  for (const token of tokens) {
    if (lex.enSet.has(token)) enHit++
    if (lex.idSet.has(token)) idHit++
  }
  return enHit >= idHit ? "en" : "id"
}

function splitTokens(text) {
  return text.split(/(\s+|[.,!?;:"'()\-])/)
}

const isSeparator = token => /^\s+$/.test(token || "") || /^[.,!?;:"'()\-]+$/.test(token || "")

/**
 * Terjemah kata per kata memakai lexicon lokal (EN/AR/ID).
 * @returns {{src:string,en:string,ar:string,id:string,unknown:string[]}}
 */
export function translateText(text, lex, options = {}) {
  const source = String(text || "")
  if (!source.trim()) return { src: "", en: "", ar: "", id: "", unknown: [] }

  const src = detectLang(source, lex)
  const tokens = splitTokens(source)
  const enOut = []
  const arOut = []
  const idOut = []
  const unknown = []

  if (src === "ar") {
    for (const token of tokens) {
      if (isSeparator(token)) {
        enOut.push(token)
        arOut.push(token)
        idOut.push(token)
        continue
      }
      const key = normalize(token, true)
      const item = lex.ar.get(key) || lex.ar.get(arBaseWord(token))
      if (item) {
        enOut.push(item[0] || token)
        arOut.push(item[1] || token)
        idOut.push(item[2] || token)
      } else {
        enOut.push(token)
        arOut.push(token)
        idOut.push(token)
        unknown.push(token)
      }
    }
  } else {
    const wordIndexes = []
    tokens.forEach((token, index) => {
      if (!isSeparator(token)) wordIndexes.push(index)
    })
    const endIndexForN = (count, start) => {
      let seen = 0
      let cursor = start
      while (cursor < tokens.length && seen < count) {
        if (!isSeparator(tokens[cursor])) seen++
        cursor++
      }
      return seen === count ? cursor - 1 : start
    }

    let index = 0
    while (index < tokens.length) {
      const token = tokens[index]
      if (isSeparator(token)) {
        enOut.push(token)
        arOut.push(token)
        idOut.push(token)
        index++
        continue
      }
      let bestItem = null
      let bestEnd = index
      for (let n = 3; n >= 1; n--) {
        const end = endIndexForN(n, index)
        if (end === index) continue
        const phrase = tokens.slice(index, end + 1).filter(t => !isSeparator(t)).join(" ")
        const key = normalize(phrase, false)
        const item = src === "en" ? lex.en.get(key) : lex.id.get(key)
        if (item) {
          bestItem = item
          bestEnd = end
          break
        }
      }
      if (bestItem) {
        enOut.push(bestItem[0] || "")
        arOut.push(bestItem[1] || "")
        idOut.push(bestItem[2] || "")
        index = bestEnd + 1
      } else {
        const key = normalize(token, false)
        const item = src === "en" ? lex.en.get(key) : lex.id.get(key)
        if (item) {
          enOut.push(item[0] || token)
          arOut.push(item[1] || token)
          idOut.push(item[2] || token)
        } else {
          enOut.push(token)
          arOut.push(token)
          idOut.push(token)
          unknown.push(token)
        }
        index++
      }
    }
  }

  const spaced = options.spaced === true
  const uniqueUnknown = Array.from(new Set(unknown))
  return {
    src,
    en: spaced ? prettifySpacing(enOut.join(""), false) : enOut.join(""),
    ar: spaced ? prettifySpacing(arOut.join(""), true) : arOut.join(""),
    id: spaced ? prettifySpacing(idOut.join(""), false) : idOut.join(""),
    unknown: uniqueUnknown
  }
}
