import { useEffect, useState } from "react"
import Modal from "../components/Modal.jsx"
import { useApp } from "../state/useApp.js"
import * as api from "../lib/api.js"
import { getAdminToken, setAdminToken } from "../lib/storage.js"
import { IconDownload, IconUpload } from "../components/Icons.jsx"

function Switch({ on, onToggle, label }) {
  return (
    <button
      className={`switch ${on ? "on" : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
    />
  )
}

export default function SettingsModal() {
  const { state, actions, helpers } = useApp()
  const open = state.ui.settingsOpen
  const [apiBase, setApiBase] = useState("")
  const [apiStatus, setApiStatus] = useState("")
  const [admin, setAdmin] = useState({ loggedIn: false, username: "", usernameInput: "", passwordInput: "", error: "" })

  useEffect(() => {
    if (!open) return
    setApiBase(helpers.apiBase() || "")
  }, [open, helpers])

  useEffect(() => {
    const token = getAdminToken()
    if (!token) return
    api
      .adminSession(token)
      .then(data => {
        if (data && data.admin) setAdmin(prev => ({ ...prev, loggedIn: true, username: data.username || "admin" }))
        else setAdminToken("")
      })
      .catch(() => {})
  }, [])

  const testApi = async () => {
    setApiStatus("menguji…")
    try {
      const data = await api.fetchHealth()
      setApiStatus(`tersambung · penyimpanan: ${data.storage || "?"} · lexicon ${data.lexicon ? data.lexicon.en + " EN" : "-"}`)
    } catch (error) {
      setApiStatus(`gagal: ${error.message}`)
    }
  }

  const saveApiBase = () => {
    helpers.setApiBase(apiBase)
    actions.pushToast("Alamat API disimpan (muat ulang untuk menerapkan)", "success")
    testApi()
  }

  const exportData = () => {
    const payload = { settings: state.settings, progress: state.progress, exported_at: Date.now() }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `pembelajar-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    actions.pushToast("Backup diunduh", "success")
  }

  const importData = event => {
    const file = event.target.files && event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"))
        actions.applyImportedState(parsed)
      } catch {
        actions.pushToast("File tidak valid", "error")
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const doLogin = async event => {
    event.preventDefault()
    try {
      const data = await actions.adminLogin(admin.usernameInput, admin.passwordInput)
      setAdmin({ loggedIn: true, username: data.username || admin.usernameInput, usernameInput: "", passwordInput: "", error: "" })
    } catch (error) {
      setAdmin(prev => ({ ...prev, error: error.message }))
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => actions.setUi({ settingsOpen: false })}
      title="Pengaturan"
      subtitle="Tampilan, belajar, server, dan data"
    >
      <div className="settings-section">
        <h4>Tampilan</h4>
        <div className="form-grid">
          <div className="form-row">
            <label>Tema</label>
            <div className="segmented">
              {[
                { id: "dark", label: "Gelap" },
                { id: "light", label: "Terang" },
                { id: "system", label: "Sistem" }
              ].map(option => (
                <button
                  key={option.id}
                  className={state.settings.theme === option.id ? "active" : ""}
                  onClick={() => actions.setSetting("theme", option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Elemen media (emoji / contoh)</label>
            <div className="switch-row" style={{ borderBottom: "none" }}>
              <span className="note">{state.settings.media ? "Aktif" : "Nonaktif"}</span>
              <Switch
                on={state.settings.media}
                onToggle={() => actions.setSetting("media", !state.settings.media)}
                label="Elemen media"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Belajar</h4>
        <div className="form-grid">
          <div className="form-row">
            <label>Arah bawaan</label>
            <select
              className="input"
              value={state.settings.direction}
              onChange={event => actions.setSetting("direction", event.target.value)}
            >
              <option value="en-ar">Inggris → Arab</option>
              <option value="ar-en">Arab → Inggris</option>
            </select>
          </div>
          <div className="form-row">
            <label>Target kartu harian</label>
            <input
              className="input"
              type="number"
              min={1}
              max={200}
              value={state.settings.dailyGoal}
              onChange={event => actions.setSetting("dailyGoal", Math.max(1, Number(event.target.value) || 10))}
            />
          </div>
          <div className="form-row">
            <label>Timer kuis</label>
            <select
              className="input"
              value={state.settings.timerSecs}
              onChange={event => actions.setSetting("timerSecs", Number(event.target.value))}
            >
              <option value={0}>Nonaktif</option>
              <option value={10}>10 detik</option>
              <option value={20}>20 detik</option>
              <option value={30}>30 detik</option>
              <option value={60}>60 detik</option>
            </select>
          </div>
          <div className="form-row">
            <label>Kecepatan suara</label>
            <select
              className="input"
              value={state.settings.rate}
              onChange={event => actions.setSetting("rate", Number(event.target.value))}
            >
              <option value={0.75}>Lambat</option>
              <option value={1}>Normal</option>
              <option value={1.25}>Cepat</option>
            </select>
          </div>
        </div>
        <div className="switch-row" style={{ marginTop: 6 }}>
          <div>
            <div style={{ fontWeight: 650, fontSize: 14 }}>Spasi kata saat terjemah</div>
            <div className="note">Rapikan tanda baca dan spasi pada hasil terjemah</div>
          </div>
          <Switch
            on={state.settings.spaced}
            onToggle={() => actions.setSetting("spaced", !state.settings.spaced)}
            label="Spasi kata"
          />
        </div>
      </div>

      <div className="settings-section">
        <h4>Server & API</h4>
        <div className="form-grid">
          <div className="form-row" style={{ gridColumn: "1 / -1" }}>
            <label>Alamat backend (kosongkan untuk same-origin / proxy dev)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder="https://api.contoh.com/"
                value={apiBase}
                onChange={event => setApiBase(event.target.value)}
              />
              <button className="btn btn-soft" onClick={saveApiBase}>
                Simpan
              </button>
              <button className="btn btn-ghost" onClick={testApi}>
                Uji
              </button>
            </div>
            <span className="note">{apiStatus}</span>
          </div>
        </div>

        {admin.loggedIn ? (
          <div className="switch-row">
            <div>
              <div style={{ fontWeight: 650, fontSize: 14 }}>Admin: {admin.username}</div>
              <div className="note">Mode admin aktif · upload gambar & status saran kata</div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={async () => {
                await actions.adminLogout()
                setAdmin({ loggedIn: false, username: "", usernameInput: "", passwordInput: "", error: "" })
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={doLogin} className="form-grid" style={{ marginTop: 12 }}>
            <div className="form-row">
              <label>Username admin</label>
              <input
                className="input"
                value={admin.usernameInput}
                onChange={event => setAdmin({ ...admin, usernameInput: event.target.value })}
                autoComplete="username"
              />
            </div>
            <div className="form-row">
              <label>Password admin</label>
              <input
                className="input"
                type="password"
                value={admin.passwordInput}
                onChange={event => setAdmin({ ...admin, passwordInput: event.target.value })}
                autoComplete="current-password"
              />
            </div>
            <div className="form-row" style={{ gridColumn: "1 / -1" }}>
              <button className="btn btn-soft" type="submit">
                Login admin
              </button>
              {admin.error ? <span className="note" style={{ color: "var(--danger)" }}>{admin.error}</span> : null}
            </div>
          </form>
        )}
      </div>

      <div className="settings-section">
        <h4>Data</h4>
        <div className="chip-row">
          <button className="btn btn-ghost btn-sm" onClick={exportData}>
            <IconDownload /> Ekspor data
          </button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            <IconUpload /> Impor data
            <input type="file" accept="application/json" onChange={importData} hidden />
          </label>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm("Reset seluruh progres belajar? Tindakan ini tidak bisa dibatalkan.")) {
                actions.resetProgress()
              }
            }}
          >
            Reset progres
          </button>
        </div>
        <p className="note" style={{ marginTop: 10 }}>
          Progres disimpan di perangkat ini dan disinkronkan ke backend (Firestore) bila tersedia.
          Ekspor data sebelum membersihkan browser.
        </p>
      </div>
    </Modal>
  )
}
