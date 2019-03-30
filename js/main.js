function main() {
    var length = 600; // Taille du canevas
    var context = initCanvas(length);
    var graph = new Graph();

    // Ajout des écouteurs d'événement
    document.getElementById('canvas').addEventListener('mouseup', function () { onMouseUp(event, graph); });
    document.getElementById('canvas').addEventListener('contextmenu', function () { createMenu(event, graph); });
    document.getElementById('canvas').addEventListener('mousedown', function () { onMouseDown(event, graph); });
    document.getElementById('canvas').addEventListener('mousemove', function () { onMouseMove(event, graph); });
    document.getElementById('export').addEventListener('click', function () { exportGraph(graph); });
    document.getElementById('fileInput').addEventListener('change', function () { readFile(event, graph); });
    document.getElementById('oriente').addEventListener('click', function () { changerOriente(graph); });
    document.addEventListener('keypress', function(){ onKeyPress(event, graph); });
    var interval = window.setInterval(function () { draw(graph, context, length); }, 10);
    document.getElementById('resetGraph').addEventListener('click', function () { resetGraph(graph,interval); });
}

function initCanvas(length) {
    var canvas = document.getElementById('canvas');
    canvas.width = length.toString();
    canvas.height = length.toString();
    return canvas.getContext('2d');
}

// Création des sommets
function creerSommet(pos, graph) {
    if (graph.listeSommet.length == 0) {
        var newSommet = new Sommet(pos, graph);
        graph.count++;
        return;
    }
    var collision = false;
    for (var i = 0; i < graph.listeSommet.length; i++) {
        if (isCollision(i, pos, graph, true)) {
            collision = true;
        }
    }
    if (!collision) {
        var newSommet = new Sommet(pos, graph);
        graph.count++;
    }

    return newSommet
}

// Détection des collisions entre sommets
function isCollision(i, pos, graph, creation) {
    if (creation && graph.listeSommet[i] != null) {
        return Math.sqrt(Math.pow(pos[0] - graph.listeSommet[i].positionX, 2) + Math.pow(pos[1] - graph.listeSommet[i].positionY, 2)) < 2 * graph.ballSize;
    } else if (graph.listeSommet[i] != null) {
        return Math.sqrt(Math.pow(pos[0] - graph.listeSommet[i].positionX, 2) + Math.pow(pos[1] - graph.listeSommet[i].positionY, 2)) <= graph.ballSize;
    }
}

// Changement de la vue : orienté, pas orienté
function changerOriente(graph) {
    if (document.getElementById('oriente').checked) {
        graph.graphOriente = true;
    } else {
        graph.graphOriente = false;
    }
    for (var i = 0; i < graph.listeLien.length; i++) {
        graph.listeLien[i].draw();
    }

}

// Gestion de l'évenement mouseDown : vérification colision
function onMouseDown(e, graph) {
    var pos = getPosition(e);
    graph.posClick = pos;
    graph.mouseDown = true;
    for (var i = 0; i < graph.listeSommet.length; i++) {
        if (isCollision(i, pos, graph, false)) {
            graph.whichMoving = graph.listeSommet[i];
            graph.collision = true;
        }
    }
}


