# 💾 Backup Tool

Outil de sauvegarde **incrémentale par hachage** d'un dossier, avec archivage `tar.gz`, manifest JSON et rétention automatique. Stdlib Python uniquement.

## Compétences mises en avant
- **`hashlib` SHA-256** : détection fiable des fichiers modifiés sans dépendre des timestamps
- **`tarfile`** : archives compressées horodatées + manifest (auditabilité)
- **Rétention GFS simplifiée** : garde les N dernières sauvegardes (`--keep`)
- **Sécurité** : protection contre les "tar bombs" (path traversal) à la restauration
- **Prêt pour cron** : dry-run, exit codes propres, logs structurés

## Utilisation

```bash
# Sauvegarder un dossier dans ./backups
python3 backup.py ~/Documents --dest ./backups

# Analyser sans rien écrire
python3 backup.py ~/Documents --dest ./backups --dry-run

# Lister l'historique
python3 backup.py --list --dest ./backups

# Restaurer une archive vers un dossier de récupération
python3 backup.py --restore backups/backup-20261015-093000/snapshot.tar.gz --dest ./recovery
```

## Comportement
- Si aucun fichier n'a changé depuis la dernière exécution → aucune archive créée (économie d'espace).
- Chaque archive est un snapshot complet (restauration triviale), le manifest signale les fichiers réellement modifiés.
- `--keep 5` (défaut) supprime automatiquement les sauvegardes les plus anciennes.

## Planifier avec cron

```cron
# Sauvegarde quotidienne à 3h du matin
0 3 * * * python3 /chemin/vers/backup.py ~/Documents --dest /mnt/disque-ext/backups --keep 14
```
