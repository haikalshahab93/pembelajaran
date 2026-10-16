import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { AppContext } from "./context.js"
import { initialState, reducer } from "./store.js"
import * as api from "../lib/api.js"
import { buildLexicon, emptyLexicon, lexiconFromPayload, addEntryToLexicon } from "../lib/language.js"
import {
  applySrsResult,
  ensureSrs,
  pruneQuizErrors,
  recordStudyEvent,
  rollDay,
  srsKey,
  todayStamp
} from "../lib/srs.js"
import { getAdminToken, getDeviceId, loadPersistedState, savePersistedState, setAdminToken } from "../lib/storage.js"

let toastSeq = 0

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [lexicon, setLexicon] = useState(() => emptyLexicon())
  const lexiconRef = useRef(lexicon)
  const syncTimer = useRef(null)
  const lastSynced = useRef(0)

  // ---------- hydrasi dari localStorage ----------
  useEffect(() => {
    const saved = loadPersistedState()
    if (saved) {
      dispatch({
        type: "HYDRATE",
        settings: saved.settings || {},
        progress: saved.progress ? rollDay(saved.progress) : {},
        ui: saved.ui || {}
      })
    } else {
      dispatch({ type: "SET_PROGRESS", patch: { dayStamp: todayStamp() } })
    }
  }, [])

  // ---------- persistensi ----------
  useEffect(() => {
    savePersistedState({
      settings: state.settings,
      progress: state.progress,
      ui: {
        tab: state.ui.tab,
        cardIndex: state.ui.cardIndex,
        studyFilter: state.ui.studyFilter,
        phrasesPage: state.ui.phrasesPage
      }
    })
  }, [state.settings, state.progress, state.ui])

  // ---------- sinkronisasi progres ke backend (Firestore via API) ----------
  const pushProgress = useCallback(
    (immediate = false) => {
      const run = async () => {
        const now = Date.now()
        if (!immediate && now - lastSynced.current < 15000) return
        lastSynced.current = now
        try {
          await api.saveProgress(getDeviceId(), state.progress)
        } catch {
          /* offline: biarkan lokal saja */
        }
      }
      if (syncTimer.current) clearTimeout(syncTimer.current)
      if (immediate) run()
      else syncTimer.current = setTimeout(run, 2500)
    },
    [state.progress]
  )

  useEffect(() => {
    if (!state.catalog.loaded) return
    pushProgress(false)
  }, [state.progress, state.catalog.loaded, pushProgress])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.fetchProgress(getDeviceId())
        const remote = data && data.progress
        if (!remote) return
        const local = state.progress
        const merged = {
          ...local,
          ...remote,
          srs: { ...local.srs, ...remote.srs },
          favorites: { ...local.favorites, ...remote.favorites },
          quizErrors: pruneQuizErrors([...(remote.quizErrors || []), ...(local.quizErrors || [])]),
          translateHistory: [
            ...(remote.translateHistory || []).slice(0, 20),
            ...(local.translateHistory || []).filter(item =>
              (remote.translateHistory || []).every(other => other.text !== item.text)
            )
          ].slice(0, 20),
          customEntries: Array.from(
            new Map([...(local.customEntries || []), ...(remote.customEntries || [])].map(item => [item.en + "|" + item.ar + "|" + item.id, item])).values()
          )
        }
        dispatch({ type: "REPLACE_PROGRESS", progress: rollDay(merged) })
      } catch {
        /* backend tidak tersedia: mode lokal */
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- status server ----------
  useEffect(() => {
    let alive = true
    api
      .fetchHealth()
      .then(data => {
        if (!alive) return
        dispatch({
          type: "SERVER_STATUS",
          patch: { checked: true, ok: true, storage: data.storage || "", version: data.version || 1 }
        })
      })
      .catch(() => {
        if (!alive) return
        dispatch({ type: "SERVER_STATUS", patch: { checked: true, ok: false, storage: "offline" } })
      })
    return () => {
      alive = false
    }
  }, [])

  // ---------- tema ----------
  useEffect(() => {
    const theme = state.settings.theme
    const root = document.documentElement
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: light)")
      const apply = () => root.setAttribute("data-theme", media.matches ? "light" : "dark")
      apply()
      media.addEventListener("change", apply)
      return () => media.removeEventListener("change", apply)
    }
    root.setAttribute("data-theme", theme)
    return undefined
  }, [state.settings.theme])

  // ---------- katalog ----------
  const loadCatalog = useCallback(async () => {
    dispatch({ type: "CATALOG_LOADING" })
    try {
      const data = await api.fetchCatalog()
      const categories = Array.isArray(data.categories) ? data.categories : []
      dispatch({ type: "CATALOG_LOADED", categories })
      return categories
    } catch (error) {
      dispatch({ type: "CATALOG_ERROR", error: error.message })
      return []
    }
  }, [])

  // ---------- entri per kategori ----------
  const loadCategory = useCallback(async categoryId => {
    if (!categoryId || categoryId === "__all") return []
    try {
      const data = await api.fetchEntries(categoryId)
      const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
      dispatch({ type: "ENTRIES_LOADED", category: categoryId, items })
      return items
    } catch (error) {
      dispatch({ type: "ENTRIES_ERROR", category: categoryId })
      throw error
    }
  }, [])

  const ensureCategory = useCallback(
    async categoryId => {
      if (!categoryId || categoryId === "__all") return []
      if (state.entriesByCategory[categoryId]) return state.entriesByCategory[categoryId]
      return loadCategory(categoryId)
    },
    [state.entriesByCategory, loadCategory]
  )

  const ensureAllEntries = useCallback(async () => {
    const categories = state.catalog.categories
    const missing = categories.filter(cat => !state.entriesByCategory[cat.id])
    if (!missing.length) return state.entriesByCategory
    const next = { ...state.entriesByCategory }
    for (const cat of missing) {
      try {
        const data = await api.fetchEntries(cat.id)
        next[cat.id] = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
      } catch {
        next[cat.id] = next[cat.id] || []
      }
    }
    dispatch({ type: "ENTRIES_MERGE", map: next })
    return next
  }, [state.catalog.categories, state.entriesByCategory])

  // ---------- lexicon ----------
  const ensureLexicon = useCallback(async () => {
    if (lexiconRef.current.en.size > 0) return lexiconRef.current
    dispatch({ type: "LEXICON_LOADING" })
    try {
      const payload = await api.fetchLexicon()
      const built = lexiconFromPayload(payload)
      lexiconRef.current = built
      setLexicon(built)
      dispatch({ type: "LEXICON_LOADED", stats: payload.stats || null })
      return built
    } catch {
      // fallback: bangun dari entri yang sudah dimuat
      const all = Object.values(state.entriesByCategory).flat()
      const built = all.length ? buildLexicon(all) : emptyLexicon()
      lexiconRef.current = built
      setLexicon(built)
      dispatch({ type: "LEXICON_ERROR", error: "offline" })
      return built
    }
  }, [state.entriesByCategory])

  const addCustomWord = useCallback(item => {
    const entry = { en: item.en || "", ar: item.ar || "", id: item.id || "" }
    if (!entry.en && !entry.ar && !entry.id) return
    addEntryToLexicon(lexiconRef.current, entry)
    setLexicon({ ...lexiconRef.current })
    dispatch({
      type: "SET_PROGRESS",
      patch: {
        customEntries: [entry, ...(state.progress.customEntries || []).filter(
          existing => srsKey(existing) !== srsKey(entry)
        )].slice(0, 200)
      }
    })
  }, [state.progress.customEntries])

  // ---------- aksi UI ----------
  const pushToast = useCallback((message, tone = "info") => {
    const id = ++toastSeq
    dispatch({ type: "PUSH_TOAST", toast: { id, message, tone } })
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 3600)
  }, [])

  const setSetting = useCallback((key, value) => {
    dispatch({ type: "SET_SETTING", key, value })
  }, [])

  const setUi = useCallback(patch => {
    dispatch({ type: "SET_UI", patch })
  }, [])

  const selectCategory = useCallback(
    categoryId => {
      dispatch({ type: "SET_SETTING", key: "category", value: categoryId })
      dispatch({ type: "SET_UI", patch: { cardIndex: 0, flipped: false, phrasesPage: 0 } })
      if (categoryId !== "__all") ensureCategory(categoryId).catch(() => {})
    },
    [ensureCategory]
  )

  // ---------- aksi belajar ----------
  const recordAnswer = useCallback(
    (item, meta) => {
      const key = srsKey(item)
      if (!key) return
      const srs = { ...state.progress.srs }
      const entry = { ...(srs[key] || {}), ...ensureSrs(srs, item) }
      applySrsResult(entry, { ...meta, timerSecs: state.settings.timerSecs })
      srs[key] = entry

      const patch = { srs }
      if (!meta.ok) {
        patch.quizErrors = pruneQuizErrors([
          {
            key,
            ts: Date.now(),
            timedOut: !!meta.timedOut,
            en: item.en || "",
            ar: item.ar || "",
            id: item.id || "",
            category: state.settings.category
          },
          ...(state.progress.quizErrors || [])
        ])
      }
      const withStudy = recordStudyEvent({ ...state.progress, ...patch }, { goal: state.settings.dailyGoal })
      const progress = {
        ...state.progress,
        ...patch,
        completedToday: withStudy.completedToday,
        streak: withStudy.streak,
        lastStudy: withStudy.lastStudy,
        bestDaily: withStudy.bestDaily
      }
      dispatch({ type: "REPLACE_PROGRESS", progress })
      pushProgress(true)
    },
    [state.progress, state.settings.timerSecs, state.settings.dailyGoal, state.settings.category, pushProgress]
  )

  const toggleFavorite = useCallback(item => {
    const key = srsKey(item)
    if (!key) return false
    const favorites = { ...state.progress.favorites }
    const next = !favorites[key]
    if (next) favorites[key] = 1
    else delete favorites[key]
    dispatch({ type: "SET_PROGRESS", patch: { favorites } })
    return next
  }, [state.progress.favorites])

  const markStudied = useCallback(() => {
    const progress = recordStudyEvent(state.progress, { goal: state.settings.dailyGoal })
    dispatch({ type: "REPLACE_PROGRESS", progress })
    pushProgress(true)
  }, [state.progress, state.settings.dailyGoal, pushProgress])

  const saveTranslateHistory = useCallback(
    entry => {
      const history = [entry, ...(state.progress.translateHistory || []).filter(item => item.text !== entry.text)].slice(0, 20)
      dispatch({ type: "SET_PROGRESS", patch: { translateHistory: history } })
    },
    [state.progress.translateHistory]
  )

  const clearTranslateHistory = useCallback(() => {
    dispatch({ type: "SET_PROGRESS", patch: { translateHistory: [] } })
  }, [])

  const resetProgress = useCallback(() => {
    dispatch({
      type: "REPLACE_PROGRESS",
      progress: { ...initialState.progress, dayStamp: todayStamp() }
    })
    pushToast("Progres belajar direset", "warn")
  }, [pushToast])

  const applyImportedState = useCallback(payload => {
    if (payload.settings) dispatch({ type: "SET_SETTINGS", patch: payload.settings })
    if (payload.progress) dispatch({ type: "REPLACE_PROGRESS", progress: rollDay(payload.progress) })
    pushToast("Data berhasil diimpor", "success")
  }, [pushToast])

  const adminLogin = useCallback(
    async (username, password) => {
      const data = await api.adminLogin(username, password)
      if (data && data.token) setAdminToken(data.token)
      pushToast("Login admin berhasil", "success")
      return data
    },
    [pushToast]
  )

  const adminLogout = useCallback(async () => {
    try {
      await api.adminLogout()
    } catch {}
    setAdminToken("")
    pushToast("Logout admin", "info")
  }, [pushToast])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      lexicon,
      actions: {
        loadCatalog,
        ensureCategory,
        ensureAllEntries,
        ensureLexicon,
        addCustomWord,
        setSetting,
        setUi,
        selectCategory,
        recordAnswer,
        toggleFavorite,
        markStudied,
        saveTranslateHistory,
        clearTranslateHistory,
        resetProgress,
        applyImportedState,
        pushToast,
        adminLogin,
        adminLogout,
        syncProgress: pushProgress
      },
      helpers: {
        adminToken: getAdminToken,
        deviceId: getDeviceId,
        apiBase: api.getApiBaseUrl,
        setApiBase: api.setStoredApiBase
      }
    }),
    [
      state,
      lexicon,
      loadCatalog,
      ensureCategory,
      ensureAllEntries,
      ensureLexicon,
      addCustomWord,
      setSetting,
      setUi,
      selectCategory,
      recordAnswer,
      toggleFavorite,
      markStudied,
      saveTranslateHistory,
      clearTranslateHistory,
      resetProgress,
      applyImportedState,
      pushToast,
      adminLogin,
      adminLogout,
      pushProgress
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
