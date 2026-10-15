#!/usr/bin/env python3
"""
Backup Tool — sauvegarde incrémentale simple et fiable d'un dossier.

Compétences illustrées :
- hachage SHA-256 pour détecter les fichiers modifiés (sauvegarde incrémentale)
- archivage tar.gz horodaté + manifest JSON
- rétention automatique (garde les N dernières sauvegardes complètes)
- dry-run, verbose, exit codes propres (prêt pour cron)

Usage :
    python3 backup.py ~/Documents --dest ./backups            # sauvegarde
    python3 backup.py ~/Documents --dest ./backups --dry-run  # prévisualise
    python3 backup.py --list --dest ./backups                 # historique
    python3 backup.py --restore <archive.tar.gz> --dest ./recovery
"""

import argparse
import hashlib
import json
import logging
import sys
import tarfile
from datetime import datetime
from pathlib import Path

CHUNK = 1024 * 1024  # 1 Mo
MANIFEST = "manifest.json"

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("backup")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(CHUNK), b""):
            h.update(block)
    return h.hexdigest()


def scan(source: Path) -> dict[str, str]:
    """Retourne {chemin_relatif: empreinte_sha256} pour tous les fichiers."""
    files = {}
    for p in sorted(source.rglob("*")):
        if p.is_file() and not any(part.startswith(".") for part in p.relative_to(source).parts):
            files[str(p.relative_to(source))] = sha256(p)
    return files


def latest_manifest(dest: Path) -> dict | None:
    manifests = sorted(dest.glob(f"backup-*/{MANIFEST}"))
    if not manifests:
        return None
    try:
        return json.loads(manifests[-1].read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def do_backup(source: Path, dest: Path, keep: int, dry_run: bool) -> None:
    log.info("🔍 Analyse de %s …", source)
    current = scan(source)
    previous = latest_manifest(dest)
    prev_files = previous["files"] if previous else {}

    new_or_changed = [f for f, h in current.items() if prev_files.get(f) != h]
    deleted = [f for f in prev_files if f not in current]

    if not new_or_changed and previous:
        log.info("✨ Rien n'a changé depuis la dernière sauvegarde (%d fichiers).", len(current))
        return

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    archive_dir = dest / f"backup-{stamp}"
    n = 1
    while archive_dir.exists():  # évite les collisions de second en second
        archive_dir = dest / f"backup-{stamp}_{n}"
        n += 1
    archive = archive_dir / "snapshot.tar.gz"

    log.info("📦 %d fichier(s) à archiver, %d supprimé(s) depuis la dernière fois.",
             len(new_or_changed), len(deleted))
    for f in new_or_changed[:10]:
        log.info("   + %s", f)
    if len(new_or_changed) > 10:
        log.info("   … et %d autre(s)", len(new_or_changed) - 10)

    if dry_run:
        log.info("[DRY-RUN] Aucune écriture réelle.")
        return

    archive_dir.mkdir(parents=True, exist_ok=False)
    with tarfile.open(archive, "w:gz") as tar:
        for f in current:  # snapshot complet (simple et robuste au restore)
            tar.add(source / f, arcname=f)

    manifest = {
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "source": str(source),
        "total_files": len(current),
        "changed_files": new_or_changed,
        "deleted_files": deleted,
        "size_bytes": archive.stat().st_size,
        "files": current,
    }
    (archive_dir / MANIFEST).write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    log.info("✅ Sauvegarde créée : %s (%.1f Mo)", archive, manifest["size_bytes"] / 1e6)

    prune(dest, keep)


def prune(dest: Path, keep: int) -> None:
    backups = sorted(d for d in dest.glob("backup-*") if d.is_dir())
    excess = backups[:-keep] if keep > 0 else []
    import shutil
    for old in excess:
        shutil.rmtree(old)
        log.info("🧹 Rétention : ancienne sauvegarde supprimée (%s)", old.name)


def list_backups(dest: Path) -> None:
    dirs = sorted(dest.glob("backup-*"))
    if not dirs:
        log.info("Aucune sauvegarde dans %s", dest)
        return
    for d in dirs:
        m = d / MANIFEST
        if m.exists():
            info = json.loads(m.read_text(encoding="utf-8"))
            size = (d / "snapshot.tar.gz").stat().st_size / 1e6
            print(f"{d.name}  —  {info['total_files']} fichiers, {size:.1f} Mo, "
                  f"{len(info['changed_files'])} modifié(s)")


def restore(archive_path: Path, target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive_path, "r:gz") as tar:
        # protection contre le path traversal ("tar bomb")
        for member in tar.getmembers():
            if member.name.startswith(("/", "..")) or "/../" in member.name:
                raise ValueError(f"Membre d'archive suspect : {member.name}")
        tar.extractall(target, filter="data")
    log.info("⏬ Restauration terminée dans %s", target)


def main() -> None:
    ap = argparse.ArgumentParser(description="Sauvegarde incrémentale par hachage.")
    ap.add_argument("source", nargs="?", help="Dossier à sauvegarder")
    ap.add_argument("--dest", default="./backups", help="Dossier des sauvegardes (ou cible de --restore)")
    ap.add_argument("--keep", type=int, default=5, help="Nombre de sauvegardes conservées (0 = tout)")
    ap.add_argument("--dry-run", action="store_true", help="Analyser sans écrire")
    ap.add_argument("--list", action="store_true", help="Lister les sauvegardes existantes")
    ap.add_argument("--restore", metavar="ARCHIVE", help="Restaurer un snapshot.tar.gz")
    ap.add_argument("--to", metavar="TARGET", help="Dossier de destination pour --restore")
    args = ap.parse_args()

    dest = Path(args.dest).expanduser().resolve()

    if args.list:
        list_backups(dest)
        return

    if args.restore:
        target = Path(args.to).expanduser().resolve() if args.to else dest / "recovery"
        restore(Path(args.restore).expanduser(), target)
        return

    if not args.source:
        ap.error("un dossier 'source' est requis (ou utilisez --list / --restore)")

    source = Path(args.source).expanduser().resolve()
    if not source.is_dir():
        log.error("'%s' n'est pas un dossier valide.", source)
        sys.exit(1)

    do_backup(source, dest, args.keep, args.dry_run)


if __name__ == "__main__":
    main()
