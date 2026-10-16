import { useEffect, useMemo } from "react"
import Header from "./components/Header.jsx"
import Tabs from "./components/Tabs.jsx"
import Footer from "./components/Footer.jsx"
import Toasts from "./components/Toast.jsx"
import Dashboard from "./views/Dashboard.jsx"
import Cards from "./views/Cards.jsx"
import Quiz from "./views/Quiz.jsx"
import Phrases from "./views/Phrases.jsx"
import Translate from "./views/Translate.jsx"
import SettingsModal from "./views/SettingsModal.jsx"
import SuggestionsModal from "./views/SuggestionsModal.jsx"
import { useApp } from "./state/useApp.js"

const VIEWS = {
  dashboard: Dashboard,
  cards: Cards,
  quiz: Quiz,
  phrases: Phrases,
  translate: Translate
}

export default function App() {
  const { state, actions } = useApp()

  useEffect(() => {
    actions.loadCatalog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pastikan kategori aktif selalu termuat.
  useEffect(() => {
    const category = state.settings.category
    if (!state.catalog.loaded || category === "__all") return
    if (state.entriesByCategory[category]) return
    actions.ensureCategory(category).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.catalog.loaded, state.settings.category])

  // Pra-muat kategori lain di latar belakang agar "__all" dan kuis cepat.
  useEffect(() => {
    if (!state.catalog.loaded) return undefined
    let cancelled = false
    const timer = setTimeout(async () => {
      for (const category of state.catalog.categories) {
        if (cancelled) return
        if (state.entriesByCategory[category.id]) continue
        try {
          await actions.ensureCategory(category.id)
        } catch {
          /* lewati kategori yang gagal */
        }
      }
    }, 1200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.catalog.loaded])

  // Pintasan papan ketik.
  useEffect(() => {
    const onKey = event => {
      const tag = (event.target && event.target.tagName || "").toLowerCase()
      if (["input", "textarea", "select"].includes(tag)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const map = { 1: "dashboard", 2: "cards", 3: "quiz", 4: "phrases", 5: "translate" }
      // Di tab Kuis, angka 1-4 dipakai untuk memilih jawaban, bukan pindah tab.
      const quizOwnsDigits = state.ui.tab === "quiz"
      if (map[event.key] && !quizOwnsDigits) {
        actions.setUi({ tab: map[event.key] })
        event.preventDefault()
      }
      if (event.key === "/") {
        const input = document.querySelector(".search-field input")
        if (input) {
          input.focus()
          event.preventDefault()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [actions, state.ui.tab])

  const View = useMemo(() => VIEWS[state.ui.tab] || Dashboard, [state.ui.tab])

  return (
    <div className="app">
      <Header />
      <Tabs />
      <main className="main">
        <div className="view" key={state.ui.tab}>
          <View />
        </div>
      </main>
      <Footer />
      <SettingsModal />
      <SuggestionsModal />
      <Toasts />
    </div>
  )
}
