import { createContext } from "react"

/** Konteks aplikasi (dipisah dari komponen agar Hot Refresh tetap sehat). */
export const AppContext = createContext(null)
