import { useEffect, useState } from "react"
import Modal from "../components/Modal.jsx"
import { useApp } from "../state/useApp.js"
import * as api from "../lib/api.js"
import { getAdminToken } from "../lib/storage.js"
import { IconSend, IconSparkles } from "../components/Icons.jsx"

const EMPTY_FORM = { kind: "word", request: "", meaning: "", category: "", note: "" }

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return ""
  }
}

export default function SuggestionsModal() {
  const { state, actions } = useApp()
  const open = state.ui.suggestionsOpen
  const [form, setForm] = useState(EMPTY_FORM)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [error, setError] = useState("")
  const isAdmin = Boolean(getAdminToken())

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.fetchSuggestions()
      setItems(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const setField = (key, value) => setForm(previous => ({ ...previous, [key]: value }))

  const runDraft = async () => {
    if (!form.request && !form.note && !form.meaning) {
      actions.pushToast("Isi dulu permintaan atau catatan", "warn")
      return
    }
    setDrafting(true)
    try {
      const data = await api.aiSuggestionDraft({ ...form, currentCategory: state.settings.category })
      if (data && data.result) {
        setForm(previous => ({ ...previous, ...data.result }))
        actions.pushToast("Draft dirapikan oleh AI", "success")
      }
    } catch (err) {
      actions.pushToast(`AI gagal: ${err.message}`, "error")
    } finally {
      setDrafting(false)
    }
  }

  const submit = async event => {
    event.preventDefault()
    if (!form.request.trim()) {
      actions.pushToast("Permintaan wajib diisi", "warn")
      return
    }
    setSubmitting(true)
    try {
      await api.submitSuggestion({
        ...form,
        ts: Date.now(),
        status: "pending"
      })
      setForm(EMPTY_FORM)
      actions.pushToast("Saran terkirim. Terima kasih!", "success")
      load()
    } catch (err) {
      actions.pushToast(`Gagal mengirim: ${err.message}`, "error")
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateSuggestionStatus(id, status, getAdminToken())
      load()
      actions.pushToast("Status diperbarui", "success")
    } catch (err) {
      actions.pushToast(`Gagal: ${err.message}`, "error")
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => actions.setUi({ suggestionsOpen: false })}
      title="Saran kata"
      subtitle="Usulkan kata, frasa, atau tema baru untuk aplikasi ini"
    >
      <form onSubmit={submit} className="settings-section" style={{ marginTop: 0 }}>
        <h4>Kirim saran</h4>
        <div className="form-grid">
          <div className="form-row">
            <label>Jenis</label>
            <select className="input" value={form.kind} onChange={event => setField("kind", event.target.value)}>
              <option value="word">Kata</option>
              <option value="phrase">Frasa</option>
              <option value="topic">Tema / topik</option>
            </select>
          </div>
          <div className="form-row">
            <label>Kategori usulan</label>
            <input
              className="input"
              placeholder="mis. hewan, perjalanan"
              value={form.category}
              onChange={event => setField("category", event.target.value)}
            />
          </div>
          <div className="form-row" style={{ gridColumn: "1 / -1" }}>
            <label>Permintaan *</label>
            <input
              className="input"
              placeholder="mis. 20 kata tentang alat tulis sekolah"
              value={form.request}
              onChange={event => setField("request", event.target.value)}
            />
          </div>
          <div className="form-row" style={{ gridColumn: "1 / -1" }}>
            <label>Arti / keterangan</label>
            <input
              className="input"
              placeholder="artinya apa dalam bahasa Indonesia"
              value={form.meaning}
              onChange={event => setField("meaning", event.target.value)}
            />
          </div>
          <div className="form-row" style={{ gridColumn: "1 / -1" }}>
            <label>Catatan tambahan</label>
            <textarea
              className="input"
              rows={3}
              placeholder="konteks penggunaan, contoh kalimat, dll."
              value={form.note}
              onChange={event => setField("note", event.target.value)}
            />
          </div>
        </div>

        <div className="chip-row" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner" /> : <IconSend />} Kirim saran
          </button>
          <button className="btn btn-soft" type="button" onClick={runDraft} disabled={drafting}>
            {drafting ? <span className="spinner" /> : <IconSparkles />} Rapikan dengan AI
          </button>
        </div>
      </form>

      <div className="settings-section">
        <h4>Status saran ({items.length})</h4>
        {loading ? (
          <div className="skeleton" style={{ height: 70 }} />
        ) : error ? (
          <p className="note" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        ) : items.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map(item => (
              <div className="card-suggestion" key={item.id}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong>{item.request}</strong>
                    <span className={`badge ${item.status}`}>{item.status === "updated" ? "Diperbarui" : "Menunggu"}</span>
                    <span className="badge">{item.kind === "phrase" ? "Frasa" : item.kind === "topic" ? "Tema" : "Kata"}</span>
                  </div>
                  {item.meaning ? <div className="note" style={{ marginTop: 4 }}>Arti: {item.meaning}</div> : null}
                  {item.category ? <div className="note">Kategori: {item.category}</div> : null}
                  {item.note ? <div className="note">Catatan: {item.note}</div> : null}
                  <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>{formatTime(item.ts)}</div>
                </div>
                {isAdmin ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    <button
                      className="btn btn-soft btn-sm"
                      onClick={() => updateStatus(item.id, "updated")}
                      disabled={item.status === "updated"}
                    >
                      Tandai selesai
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => updateStatus(item.id, "pending")}
                      disabled={item.status === "pending"}
                    >
                      Buka lagi
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="note">Belum ada saran. Jadilah yang pertama mengusulkan kata baru.</p>
        )}
      </div>
    </Modal>
  )
}
