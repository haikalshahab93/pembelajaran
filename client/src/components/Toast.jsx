import { useApp } from "../state/useApp.js"

export default function Toasts() {
  const { state } = useApp()
  if (!state.toasts.length) return null
  return (
    <div className="toasts" aria-live="polite">
      {state.toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.tone || "info"}`}>
          <span
            className={`status-dot ${toast.tone === "success" ? "ok" : toast.tone === "error" ? "bad" : ""}`}
          />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
