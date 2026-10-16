import { useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "../state/useApp.js"
import { translateText } from "../lib/language.js"
import { speak } from "../lib/speech.js"
import * as api from "../lib/api.js"
import { IconCopy, IconSend, IconSparkles, IconTrash, IconVolume } from "../components/Icons.jsx"

export default function Translate() {
  const { state, actions, lexicon } = useApp()
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [savingWord, setSavingWord] = useState("")
  const [draft, setDraft] = useState({ en: "", ar: "", id: "" })
  const [ai, setAi] = useState({ status: "", data: null, error: "" })
  const timerRef = useRef(null)

  const spaced = state.settings.spaced
  const history = state.progress.translateHistory || []

  useEffect(() => {
    actions.ensureLexicon()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!text.trim()) {
      setResult(null)
      return undefined
    }
    timerRef.current = setTimeout(() => {
      setResult(translateText(text, lexicon, { spaced }))
    }, 220)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, lexicon, spaced])

  const lexiconSize = useMemo(() => lexicon.en.size + lexicon.ar.size + lexicon.id.size, [lexicon])

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value)
      actions.pushToast(`${label} disalin`, "success")
    } catch {
      actions.pushToast("Gagal menyalin", "error")
    }
  }

  const runAi = async () => {
    if (!text.trim()) return
    setAi({ status: "loading", data: null, error: "" })
    try {
      const data = await api.aiTranslate(text, result ? result.src : "en", {
        ollamaUrl: localStorage.getItem("pembelajar_ollama_url") || "",
        ollamaModel: localStorage.getItem("pembelajar_ollama_model") || ""
      })
      setAi({ status: "done", data: data.result, error: "" })
    } catch (error) {
      setAi({ status: "error", data: null, error: error.message })
    }
  }

  const startSaveWord = token => {
    const src = result ? result.src : "en"
    setSavingWord(token)
    setDraft({
      en: src === "en" ? token : "",
      ar: src === "ar" ? token : "",
      id: src === "id" ? token : ""
    })
  }

  const saveWord = () => {
    if (!draft.en && !draft.ar && !draft.id) {
      actions.pushToast("Isi minimal satu bahasa", "warn")
      return
    }
    actions.addCustomWord(draft)
    actions.pushToast("Kata ditambahkan ke kamus lokal", "success")
    setSavingWord("")
    setDraft({ en: "", ar: "", id: "" })
  }

  const rows = result
    ? [
        { key: "en", value: result.en },
        { key: "ar", value: result.ar },
        { key: "id", value: result.id }
      ]
    : []

  return (
    <div className="translate-grid">
      <section className="panel panel-pad">
        <div className="section-head" style={{ marginTop: 0 }}>
          <div>
            <div className="section-title">Terjemah</div>
            <div className="section-sub">
              Kamus lokal {lexiconSize ? `${lexiconSize} entri` : "dimuat dari server"}
              {state.lexicon.loading ? " · memuat…" : ""}
              {state.lexicon.error ? " · mode offline" : ""}
            </div>
          </div>
        </div>

        <textarea
          className="translate-input"
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder="Tulis kalimat atau kata dalam bahasa Inggris, Arab, atau Indonesia…"
          rows={4}
        />

        <div className="detect-badge">
          {result ? (
            <>
              <span className={`chip-tag ${result.src}`}>{result.src.toUpperCase()}</span>
              Deteksi bahasa otomatis · {spaced ? "spasi aktif" : "spasi mati"}
            </>
          ) : (
            "Deteksi bahasa otomatis"
          )}
        </div>

        <div className="chip-row" style={{ marginTop: 14 }}>
          <button className="btn btn-soft btn-sm" onClick={() => copy(result ? result.en + "\n" + result.ar + "\n" + result.id : text, "Hasil")}>
            <IconCopy /> Salin hasil
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (!text.trim()) return
              actions.saveTranslateHistory({ text: text.trim(), ts: Date.now(), src: result ? result.src : "" })
              actions.pushToast("Disimpan ke riwayat", "success")
            }}
          >
            Simpan riwayat
          </button>
          <button
            className={`chip ${spaced ? "active" : ""}`}
            onClick={() => actions.setSetting("spaced", !spaced)}
            aria-pressed={spaced}
          >
            Spasi kata
          </button>
          <button className="btn btn-primary btn-sm" onClick={runAi} disabled={ai.status === "loading" || !text.trim()}>
            {ai.status === "loading" ? <span className="spinner" /> : <IconSparkles />} Bantu AI
          </button>
        </div>

        {ai.status === "error" ? (
          <div className="quiz-feedback bad" style={{ marginTop: 14 }}>
            <span>AI tidak tersedia: {ai.error}</span>
            <span className="faint" style={{ fontSize: 12.5 }}>
              Pastikan backend punya Ollama
            </span>
          </div>
        ) : null}

        {ai.status === "done" && ai.data ? (
          <div className="ai-panel">
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Hasil AI
            </div>
            <div className="output-list" style={{ marginTop: 0 }}>
              {["en", "ar", "id"].map(key => (
                <div className="output-row" key={`ai-${key}`}>
                  <span className={`chip-tag ${key}`}>{key.toUpperCase()}</span>
                  <span className={`value ${key === "ar" ? "arabic" : ""}`}>{ai.data[key] || "-"}</span>
                  <button className="icon-btn" onClick={() => speak(ai.data[key] || "", key)} aria-label={`Dengarkan ${key}`}>
                    <IconVolume />
                  </button>
                  <button className="icon-btn" onClick={() => copy(ai.data[key] || "", key.toUpperCase())} aria-label={`Salin ${key}`}>
                    <IconCopy />
                  </button>
                </div>
              ))}
            </div>
            {ai.data.explanation ? <p className="note" style={{ marginTop: 10 }}>{ai.data.explanation}</p> : null}
          </div>
        ) : null}

        {result && result.unknown.length ? (
          <div style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Kata belum dikenal ({result.unknown.length})
            </div>
            <div className="chip-row">
              {result.unknown.map(token => (
                <button key={token} className="chip" onClick={() => startSaveWord(token)}>
                  {token} <span style={{ color: "var(--primary)", fontWeight: 700 }}>+</span>
                </button>
              ))}
            </div>

            {savingWord ? (
              <div className="panel panel-pad" style={{ marginTop: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>
                  Tambahkan “{savingWord}” ke kamus lokal
                </div>
                <div className="form-grid">
                  <div className="form-row">
                    <label>Inggris</label>
                    <input className="input" value={draft.en} onChange={event => setDraft({ ...draft, en: event.target.value })} />
                  </div>
                  <div className="form-row">
                    <label>Arab</label>
                    <input
                      className="input arabic"
                      dir="rtl"
                      value={draft.ar}
                      onChange={event => setDraft({ ...draft, ar: event.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <label>Indonesia</label>
                    <input className="input" value={draft.id} onChange={event => setDraft({ ...draft, id: event.target.value })} />
                  </div>
                </div>
                <div className="chip-row" style={{ marginTop: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={saveWord}>
                    Simpan kata
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSavingWord("")}>
                    Batal
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="panel panel-pad">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Hasil terjemah
        </div>

        {rows.length ? (
          <div className="output-list" style={{ marginTop: 0 }}>
            {rows.map(row => (
              <div className="output-row" key={row.key}>
                <span className={`chip-tag ${row.key}`}>{row.key.toUpperCase()}</span>
                <span className={`value ${row.key === "ar" ? "arabic" : ""}`}>{row.value || "-"}</span>
                <button className="icon-btn" onClick={() => speak(row.value || "", row.key)} aria-label={`Dengarkan ${row.key}`}>
                  <IconVolume />
                </button>
                <button className="icon-btn" onClick={() => copy(row.value || "", row.key.toUpperCase())} aria-label={`Salin ${row.key}`}>
                  <IconCopy />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: "30px 10px" }}>
            <div className="empty-icon">🌐</div>
            <h3>Mulai mengetik</h3>
            <p>Hasil terjemah untuk EN, AR, dan ID muncul di sini beserta audio dan tombol salin.</p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div className="section-head" style={{ marginBottom: 8 }}>
            <div className="eyebrow">Riwayat ({history.length})</div>
            {history.length ? (
              <button className="btn btn-ghost btn-sm" onClick={() => actions.clearTranslateHistory()}>
                <IconTrash /> Bersihkan
              </button>
            ) : null}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {history.length ? (
              history.map(entry => (
                <button
                  key={`${entry.ts}-${entry.text}`}
                  className="history-item"
                  onClick={() => setText(entry.text)}
                  title={entry.text}
                >
                  <span className={`chip-tag ${entry.src || "en"}`}>{(entry.src || "en").toUpperCase()}</span>
                  <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.text}
                  </span>
                  <IconSend size={14} />
                </button>
              ))
            ) : (
              <p className="note">Belum ada riwayat. Klik “Simpan riwayat” untuk menyimpan terjemah yang sering dipakai.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
