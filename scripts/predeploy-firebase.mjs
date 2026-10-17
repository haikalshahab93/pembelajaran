#!/usr/bin/env node
/**
 * Predeploy functions: menyalin dataset statis (assets/) ke dalam folder server/
 * karena Cloud Functions hanya meng-upload isi folder functions source (server/).
 * Folder hasil (server/assets) di-gitignore; di-regenerate setiap deploy.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SRC = path.join(ROOT, "assets")
const DEST = path.join(ROOT, "server", "assets")

const SKIP_FILES = new Set(["progress.json"])
function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (SKIP_FILES.has(entry.name)) continue
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyDirectory(from, to)
    else fs.copyFileSync(from, to)
  }
}

copyDirectory(SRC, DEST)
const categoryFiles = fs.readdirSync(path.join(DEST, "data", "categories")).length
console.log(`[predeploy] dataset disalin ke server/assets (kategori: ${categoryFiles})`)
