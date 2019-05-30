# Editeur de Graphes

### Algorithme
* Calcul du page rank

### La bibliothèque permet de :
* créer et modifier un graphe, orienté ou non, en ajoutant des sommets et des arêtes / arcs ;
* enregistrer / lire un graphe dans / depuis un fichier ;
* appliquer certains algorithmes sur des graphes

### Spécifications du format d'export

```json
{
  "graph": {
    "name": "nom_du_graphe",
    "directed": "false",
    "vertices": [
      { "id": "0", "label": "v1", "pos": {"x":"100", "y":"100"}},
      { "id": "1", "label": "v7", "pos": {"x":"150", "y":"50"}},
      { "id": "2", "label": "v19", "pos": {"x":"83", "y":"27"}},
      ...
    ],
    "edges": [
      {"id1":"0", "id2":"1"},
      {"id1":"0", "id2":"2"},
      ...
    ]
  }
}
```
