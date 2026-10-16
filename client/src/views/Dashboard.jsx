import { useMemo } from "react"
import { useApp } from "../state/useApp.js"
import { useStudyItems } from "../hooks/useStudyItems.js"
import { summarizeProgress, srsKey, srsSnapshot } from "../lib/srs.js"
import { IconFlame, IconTarget, IconSparkles, IconArrowRight } from "../components/Icons.jsx"

function greeting() {
  const hour = new Date().getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 19) return "Selamat sore"
  return "Selamat malam"
}

function ProgressRing({ value, goal }) {
  const pct = Math.max(0, Math.min(1, goal ? value / goal : 0))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  return (
    <div className="ring">
      <svg viewBox="0 0 132 132">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6d7cff" />
            <stop offset="60%" stopColor="#9b6bff" />
            <stop offset="100%" stopColor="#35d6a4" />
          </linearGradient>
        </defs>
        <circle className="ring-bg" cx="66" cy="66" r={radius} fill="none" strokeWidth="12" />
        <circle
          className="ring-fg"
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-label">
        <div className="ring-value mono-num">{Math.min(value, goal)}</div>
        <div className="ring-caption">dari {goal}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { state, actions } = useApp()
  const { items } = useStudyItems()
  const goal = state.settings.dailyGoal || 10
  const done = state.progress.completedToday || 0
  const summary = useMemo(
    () => summarizeProgress(state.progress.srs, state.progress.favorites),
    [state.progress.srs, state.progress.favorites]
  )

  const weakCategories = useMemo(() => {
    const rows = []
    for (const category of state.catalog.categories) {
      const entries = state.entriesByCategory[category.id]
      if (!entries || !entries.length) continue
      let trouble = 0
      let trained = 0
      let mastered = 0
      for (const item of entries) {
        const entry = state.progress.srs[srsKey(item)]
        if (!entry) continue
        if (entry.attempts) trained++
        const snap = srsSnapshot(entry)
        if (snap.tone === "hard") trouble++
        if ((entry.level || 1) >= 5 && (entry.streak || 0) >= 2) mastered++
      }
      rows.push({
        id: category.id,
        name: category.name,
        total: entries.length,
        trained,
        mastered,
        trouble,
        score: trouble * 3 + (trained ? 0 : 1)
      })
    }
    return rows
      .filter(row => row.trained > 0 || row.trouble > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [state.catalog.categories, state.entriesByCategory, state.progress.srs])

  const recentErrors = (state.progress.quizErrors || []).slice(0, 8)

  if (!state.catalog.loaded) {
    return (
      <div className="panel panel-pad">
        <div className="skeleton" style={{ height: 160 }} />
        <div className="stats-grid">
          {[0, 1, 2, 3].map(index => (
            <div key={index} className="skeleton" style={{ height: 92 }} />
          ))}
        </div>
      </div>
    )
  }

  if (state.catalog.error) {
    return (
      <div className="panel empty">
        <div className="empty-icon">📡</div>
        <h3>Backend belum terjangkau</h3>
        <p>
          Aplikasi tidak bisa memuat katalog dari server. Jalankan backend lokal
          (<code>cd server && npm start</code>) atau isi alamat API di Pengaturan.
        </p>
        <button className="btn btn-primary" onClick={() => actions.loadCatalog()}>
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-grid">
        <section className="dash-hero">
          <div className="hero-copy">
            <div className="eyebrow">{greeting()}</div>
            <h1 className="hero-title">
              Lanjutkan latihan
              <br />
              bahasa kamu hari ini
            </h1>
            <p className="hero-sub">
              {items.length ? `${items.length} kata siap dilatih di kategori aktif.` : "Pilih kategori untuk mulai belajar."}{" "}
              Konsistensi kecil setiap hari lebih baik daripada belajar panjang sesekali.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => actions.setUi({ tab: "cards" })}>
                Mulai kartu <IconArrowRight size={16} />
              </button>
              <button className="btn btn-soft" onClick={() => actions.setUi({ tab: "quiz" })}>
                Uji dengan kuis
              </button>
            </div>
          </div>
          <div className="ring-wrap">
            <ProgressRing value={done} goal={goal} />
            <div style={{ display: "grid", gap: 10 }}>
              <span className="streak-pill">
                <span className="flame">
                  <IconFlame />
                </span>
                {state.progress.streak || 0} hari beruntun
              </span>
              <span className="chip">
                <IconTarget size={14} /> Rekor {state.progress.bestDaily || 0} kartu/hari
              </span>
              <span className="chip">
                <IconSparkles size={14} /> {state.progress.favorites ? Object.keys(state.progress.favorites).length : 0} favorit
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="stats-grid">
        <div className="stat-tile tone-primary">
          <div className="stat-value mono-num">{summary.learned}</div>
          <div className="stat-label">Kata sudah dilatih</div>
          <div className="stat-hint">dari {summary.total} tersimpan di progres</div>
        </div>
        <div className="stat-tile tone-good">
          <div className="stat-value mono-num">{summary.accuracy}%</div>
          <div className="stat-label">Akurasi kuis</div>
          <div className="stat-hint">{summary.attempts} jawaban tercatat</div>
        </div>
        <div className="stat-tile tone-warn">
          <div className="stat-value mono-num">{summary.mastered}</div>
          <div className="stat-label">Kata dikuasai</div>
          <div className="stat-hint">level ≥ 5 dan benar beruntun</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value mono-num">{summary.hard}</div>
          <div className="stat-label">Perlu diperkuat</div>
          <div className="stat-hint">salah dalam 24 jam terakhir</div>
        </div>
      </div>

      <div className="dash-grid" style={{ marginTop: 18 }}>
        <section className="panel panel-pad">
          <div className="section-head">
            <div>
              <div className="section-title">Kategori paling sulit</div>
              <div className="section-sub">Berdasarkan kesalahan dan level terakhir</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => actions.setUi({ tab: "quiz" })}>
              Mulai kuis
            </button>
          </div>
          {weakCategories.length ? (
            weakCategories.map(category => {
              const pct = category.total ? Math.round((category.mastered / category.total) * 100) : 0
              return (
                <div
                  key={category.id}
                  className="list-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    actions.selectCategory(category.id)
                    actions.setUi({ tab: "cards" })
                  }}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      actions.selectCategory(category.id)
                      actions.setUi({ tab: "cards" })
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="grow">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <strong style={{ fontSize: 14.5 }}>{category.name}</strong>
                      <span className="faint" style={{ fontSize: 12.5 }}>
                        {pct}% dikuasai · {category.trouble} sulit
                      </span>
                    </div>
                    <div className="bar">
                      <span style={{ width: `${Math.max(3, pct)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="empty" style={{ padding: 26 }}>
              <div className="empty-icon">🌱</div>
              <h3>Belum ada data latihan</h3>
              <p>Selesaikan beberapa kartu atau kuis, lalu progres tiap kategori muncul di sini.</p>
            </div>
          )}
        </section>

        <section className="panel panel-pad">
          <div className="section-head">
            <div>
              <div className="section-title">Kesalahan terakhir</div>
              <div className="section-sub">Berlaku 24 jam terakhir</div>
            </div>
          </div>
          {recentErrors.length ? (
            <>
              <div className="chip-row">
                {recentErrors.map((error, index) => (
                  <span key={`${error.key}-${index}`} className="chip" title={error.id}>
                    <span className="chip-tag">EN</span>
                    {error.en || error.ar || error.id}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    actions.setUi({ tab: "quiz" })
                  }}
                >
                  Latih lagi di kuis
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    actions.setSetting("category", "__all")
                    actions.setUi({ studyFilter: "hard", tab: "cards" })
                  }}
                >
                  Lihat kartu sulit
                </button>
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: 26 }}>
              <div className="empty-icon">✨</div>
              <h3>Belum ada kesalahan</h3>
              <p>Kesalahan kuis akan muncul di sini supaya bisa langsung diulang.</p>
            </div>
          )}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div className="eyebrow">Target hari ini</div>
            <div className="bar" style={{ marginTop: 8 }}>
              <span style={{ width: `${Math.min(100, Math.round((done / goal) * 100))}%` }} />
            </div>
            <div className="note" style={{ marginTop: 8 }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} ·{" "}
              {Math.min(done, goal)}/{goal} kartu
              {done >= goal ? " · target tercapai, bagus! 🎉" : ""}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
