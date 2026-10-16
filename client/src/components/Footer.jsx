import { useApp } from "../state/useApp.js"
import { IconFlame, IconTarget } from "./Icons.jsx"

export default function Footer() {
  const { state } = useApp()
  const goal = state.settings.dailyGoal || 10
  const done = state.progress.completedToday || 0
  const storageLabel =
    state.server.storage === "firestore"
      ? "Firestore"
      : state.server.storage === "json"
        ? "Penyimpanan lokal"
        : state.server.storage === "offline"
          ? "Mode offline"
          : "Memeriksa server…"

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span className="streak-pill">
          <span className="flame">
            <IconFlame />
          </span>
          {state.progress.streak || 0} hari beruntun
        </span>
        <span className="chip">
          <IconTarget size={14} />
          Target hari ini: {Math.min(done, goal)}/{goal} kartu
        </span>
        <span className="spacer" />
        <span className="chip">
          <span className={`status-dot ${state.server.ok ? "ok" : state.server.checked ? "bad" : ""}`} />
          {storageLabel}
        </span>
      </div>
    </footer>
  )
}
