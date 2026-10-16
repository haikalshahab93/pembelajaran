import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "../state/useApp.js"
import { useStudyItems } from "../hooks/useStudyItems.js"
import { buildQuizChoices, pickWeightedIndex, srsKey, srsUrgency } from "../lib/srs.js"
import { pickVoice, speak } from "../lib/speech.js"
import { IconCheck, IconVolume, IconX } from "../components/Icons.jsx"

const QUESTION_COUNT = 10

function pickQuestion(pool, srsMap, timerSecs, exclude) {
  if (!pool.length) return null
  const candidates = pool.filter(item => !exclude.has(srsKey(item)))
  const list = candidates.length ? candidates : pool
  const pick = pickWeightedIndex(list.length, index =>
    srsUrgency(srsMap[srsKey(list[index])], Date.now(), timerSecs)
  )
  const item = list[Math.max(0, pick)]
  return { item, choices: buildQuizChoices(pool, item, 4), startedAt: Date.now() }
}

export default function Quiz() {
  const { state, actions } = useApp()
  const { items } = useStudyItems()
  const [session, setSession] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)
  const sessionRef = useRef(null)
  const lockRef = useRef(null)
  const timeoutRef = useRef(null)
  sessionRef.current = session

  const timerSecs = state.settings.timerSecs || 0
  const srsMap = state.progress.srs

  const reviewPool = useMemo(
    () =>
      (state.progress.quizErrors || [])
        .filter(error => error.en || error.ar || error.id)
        .map(error => ({ en: error.en, ar: error.ar, id: error.id, __review: true })),
    [state.progress.quizErrors]
  )

  const startSession = useCallback(
    (mode = "normal") => {
      const pool = mode === "review" ? reviewPool : items
      if (!pool.length) {
        actions.pushToast("Belum ada kata untuk kuis di kategori ini", "warn")
        return
      }
      const total = Math.min(QUESTION_COUNT, pool.length)
      const first = pickQuestion(pool, srsMap, timerSecs, new Set())
      if (!first) return
      setSession({
        mode,
        pool,
        total,
        index: 0,
        current: first,
        answered: null,
        correct: 0,
        wrong: 0,
        seen: new Set([srsKey(first.item)]),
        wrongList: [],
        finished: false
      })
      lockRef.current = false
    },
    [items, reviewPool, srsMap, timerSecs, actions]
  )

  // reset sesi saat kategori/filter berubah
  useEffect(() => {
    setSession(null)
  }, [state.settings.category, state.settings.direction, state.ui.studyFilter, state.settings.search])

  // hitung mundur berbasis deadline agar tidak ada nilai basi antar soal
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (!session || session.answered || session.finished || !timerSecs) {
      setTimeLeft(timerSecs)
      return undefined
    }
    const deadline = Date.now() + timerSecs * 1000
    setTimeLeft(timerSecs)
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        if (timeoutRef.current) timeoutRef.current()
      }
    }, 250)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session && session.current, session && session.answered, session && session.finished, timerSecs])

  // kunci direset setiap soal baru
  useEffect(() => {
    lockRef.current = false
  }, [session && session.current])

  const answer = useCallback(
    choice => {
      if (lockRef.current) return
      const currentSession = sessionRef.current
      if (!currentSession || currentSession.answered || currentSession.finished) return
      lockRef.current = true
      const target = currentSession.current.item
      const ok = choice === target
      const elapsedMs = Date.now() - currentSession.current.startedAt
      actions.recordAnswer(target, { ok, elapsedMs, timedOut: false })
      setSession(previous => ({
        ...previous,
        answered: { choice, ok, timedOut: false },
        correct: previous.correct + (ok ? 1 : 0),
        wrong: previous.wrong + (ok ? 0 : 1),
        wrongList: ok
          ? previous.wrongList
          : [...previous.wrongList, { en: target.en, ar: target.ar, id: target.id }]
      }))
      if (ok && pickVoice("en")) speak(target.en || target.ar || "", "en")
    },
    [session, actions]
  )

  const handleTimeout = useCallback(() => {
    const currentSession = sessionRef.current
    if (!currentSession || currentSession.answered || currentSession.finished) return
    if (lockRef.current) return
    lockRef.current = true
    const target = currentSession.current.item
    actions.recordAnswer(target, {
      ok: false,
      elapsedMs: (state.settings.timerSecs || 10) * 1000,
      timedOut: true
    })
    setSession(previous => {
      if (!previous || previous.answered || previous.finished) return previous
      return {
        ...previous,
        answered: { choice: null, ok: false, timedOut: true },
        wrong: previous.wrong + 1,
        wrongList: [...previous.wrongList, { en: target.en, ar: target.ar, id: target.id }]
      }
    })
  }, [actions, state.settings.timerSecs])
  timeoutRef.current = handleTimeout

  const nextQuestion = useCallback(() => {
    setSession(previous => {
      if (!previous || !previous.answered) return previous
      const nextIndex = previous.index + 1
      if (nextIndex >= previous.total) {
        return { ...previous, finished: true }
      }
      const current = pickQuestion(previous.pool, srsMap, timerSecs, previous.seen)
      if (!current) return { ...previous, finished: true }
      return {
        ...previous,
        index: nextIndex,
        current,
        answered: null,
        seen: new Set([...previous.seen, srsKey(current.item)])
      }
    })
  }, [srsMap, timerSecs])

  // Enter untuk lanjut
  useEffect(() => {
    const onKey = event => {
      const tag = (event.target && event.target.tagName || "").toLowerCase()
      if (["input", "textarea", "select"].includes(tag)) return
      if (state.ui.tab !== "quiz") return
      if (event.key === "Enter" && session && session.answered && !session.finished) {
        nextQuestion()
        event.preventDefault()
      }
      if (["1", "2", "3", "4"].includes(event.key) && session && !session.answered) {
        const choice = session.current.choices[Number(event.key) - 1]
        if (choice) answer(choice)
        event.preventDefault()
      }
      if (event.key.toLowerCase() === "s" && session && !session.answered) {
        const item = session.current.item
        speak(item.en || item.ar || "", "en")
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [session, answer, nextQuestion, state.ui.tab])

  const timerRadius = 22
  const timerCircumference = 2 * Math.PI * timerRadius

  if (!session) {
    const hasErrors = reviewPool.length > 0
    return (
      <div className="panel empty">
        <div className="empty-icon">🎯</div>
        <h3>Siap menguji pemahamanmu?</h3>
        <p>
          {items.length
            ? `${items.length} kata tersedia di kategori aktif. Kuis memilih soal yang paling perlu kamu ulang.`
            : "Belum ada kata di kategori ini. Pilih kategori lain di header."}
          {timerSecs ? ` Timer ${timerSecs} detik per soal.` : " Timer nonaktif."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => startSession("normal")} disabled={!items.length}>
            Mulai kuis ({Math.min(QUESTION_COUNT, items.length || 0)} soal)
          </button>
          <button className="btn btn-soft" onClick={() => startSession("review")} disabled={!hasErrors}>
            Ulangi kesalahan ({reviewPool.length})
          </button>
        </div>
      </div>
    )
  }

  if (session.finished) {
    const total = session.correct + session.wrong
    const accuracy = total ? Math.round((session.correct / total) * 100) : 0
    return (
      <div className="panel panel-pad view">
        <div className="section-head">
          <div>
            <div className="section-title">Ringkasan sesi {session.mode === "review" ? "review" : "kuis"}</div>
            <div className="section-sub">
              {accuracy >= 80
                ? "Hebat! Pemahamanmu sangat bagus hari ini."
                : accuracy >= 50
                  ? "Bagus, teruskan latihan untuk memperkuat yang lemah."
                  : "Terus berlatih, kesulitan wajar untuk materi baru."}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSession(null)}>
            Tutup
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <div className="value mono-num">{accuracy}%</div>
            <div className="label">Akurasi</div>
          </div>
          <div className="summary-item">
            <div className="value mono-num">
              {session.correct}/{total}
            </div>
            <div className="label">Jawaban benar</div>
          </div>
          <div className="summary-item">
            <div className="value mono-num">{session.wrongList.length}</div>
            <div className="label">Perlu diulang</div>
          </div>
        </div>

        {session.wrongList.length ? (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Yang perlu diulang
            </div>
            <div className="chip-row">
              {session.wrongList.map((item, index) => (
                <span key={`${srsKey(item)}-${index}`} className="chip">
                  <span className="chip-tag">EN</span>
                  {item.en || item.ar || item.id}
                </span>
              ))}
            </div>
          </>
        ) : null}

        <div className="card-actions" style={{ marginTop: 22 }}>
          <button className="btn btn-primary" onClick={() => startSession(session.mode)}>
            Main lagi
          </button>
          <button
            className="btn btn-soft"
            onClick={() => startSession("review")}
            disabled={!reviewPool.length}
          >
            Ulangi kesalahan
          </button>
          <button className="btn btn-ghost" onClick={() => actions.setUi({ tab: "cards" })}>
            Kembali ke kartu
          </button>
        </div>
      </div>
    )
  }

  const { item, choices } = session.current
  const answered = session.answered
  const sourceIsArabic = state.settings.direction.startsWith("ar")
  const promptText = sourceIsArabic ? item.ar || "" : item.en || item.id || ""
  const answerLang = sourceIsArabic ? "en" : "ar"
  const promptLang = sourceIsArabic ? "ar" : "en"
  const timerPct = timerSecs ? timeLeft / timerSecs : 1

  return (
    <div>
      <div className="quiz-top">
        <div className="score-pills">
          <span className="score-pill good">Benar {session.correct}</span>
          <span className="score-pill bad">Salah {session.wrong}</span>
          <span className="score-pill">
            Soal {session.index + 1}/{session.total}
          </span>
          {session.mode === "review" ? <span className="score-pill">Mode review</span> : null}
        </div>
        {timerSecs ? (
          <div className={`timer ${timeLeft <= 5 ? "low" : ""}`}>
            <svg viewBox="0 0 54 54" width="54" height="54">
              <circle className="timer-bg" cx="27" cy="27" r={timerRadius} fill="none" strokeWidth="5" />
              <circle
                className="timer-fg"
                cx="27"
                cy="27"
                r={timerRadius}
                fill="none"
                strokeWidth="5"
                strokeDasharray={timerCircumference}
                strokeDashoffset={timerCircumference * (1 - timerPct)}
              />
            </svg>
            <span className="timer-value">{timeLeft}</span>
          </div>
        ) : null}
      </div>

      <div className="quiz-prompt">
        <div className="prompt-label">
          {promptLang === "ar" ? "Terjemahkan ke Inggris" : "Apa arti kata ini?"}
        </div>
        <div className={`prompt-text ${promptLang === "ar" ? "arabic" : ""}`}>{promptText}</div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 12 }}
          onClick={() => speak(promptText, promptLang)}
        >
          <IconVolume /> Dengarkan
        </button>
      </div>

      <div className="options">
        {choices.map((choice, choiceIndex) => {
          let tone = ""
          if (answered) {
            if (choice === item) tone = "correct"
            else if (choice === answered.choice) tone = "wrong"
            else tone = "dimmed"
          }
          const text = sourceIsArabic ? choice.en || choice.id : choice.ar || choice.id
          return (
            <button
              key={`${srsKey(choice)}-${choiceIndex}`}
              className={`option ${tone}`}
              onClick={() => answer(choice)}
              disabled={Boolean(answered)}
            >
              <span className="opt-key">{choiceIndex + 1}</span>
              <span className={sourceIsArabic ? "" : "arabic"} style={{ flex: 1 }}>
                {text}
              </span>
              {answered && choice === item ? <IconCheck /> : null}
              {answered && choice === answered.choice && choice !== item ? <IconX /> : null}
            </button>
          )
        })}
      </div>

      {answered ? (
        <div className={`quiz-feedback ${answered.ok ? "good" : "bad"}`}>
          <span>
            {answered.ok
              ? `Benar! ${item.en || ""} = ${item.ar || ""}`
              : answered.timedOut
                ? `Waktu habis. Jawaban benar: ${item.en || ""} = ${item.ar || ""}`
                : `Belum tepat. Jawaban benar: ${item.en || ""} = ${item.ar || ""}`}
          </span>
          <button className="btn btn-primary btn-sm" onClick={nextQuestion} autoFocus>
            {session.index + 1 >= session.total ? "Lihat ringkasan" : "Soal berikutnya"}
          </button>
        </div>
      ) : (
        <div className="kbd-hints" style={{ marginTop: 16 }}>
          <span>
            <kbd>1</kbd>–<kbd>4</kbd> pilih jawaban
          </span>
          <span>
            <kbd>Enter</kbd> lanjut
          </span>
          <span>
            <kbd>S</kbd> suara
          </span>
          <span>
            Kata: <strong>{item.id || item.en}</strong>
          </span>
        </div>
      )}
      <div className="sr-only" aria-live="polite">
        {answerLang}
      </div>
    </div>
  )
}
