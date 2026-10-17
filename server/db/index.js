/**
 * Pabrik store: memilih Firestore bila kredensial tersedia, selain itu JSON lokal.
 * Mode JSON dipakai development dan tetap berfungsi penuh tanpa Firebase.
 */
const path = require("path")
const { createLocalStore } = require("./local")
const { createFirestoreStore, isFirestoreConfigured } = require("./firestore")

const ROOT = process.env.APP_ROOT ? path.resolve(process.env.APP_ROOT) : path.resolve(__dirname, "..", "..")
const DATA_DIR = path.join(ROOT, "assets", "data")

async function createStore(env = process.env) {
  const localOptions = { rootDir: ROOT, dataDir: DATA_DIR }

  if (env.STORAGE === "json") {
    return createLocalStore(localOptions)
  }

  if (isFirestoreConfigured(env)) {
    try {
      const store = createFirestoreStore(Object.assign({ env }, localOptions))
      // uji koneksi ringan agar kegagalan terlihat di log startup
      await store.getCatalog()
      return store
    } catch (error) {
      console.warn(`[store] Firestore gagal dipakai (${error.message}), fallback ke JSON lokal`)
    }
  }

  return createLocalStore(localOptions)
}

module.exports = { createStore, ROOT, DATA_DIR }