// Gestion de l'évenement mouseUp : vérification colision, même position, ajout sommet  
function onMouseUp(e, graph) {

    var sommet;
    var pos = getPosition(e);
    var collision = false;
    graph.mouseDown = false;
    graph.whichMoving = null;
    for (var i = 0; i < graph.listeSommet.length; i++) {
        if (isCollision(i, pos, graph, false)) {
            collision = true;
            sommet = graph.listeSommet[i];
        }
    }

    var pos = getPosition(e);
    if (pos[0] == graph.posClick[0] && pos[1] == graph.posClick[1] && !collision && e.button == 0) {
        creerSommet(pos, graph);
        graph.whichSelected = null;
        graph.isSommetSelected = false;
        graph.sommetSelected = [];
    } else if (pos[0] == graph.posClick[0] && pos[1] == graph.posClick[1] && collision && !graph.isSommetSelected && e.button == 0) {
        graph.sommetSelected.push(sommet);
        graph.isSommetSelected = true;
        graph.whichSelected = sommet;
        //console.log(sommet);
    } else if (pos[0] == graph.posClick[0] && pos[1] == graph.posClick[1] && collision && graph.isSommetSelected && e.button == 0) {
        graph.sommetSelected.push(sommet);
        graph.whichSelected = sommet;
        if (graph.sommetSelected[0] == graph.sommetSelected[1]) {
            graph.isSommetSelected = false;
            graph.sommetSelected = [];
            graph.whichSelected = null;
        } else {
            creerLien(graph);
            graph.whichSelected = null;
            graph.isSommetSelected = false;
            graph.sommetSelected = [];
        }
    }
}

// Gestion de l'événement mouseMove : déplacement des sommets
function onMouseMove(event, graph) {
    if (graph.mouseDown && graph.collision && graph.whichMoving != null) {
        graph.whichMoving.positionX = getPosition(event)[0];
        graph.whichMoving.positionY = getPosition(event)[1];
        for (var i = 0; i < graph.listeLien.length; i++) {
            if(graph.listeLien[i] != null){
                graph.listeLien[i].recalculate();
            }
            
        }

    }
}

// Création des liens
function creerLien(graph) {
    new Lien(graph, graph.sommetSelected[0], graph.sommetSelected[1]);

}

// Récupération de la position de la souris
function getPosition(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return [x, y];
}

// Dessin des formes
function draw(graph, ctx, length) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, length, length);
    drawSommets(graph, ctx);
    drawLiens(graph, ctx);
}

// Dessin des sommets
function drawSommets(graph, ctx) {
    for (var i = 0; i < graph.listeSommet.length; i++) {
        if(graph.listeSommet[i] != null){
            graph.listeSommet[i].draw(ctx, graph);
        }
    }
}

// Dessins des liens
function drawLiens(graph, ctx) {
    for (var i = 0; i < graph.listeLien.length; i++) {
        if(graph.listeLien[i] != null && graph.listeLien[i].sommetDeux != null && graph.listeLien[i].sommetUn != null) {
            graph.listeLien[i].draw(ctx, graph);
        } 
    }
}

// Réinitialiser le graph : suppression des sommets et des liens
function resetGraph(graph,interval){
    for(var i = 0; i < graph.listeSommet.length; i++){
            sommet = graph.listeSommet[i]
            graph.listeSommet[i] = null;
        }
    // A tester
    //for (var j = 0; j < graph.listeLien.length; j++) {
    //        graph.listeLien[j] = null;
    //    } 
    //}
    clearInterval(interval);
    main();
}
    
    


// *********** Renommer étiquette ***********
// Récupération des touches claviers entrées
function onKeyPress(e, graph){
    var key;
    if(graph.isRename){
        if(e.keyCode == 13){
            graph.isRename = false;           
            graph.selectedSommetMenu.etiquette = graph.tmpName;
            graph.tmpName = '';
        }else{
            get = window.event?event:e;
            key = get.keyCode?get.keyCode:get.charCode;
            key = String.fromCharCode(key);
            graph.tmpName += key
        }    
    }   
}

// Renommage des l'étiquettes
function renameEtiquette(graph, pos){
    graph.isRename = true;
    for(var i = 0; i < graph.listeSommet.length; i++){
        if(isCollision(i, pos, graph, false)){
            graph.selectedSommetMenu = graph.listeSommet[i];
        }
    }
}
// *********** *********** ***********




