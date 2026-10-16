import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "../state/useApp.js"
import { useStudyItems } from "../hooks/useStudyItems.js"
import { srsKey, srsSnapshot } from "../lib/srs.js"
import { speak } from "../lib/speech.js"
import {
  IconArrowLeft,
  IconArrowRight,
  IconFlip,
  IconStar,
  IconVolume
} from "../components/Icons.jsx"

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "favorites", label: "Favorit" },
  { id: "hard", label: "Sulit" },
  { id: "new", label: "Baru" },
  { id: "strong", label: "Kuat" }
]

const LANG_OF = { en: "English", ar: "العربية", id: "Indonesia" }

export default function Cards() {
  const { state, actions } = useApp()
  const { items, loading, directionPair } = useStudyItems()
  const [speaking, setSpeaking] = useState(false)
  const counted = useRef(new Set())

  const total = items.length
  const index = Math.min(state.ui.cardIndex, Math.max(0, total - 1))
  const item = items[index]

  const countStudy = useCallback(
    target => {
      if (!target) return
      const key = srsKey(target)
      if (counted.current.has(key)) return
      counted.current.add(key)
      actions.markStudied()
    },
    [actions]
  )

  const flip = useCallback(() => {
    const next = !state.ui.flipped
    actions.setUi({ flipped: next })
    if (next) countStudy(item)
  }, [actions, state.ui.flipped, item, countStudy])

  const move = useCallback(
    delta => {
      if (!total) return
      const nextIndex = (index + delta + total) % total
      actions.setUi({ cardIndex: nextIndex, flipped: false })
    },
    [actions, index, total]
  )

  const say = useCallback(
    text => {
      const lang = directionPair.sourceLang
      setSpeaking(true)
      speak(text, lang)
      setTimeout(() => setSpeaking(false), 900)
    },
    [directionPair.sourceLang]
  )

  useEffect(() => {
    const onKey = event => {
      const tag = (event.target && event.target.tagName || "").toLowerCase()
      if (["input", "textarea", "select"].includes(tag)) return
      if (state.ui.tab !== "cards") return
      if (event.key === "ArrowRight") {
        move(1)
        event.preventDefault()
      } else if (event.key === "ArrowLeft") {
        move(-1)
        event.preventDefault()
      } else if (event.key === " ") {
        flip()
        event.preventDefault()
      } else if (event.key.toLowerCase() === "s" && item) {
        say(item[directionPair.sourceKey] || item.en || "")
        event.preventDefault()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [move, flip, say, item, state.ui.tab, directionPair.sourceKey])

  const sourceText = item ? item[directionPair.sourceKey] || "" : ""
  const isArabicSource = directionPair.sourceKey === "ar"
  const snapshot = useMemo(
    () => (item ? srsSnapshot(state.progress.srs[srsKey(item)]) : null),
    [item, state.progress.srs]
  )
  const isFavorite = item ? !!state.progress.favorites[srsKey(item)] : false
  const goal = state.settings.dailyGoal || 10
  const done = state.progress.completedToday || 0

  if (loading && !item) {
    return (
      <div className="cards-layout">
        <div className="skeleton" style={{ height: 44 }} />
        <div className="skeleton" style={{ height: 340 }} />
        <div className="skeleton" style={{ height: 52 }} />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="panel empty">
        <div className="empty-icon">🗂️</div>
        <h3>Tidak ada kata untuk ditampilkan</h3>
        <p>
          Ubah kategori, kata kunci pencarian, atau filter studi di bawah ini untuk
          menemukan kosakata yang ingin dilatih.
        </p>
        <button
          className="btn btn-soft"
          onClick={() => {
            actions.setSetting("search", "")
            actions.setUi({ studyFilter: "all" })
          }}
        >
          Reset filter
        </button>
      </div>
    )
  }

  return (
    <div className="cards-layout">
      <div className="card-toolbar">
        <div className="chip-row">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              className={`chip ${state.ui.studyFilter === filter.id ? "active" : ""}`}
              onClick={() => actions.setUi({ studyFilter: filter.id, cardIndex: 0, flipped: false })}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="chip-row">
          <span className={`srs-badge srs-${snapshot.tone}`}>
            <span className="srs-title">{snapshot.summary}</span>
            {snapshot.stats ? <span className="srs-meta">{snapshot.stats}</span> : null}
          </span>
          <button
            className={`icon-btn ${isFavorite ? "active" : ""}`}
            onClick={() => actions.toggleFavorite(item)}
            aria-label="Favorit"
            title="Favorit"
          >
            <IconStar filled={isFavorite} />
          </button>
        </div>
      </div>

      <div className="flashcard-scene">
        <div
          className={`flashcard ${state.ui.flipped ? "flipped" : ""}`}
          onClick={flip}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === "Enter") flip()
          }}
          aria-label="Balik kartu"
        >
          <div className="face front">
            {state.settings.media && item.emoji ? <div className="card-emoji">{item.emoji}</div> : null}
            <div className={`card-word ${isArabicSource ? "arabic" : ""}`}>{sourceText}</div>
            {isArabicSource && item.tr ? <div className="translit">{item.tr}</div> : null}
            <div className="card-hint">
              {LANG_OF[directionPair.sourceKey]} · klik atau tekan spasi untuk membalik
            </div>
          </div>

          <div className="face back">
            <div className="translations">
              {directionPair.targetKeys.map(key => (
                <div className="translation-row" key={key}>
                  <span className={`chip-tag ${key}`}>{key.toUpperCase()}</span>
                  <span className={`value ${key === "ar" ? "arabic" : ""}`}>{item[key] || "-"}</span>
                  <button
                    className="icon-btn"
                    onClick={event => {
                      event.stopPropagation()
                      if (item[key]) speak(item[key], key)
                    }}
                    aria-label={`Dengarkan ${key}`}
                  >
                    <IconVolume />
                  </button>
                </div>
              ))}
            </div>
            {state.settings.media && (item.ex_en || item.ex_ar) ? (
              <div className="examples">
                {item.ex_en ? (
                  <div className="example-row">
                    <span className="example-label">EN</span>
                    <span>{item.ex_en}</span>
                  </div>
                ) : null}
                {item.ex_ar ? (
                  <div className="example-row">
                    <span className="example-label">AR</span>
                    <span className="arabic">{item.ex_ar}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="card-hint">{LANG_OF[directionPair.sourceKey]} · {sourceText}</div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-ghost" onClick={() => move(-1)}>
          <IconArrowLeft /> Sebelumnya
        </button>
        <button className="btn btn-primary" onClick={flip}>
          <IconFlip /> {state.ui.flipped ? "Lihat depan" : "Balik kartu"}
        </button>
        <button className="btn btn-ghost" onClick={() => move(1)}>
          Berikutnya <IconArrowRight />
        </button>
        <button className="btn btn-soft" onClick={() => say(sourceText)}>
          <IconVolume /> {speaking ? "Bersuara…" : "Dengar"}
        </button>
      </div>

      <div className="progress-strip">
        <span className="progress-text">
          {index + 1} / {total}
        </span>
        <div className="bar">
          <span style={{ width: `${total ? ((index + 1) / total) * 100 : 0}%` }} />
        </div>
        <span className="progress-text">
          Target {Math.min(done, goal)}/{goal}
        </span>
      </div>

      <div className="kbd-hints">
        <span>
          <kbd>←</kbd> <kbd>→</kbd> pindah kartu
        </span>
        <span>
          <kbd>Spasi</kbd> balik kartu
        </span>
        <span>
          <kbd>S</kbd> suara
        </span>
        <span>
          <kbd>/</kbd> cari
        </span>
      </div>
    </div>
  )
}
