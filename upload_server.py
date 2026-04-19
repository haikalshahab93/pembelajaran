import os
import json
import uuid
import time
import re
from http.server import SimpleHTTPRequestHandler, HTTPServer
import cgi
import io
import csv
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(ROOT, "assets", "user-images")
MAP_PATH = os.path.join(UPLOAD_DIR, "user_images.json")
ANIMALS_DIR = os.path.join(ROOT, "assets", "animals")
ANIMALS_PATH = os.path.join(ANIMALS_DIR, "animals.json")
VEGETABLES_DIR = os.path.join(ROOT, "assets", "vegetables")
VEGETABLES_PATH = os.path.join(VEGETABLES_DIR, "vegetables.json")
DATA_DIR = os.path.join(ROOT, "assets", "data")
WORD_SUGGESTIONS_PATH = os.path.join(DATA_DIR, "word_suggestions.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)
if not os.path.exists(MAP_PATH):
    with open(MAP_PATH, "w", encoding="utf-8") as f:
        json.dump({}, f, ensure_ascii=False, indent=2)
os.makedirs(ANIMALS_DIR, exist_ok=True)
if not os.path.exists(ANIMALS_PATH):
    with open(ANIMALS_PATH, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)
os.makedirs(VEGETABLES_DIR, exist_ok=True)
if not os.path.exists(VEGETABLES_PATH):
    with open(VEGETABLES_PATH, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)
os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(WORD_SUGGESTIONS_PATH):
    with open(WORD_SUGGESTIONS_PATH, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)


def sanitize_name(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"[^a-z0-9_-]+", "-", s)
    s = re.sub(r"-{2,}", "-", s)
    return s or "img"


def log_event(kind: str, detail: str):
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{stamp}] {kind}: {detail}")


