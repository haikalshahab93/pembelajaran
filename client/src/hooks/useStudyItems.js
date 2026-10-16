import { useMemo } from "react"
import { useApp } from "../state/useApp.js"
import { studyFilterMatch, srsKey, ensureSrs } from "../lib/srs.js"

function matchesSearch(item, query) {
  if (!query) return true
  const needle = query.toLowerCase().trim()
  if (!needle) return true
  return [item.en, item.ar, item.id, item.tr]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(needle))
}

/**
 * Kumpulan item belajar untuk kategori + pencarian + filter aktif.
 */
export function useStudyItems() {
  const { state } = useApp()
  const { category, search, direction } = state.settings
  const filter = state.ui.studyFilter
  const srs = state.progress.srs
  const favorites = state.progress.favorites

  const loading = Boolean(state.loadingCategory) && !state.entriesByCategory[category]

  const base = useMemo(() => {
    if (category === "__all") {
      return Object.entries(state.entriesByCategory)
        .filter(([key]) => key !== "__bulk")
        .flatMap(([, items]) => items || [])
    }
    return state.entriesByCategory[category] || []
  }, [category, state.entriesByCategory])

  const items = useMemo(() => {
    let list = base.filter(item => matchesSearch(item, search))
    if (filter && filter !== "all") {
      list = list.filter(item =>
        studyFilterMatch(item, srs[srsKey(item)], filter, favorites)
      )
    }
    return list
  }, [base, search, filter, srs, favorites])

  const directionPair = useMemo(() => {
    const isEnFirst = !String(direction).startsWith("ar")
    return isEnFirst
      ? { sourceKey: "en", targetKeys: ["ar", "id"], sourceLabel: "EN", sourceLang: "en" }
      : { sourceKey: "ar", targetKeys: ["en", "id"], sourceLabel: "AR", sourceLang: "ar" }
  }, [direction])

  return { items, base, loading, directionPair, category, filter }
}

export function itemSrs(map, item) {
  return ensureSrs(map || {}, item)
}
