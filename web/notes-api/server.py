#!/usr/bin/env python3
"""
Notes API — REST API sans framework (stdlib uniquement).

Compétences illustrées :
- HTTP server avec http.server
- Routage manuel + parsing d'URL
- Validation des entrées / gestion d'erreurs JSON
- Persistance sur disque (JSON file) avec lock
- CORS pour être consommée depuis un front

Usage :
    python3 server.py            # démarre sur http://localhost:8000
    curl http://localhost:8000/api/notes
"""

import json
import threading
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

DB_FILE = Path(__file__).parent / "notes.json"
_LOCK = threading.Lock()


# ---------- Couche données ----------

def load_notes() -> list[dict]:
    if not DB_FILE.exists():
        return []
    try:
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def save_notes(notes: list[dict]) -> None:
    tmp = DB_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(notes, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(DB_FILE)  # écriture atomique


# ---------- Handlers ----------

class NotesHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        parts = [p for p in parsed.path.split("/") if p]

        if parts == ["api", "health"]:
            return self._json(200, {"status": "ok", "time": utcnow()})

        if parts == ["api", "notes"]:
            q = parse_qs(parsed.query)
            tag = q.get("tag", [None])[0]
            with _LOCK:
                notes = load_notes()
            if tag:
                notes = [n for n in notes if tag in n.get("tags", [])]
            return self._json(200, {"count": len(notes), "notes": notes})

        if parts[:2] == ["api", "notes"] and len(parts) == 3:
            with _LOCK:
                note = next((n for n in load_notes() if n["id"] == parts[2]), None)
            if note:
                return self._json(200, note)
            return self._json(404, {"error": "note introuvable"})

        return self._json(404, {"error": "route inconnue"})

    def do_POST(self):
        if urlparse(self.path).path != "/api/notes":
            return self._json(404, {"error": "route inconnue"})

        body, err = self._read_json()
        if err:
            return self._json(400, {"error": err})

        title = str(body.get("title", "")).strip()
        content = str(body.get("content", "")).strip()
        tags = body.get("tags", [])

        if not title:
            return self._json(422, {"error": "le champ 'title' est requis"})
        if not isinstance(tags, list):
            return self._json(422, {"error": "'tags' doit être une liste"})

        note = {
            "id": uuid.uuid4().hex[:8],
            "title": title,
            "content": content,
            "tags": [str(t) for t in tags],
            "created_at": utcnow(),
        }
        with _LOCK:
            notes = load_notes()
            notes.append(note)
            save_notes(notes)
        return self._json(201, note)

    def do_DELETE(self):
        parts = [p for p in urlparse(self.path).path.split("/") if p]
        if parts[:2] != ["api", "notes"] or len(parts) != 3:
            return self._json(404, {"error": "route inconnue"})

        with _LOCK:
            notes = load_notes()
            remaining = [n for n in notes if n["id"] != parts[2]]
            if len(remaining) == len(notes):
                return self._json(404, {"error": "note introuvable"})
            save_notes(remaining)
        return self._json(200, {"deleted": parts[2]})

    # ---------- Helpers ----------

    def _read_json(self) -> tuple[dict, str | None]:
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        if not raw:
            return {}, "corps de requête vide (JSON attendu)"
        try:
            data = json.loads(raw)
            if not isinstance(data, dict):
                return {}, "le JSON racine doit être un objet"
            return data, None
        except json.JSONDecodeError as e:
            return {}, f"JSON invalide : {e}"

    def _json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")  # CORS
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):  # journalisation concise
        print(f"[{datetime.now():%H:%M:%S}] {self.command} {self.path} → {fmt % args}")


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("localhost", 8000), NotesHandler)
    print("🚀 Notes API sur http://localhost:8000/api/notes (Ctrl+C pour arrêter)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Arrêt du serveur.")
