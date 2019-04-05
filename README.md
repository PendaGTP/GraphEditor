# Editeur de Graph

## Quelques info utiles :

### Un menu contextuel à été ajouté pour gérer les actions :

*  supprimer / renommer un sommet
* export / importer / orienté un graph

### Le format JSON pour l'export du graph est bien respecté

### Le format JSON pour l'export des résultats PageRank suit ce format :

```json
{
    "algorithm": {
        "name": "PageRank",
        "vertices": [{"id": "0"}, {"id": "1"}, {"id": "4"}, {"id": "7"}, {"id": "8"}],
        "score": [{"score": "2"}, {"score": "3"}, {"score": "5"}, {"score": "6"}],
        "classement": [{"rank": "2"}, {"rank": "3"}, {"rank": "5"}, {"rank": "6"}]
    }
}
```