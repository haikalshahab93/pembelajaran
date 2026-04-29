(() => {
  const API_BASE_STORAGE_KEY = "pembelajar_api_base"
  const ADMIN_TOKEN_KEY = "pembelajar_admin_token"

  function normalizeBaseUrl(value) {
    const raw = String(value || "").trim()
    if (!raw) return ""
    try {
      return new URL(raw.endsWith("/") ? raw : `${raw}/`).toString()
    } catch {
      return ""
    }
  }

  function defaultApiBase() {
    const appBase = new URL("./", window.location.href)
    if (/\.github\.io$/i.test(window.location.hostname || "")) return ""
    if (/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || "")) {
      if (window.location.port === "8020" || window.location.port === "8021") return appBase.toString()
      return `${window.location.protocol}//${window.location.hostname}:8020/`
    }
    return appBase.toString()
  }

  function getApiBaseUrl() {
    const configured = normalizeBaseUrl(window.PEMBELAJAR_CONFIG && window.PEMBELAJAR_CONFIG.apiBase || "")
    let stored = ""
    try {
      stored = localStorage.getItem(API_BASE_STORAGE_KEY) || ""
    } catch {}
    return normalizeBaseUrl(stored) || configured || defaultApiBase()
  }

  function apiUrl(path) {
    const base = getApiBaseUrl()
    if (!base) return ""
    return new URL(String(path || "").replace(/^\/+/, ""), base).toString()
  }

  function getAdminToken() {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || ""
    } catch {
      return ""
    }
  }

  function setAdminToken(token) {
    try {
      if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
      else localStorage.removeItem(ADMIN_TOKEN_KEY)
    } catch {}
  }

  function buildAdminHeaders(base) {
    const headers = Object.assign({}, base || {})
    const token = getAdminToken()
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  const form = document.getElementById("admin-login-form")
  const usernameInput = document.getElementById("admin-username")
  const passwordInput = document.getElementById("admin-password")
  const submitBtn = document.getElementById("admin-submit")
  const logoutBtn = document.getElementById("admin-logout")
  const statusBox = document.getElementById("admin-status")
  const apiInfo = document.getElementById("admin-api-info")

  function setStatus(message, kind) {
    statusBox.textContent = message
    statusBox.className = `status-box${kind ? ` ${kind}` : ""}`
  }

  async function syncSession() {
    const endpoint = apiUrl("admin/session")
    apiInfo.textContent = endpoint ? `Backend aktif: ${getApiBaseUrl()}` : "Backend belum terdeteksi. Atur URL API dari aplikasi utama bila perlu."
    if (!endpoint) {
      setStatus("Backend admin belum tersedia. Pastikan server Express aktif.", "error")
      return false
    }
    try {
      const res = await fetch(endpoint, { headers: buildAdminHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json && json.admin) {
        setStatus(`Sesi admin aktif${json.username ? ` sebagai ${json.username}` : ""}.`, "success")
        submitBtn.textContent = "Perbarui Login"
        return true
      }
      setAdminToken("")
      setStatus("Belum login admin.", "")
      submitBtn.textContent = "Masuk Admin"
      return false
    } catch {
      setAdminToken("")
      setStatus("Gagal memeriksa sesi admin. Pastikan server Express aktif dan URL API benar.", "error")
      submitBtn.textContent = "Masuk Admin"
      return false
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault()
    const endpoint = apiUrl("admin/login")
    if (!endpoint) {
      setStatus("Backend admin belum tersedia.", "error")
      return
    }
    const username = String(usernameInput.value || "").trim()
    const password = String(passwordInput.value || "")
    if (!username || !password) {
      setStatus("Username dan password admin wajib diisi.", "error")
      return
    }
    submitBtn.disabled = true
    setStatus("Sedang login admin...", "")
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json || !json.token) {
        throw new Error(json && json.error ? json.error : `HTTP ${res.status}`)
      }
      setAdminToken(String(json.token))
      passwordInput.value = ""
      setStatus(`Login admin berhasil${json.username ? ` sebagai ${json.username}` : ""}.`, "success")
      submitBtn.textContent = "Perbarui Login"
    } catch (error) {
      setAdminToken("")
      setStatus(`Login admin gagal. ${error && error.message ? error.message : ""}`.trim(), "error")
    } finally {
      submitBtn.disabled = false
    }
  })

  logoutBtn.addEventListener("click", async () => {
    const endpoint = apiUrl("admin/logout")
    logoutBtn.disabled = true
    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: buildAdminHeaders({ "Content-Type": "application/json" })
        })
      }
    } catch {}
    setAdminToken("")
    setStatus("Sesi admin ditutup.", "")
    submitBtn.textContent = "Masuk Admin"
    logoutBtn.disabled = false
  })

  syncSession()
})()
