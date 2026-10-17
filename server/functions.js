/**
 * Wrapper Cloud Functions (v2) untuk backend Express — arsitektur full Firebase:
 *   Firebase Hosting  ->  merutekan /api/*, /tts, /ai/*, /admin/*, dll ke fungsi ini
 *   Cloud Functions   ->  backend Express (server/index.js) sebagai fungsi "backend"
 *   Firestore         ->  penyimpanan data (firebase-admin, credentials Google otomatis)
 *
 * Fungsi ini diekspor dari package.json "main" (server/functions.js) dan dibaca
 * firebase.json => functions[0].source = "server".
 */

const path = require("path")
const os = require("os")

// Sebelum server/index.js dimuat, atur path agar sesuai runtime serverless:
//   APP_ROOT    = folder deployment (kode server + assets/ hasil predeploy)
//   WRITE_ROOT  = filesystem yang boleh ditulis (/tmp) untuk upload & impor
process.env.APP_ROOT = __dirname
process.env.WRITE_ROOT = process.env.WRITE_ROOT || path.join(os.tmpdir(),"pembelajar")

const { onRequest } = require("firebase-functions/v2/https")

let appPromise = null
function getExpressApp() {
  if (!appPromise) {
    appPromise = require("./index.js").createApp()
    appPromise.catch(error => {
      console.error("[functions] inisialisasi backend gagal:", error)
      appPromise = null
    })
  }
  return appPromise
}

exports.backend = onRequest(
  {
    region: "asia-southeast1",
    memory: "1GiB",
    timeoutSeconds: 120,
    concurrency: 80
  },
  async (req, res) => {
    try {
      const app = await getExpressApp()
      return app(req, res)
    } catch (error) {
      console.error("[functions]", error)
      res.status(500).json({ error: "backend_gagal", detail: String(error && error.message || error) })
    }
  }
)
