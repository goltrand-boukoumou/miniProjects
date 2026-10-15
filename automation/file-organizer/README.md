# 🗂️ File Organizer

Script qui range automatiquement un dossier en vrac (ex. `~/Downloads`) dans des sous-dossiers par type de fichier.

## Compétences mises en avant
- **`pathlib` / `shutil`** : manipulation robuste du système de fichiers
- **CLI `argparse`** : options `--dry-run` et `--undo`
- **Sécurité** : aucun écrasement de fichier (suffixe `_1`, `_2`…), historique JSON permettant l'annulation
- **`logging`** : sortie lisible et filtrable

## Utilisation

```bash
# 1. Prévisualiser sans rien déplacer (toujours commencer par là)
python3 organizer.py ~/Downloads --dry-run

# 2. Organiser pour de vrai
python3 organizer.py ~/Downloads

# 3. Annuler la dernière session
python3 organizer.py ~/Downloads --undo
```

## Catégories
Images, Documents, Tableurs, Presentations, Archives, Musique, Vidéos, Code, Exécutables, Autres.
Pour en ajouter une : modifiez le dictionnaire `CATEGORIES` en haut du script.

## À planifier automatiquement (cron)

```cron
# Chaque dimanche à 9h, organiser ~/Downloads en mode brouillon + log
0 9 * * 7 python3 /chemin/vers/organizer.py ~/Downloads >> ~/organize.log 2>&1
```
