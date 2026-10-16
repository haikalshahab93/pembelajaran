import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const API_TARGET = process.env.VITE_API_TARGET || "http://localhost:8020"

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/tts": { target: API_TARGET, changeOrigin: true },
      "/ai": { target: API_TARGET, changeOrigin: true },
      "/admin": { target: API_TARGET, changeOrigin: true },
      "/word-suggestions": { target: API_TARGET, changeOrigin: true }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900
  }
})