// *********** EXPORT ***********
// Convertion de l'objet en json .. : on met tout se qu'on à besoin dans graphJSON
function graphToJSON(graph) {
    graphJSON = '{ "graph":{';
    var graphName = entergraphName(graph);
    if (graphName == null){

    }else{
        for (var property in graph) {
            switch (property) {
                case "name":
                    graph[property] = graphName;
                    graphJSON += '"name":"' + graph[property] + '",';
                    break;
                case "graphOriente":
                    graphJSON += '"directed":"' + graph[property] + '",';
                default:
                    break;
            }
        }
        graphJSON += '"vertices":[';
    
        for (var i = 0; i < graph.listeSommet.length; i++) {
            graphJSON += "{";
            graphJSON += '"id":"' + graph.listeSommet[i].id + '",';
            graphJSON += '"label":"' + graph.listeSommet[i].etiquette + '",';
            graphJSON += '"pos":{';
            graphJSON += '"x":"' + graph.listeSommet[i].positionX + '",';
            graphJSON += '"y":"' + graph.listeSommet[i].positionY + '"}';
            if (i == graph.listeSommet.length - 1) {
                graphJSON += '}],';
            } else {
                graphJSON += '},';
            }
    
        }
        graphJSON += '"edges":[';
        for (var j = 0; j < graph.listeLien.length; j++) {
            graphJSON += '{';
            graphJSON += '"id1":"' + graph.listeLien[j].sommetUn.id + '",';
            graphJSON += '"id2":"' + graph.listeLien[j].sommetDeux.id + '"';
            if (j == graph.listeLien.length - 1) {
                graphJSON += '}';
            } else {
                graphJSON += '},';
            }
        }
        graphJSON += ']}}';
        return [graphJSON, graphName];
    }
    return false;
}

// Popup pour le nom du graph
function entergraphName(graph) {
    var nom = prompt("Merci d'entre le nom du graph",graph.name);
    if (nom == null || nom == "") {

    } else if (graph.algoPageRank) {
        nom = graph.name + "_PageRank";
    }
    return nom;
}

// Export du graphique : sauvegarde en locale
function exportGraph(graphJSON) {
    var content = graphToJSON(graphJSON);
    //console.log('content :'+content);
    if (content){
        var blob = new Blob([content[0]], { type: "text/plain;charset=utf-8" });
        saveAs(blob, content[1] + ".json");
    }
}
// *********** *********** ***********


// *********** IMPORT ***********
// Lecture du fichier sélectionné puis transfert de la data à importJSON
function readFile(e, graph) {
    var selectedFile = document.getElementById('fileInput').files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        var content = reader.result;
        importJSON(content, graph);
    };
    reader.readAsText(selectedFile);
<<<<<<< HEAD
    
=======
>>>>>>> 162ce151c87457576a8ba420359a3295a78623a1
}

// Conversion du fichier JSON en data : import graph : sommets, liens, 
function importJSON(data, graph) {
    
    var obj = JSON.parse(data);
    graph.name = obj.graph.name;
    graph.graphOriente = obj.graph.directed;
    graph.count = obj.graph.vertices.length;
    for (var i = 0; i < obj.graph.vertices.length; i++) {
        var tmp = new Sommet([obj.graph.vertices[i].pos.x, obj.graph.vertices[i].pos.y], graph);
        tmp.id = obj.graph.vertices[i].id;
        tmp.etiquette = obj.graph.vertices[i].label;
    }
    for (var i = 0; i < obj.graph.edges.length; i++) {
        for (var j = 0; j < graph.listeSommet.length; j++) {
            if (graph.listeSommet[j].id == obj.graph.edges[i].id1) {
                var tmpSommetUn = graph.listeSommet[j];
            }
        }

        for (var k = 0; k < graph.listeSommet.length; k++) {
            if (graph.listeSommet[k].id == obj.graph.edges[i].id2) {
                var tmpSommetDeux = graph.listeSommet[k];
            }
        }
        new Lien(graph, tmpSommetUn, tmpSommetDeux);
    }
}
// *********** *********** ***********


