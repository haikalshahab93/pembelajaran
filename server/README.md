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

## Endpoint

- `GET /api/health`
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
- Data tetap memakai file JSON yang sudah dipakai aplikasi saat ini.
- Frontend tetap bisa override URL API lewat pengaturan `Server Audio/API` di browser.
- Untuk produksi publik, sebaiknya jangan expose database langsung; cukup expose Express/Nginx.
