# 📝 Mini Todo — Vanilla JS

Petite application de liste de tâches **sans framework ni build**, pour illustrer les fondamentaux du développement web.

## Compétences mises en avant
- **HTML sémantique & accessibilité** (labels, `aria-live`, `aria-label`)
- **CSS moderne** : variables CSS, Flexbox, design responsive
- **JavaScript vanilla** : DOM API, délégation d'événements, rendu déclaratif
- **Persistance** avec `localStorage`
- **Sécurité** : échappement HTML contre les injections XSS

## Fonctionnalités
- Ajouter / cocher / supprimer des tâches
- 3 niveaux de priorité (basse, moyenne, haute) avec code couleur
- Filtres : Toutes / Actives / Terminées
- Statistiques en temps réel + bouton "Effacer terminées"
- Sauvegarde automatique dans le navigateur

## Lancer le projet

Aucune dépendance. Deux options :

```bash
# Option 1 : serveur Python
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/web/todo-app/

# Option 2 : ouvrir directement index.html dans un navigateur
```

## Arborescence
```
todo-app/
├── index.html   # structure sémantique
├── style.css    # thème sombre, variables CSS
└── app.js       # logique métier (~100 lignes commentées)
```
