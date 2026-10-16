/**
 * SRS (spaced repetition) + logika kuis. Dipindahkan dari app.js sistem lama
 * menjadi fungsi murni agar mudah diuji dan dipakai ulang di React.
 */

export const DEFAULT_SRS = {
  level: 1,
  attempts: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  lastSeen: 0,
  lastWrong: 0,
  avgMs: 0,
  lastMs: 0
}

export function srsKey(item) {
  if (!item) return ""
  return `${String(item.en || "").toLowerCase().trim()}|${String(item.ar || "").toLowerCase().trim()}|${String(item.id || "").toLowerCase().trim()}`
}

export function ensureSrs(map, item) {
  const key = srsKey(item)
  if (!key) return { ...DEFAULT_SRS }
  if (!map[key]) map[key] = { ...DEFAULT_SRS }
  else map[key] = Object.assign({}, DEFAULT_SRS, map[key])
  return map[key]
}

export function applySrsResult(entry, meta = {}) {
  const ok = !!meta.ok
  const elapsedMs = Math.max(300, Math.round(Number(meta.elapsedMs || 0) || 0))
  const timerSecs = Number(meta.timerSecs || 0)
  const now = Date.now()

  entry.attempts = (entry.attempts || 0) + 1
  entry.lastSeen = now
  if (elapsedMs) {
    entry.lastMs = elapsedMs
    entry.avgMs = entry.avgMs ? Math.round(entry.avgMs * 0.65 + elapsedMs * 0.35) : elapsedMs
  }

  if (ok) {
    entry.correct = (entry.correct || 0) + 1
    entry.streak = (entry.streak || 0) + 1
    const fastThreshold = Math.max(2200, (timerSecs || 30) * 350)
    const bonus = elapsedMs && elapsedMs <= fastThreshold ? 2 : 1
    entry.level = Math.min(6, (entry.level || 1) + bonus)
  } else {
    entry.wrong = (entry.wrong || 0) + 1
    entry.streak = 0
    entry.lastWrong = now
    entry.level = Math.max(1, (entry.level || 1) - (meta.timedOut ? 2 : 1))
  }
  return entry
}

export function srsSnapshot(entry) {
  const data = Object.assign({}, DEFAULT_SRS, entry || {})
  const day = 24 * 60 * 60 * 1000
  if (!(data.attempts || 0)) {
    return {
      entry: data,
      label: "Belum latihan",
      tone: "new",
      summary: "Belum latihan \u2022 Level 1",
      stats: ""
    }
  }
  const recentWrong = data.lastWrong && Date.now() - data.lastWrong < day
  const label = recentWrong
    ? "Perlu review"
    : data.level <= 2
      ? "Masih sulit"
      : data.level <= 4
        ? "Sedang latihan"
        : "Sudah kuat"
  const tone = recentWrong || data.level <= 2 ? "hard" : data.level <= 4 ? "mid" : "easy"
  const stats = []
  if (data.attempts) stats.push(`${data.attempts} latihan`)
  if (data.correct || data.wrong) stats.push(`${data.correct || 0} benar / ${data.wrong || 0} salah`)
  if (data.avgMs) stats.push(`rata-rata ${(data.avgMs / 1000).toFixed(1)} dtk`)
  return { entry: data, label, tone, summary: `${label} \u2022 Level ${data.level || 1}`, stats: stats.join(" \u2022 ") }
}

export function srsUrgency(entry, now = Date.now(), timerSecs = 30) {
  const data = Object.assign({}, DEFAULT_SRS, entry || {})
  const day = 24 * 60 * 60 * 1000
  let weight = 7 - Math.min(6, Math.max(1, data.level || 1))
  if (data.lastWrong && now - data.lastWrong < day) weight += 3
  if (data.avgMs > 0) {
    const baseline = Math.max(5000, (timerSecs || 30) * 500)
    weight += Math.min(3, Math.max(0, (data.avgMs - baseline) / baseline))
  }
  if ((data.attempts || 0) < 3) weight += 1
  weight += Math.max(0, 2 - Math.min(2, (data.streak || 0) * 0.5))
  return Math.max(1, weight)
}

