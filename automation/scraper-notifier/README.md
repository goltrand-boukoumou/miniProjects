# 👀 Price Watcher (Scraper + Notifier)

Script de veille : il récupère une page web, détecte les prix affichés, et **alerte quand un prix change** depuis la dernière exécution. Zéro dépendance externe (stdlib Python uniquement).

## Compétences mises en avant
- **HTTP robuste** : `urllib` avec retries exponentiels et timeout
- **Parsing HTML** : `html.parser` (extraction du texte visible, ignore `<script>`/`<style>`) + regex de détection de montants (`12,99 €`, `$19`, `€ 34.50`…)
- **Gestion d'état persistant** : comparaison avec l'exécution précédente via JSON
- **Notifications webhook** : compatible Slack / Discord / ntfy
- **Automatisation** : pensé pour tourner dans un cron

## Utilisation

```bash
# Première exécution : mémorise les prix de référence
python3 watcher.py https://exemple.com/produit

# Exécutions suivantes : alerte si les prix ont changé
python3 watcher.py https://exemple.com/produit

# Avec notification Slack/Discord/ntfy
python3 watcher.py https://exemple.com/produit --webhook "https://hooks.slack.com/services/XXX"

# Oublier la référence
python3 watcher.py https://exemple.com/produit --reset
```

## Planifier avec cron

```cron
# Vérification toutes les 6 heures
0 */6 * * * python3 /chemin/vers/watcher.py https://exemple.com/produit --webhook $WEBHOOK >> ~/watcher.log 2>&1
```

## Éthique & limites
- ⚠️ Respectez le `robots.txt` et les CGU des sites ciblés ; gardez une fréquence raisonnable.
- La détection par regex convient aux pages simples ; pour un site JS-complexe, une version Playwright/Selenium serait l'évolution naturelle.