def read_json_file(path: str, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback


def write_json_file(path: str, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_word_suggestion(entry):
    source = entry if isinstance(entry, dict) else {}
    now = int(time.time() * 1000)
    status = str(source.get("status", "pending") or "pending").strip().lower()
    if status not in ("pending", "updated"):
        status = "pending"
    return {
        "id": str(source.get("id") or uuid.uuid4().hex[:12]),
        "kind": str(source.get("kind", "word") or "word").strip().lower(),
        "request": str(source.get("request", "") or "").strip(),
        "meaning": str(source.get("meaning", "") or "").strip(),
        "category": str(source.get("category", "") or "").strip(),
        "note": str(source.get("note", "") or "").strip(),
        "status": status,
        "ts": int(source.get("ts") or now),
        "updated_at": int(source.get("updated_at") or 0),
    }


def load_word_suggestions():
    raw = read_json_file(WORD_SUGGESTIONS_PATH, [])
    if not isinstance(raw, list):
        return []
    out = []
    seen = set()
    for item in raw:
        normalized = normalize_word_suggestion(item)
        if not normalized["request"]:
            continue
        if normalized["id"] in seen:
            continue
        seen.add(normalized["id"])
        out.append(normalized)
    return out


def save_word_suggestions(items):
    write_json_file(WORD_SUGGESTIONS_PATH, items)


def send_json(handler, payload, status=200):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


TTS_RATE = {}
def allow_tts(ip: str) -> bool:
    now = time.time()
    w = TTS_RATE.get(ip) or []
    w = [t for t in w if now - t < 10.0]
    if len(w) >= 5:
        TTS_RATE[ip] = w
        return False
    w.append(now)
    TTS_RATE[ip] = w
    return True
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/word-suggestions"):
            try:
                items = sorted(load_word_suggestions(), key=lambda x: int(x.get("ts") or 0), reverse=True)
                send_json(self, {"items": items, "total": len(items)})
                return
            except Exception:
                log_event("word_suggestions_get_error", self.path)
                self.send_error(500, "Failed to load word suggestions")
                return
        if self.path.startswith("/tts"):
            try:
                ip = self.client_address[0] if hasattr(self, "client_address") else "0.0.0.0"
                if not allow_tts(ip):
                    log_event("tts_rate_limit", ip)
                    self.send_error(429, "Too Many Requests")
                    return
                qs = parse_qs(urlparse(self.path).query or "")
                text = (qs.get("text", [""])[0] or "").strip()
                lang = (qs.get("lang", ["ar"])[0] or "ar").strip().lower()
                if not text:
                    log_event("tts_bad_request", "missing_text")
                    self.send_error(400, "Text is required")
                    return
                try:
                    from gtts import gTTS
                except Exception:
                    log_event("tts_unavailable", "gtts_missing")
                    self.send_error(501, "Server TTS not available (install gTTS)")
                    return
                if lang.startswith("ar"):
                    lang = "ar"
                buf = io.BytesIO()
                try:
                    tts = gTTS(text=text, lang=lang)
                    tts.write_to_fp(buf)
                except Exception:
                    log_event("tts_failed", f"lang={lang}")
                    self.send_error(500, "TTS generation failed")
                    return
                data = buf.getvalue()
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            except Exception:
                log_event("tts_unexpected", self.path)
                self.send_error(500, "Unexpected server error")
                return
        return super().do_GET()
    def do_POST(self):
        ctype = self.headers.get("Content-Type", "")
        if self.path in ("/word-suggestions", "/word-suggestions-status"):
            if "application/json" not in ctype:
                self.send_error(400, "Expect application/json")
                return
            try:
                size = int(self.headers.get("Content-Length", "0") or "0")
            except Exception:
                size = 0
            raw = self.rfile.read(size) if size > 0 else b"{}"
            try:
                payload = json.loads(raw.decode("utf-8") or "{}")
            except Exception:
                self.send_error(400, "Invalid JSON")
                return
            if self.path == "/word-suggestions":
                entry = normalize_word_suggestion(payload)
                if not entry["request"]:
                    self.send_error(400, "Request is required")
                    return
                items = load_word_suggestions()
                items = [item for item in items if item.get("id") != entry["id"]]
                items.insert(0, entry)
                save_word_suggestions(items[:500])
                send_json(self, {"ok": True, "item": entry, "total": len(items[:500])})
                log_event("word_suggestions_add_ok", entry["request"][:80])
                return
            if self.path == "/word-suggestions-status":
                item_id = str(payload.get("id", "") or "").strip()
                status = str(payload.get("status", "pending") or "pending").strip().lower()
                if not item_id:
                    self.send_error(400, "id is required")
                    return
                if status not in ("pending", "updated"):
                    self.send_error(400, "status must be pending or updated")
                    return
                items = load_word_suggestions()
                updated = None
                for item in items:
                    if item.get("id") == item_id:
                        item["status"] = status
                        item["updated_at"] = int(time.time() * 1000) if status == "updated" else 0
                        updated = item
                        break
                if not updated:
                    self.send_error(404, "Suggestion not found")
                    return
                save_word_suggestions(items)
                send_json(self, {"ok": True, "item": updated})
                log_event("word_suggestions_status_ok", f"{item_id}:{status}")
                return
        if self.path not in ("/upload", "/import-animals", "/import-vegetables"):
            self.send_error(404, "Not Found")
            return
        if "multipart/form-data" not in ctype:
            self.send_error(400, "Expect multipart/form-data")
            return
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": ctype},
        )
        if self.path == "/upload":
            fileitem = None
            if "file" in form:
                fi = form["file"]
                fileitem = fi[0] if isinstance(fi, list) else fi
            elif "image" in form:
                fi = form["image"]
                fileitem = fi[0] if isinstance(fi, list) else fi
            if getattr(fileitem, "file", None) is None:
                log_event("upload_error", "missing_file")
                self.send_error(400, "No file provided")
                return
            mimetype = getattr(fileitem, "type", "") or ""
            if not mimetype.startswith("image/"):
                log_event("upload_error", f"invalid_mime:{mimetype}")
                self.send_error(400, "Invalid MIME type")
                return
            en = form.getvalue("en", "") or ""
            ar = form.getvalue("ar", "") or ""
            idv = form.getvalue("id", "") or ""
            prev = form.getvalue("prev", "") or ""
            filename = getattr(fileitem, "filename", "") or "image"
            ext = os.path.splitext(filename)[1].lower()
            if ext not in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"):
                ext = ".png"
            base = sanitize_name(en or idv or "img")
            uniq = f"{base}-{int(time.time())}-{uuid.uuid4().hex[:6]}{ext}"
            out_path = os.path.join(UPLOAD_DIR, uniq)
            data = fileitem.file.read()
            if len(data) > 5 * 1024 * 1024:
                log_event("upload_error", "file_too_large")
                self.send_error(413, "File too large")
                return
            with open(out_path, "wb") as f:
                f.write(data)
            try:
                with open(MAP_PATH, "r", encoding="utf-8") as mf:
                    mapping = json.load(mf)
            except Exception:
                mapping = {}
            key = f"{(en or '').lower()}|{(ar or '').lower()}|{(idv or '').lower()}"
            url = f"/assets/user-images/{uniq}"
            mapping[key] = url
            with open(MAP_PATH, "w", encoding="utf-8") as mf:
                json.dump(mapping, mf, ensure_ascii=False, indent=2)
            if prev:
                try:
                    p = os.path.normpath(os.path.join(ROOT, prev.lstrip("/")))
                    if p.startswith(UPLOAD_DIR) and os.path.exists(p) and p != out_path:
                        os.remove(p)
                except Exception:
                    pass
            resp = json.dumps({"url": url}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            log_event("upload_ok", url)
            return
        if self.path == "/import-animals":
            fileitem = None
            if "file" in form:
                fi = form["file"]
                fileitem = fi[0] if isinstance(fi, list) else fi
            if getattr(fileitem, "file", None) is None:
                log_event("import_animals_error", "missing_file")
                self.send_error(400, "No file provided")
                return
            filename = getattr(fileitem, "filename", "") or "data"
            ext = os.path.splitext(filename)[1].lower()
            data_bytes = fileitem.file.read()
            if len(data_bytes) > 2 * 1024 * 1024:
                log_event("import_animals_error", "file_too_large")
                self.send_error(413, "File too large")
                return
            text = data_bytes.decode("utf-8", errors="ignore")
            try:
                with open(ANIMALS_PATH, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []
            by_key = {}
            for e in existing:
                k = f"{(e.get('en','') or '').lower()}|{(e.get('ar','') or '').lower()}|{(e.get('id','') or '').lower()}"
                by_key[k] = e
            imported = []
            if ext == ".json":
                try:
                    arr = json.loads(text)
                    if isinstance(arr, list):
                        for r in arr:
                            en = (r.get("en", "") or "").strip()
                            ar = (r.get("ar", "") or "").strip()
                            idv = (r.get("id", "") or "").strip()
                            emoji = (r.get("emoji", "") or "").strip()
                            tags = r.get("tags", [])
                            syn_en = r.get("synonyms_en", [])
                            syn_id = r.get("synonyms_id", [])
                            if en or ar or idv:
                                imported.append({"en": en, "ar": ar, "id": idv, "emoji": emoji, "tags": tags, "synonyms_en": syn_en, "synonyms_id": syn_id})
                except Exception:
                    imported = []
            else:
                sio = io.StringIO(text)
                reader = csv.DictReader(sio)
                for r in reader:
                    en = (r.get("en", "") or "").strip()
                    ar = (r.get("ar", "") or "").strip()
                    idv = (r.get("id", "") or "").strip()
                    emoji = (r.get("emoji", "") or "").strip()
                    tags = r.get("tags", "") or ""
                    syn_en = r.get("synonyms_en", "") or ""
                    syn_id = r.get("synonyms_id", "") or ""
                    if en or ar or idv:
                        imported.append({"en": en, "ar": ar, "id": idv, "emoji": emoji, "tags": tags, "synonyms_en": syn_en, "synonyms_id": syn_id})
            for r in imported:
                k = f"{(r.get('en','') or '').lower()}|{(r.get('ar','') or '').lower()}|{(r.get('id','') or '').lower()}"
                by_key[k] = r
            merged = list(by_key.values())
            with open(ANIMALS_PATH, "w", encoding="utf-8") as f:
                json.dump(merged, f, ensure_ascii=False, indent=2)
            resp = json.dumps({"count": len(imported), "total": len(merged)}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            log_event("import_animals_ok", f"count={len(imported)} total={len(merged)}")
            return
        if self.path == "/import-vegetables":
            fileitem = None
            if "file" in form:
                fi = form["file"]
                fileitem = fi[0] if isinstance(fi, list) else fi
            if getattr(fileitem, "file", None) is None:
                log_event("import_vegetables_error", "missing_file")
                self.send_error(400, "No file provided")
                return
            filename = getattr(fileitem, "filename", "") or "data"
            ext = os.path.splitext(filename)[1].lower()
            data_bytes = fileitem.file.read()
            if len(data_bytes) > 2 * 1024 * 1024:
                log_event("import_vegetables_error", "file_too_large")
                self.send_error(413, "File too large")
                return
            text = data_bytes.decode("utf-8", errors="ignore")
            try:
                with open(VEGETABLES_PATH, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []
            by_key = {}
            for e in existing:
                k = f"{(e.get('en','') or '').lower()}|{(e.get('ar','') or '').lower()}|{(e.get('id','') or '').lower()}"
                by_key[k] = e
            imported = []
            if ext == ".json":
                try:
                    arr = json.loads(text)
                    if isinstance(arr, list):
                        for r in arr:
                            en = (r.get("en", "") or "").strip()
                            ar = (r.get("ar", "") or "").strip()
                            idv = (r.get("id", "") or "").strip()
                            emoji = (r.get("emoji", "") or "").strip()
                            tags = r.get("tags", [])
                            syn_en = r.get("synonyms_en", [])
                            syn_id = r.get("synonyms_id", [])
                            if en or ar or idv:
                                imported.append({"en": en, "ar": ar, "id": idv, "emoji": emoji, "tags": tags, "synonyms_en": syn_en, "synonyms_id": syn_id})
                except Exception:
                    imported = []
            else:
                sio = io.StringIO(text)
                reader = csv.DictReader(sio)
                for r in reader:
                    en = (r.get("en", "") or "").strip()
                    ar = (r.get("ar", "") or "").strip()
                    idv = (r.get("id", "") or "").strip()
                    emoji = (r.get("emoji", "") or "").strip()
                    tags = r.get("tags", "") or ""
                    syn_en = r.get("synonyms_en", "") or ""
                    syn_id = r.get("synonyms_id", "") or ""
                    if en or ar or idv:
                        imported.append({"en": en, "ar": ar, "id": idv, "emoji": emoji, "tags": tags, "synonyms_en": syn_en, "synonyms_id": syn_id})
            for r in imported:
                k = f"{(r.get('en','') or '').lower()}|{(r.get('ar','') or '').lower()}|{(r.get('id','') or '').lower()}"
                by_key[k] = r
            merged = list(by_key.values())
            with open(VEGETABLES_PATH, "w", encoding="utf-8") as f:
                json.dump(merged, f, ensure_ascii=False, indent=2)
            resp = json.dumps({"count": len(imported), "total": len(merged)}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            log_event("import_vegetables_ok", f"count={len(imported)} total={len(merged)}")
            return


def run(port: int):
    httpd = HTTPServer(("0.0.0.0", port), Handler)
    print(f"Serving on http://localhost:{port}/")
    httpd.serve_forever()


if __name__ == "__main__":
    import sys

    port = 8020
    if len(sys.argv) >= 2:
        try:
            port = int(sys.argv[1])
        except Exception:
            pass
    run(port)
