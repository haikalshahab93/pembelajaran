# Backend Express

Backend ini menggantikan `upload_server.py` untuk kebutuhan lokal/online.

## Menjalankan

```bash
cd server
npm install
npm run start
```

Default port: `8020`

## Environment

- `PORT`: port server Express
- `HOST`: host bind, default `0.0.0.0`
- `API_BASE_URL`: base URL publik untuk respons seperti upload image
- `CORS_ORIGINS`: daftar origin dipisah koma, default `*`
- `ADMIN_USERNAME`: username login admin backend
- `ADMIN_PASSWORD`: password login admin backend
- `OLLAMA_BASE_URL`: URL server Ollama, default `http://127.0.0.1:11434`
- `OLLAMA_MODEL`: model default untuk bantuan AI, contoh `qwen2.5:3b`

## Endpoint

- `GET /api/health`
- `GET /ai/status`
- `POST /ai/translate`
- `POST /ai/word-suggestion-draft`
- `GET /tts`
- `POST /upload`
- `POST /import-animals`
- `POST /import-vegetables`
- `GET /word-suggestions`
- `POST /word-suggestions`
- `POST /word-suggestions-status`

## Mode Online

Backend ini cocok untuk pola:

- frontend di GitHub Pages
- backend di PC/Ubuntu lokal
- backend dibuka online lewat domain/tunnel

Rekomendasi produksi:

1. Jalankan backend dengan PM2 memakai [ecosystem.config.js](file:///c:/Users/haika/Documents/project_trae/pembelajaran/server/ecosystem.config.js)
2. Reverse proxy dengan template [nginx.pembelajaran.conf.example](file:///c:/Users/haika/Documents/project_trae/pembelajaran/server/deploy/nginx.pembelajaran.conf.example)
3. Jika tidak mau buka port router langsung, pakai template [cloudflared-config.example.yml](file:///c:/Users/haika/Documents/project_trae/pembelajaran/server/deploy/cloudflared-config.example.yml)
4. Isi `.env` dari contoh [.env.example](file:///c:/Users/haika/Documents/project_trae/pembelajaran/server/.env.example)

Contoh `.env` untuk frontend GitHub Pages:

```env
PORT=8020
HOST=0.0.0.0
API_BASE_URL=https://api.example.com/
CORS_ORIGINS=https://haikalshahab93.github.io
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ganti-password-aman
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

## Frontend GitHub Pages

Frontend sekarang bisa membaca file konfigurasi root [app.config.js](file:///c:/Users/haika/Documents/project_trae/pembelajaran/app.config.js).
Untuk deploy GitHub Pages, isi `apiBase` dengan URL backend publik Anda.

Contoh:

```js
window.PEMBELAJAR_CONFIG = Object.assign({
  apiBase: "https://api.example.com/"
}, window.PEMBELAJAR_CONFIG || {})
```

## Catatan

- Static frontend tetap di-root project dan disajikan oleh Express.
- Data dinamis saat ini tetap memakai file JSON lokal di server.
- Frontend tetap bisa override URL API lewat pengaturan `Server Audio/API` di browser.
- Frontend sekarang juga bisa override `URL Ollama` dan `Model Ollama` lewat Pengaturan jika backend ingin mem-proxy ke instance/model lain.
- Untuk produksi publik, sebaiknya jangan expose database langsung; cukup expose Express/Nginx.
- Fitur edit server seperti upload gambar, impor data server, dan update status saran memerlukan login admin.
- Fitur `Bantu AI (Ollama)` berjalan lewat backend Express, bukan memanggil Ollama langsung dari browser.
- Modal `Saran Kata` juga bisa memakai AI untuk merapikan draft `request/meaning/category/note` sebelum disimpan.
