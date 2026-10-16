import { useContext } from "react"
import { AppContext } from "./context.js"

/** Ambil store aplikasi (state + actions + helpers). */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp harus dipakai di dalam AppProvider")
  return context
}
