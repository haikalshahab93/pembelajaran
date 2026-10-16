/**
 * Audio: memakai Web Speech API lebih dulu, lalu fallback ke endpoint /tts backend.
 */

import { fetchTtsObjectUrl } from "./api.js"

let voices = []
let audioCacheReady = false
let currentAudio = null

export function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return []
  voices = window.speechSynthesis.getVoices() || []
  audioCacheReady = true
  return voices
}

export function initVoices(onReady) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {}
  loadVoices()
  const handler = () => {
    loadVoices()
    if (onReady) onReady(voices)
  }
  window.speechSynthesis.addEventListener("voiceschanged", handler)
  return () => window.speechSynthesis.removeEventListener("voiceschanged", handler)
}

function langGroup(lang) {
  const value = String(lang || "").toLowerCase()
  if (value.startsWith("ar")) return "ar"
  if (value.startsWith("id")) return "id"
  return "en"
}

export function pickVoice(lang) {
  if (!voices.length) loadVoices()
  const group = langGroup(lang)
  const exact = { ar: "ar", id: "id", en: "en" }[group]
  return (
    voices.find(voice => String(voice.lang || "").toLowerCase().startsWith(exact)) ||
    voices.find(voice => String(voice.lang || "").toLowerCase().startsWith(group === "id" ? "id" : group)) ||
    null
  )
}

export function stopSpeaking() {
  if (typeof window === "undefined") return
  if ("speechSynthesis" in window) window.speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

/**
 * Ucapkan teks. Mengembalikan { mode: "browser" | "server" | "none" }.
 */
export function speak(text, lang, options = {}) {
  const value = String(text || "").trim()
  if (!value) return { mode: "none" }
  const group = langGroup(lang)
  const preferServer = options.preferServer === true

  stopSpeaking()

  const voice = pickVoice(group)
  if (!preferServer && voice && "speechSynthesis" in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(value)
      utterance.voice = voice
      utterance.lang = voice.lang
      utterance.rate = options.rate || 0.95
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
      return { mode: "browser", voice: voice.name }
    } catch {
      /* lanjut ke server */
    }
  }

  fetchTtsObjectUrl(value, group)
    .then(url => {
      const audio = new Audio(url)
      audio.playbackRate = options.rate || 1
      currentAudio = audio
      audio.play().catch(() => {})
    })
    .catch(() => {})

  return { mode: "server" }
}

export async function prefetchAudio(text, lang) {
  const value = String(text || "").trim()
  if (!value) return
  const group = langGroup(lang)
  if (pickVoice(group) && !audioCacheReady) return
  try {
    await fetchTtsObjectUrl(value, group)
  } catch {
    /* diamkan */
  }
}
