# 🚀 Mini-Projets — Web & Automatisation

Portfolio de mini-projets autonomes illustrant deux axes de compétences :
**développement web** (front + API) et **automatisation** (scripts CLI robustes).
Tous les projets fonctionnent **sans dépendance externe** (vanilla JS / stdlib Python).

## 🌐 Développement web — `web/`

| Projet | Stack | Ce que ça montre |
|--------|-------|------------------|
| [📝 Todo App](web/todo-app/) | HTML/CSS/JS vanilla | DOM, événements, localStorage, rendu XSS-safe, CSS variables |
| [🔗 Notes API](web/notes-api/) | Python stdlib | Serveur HTTP, routage REST, validation, concurrence (Lock), CORS |

## ⚙️ Automatisation — `automation/`

| Projet | Ce que ça montre |
|--------|------------------|
| [🗂️ File Organizer](automation/file-organizer/) | pathlib/shutil, CLI argparse, dry-run, annulation via historique |
| [👀 Price Watcher](automation/scraper-notifier/) | HTTP + retries/backoff, parsing HTML, état persistant, webhooks Slack/Discord |
| [💾 Backup Tool](automation/backup-tool/) | SHA-256 incrémental, tar.gz + manifest, rétention, protection tar-bomb |

## Démarrage rapide

```bash
# Frontend (aucune installation)
python3 -m http.server 8000   # → http://localhost:8000/web/todo-app/

# API notes (après avoir stoppé le serveur ci-dessus)
python3 web/notes-api/server.py   # → http://localhost:8000/api/health

# Scripts d'automatisation (chacun a son README)
python3 automation/file-organizer/organizer.py ~/Downloads --dry-run
python3 automation/scraper-notifier/watcher.py https://exemple.com/produit
python3 automation/backup-tool/backup.py ~/Documents --dest ./backups --dry-run
```

## Environnement
- Python ≥ 3.10 recommandé ; aucun `pip install` / `npm install` nécessaire.
- Chaque projet est autonome dans son dossier avec son propre README.