// ******************** Partie pour le menu contextuel ********************
function createMenu(e, graph) {
    $.contextMenu({
        selector: '.context-menu-one',
        trigger: 'right',
        build: function ($trigger, e) {
            var options = {
                callback: function (key, options) {
                    var m = "clicked: " + key;
                    var sommet;
                    //console.log(key);
                    if (key == "menu1"){
                        if(options.items.menu1.name == "Renommer"){
                            // Appeler fonction pour renommer l'étiquette
                            renameEtiquette(graph, pos);

                        }
                        if(options.items.menu1.name == "Exporter"){
                            // Appeler fonction pour exporter le graph
                            exportGraph(graph);
                        }
                    }else if(key == "menu2"){
                        
                        if(options.items.menu2.name == "Importer"){
                            $('#fileInput').click();
                        }
                        if(options.items.menu2.name == "Supprimer"){
                            
                            for(var i = 0; i < graph.listeSommet.length; i++){
                                if(isCollision(i, pos, graph,false)){
                                    sommet = graph.listeSommet[i]
                                    graph.listeSommet[i] = null;
                                }
                            }

                            for(var i = 0; i < graph.listeLien.length; i++){
                                if(graph.listeLien[i] != null){
                                    if(sommet == graph.listeLien[i].sommetUn || sommet == graph.listeLien[i].sommetDeux){
                                        graph.listeLien[i] = null;
                                    }
                                    
                                }
                            }sommet = null;
    
                        }
                    }else if(key == "menu3"){
                        $('#oriente').click();
                    }
                    
                    
                },
                items: {},
                hideOnSecondTrigger: true
            };
            var menu1, menu2, icon1, icon2;
            var menu3 = 'Orienté'; 
            var icon3 = 'fa-long-arrow-right';
            var pos = getPosition(e);
            var collision = false;
            for (var i = 0; i < graph.listeSommet.length; i++) {
                if (isCollision(i, pos, graph, false)) {
                    collision = true;
        
                }
            }
            if (collision) {
                menu1 = "Renommer";
                menu2 = "Supprimer";
                icon1 = "fa-edit";
                icon2 = "delete";
                
            } else {
                menu1 = "Exporter";
                menu2 = "Importer";
                icon1 = "fa-download";
                icon2 = "fa-upload";
                
            }
            options.items.menu1 = {
                name: menu1,
                icon: icon1
            }
            options.items.menu2 = {
                name: menu2,
                icon: icon2
            }
            options.items.menu3 = {
                name: menu3,
                icon: icon3
            }
            options.items.quit = {
                name:"Quit", 
                icon: function($element, key, item){ 
                    return 'context-menu-icon context-menu-icon-quit'; 
                } 
            }
            return options;
        }
    });

    $('.context-menu-one').on('click', function (e) {

        //console.log('clicked', this);
    })

}


// La class Graph : elle représente le graphique 
class Graph {
    constructor() {
        this.name = "nom_du_graphe"; // valeur par défaut
        this.listeSommet = new Array();
        this.listeLien = new Array();
        this.isSommetSelected = false;
        this.sommetSelected = [];
        this.posClick = new Array();
        this.mouseDown = false;
        this.collision = false;
        this.whichMoving;
        this.count = 0;
        this.graphOriente = false;
        this.export = "";
        this.ballSize = 20;
        this.algoPageRank = false;
        this.whichSelected;
        this.color = 'red';
        this.selectedColor = 'yellow';
        this.isRename = false;
        this.tmpName = '';
        this.selectedSommetMenu; 
    }
}

// La classe sommet représente les sommets
class Sommet {
    constructor(pos, graph) {
        this.positionX = pos[0];
        this.positionY = pos[1];
        this.id = graph.count;
        this.etiquette = this.id; 
        graph.listeSommet.push(this);
    }