export function pickWeightedIndex(length, weightFn) {
  if (!length) return -1
  const weights = []
  let total = 0
  for (let i = 0; i < length; i++) {
    const weight = Math.max(0.01, weightFn(i))
    weights.push(weight)
    total += weight
  }
  let random = Math.random() * total
  for (let i = 0; i < length; i++) {
    if (random < weights[i]) return i
    random -= weights[i]
  }
  return length - 1
}

function distractorScore(candidate, target) {
  const a = String(candidate.en || "").toLowerCase()
  const b = String(target.en || "").toLowerCase()
  if (!a || !b) return 0
  let score = 0
  if (a[0] === b[0]) score += 2
  if (Math.abs(a.length - b.length) <= 3) score += 1
  return score
}

/** Susun pilihan kuis: 1 benar + n pengganggu terdekat. */
export function buildQuizChoices(items, target, count = 4) {
  const pool = (items || []).filter(item => item !== target)
  const shuffled = pool.slice().sort(() => Math.random() - 0.5)
  const ranked = shuffled
    .map(item => ({ item, score: distractorScore(item, target) + Math.random() * 2 }))
    .sort((x, y) => y.score - x.score)
    .map(entry => entry.item)

  const choices = [target]
  while (choices.length < count && ranked.length) {
    choices.push(ranked.shift())
  }
  let index = choices.length
  while (index > 1) {
    const swap = Math.floor(Math.random() * index--)
    ;[choices[index], choices[swap]] = [choices[swap], choices[index]]
  }
  return choices
}

export function studyFilterMatch(item, entry, filter, favorites) {
  if (filter === "favorites") return !!(favorites && favorites[srsKey(item)])
  const data = Object.assign({}, DEFAULT_SRS, entry || {})
  if (filter === "hard") {
    const day = 24 * 60 * 60 * 1000
    const recentWrong = data.lastWrong && Date.now() - data.lastWrong < day
    return recentWrong || (data.level || 1) <= 2
  }
  if (filter === "new") return !(data.attempts || 0)
  if (filter === "strong") return (data.level || 1) >= 5 && (data.streak || 0) >= 2
  return true
}

export function todayStamp() {
  return new Date().toDateString()
}

/** Gulir harian: reset penghitung bila hari berganti. */
export function rollDay(progress) {
  const next = Object.assign({}, progress)
  if (next.dayStamp !== todayStamp()) {
    next.dayStamp = todayStamp()
    next.completedToday = 0
  }
  return next
}

export function recordStudyEvent(progress, { goal = 10 } = {}) {
  const next = rollDay(progress)
  next.completedToday = (next.completedToday || 0) + 1
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  if (!next.lastStudy || now - next.lastStudy > day) {
    // hari sebelumnya terlewat -> streak kembali ke 1
    next.streak = (next.lastStudy && now - next.lastStudy < 2 * day) ? (next.streak || 0) + 1 : 1
  }
  next.lastStudy = now
  next.goal = goal
  if (next.completedToday > (next.bestDaily || 0)) next.bestDaily = next.completedToday
  return next
}

export function summarizeProgress(srsMap, favorites = {}) {
  const values = Object.values(srsMap || {})
  const total = values.length
  const learned = values.filter(entry => (entry.attempts || 0) > 0).length
  const mastered = values.filter(entry => (entry.level || 1) >= 5 && (entry.streak || 0) >= 2).length
  const hard = values.filter(entry => (entry.level || 1) <= 2 || (entry.lastWrong && Date.now() - entry.lastWrong < 864e5)).length
  const attempts = values.reduce((sum, entry) => sum + (entry.attempts || 0), 0)
  const correct = values.reduce((sum, entry) => sum + (entry.correct || 0), 0)
  return {
    total,
    learned,
    mastered,
    hard,
    attempts,
    correct,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    favorites: Object.keys(favorites || {}).length
  }
}

export function pruneQuizErrors(entries) {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  return (entries || []).filter(item => item && item.ts && now - item.ts < day).slice(0, 60)
}
