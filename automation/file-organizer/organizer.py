#!/usr/bin/env python3
"""
File Organizer — range automatiquement un dossier en vrac.

Compétences illustrées :
- pathlib, shutil (déplacements sûrs entre systèmes de fichiers)
- argparse (CLI professionnelle avec sous-commandes)
- mode dry-run, journalisation logging
- mapping extensions → catégories

Usage :
    python3 organizer.py ~/Downloads            # organise pour de vrai
    python3 organizer.py ~/Downloads --dry-run  # prévisualise sans rien toucher
    python3 organizer.py . --undo               # annule la dernière session
"""

import argparse
import json
import logging
import shutil
import sys
from datetime import datetime
from pathlib import Path

CATEGORIES = {
    "Images":   {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".heic"},
    "Documents": {".pdf", ".doc", ".docx", ".txt", ".md", ".odt", ".rtf"},
    "Tableurs":  {".xls", ".xlsx", ".csv", ".ods"},
    "Presentations": {".ppt", ".pptx", ".odp"},
    "Archives": {".zip", ".tar", ".gz", ".tgz", ".bz2", ".7z", ".rar", ".xz"},
    "Musique":  {".mp3", ".flac", ".wav", ".ogg", ".m4a", ".aac"},
    "Vidéos":   {".mp4", ".mkv", ".avi", ".mov", ".webm", ".wmv"},
    "Code":     {".py", ".js", ".ts", ".html", ".css", ".json", ".sh", ".sql"},
    "Exécutables": {".exe", ".msi", ".dmg", ".app", ".deb", ".rpm"},
}

LOG_FILE = Path(__file__).parent / "organize_history.json"

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("organizer")


def category_for(path: Path) -> str:
    ext = path.suffix.lower()
    for cat, exts in CATEGORIES.items():
        if ext in exts:
            return cat
    return "Autres"


def unique_destination(dest_dir: Path, filename: str) -> Path:
    """Évite d'écraser un fichier existant : rapport.pdf -> rapport_1.pdf."""
    dest = dest_dir / filename
    if not dest.exists():
        return dest
    stem, suffix = dest.stem, dest.suffix
    n = 1
    while (dest_dir / f"{stem}_{n}{suffix}").exists():
        n += 1
    return dest_dir / f"{stem}_{n}{suffix}"


def organize(folder: Path, dry_run: bool) -> list[dict]:
    if not folder.is_dir():
        log.error("'%s' n'est pas un dossier valide.", folder)
        sys.exit(1)

    moves: list[dict] = []
    skip_names = {Path(__file__).name, LOG_FILE.name}

    for entry in sorted(folder.iterdir()):
        if entry.is_dir() or entry.name.startswith(".") or entry.name in skip_names:
            continue

        cat = category_for(entry)
        dest_dir = folder / cat
        dest = unique_destination(dest_dir, entry.name)

        tag = "[DRY-RUN] " if dry_run else ""
        log.info("%s%-14s ← %s", tag, cat, entry.name)
        moves.append({"src": str(entry), "dst": str(dest), "category": cat})

        if not dry_run:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.move(str(entry), str(dest))

    return moves


def undo(folder: Path) -> None:
    if not LOG_FILE.exists():
        log.error("Aucun historique trouvé (%s).", LOG_FILE.name)
        return
    history = json.loads(LOG_FILE.read_text(encoding="utf-8"))
    restored = 0
    for m in reversed(history.get("moves", [])):
        src, dst = Path(m["src"]), Path(m["dst"])
        if dst.exists() and not src.exists():
            dst.replace(src)
            restored += 1
    log.info("↩️  %d fichier(s) remis à leur emplacement d'origine.", restored)


def main() -> None:
    parser = argparse.ArgumentParser(description="Range un dossier par type de fichier.")
    parser.add_argument("folder", nargs="?", default=".", help="Dossier à organiser (défaut: .)")
    parser.add_argument("--dry-run", action="store_true", help="Prévisualiser sans déplacer")
    parser.add_argument("--undo", action="store_true", help="Annuler la dernière session")
    args = parser.parse_args()

    folder = Path(args.folder).expanduser().resolve()

    if args.undo:
        undo(folder)
        return

    log.info("📂 Dossier : %s", folder)
    moves = organize(folder, args.dry_run)

    if not moves:
        log.info("Rien à ranger, le dossier est déjà propre ✨")
        return

    if not args.dry_run:
        LOG_FILE.write_text(
            json.dumps(
                {"session": datetime.now().isoformat(timespec="seconds"), "moves": moves},
                indent=2,
            ),
            encoding="utf-8",
        )
    log.info("✅ %d fichier(s) traités%s.", len(moves), " (aucun déplacement réel)" if args.dry_run else "")


if __name__ == "__main__":
    main()
