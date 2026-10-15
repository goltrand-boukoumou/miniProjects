# 🔗 Notes API — REST sans framework

API CRUD de notes écrite **uniquement avec la bibliothèque standard Python** (zéro dépendance).

## Compétences mises en avant
- **Serveur HTTP** : `http.server` + `ThreadingHTTPServer`
- **Routage REST manuel** (GET/POST/DELETE, paramètres d'URL, query strings)
- **Validation des entrées** et codes HTTP appropriés (201, 400, 404, 422)
- **Persistance sur disque** avec écriture atomique et verrou thread (`threading.Lock`)
- **CORS** pour consommation depuis un front

## Démarrer

```bash
python3 server.py
# 🚀 Notes API sur http://localhost:8000/api/notes
```

## Endpoints

| Méthode | Route                | Description                          |
|---------|----------------------|--------------------------------------|
| GET     | `/api/health`        | Sonde de disponibilité               |
| GET     | `/api/notes`         | Liste toutes les notes               |
| GET     | `/api/notes?tag=x`   | Liste filtrée par tag                |
| GET     | `/api/notes/{id}`    | Une note par identifiant             |
| POST    | `/api/notes`         | Crée une note (`title`, `content`, `tags`) |
| DELETE  | `/api/notes/{id}`    | Supprime une note                    |

## Exemples curl

```bash
# Créer
curl -X POST http://localhost:8000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Ma première note", "content": "Hello 👋", "tags": ["démo"]}'

# Lister
curl http://localhost:8000/api/notes

# Supprimer (remplacer <id> par l'id retourné à la création)
curl -X DELETE http://localhost:8000/api/notes/<id>
```

Les données sont stockées dans `notes.json` (créé automatiquement).
