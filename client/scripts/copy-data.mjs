/**
 * Salin dataset statis (assets/) ke client/public/data sebelum dev/build.
 * Dipakai sebagai fallback bila backend tidak tersedia (mode statis GitHub Pages).
 */
import { cp, mkdir, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..", "..")
const outDir = path.resolve(here, "..", "public", "data")

const copies = [
  [path.join(root, "assets", "data", "catalog.json"), path.join(outDir, "catalog.json")],
  [path.join(root, "assets", "data", "word_suggestions.json"), path.join(outDir, "word_suggestions.json")],
  [path.join(root, "assets", "data", "categories"), path.join(outDir, "categories")],
  [path.join(root, "assets", "animals", "animals.json"), path.join(outDir, "animals.json")],
  [path.join(root, "assets", "vegetables", "vegetables.json"), path.join(outDir, "vegetables.json")]
]

await mkdir(outDir, { recursive: true })

let copied = 0
for (const [from, to] of copies) {
  try {
    await cp(from, to, { recursive: true, force: true })
    copied++
  } catch (error) {
    console.warn(`[copy-data] lewati ${path.basename(from)}: ${error.message}`)
  }
}

const categories = await readdir(path.join(outDir, "categories")).catch(() => [])
console.log(`[copy-data] selesai: ${copied}/${copies.length} sumber, ${categories.length} file kategori`)
