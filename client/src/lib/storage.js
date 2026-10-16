/**
 * Persistensi lokal (localStorage) + identitas perangkat untuk sinkronisasi server.
 */

export const STORAGE_KEY = "pembelajar_state_v2"
export const DEVICE_KEY = "pembelajar_device_id"
export const ADMIN_TOKEN_KEY = "pembelajar_admin_token"

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = `dev-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return "dev-anonymous"
  }
}

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

let saveTimer = null
let pendingPayload = null

export function savePersistedState(payload, delay = 400) {
  pendingPayload = payload
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingPayload))
    } catch {
      /* kuota penuh: abaikan */
    }
  }, delay)
}

export function flushPersistedState(payload) {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || ""
  } catch {
    return ""
  }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
    else localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {}
}

export function exportState(payload) {
  return JSON.stringify(payload, null, 2)
}

export function parseImportedState(text) {
  const parsed = JSON.parse(text)
  return parsed && typeof parsed === "object" ? parsed : null
}
