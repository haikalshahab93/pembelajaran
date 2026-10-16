// Konfigurasi yg dibaca frontend React (window.PEMBELAJAR_CONFIG) saat render statis (misalnya GitHub Pages).
// Isi URL backend Render kamu di bawah, lalu commit + push agar Pages di-deploy ulang.
// Tanpa isi juga jalan: aplikasi memakai fallback dataset statis, dan URL backend
// bisa diisi dari aplikasi lewat Pengaturan → Server & API (tersimpan per perangkat).
window.PEMBELAJAR_CONFIG = Object.assign({
  apiBase: "" // contoh: "https://pembelajaran-api.onrender.com/"
}, window.PEMBELAJAR_CONFIG || {})
