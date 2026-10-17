# Firebase Web-SDK Config (referensi — tidak dipakai oleh kode saat ini)

Snippet di bawah adalah konfigurasi **Firebase Web SDK** untuk project **`pembelajaran-44e75`**.
Config ini memang **dirancang publik** — bukan rahasia (beda dengan service-account JSON yang wajib rahasia).

```js
// Firebase JS SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCXQGQdOlS-JGXcDJmGinwyhoIaR7k0jRM",
  authDomain: "pembelajaran-44e75.firebaseapp.com",
  projectId: "pembelajaran-44e75",
  storageBucket: "pembelajaran-44e75.firebasestorage.app",
  messagingSenderId: "913921462129",
  appId: "1:913921462129:web:8c6d931aa569024019f0d0",
  measurementId: "G-FKEGHEWB4H"
};
```

## Kenapa snippet ini tidak perlu disimpan di kode aplikasi?

Arsitektur saat ini memakai pola "klien hanya bicara ke backend":

```
Browser (React)  --REST-->  Backend Express (Render)  --firebase-admin-->  Firestore
```

- Frontend TIDAK bicara langsung ke Firestore — `firestore.rules` menolak semua akses browser.
- Backend memakai **service account (JSON)** lewat env `FIREBASE_SERVICE_ACCOUNT` di Render.
- Firebase Web SDK baru dibutuhkan kalau mau fitur client-side (mis. Analytics, atau realtime
  listener langsung ke Firestore). Kalau nanti dipakai, tempat benarnya =
  `client/src/lib/firebase.js` + pasang dependency: `npm i firebase` di folder `client`.

## Dua project yang ada di akun ini

| Project ID | Status |
|---|---|
| `pembelajaran-44e75` | project lama; snippet web-SDK di atas berasal dari sini |
| `pembelajar-enar-app` | dibuat untuk aplikasi ini; Firestore `(default)` di `asia-southeast2`, rules sudah di-deploy |

**Pilihan terpakai**: project **`pembelajaran-44e75`** — database production. Firestore Native `(default)`
sudah dibuat via CLI dan `firestore.rules` (deny-all untuk browser) sudah di-deploy ke sini.
Untuk backend Render: generate service-account JSON dari project ini (⚙ Project settings →
Service accounts → Generate new private key) → isi ke `FIREBASE_SERVICE_ACCOUNT` di Render → seed.

(`pembelajar-enar-app` juga punya Firestore + rules siap dipakai bila suatu saat mau pindah.)

## Yang TIDAK boleh dibagikan / ditempel ke chat

- File service-account JSON / isi `FIREBASE_SERVICE_ACCOUNT`
- Password admin (`ADMIN_PASSWORD` di `server/.env`)
