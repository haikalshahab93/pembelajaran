# Pembelajar EN ↔ AR

Aplikasi belajar kosakata **Inggris · العربية · Indonesia** — dibangun ulang dengan **React (Vite)** di frontend dan **Node.js (Express)** di backend, siap di-deploy ke **GitHub Pages** (frontend) dan **Render** (backend) dengan **Firebase Firestore** sebagai database.

> v2.0 · Frontend React + Backend Express + Firestore. Versi statis lama (app.js) masih bisa dipakai fallback.

---

## Struktur proyek

```
├── client/                    # Frontend React (Vite)
│   ├── src/
│   │   ├── components/        # Header, Tabs, Modal, Toast, Footer, Icons
│   │   ├── views/             # Dashboard, Cards, Quiz, Phrases, Translate, Settings, Suggestions
│   │   ├── hooks/             # useStudyItems
│   │   ├── lib/               # api, language, srs, speech, storage
│   │   ├── state/             # AppContext (reducer + provider)
│   │   └── styles/            # tokens.css + app.css (tema gelap/terang)
│   ├── scripts/copy-data.mjs  # salin dataset statis ke public/data
│   └── dist/                  # hasil build (deploy ke GitHub Pages)
├── server/                    # Backend Express
│   ├── index.js               # HTTP + semua route API
│   ├── db/                    # pabrik store: firestore.js | local.js (JSON fallback)
│   ├── lib/lexicon.js         # lexicon kompak server-side (cache)
│   └── scripts/seed-firestore.js
├── assets/data/               # dataset statis (82 kategori, ±12.000 entri)
├── render.yaml                # blueprint deploy Render
└── .github/workflows/deploy-pages.yml
```

## Fitur

- **Dasbor** — ring progres harian, streak, rekor, statistik belajar, kategori paling sulit, daftar kesalahan 24 jam.
- **Kartu** — flashcard 3D balik, audio EN/AR/ID (Web Speech + fallback TTS server), favorit, filter (Semua/Favorit/Sulit/Baru/Kuat), badge SRS.
- **Kuis** — 10 soal per sesi, timer lingkaran (bisa dimatikan), pemilihan soal berbobot SRS, ringkasan sesi, mode "ulangi kesalahan".
- **Frasa** — grid kartu EN/AR/ID dengan audio per baris dan paginasi.
- **Terjemah** — kamus lokal ±5.000 entri lewat API `/api/lexicon` (kompak, bukan 3MB), deteksi bahasa otomatis, tambah kata tak dikenal ke kamus lokal, riwayat, bantuan AI (Ollama via backend).
- **Saran kata** — form + status, bisa dirapikan AI, admin bisa menandai selesai.
- **Sinkronisasi progres** — SRS/favorit/riwayat tersimpan di localStorage **dan** tersinkron ke backend (`progress/{deviceId}` di Firestore).
- Tampilan baru: tema gelap/terang/sistem, glassmorphism header, animasi halus, responsif penuh, pintasan papan ketik (`1–5`, `/`, spasi, ←→, S).

## Menjalankan lokal

```bash
# 1. Backend (mode JSON lokal, tanpa Firebase)
cd server
npm install
npm start            # http://localhost:8020

# 2. Frontend (terminal kedua)
cd client
npm install
npm run dev          # http://localhost:5173 (proxy API ke :8020)
```

Build produksi frontend only:

```bash
cd client && npm run build     # hasil di client/dist
```

Backend otomatis menyajikan `client/dist` bila ada — jadi satu service Render bisa menampung API + frontend sekaligus.

---

## Deploy

### 1. Frontend → GitHub Pages

Workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) sudah ada: setiap push ke `main` mem-build `client/` dan men-deploy `client/dist` ke Pages. Aktifkan di **Settings → Pages → Source: GitHub Actions**.

Agar frontend tahu alamat backend, edit [client/public/app.config.js](client/public/app.config.js):

```js
window.PEMBELAJAR_CONFIG = Object.assign({
  apiBase: "https://pembelajaran-api.onrender.com/"
}, window.PEMBELAJAR_CONFIG || {})
```

