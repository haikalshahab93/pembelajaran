import { useApp } from "../state/useApp.js"
import { IconCards, IconChat, IconGrid, IconQuiz, IconTranslate } from "./Icons.jsx"

const TABS = [
  { id: "dashboard", label: "Dasbor", key: "1", Icon: IconGrid },
  { id: "cards", label: "Kartu", key: "2", Icon: IconCards },
  { id: "quiz", label: "Kuis", key: "3", Icon: IconQuiz },
  { id: "phrases", label: "Frasa", key: "4", Icon: IconChat },
  { id: "translate", label: "Terjemah", key: "5", Icon: IconTranslate }
]

export default function Tabs() {
  const { state, actions } = useApp()
  return (
    <nav className="tabs" aria-label="Navigasi utama">
      {TABS.map(({ id, label, key, Icon }) => (
        <button
          key={id}
          className={`tab ${state.ui.tab === id ? "active" : ""}`}
          onClick={() => actions.setUi({ tab: id })}
          aria-current={state.ui.tab === id ? "page" : undefined}
        >
          <Icon size={17} />
          {label}
          <span className="tab-key">{key}</span>
        </button>
      ))}
    </nav>
  )
}