    // Ici on dessine les sommets (rouge/jaune)
    draw(ctx, graph) {
            if (this == graph.whichSelected) {
                ctx.fillStyle = graph.selectedColor;
                ctx.beginPath();
                ctx.arc(this.positionX, this.positionY, 20, 0, Math.PI * 2, true);
                ctx.fill();
            } else {
                ctx.fillStyle = graph.color;
                ctx.beginPath();
                ctx.arc(this.positionX, this.positionY, 20, 0, Math.PI * 2, true);
                ctx.fill();
            } 
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.font = "20px Arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            if(graph.isRename && this == graph.selectedSommetMenu){
                ctx.fillText(graph.tmpName, this.positionX, this.positionY);
            }else{
                
                ctx.fillText(this.etiquette, this.positionX, this.positionY);
            }
            ctx.fill();             
        } 
}

// La classe sommet représente les liens entre les sommets
class Lien {
    constructor(graph, nodeA, nodeB) {
        this.sommetUn = nodeA;
        this.sommetDeux = nodeB;
        graph.listeLien.push(this);
        this.recalculate();


    }
    // Ici on s'occupe de calculer l'angle de la flèche
    recalculate() {
        if (this.sommetDeux.positionX > this.sommetUn.positionX && this.sommetDeux.positionY < this.sommetUn.positionY) {
            this.angleFleche = -Math.acos(Math.abs(this.sommetUn.positionX - this.sommetDeux.positionX) / Math.sqrt(Math.pow(this.sommetUn.positionX - this.sommetDeux.positionX, 2) + Math.pow(this.sommetUn.positionY - this.sommetDeux.positionY, 2)));
        } else if (this.sommetDeux.positionX > this.sommetUn.positionX && this.sommetDeux.positionY > this.sommetUn.positionY) {
            this.angleFleche = Math.acos(Math.abs(this.sommetUn.positionX - this.sommetDeux.positionX) / Math.sqrt(Math.pow(this.sommetUn.positionX - this.sommetDeux.positionX, 2) + Math.pow(this.sommetUn.positionY - this.sommetDeux.positionY, 2)));
        } else if (this.sommetDeux.positionX < this.sommetUn.positionX && this.sommetDeux.positionY > this.sommetUn.positionY) {
            this.angleFleche = Math.acos(-Math.abs(this.sommetUn.positionX - this.sommetDeux.positionX) / Math.sqrt(Math.pow(this.sommetUn.positionX - this.sommetDeux.positionX, 2) + Math.pow(this.sommetUn.positionY - this.sommetDeux.positionY, 2)));
        } else if (this.sommetDeux.positionX < this.sommetUn.positionX && this.sommetDeux.positionY < this.sommetUn.positionY) {
            this.angleFleche = -Math.acos(-Math.abs(this.sommetUn.positionX - this.sommetDeux.positionX) / Math.sqrt(Math.pow(this.sommetUn.positionX - this.sommetDeux.positionX, 2) + Math.pow(this.sommetUn.positionY - this.sommetDeux.positionY, 2)));
        }
    }
    // Ici on déssine le lien (avec/sans) flèche
    draw(ctx, graph) {
        if(this.sommetDeux != null && this.sommetUn != null){
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.translate(this.sommetDeux.positionX, this.sommetDeux.positionY);
            ctx.rotate(this.angleFleche);
            ctx.moveTo(-(graph.ballSize), 0);
            ctx.lineTo(-Math.sqrt(Math.pow(this.sommetUn.positionX - this.sommetDeux.positionX, 2) + Math.pow(this.sommetUn.positionY - this.sommetDeux.positionY, 2)) + graph.ballSize, 0);
            if (graph.graphOriente) {
                ctx.moveTo(-(graph.ballSize), 0);
                ctx.lineTo(-2 * graph.ballSize, -(graph.ballSize));
                ctx.moveTo(-(graph.ballSize), 0);
                ctx.lineTo(-2 * graph.ballSize, graph.ballSize);
            }
            ctx.rotate(-this.angleFleche);

            ctx.translate(-this.sommetDeux.positionX, -this.sommetDeux.positionY);
            ctx.stroke();
        }
    }
}
