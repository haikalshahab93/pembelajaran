/**
 * Seed data statis (assets/) ke Firebase Firestore — jalankan dari komputer lokal.
 *
 *   cd server
 *   FIREBASE_SERVICE_ACCOUNT='{...json service account...}' node scripts/seed-firestore.js --dry-run
 *   (tanpa --dry-run menulis data ke Firestore)
 *
 * Logika inti ada di server/lib/seed.js (dipakai juga endpoint /admin/seed di Cloud Functions).
 */
const path = require("path")

const ROOT = process.env.APP_ROOT ? path.resolve(process.env.APP_ROOT) : path.resolve(__dirname, "..", "..")
const ASSETS_DIR = path.join(ROOT, "assets")

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const { loadDataset, chunkItems } = require("../lib/seed")
  const { categories, allEntries, suggestions } = await loadDataset(ASSETS_DIR)
  console.log(`[seed] kategori=${categories.length} entri=${allEntries.length} saran=${suggestions.length}`)

  if (dryRun) {
    for (const category of categories) {
      const items = allEntries.filter(item => item.__category === category.id)
      const chunks = chunkItems(items, 700 * 1024)
      console.log(`  - ${category.id.padEnd(28)} ${String(category.count).padStart(5)} entri  ${chunks.length} chunk`)
    }
    return
  }

  const admin = require("firebase-admin")
  const { parseServiceAccount, isFirestoreConfigured } = require("../db/firestore")
  if (!isFirestoreConfigured()) {
    console.error("[seed] Kredensial Firestore tidak ditemukan.")
    console.error("        Set FIREBASE_SERVICE_ACCOUNT (JSON) atau GOOGLE_APPLICATION_CREDENTIALS lalu ulangi.")
    console.error("        Alternatif: seed lewat endpoint /admin/seed di Cloud Functions sesudah deploy.")
    process.exit(1)
  }

  if (!admin.apps.length) {
    const serviceAccount = parseServiceAccount()
    admin.initializeApp(
      serviceAccount
        ? { credential: admin.credential.cert(serviceAccount) }
        : { projectId: process.env.FIREBASE_PROJECT_ID || undefined }
    )
  }

  const db = admin.firestore()
  const summary = await require("../lib/seed").seedFirestore({ assetsRoot: ASSETS_DIR, db })
  console.log(`[seed] selesai: kategori=${summary.categories} entri=${summary.entries} chunk=${summary.entryChunks} saran=${summary.suggestions}`)
  await admin.app().delete()
}

main().catch(error => {
  console.error("[seed] gagal:", error)
  process.exit(1)
})
