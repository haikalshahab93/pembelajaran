import { todayStamp } from "../lib/srs.js"

export const initialState = {
  catalog: { categories: [], loaded: false, error: null },
  entriesByCategory: {},
  loadingCategory: "",
  settings: {
    direction: "en-ar",
    category: "greetings",
    search: "",
    theme: "dark",
    media: true,
    dailyGoal: 10,
    timerSecs: 30,
    spaced: false,
    rate: 1
  },
  progress: {
    srs: {},
    favorites: {},
    quizErrors: [],
    translateHistory: [],
    customEntries: [],
    dayStamp: todayStamp(),
    completedToday: 0,
    streak: 0,
    bestStreak: 0,
    bestDaily: 0,
    lastStudy: 0
  },
  ui: {
    tab: "dashboard",
    cardIndex: 0,
    flipped: false,
    studyFilter: "all",
    phrasesPage: 0,
    settingsOpen: false,
    suggestionsOpen: false
  },
  lexicon: { loaded: false, loading: false, error: null, stats: null },
  server: { checked: false, ok: null, storage: "", version: 0 },
  toasts: []
}

export function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        settings: Object.assign({}, state.settings, action.settings),
        progress: Object.assign({}, state.progress, action.progress),
        ui: Object.assign({}, state.ui, action.ui)
      }
    case "CATALOG_LOADING":
      return { ...state, catalog: { ...state.catalog, error: null } }
    case "CATALOG_LOADED":
      return {
        ...state,
        catalog: { categories: action.categories, loaded: true, error: null }
      }
    case "CATALOG_ERROR":
      return { ...state, catalog: { ...state.catalog, loaded: true, error: action.error } }
    case "ENTRIES_LOADING":
      return { ...state, loadingCategory: action.category }
    case "ENTRIES_LOADED":
      return {
        ...state,
        loadingCategory: "",
        entriesByCategory: { ...state.entriesByCategory, [action.category]: action.items }
      }
    case "ENTRIES_MERGE":
      return { ...state, entriesByCategory: { ...state.entriesByCategory, ...action.map } }
    case "ENTRIES_ERROR":
      return { ...state, loadingCategory: "" }
    case "SET_SETTING":
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case "SET_PROGRESS":
      return { ...state, progress: Object.assign({}, state.progress, action.patch) }
    case "REPLACE_PROGRESS":
      return { ...state, progress: action.progress }
    case "SET_UI":
      return { ...state, ui: { ...state.ui, ...action.patch } }
    case "LEXICON_LOADING":
      return { ...state, lexicon: { ...state.lexicon, loading: true, error: null } }
    case "LEXICON_LOADED":
      return { ...state, lexicon: { loaded: true, loading: false, error: null, stats: action.stats } }
    case "LEXICON_ERROR":
      return { ...state, lexicon: { ...state.lexicon, loading: false, error: action.error } }
    case "SERVER_STATUS":
      return { ...state, server: { ...state.server, ...action.patch } }
    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] }
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter(item => item.id !== action.id) }
    default:
      return state
  }
}