Lalu commit + push agar Pages di-build ulang. Atau lewat **Pengaturan → Server & API** langsung di aplikasi (tersimpan per perangkat).

> Mode fallback: bila `app.config.js` tidak diisi, aplikasi tetap jalan memakai `client/public/data` (dataset statis) + localStorage — hanya fitur server yang mati.

### 2. Backend → Render

1. Push repo ke GitHub.
2. Di Render: **New → Blueprint**, pilih repo — [render.yaml](render.yaml) otomatis membuat service `pembelajaran-api`.
3. Isi environment variables:
   - `FIREBASE_SERVICE_ACCOUNT` — **isi file service account JSON Firebase** (satu baris, tanpa enter). Render → Environment → Add.
   - `API_BASE_URL` — URL publik service (mis. `https://pembelajaran-api.onrender.com/`)
   - `CORS_ORIGINS` — URL Pages kamu (mis. `https://username.github.io`), koma bila lebih dari satu
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — untuk login admin (upload, status saran)
   - `OLLAMA_BASE_URL` / `OLLAMA_MODEL` — opsional, untuk fitur AI

Health check: `GET /api/health` — balik `{"ok":true,"storage":"firestore|json"}`.

### 3. Firebase Firestore (database sementara)

Backend memakai Firestore bila kredensial ada, otomatis fallback ke JSON lokal bila tidak.

1. Firebase Console → buat project → **Firestore Database** (mode Native).
2. **Project settings → Service accounts → Generate new private key** → salin isi JSON-nya ke env `FIREBASE_SERVICE_ACCOUNT` di Render.
3. Seed dataset statis ke Firestore (sekali):

```bash
cd server
FIREBASE_SERVICE_ACCOUNT='{...json...}' node scripts/seed-firestore.js --dry-run   # lihat ringkasan
FIREBASE_SERVICE_ACCOUNT='{...json...}' node scripts/seed-firestore.js             # tulis
```

Skema Firestore:

| Collection | Isi |
|---|---|
| `categories/{id}` | `{ id, name, count, order }` |
| `entries/{cat}__{n}` | `{ category, index, items: [...] }` (chunk < 1MB) |
| `meta/catalog` | ringkasan kategori untuk respon cepat |
| `word_suggestions/{id}` | saran kata |
| `progress/{deviceId}` | `{ payload, updated_at }` — progres belajar per perangkat |

> Tanpa seed: backend lewat JSON lokal tetap menyajikan seluruh kategori, jadi aplikasi langsung dipakai sebelum Firestore di-seed.

## API

| Endpoint | Ket |
|---|---|
| `GET /api/health` | status + storage aktif + statistik lexicon |
| `GET /api/catalog` | daftar kategori + jumlah entri per kategori |
| `GET /api/entries/:categoryId` | entri satu kategori |
| `GET /api/entries` | seluruh entri |
| `GET /api/lexicon` | lexicon kompak (EN/AR/ID) untuk fitur Terjemah |
| `GET·PUT /api/progress/:deviceId` | baca/simpan progres belajar |
| `GET /tts?lang&text` | audio TTS (rate-limited) |
| `GET·POST /word-suggestions` | baca/kirim saran kata |
| `POST /word-suggestions-status` | ubah status (admin) |
| `POST /ai/translate`, `/ai/word-suggestion-draft` | bantuan Ollama |
| `POST /admin/login·logout·session` | sesi admin |
| `POST /upload`, `/import-animals`, `/import-vegetables` | admin |

## Catatan

- Data belajar (SRS, favorit, riwayat) milik perangkat: localStorage dulu, sinkron ke Firestore pas ada jaringan.
- `client/public/data` dibuat otomatis oleh `scripts/copy-data.mjs` (jangan edit manual; sudah di-gitignore).
- `scripts/*.py` di root adalah script generator dataset (sudah terpakai) — boleh dihapus kalau dataset tidak lagi dikembangkan.
- Path `/assets/*` tetap dilayani backend (folder `assets/`, termasuk `user-images/` hasil upload admin).
