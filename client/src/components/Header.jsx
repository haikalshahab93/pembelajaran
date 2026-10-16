import { useApp } from "../state/useApp.js"
import { IconBulb, IconMoon, IconSearch, IconSettings, IconSun } from "./Icons.jsx"

export default function Header() {
  const { state, actions } = useApp()
  const { settings, catalog, ui } = state
  const isDark = settings.theme !== "light"

  const toggleTheme = () => {
    actions.setSetting("theme", isDark ? "light" : "dark")
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            <span>ع</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">Pembelajar</span>
            <span className="brand-sub">English · العربية · Indonesia</span>
          </div>
        </div>

        <div className="header-tools">
          <label className="field">
            <span className="field-label">Arah</span>
            <select
              value={settings.direction}
              onChange={event => actions.setSetting("direction", event.target.value)}
              aria-label="Arah terjemah"
            >
              <option value="en-ar">Inggris → Arab</option>
              <option value="ar-en">Arab → Inggris</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Kategori</span>
            <select
              value={settings.category}
              onChange={event => actions.selectCategory(event.target.value)}
              aria-label="Kategori kosakata"
              disabled={!catalog.loaded}
            >
              {!catalog.loaded ? <option value="__loading">Memuat…</option> : null}
              <option value="__all">Semua kategori</option>
              {catalog.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.count ? ` (${category.count})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="field search-field">
            <IconSearch />
            <input
              type="search"
              value={settings.search}
              onChange={event => actions.setSetting("search", event.target.value)}
              placeholder="Cari kata (EN/AR/ID)…"
              aria-label="Cari kata"
            />
          </label>

          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            title={isDark ? "Tema terang" : "Tema gelap"}
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>

          <button
            className={`icon-btn ${ui.suggestionsOpen ? "active" : ""}`}
            onClick={() => actions.setUi({ suggestionsOpen: !ui.suggestionsOpen })}
            aria-label="Saran kata"
            title="Saran kata"
          >
            <IconBulb />
          </button>

          <button
            className={`icon-btn ${ui.settingsOpen ? "active" : ""}`}
            onClick={() => actions.setUi({ settingsOpen: !ui.settingsOpen })}
            aria-label="Pengaturan"
            title="Pengaturan"
          >
            <IconSettings />
          </button>
        </div>
      </div>
    </header>
  )
}
