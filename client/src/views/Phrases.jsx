import { useMemo, useState } from "react"
import { useApp } from "../state/useApp.js"
import { useStudyItems } from "../hooks/useStudyItems.js"
import { srsKey } from "../lib/srs.js"
import { speak } from "../lib/speech.js"
import { IconArrowLeft, IconArrowRight, IconStar, IconVolume } from "../components/Icons.jsx"

const PAGE_SIZE = 24

export default function Phrases() {
  const { state, actions } = useApp()
  const { items, loading } = useStudyItems()
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = useMemo(
    () => items.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [items, safePage]
  )

  if (loading && !items.length) {
    return (
      <div className="phrases-grid">
        {[0, 1, 2, 3, 4, 5].map(index => (
          <div key={index} className="skeleton" style={{ height: 132 }} />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="panel empty">
        <div className="empty-icon">💬</div>
        <h3>Belum ada frasa</h3>
        <p>Ubah kategori atau kata kunci pencarian untuk menampilkan daftar frasa.</p>
        <button
          className="btn btn-soft"
          onClick={() => {
            actions.setSetting("search", "")
            actions.setUi({ studyFilter: "all" })
            setPage(0)
          }}
        >
          Reset filter
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Daftar frasa & kosakata</div>
          <div className="section-sub">
            {items.length} item · halaman {safePage + 1}/{totalPages}
            {state.settings.search ? ` · hasil pencarian "${state.settings.search}"` : ""}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const next = !state.settings.media
            actions.setSetting("media", next)
          }}
          aria-pressed={state.settings.media}
        >
          {state.settings.media ? "Emoji aktif" : "Emoji nonaktif"}
        </button>
      </div>

      <div className="phrases-grid">
        {visible.map(item => {
          const key = srsKey(item)
          const favorite = !!state.progress.favorites[key]
          return (
            <article className="phrase-card" key={key}>
              <div className="phrase-line">
                <span className="chip-tag en">EN</span>
                <span className="text">
                  {state.settings.media && item.emoji ? `${item.emoji} ` : ""}
                  {item.en || "-"}
                </span>
                <button
                  className="icon-btn"
                  onClick={() => speak(item.en || "", "en")}
                  aria-label="Dengarkan Inggris"
                  title="Dengarkan Inggris"
                >
                  <IconVolume />
                </button>
              </div>

              <div className="phrase-line">
                <span className="chip-tag ar">AR</span>
                <span className="text arabic">{item.ar || "-"}</span>
                <button
                  className="icon-btn"
                  onClick={() => speak(item.ar || "", "ar")}
                  aria-label="Dengarkan Arab"
                  title="Dengarkan Arab"
                >
                  <IconVolume />
                </button>
              </div>

              <div className="phrase-line secondary">
                <span className="chip-tag id">ID</span>
                <span className="text">{item.id || "-"}</span>
                <button
                  className="icon-btn"
                  onClick={() => speak(item.id || "", "id")}
                  aria-label="Dengarkan Indonesia"
                  title="Dengarkan Indonesia"
                >
                  <IconVolume />
                </button>
              </div>

              <div className="phrase-meta">
                <span className="faint" style={{ fontSize: 12.5, fontStyle: "italic" }}>
                  {item.tr || ""}
                </span>
                <button
                  className={`icon-btn ${favorite ? "active" : ""}`}
                  onClick={() => actions.toggleFavorite(item)}
                  aria-label="Favorit"
                >
                  <IconStar filled={favorite} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="pagination">
        <button className="btn btn-ghost btn-sm" onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>
          <IconArrowLeft /> Sebelumnya
        </button>
        <span className="progress-text">
          Halaman {safePage + 1} / {totalPages}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
          disabled={safePage >= totalPages - 1}
        >
          Berikutnya <IconArrowRight />
        </button>
      </div>
    </div>
  )
}
