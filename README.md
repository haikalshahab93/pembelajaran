# Pembelajar EN ↔ AR

Aplikasi belajar kosakata **Inggris · العربية · Indonesia** — React (Vite) frontend + Node.js (Express) backend, **full Firebase**: Hosting untuk frontend, Cloud Functions untuk backend, Firestore untuk database.

> v2.1 · Arsitektur full-Firebase adalah jalur deploy utama; GitHub Pages + Render masih didukung sebagai alternatif ([render.yaml](render.yaml), [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)).

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
│   ├── public/app.config.js   # konfigurasi apiBase untuk backend stand-alone (Pages/Render)
│   └── scripts/copy-data.mjs  # salin dataset statis ke public/data
├── server/                    # Backend Express (standalone + Cloud Functions)
│   ├── index.js               # semua route API (createApp diekspor untuk Functions)
│   ├── functions.js           # wrapper Cloud Functions v2 ("backend", region asia-southeast1)
│   ├── db/                    # pabrik store: firestore.js | local.js (JSON fallback)
│   ├── lib/                   # lexicon.js, seed.js (inti seed Firestore)
│   └── scripts/seed-firestore.js
├── assets/data/               # dataset statis (82 kategori, ±12.000 entri)
├── firebase.json              # hosting rewrites + functions + firestore rules
├── firestore.rules            # akses klien langsung ditolak (backend admin SDK saja)
└── scripts/predeploy-firebase.mjs
```

## Fitur

- **Dasbor** — ring progres harian, streak, rekor, statistik belajar, kategori paling sulit, daftar kesalahan 24 jam.
- **Kartu** — flashcard 3D balik, audio EN/AR/ID (Web Speech + fallback TTS server), favorit, filter (Semua/Favorit/Sulit/Baru/Kuat), badge SRS.
- **Kuis** — 10 soal per sesi, timer lingkaran (bisa dimatikan), pemilihan soal berbobot SRS, ringkasan sesi, mode "ulangi kesalahan".
- **Frasa** — grid kartu EN/AR/ID dengan audio per baris dan paginasi.
- **Terjemah** — kamus lokal ±5.000 entri lewat API `/api/lexicon` (kompak), deteksi bahasa otomatis, tambah kata tak dikenal, riwayat, bantuan AI (Ollama via backend).
- **Saran kata** — form + status, bisa dirapikan AI, admin bisa menandai selesai.
- **Sinkronisasi progres** — SRS/favorit/riwayat tersimpan di localStorage **dan** tersinkron ke backend (`progress/{deviceId}` di Firestore).
- Tema gelap/terang/sistem, glassmorphism, responsif penuh, pintasan keyboard (`1–5`, `/`, spasi, ←→, S).

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

Build produksi frontend saja: `cd client && npm run build` (hasil di `client/dist`).

---

## Deploy full-Firebase (jalur utama)

**Prasyarat:** Firebase CLI terpasang & login (`npm i -g firebase-tools` lalu `firebase login`).

### 1. Buat/aktifkan project + database

```bash
firebase projects:create <id-project-unik> --display-name "Pembelajar EN-AR"
firebase use <id-project>
firebase firestore:databases:create --location asia-southeast2 --type firestore-native
```

### 2. Admin password (untuk endpoint admin & seed)

Buat `server/.env` (di-gitignore, ikut deploy sebagai env functions):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ganti-password-kamu-yang-kuat
```

### 3. Deploy semuanya sekaligus

```bash
firebase deploy --non-interactive
```

Predeploy otomatis: build React (`client/dist` untuk Hosting), salin dataset ke `server/assets`, `npm install` di `server/`. Hasilnya:

- **Frontend**: `https://<id-project>.web.app` (juga `.firebaseapp.com`)
- **Backend**: rewrites `/api/*`, `/tts`, `/ai/*`, `/admin/*`, `/word-suggestions*`, `/upload`, `/import-*`, `/assets/*` → Cloud Function `backend` (region `asia-southeast1`)
- **Firestore**: dipakai penuh (backend pakai credentials Google otomatis — tanpa file service account)

Verifikasi: `https://<id-project>.web.app/api/health` → `{"ok":true,"storage":"firestore",...}`.

### 4. Seed dataset (sekali)

```bash
# a) Lewat endpoint admin (paling gampang):
curl -s -X POST https://<id-project>.web.app/admin/login \
  -H "Content-Type: application/json" -d '{"username":"admin","password":"<password>"}'
# ambil "token" dari respon, lalu:
curl -s -X POST https://<id-project>.web.app/admin/seed -H "x-admin-token: <token>"

# b) Atau dari lokal (butuh file service account):
cd server
FIREBASE_SERVICE_ACCOUNT='{...json...}' node scripts/seed-firestore.js --dry-run
FIREBASE_SERVICE_ACCOUNT='{...json...}' node scripts/seed-firestore.js
```

Skema Firestore:

| Collection | Isi |
|---|---|
| `categories/{id}` | `{ id, name, count, order }` |
| `entries/{cat}__{n}` | `{ category, index, items: [...] }` (chunk < 1MB) |
| `meta/catalog` | ringkasan kategori untuk respon cepat |
| `word_suggestions/{id}` | saran kata |
| `progress/{deviceId}` | `{ payload, updated_at }` — progres belajar per perangkat |

### Batasan di Cloud Functions (full-Firebase)

- Upload gambar admin & impor CSV/JSON (animals/vegetables) ditulis ke `/tmp`, jadi **hilang saat instance di-recycle** — data asli tetap aman di Firestore. Untuk persistensi penuh upload, nanti pakai Cloud Storage/R2.
- Fitur AI (Ollama) butuh server Ollama sendiri; kosong → fitur AI mati dengan rapi.
- Instance gratis tidur setelah idle; permintaan pertama lambat 2–5 detik (cold start + pelepasan cache leksikon), setelahnya cepat.

---

## Deploy alternatif: GitHub Pages + Render + Firestore

1. **Push repo ke GitHub**, aktifkan **Settings → Pages → Source: GitHub Actions** — workflow build React dan deploy tiap push `main`.
2. **Render**: New → Blueprint → pilih repo ([render.yaml](render.yaml)) → isi `FIREBASE_SERVICE_ACCOUNT` (JSON service account satu baris), `API_BASE_URL`, `CORS_ORIGINS`, `ADMIN_PASSWORD`.
3. **Seed** dari lokal: `FIREBASE_SERVICE_ACCOUNT='{...}' node scripts/seed-firestore.js`.
4. Sambungkan Pages → Render lewat [client/public/app.config.js](client/public/app.config.js) (`apiBase`) atau **Pengaturan → Server & API** di aplikasi.

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
| `POST /admin/login·logout·seed` | sesi admin / seed Firestore |
| `POST /ai/translate`, `/ai/word-suggestion-draft` | bantuan Ollama |
| `POST /upload`, `/import-animals`, `/import-vegetables` | admin |

## Catatan

- Data belajar (SRS, favorit, riwayat) milik perangkat: localStorage dulu, sinkron ke Firestore pas ada jaringan.
- `client/public/data` dibuat otomatis oleh `scripts/copy-data.mjs` (jangan edit manual; sudah di-gitignore).
- `server/assets` hasil `scripts/predeploy-firebase.mjs` (di-gitignore, regenerate tiap deploy) — jangan edit manual.
- `scripts/*.py` di root adalah generator dataset (sudah terpakai) — boleh dihapus kalau dataset tidak lagi dikembangkan.
- Kredensial Firebase (service account/`.env`) **tidak pernah** di-commit.
