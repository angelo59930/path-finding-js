/////////
//canvas, contexto y fps
////////
var canvas;
var ctx;
var FPS = 50;

////////
// ESCENARIO
///////
var columnas = 50;
var filas = 50;
var escenario;  //Matriz del nivel

///////
//TILES
///////
var anchoTile;
var altoTile;

const muro = '#000000';
const vacio = '#CDCDCD';

///////
//ELEMENTOS DE LA RUTA
///////
var principio;
var fin;

var openSet = [];   //guarda las casillas disponibles
var closeSet = [];    //guarda las casillas ya visitadas

var camino = [];    //guarda el camino que se va tomando

var terminado = false;  //determina si se termino o no la ruta


/////
//CLASE CORRESPONDIENTE A LAS CASILLAS
/////
class casillas {
    constructor(x, y) {

        //POSICION
        this.x = x;
        this.y = y;

        //TIPO (MURO O VACIO)
        this.tipo = 0; //vacio = 0, muro = 1

        var aleatorios = Math.floor(Math.random() * 5);

        if (aleatorios === 1) {
            this.tipo = 1;
        }

        //PESOS
        this.f = 0; //f = total = g + h
        this.g = 0; //g = pasos dados
        this.h = 0; //h = pasos que nos quedan en linea recta

        this.vecinos = [];
        this.padre = null;

    }

    //METODO QUE DIBUJA LA CASILLA
    dibuja() {

        var color;
        //definir el color del muro y el vacio
        if (this.tipo == 0) {
            color = vacio;
        }
        if (this.tipo == 1) {
            color = muro;
        }


        //DIBUJAMOS EL CUADRO EN EL CANVAS
        ctx.fillStyle = color;
        ctx.fillRect(this.x * anchoTile, this.y * altoTile, anchoTile, altoTile);

    }

    //METODO QUE CALCULA LOS VECINOS
    addvecinos() {
        if (this.x > 0) { //vecino izquierdo
            this.vecinos.push(escenario[this.y][this.x - 1]);
        }
        if (this.x < filas - 1) {   //vecino derecho
            this.vecinos.push(escenario[this.y][this.x + 1]);
        }
        if (this.y > 0) {   //vecino superior
            this.vecinos.push(escenario[this.y - 1][this.x]);
        }
        if (this.y < columnas - 1) {   //vecino inferior
            this.vecinos.push(escenario[this.y + 1][this.x]);
        }

        /*console.log(this.vecinos);*/  //muestra los vecinos
    }

    dibujaOP() { //dibuja openSet
        ctx.fillStyle = '#008000';
        ctx.fillRect(this.x * anchoTile, this.y * altoTile, anchoTile, altoTile);
    }

    dibujaCS() { //dibuja closeSet
        ctx.fillStyle = '#800000';
        ctx.fillRect(this.x * anchoTile, this.y * altoTile, anchoTile, altoTile);
    }

    dibujacamino() {
        ctx.fillStyle = '#00FFFF';  //cyan
        ctx.fillRect(this.x * anchoTile, this.y * altoTile, anchoTile, altoTile);
    }
    

}


///////
//CREA ARRAY PARA EL ESCENARIO
///////
function creaArray2D(f, c) {  //f = fila,  c = columna
    var obj = new Array(f);

    for (let i = 0; i < f; i++) {
        obj[i] = new Array(c);
    }

    return obj;
}


///////
//CALCULA HEURISTICA(distacia entre dos putnos en liena recta)
//////
function heuristica(a, b) {
    var x = Math.abs(a.x - b.x);
    var y = Math.abs(a.y - b.y);

    var dist = x + y;

    return dist;
}


///////
//SACA UN OBJETO DE openSet Y LO PASA A closeSet
///////
function borrarDelArray(array, elemento) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] == elemento) {
            array.splice(i, 1);
        }
    }
}


///////
//ALGORITMO EN SI MISMO
//////
function algoritmo() {

    if (terminado != true) {  //seguimos hasta encontrar solucion

        if (openSet.length > 0) {   //seguimos mientras haya algo en openSet
            var ganador = 0;    //indice/posicion del ganador

            for (let i = 0; i < openSet.length; i++) {  //evaluamos que openSet teine menor costo/esfuerzo
                if (openSet[i].f < openSet[ganador].f) {
                    ganador = i;
                }
            }


            var actual = openSet[ganador];  //analizamos la casilla ganadora


            if (actual === fin) {    //si se llego al final se busca el camino de regreso
                var temporal = actual;
                camino.push(temporal);

                while (temporal.padre != null) {
                    temporal = temporal.padre;
                    camino.push(temporal);
                }
                console.log("ACA ESTA EL CAMINO");
                terminado = true;
            }
            else {   //si no llegamos al final, seguimos "caminando"
                borrarDelArray(openSet, actual); //saco de openSet
                closeSet.push(actual);          //meto en closeSet

                var vecinos = actual.vecinos;

                for (let i = 0; i < vecinos.length; i++) { //recorro los vecinos de mi ganador
                    var vecino = vecinos[i];

                    //si el vecino no esta en closeSet ni es tipo 1 calculamos los pasos
                    if (!closeSet.includes(vecino) && vecino.tipo != 1) {
                        var tempG = actual.g + 1;

                        if (openSet.includes(vecino)) {   // si el vecino esta en openSet y tiene mayor peso
                            if (tempG < vecino.g) {   //se encontro un camino mas corto
                                vecino.g = tempG;   //camino mas corto
                            }
                        }
                        else {
                            vecino.g = tempG;
                            openSet.push(vecino);
                        }


                        //actualizamos los valores
                        vecino.h = heuristica(vecino, fin);
                        vecino.f = vecino.g + vecino.h;


                        //guardamos el padre(de donde venimos)
                        vecino.padre = actual;

                    }

                }
                
            }
            
            
        }
        else {  //ya no hay nada en openSet, es decir, no hay mas camino
           console.log("NO SE ENCONTRO EL CAMINO");
           terminado = true;
       }
        
    }


}



function inicializa() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    //CALCULAMOS EL TAMAÑO DE LOS TILES PROPORCIONALMENTE
    anchoTile = parseInt(canvas.width / columnas);    //parseInt convierte a entero un decimal
    altoTile = parseInt(canvas.height / filas);      //canvas, width y height estan desarrolladas en el html


    //CREAMOS LA MATRIZ
    escenario = creaArray2D(filas, columnas);


    //AÑADIMOS LOS OBJETOS CASILLAS
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            escenario[i][j] = new casillas(j,i);
        }
    }

    //AÑADIMOS LOS VECINOS
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            escenario[i][j].addvecinos();
        }
    }

    //CREAMOS ORIGEN Y VECINOS DE LA RUTA
    principio = escenario[0][0];
    fin = escenario[columnas - 1][filas - 1];

    //INICIALIZAMOS openSet
    openSet.push(principio);


    //EJECUCION DE LA FUNCION PRINCIPAL
    setInterval(function () { main() }, 1000 / FPS);   //setinterval ejecuta cada x milisegundos una funcion


}

/////
//DIBUJAR EL ESCENARIO
/////
function dibujaEscenario() {
    for (let j = 0; j < filas; j++) {
        for (let i = 0; i < columnas; i++) {
            escenario[i][j].dibuja();
        }
    }

    //dibujar openSet
    for (let i = 0; i < openSet.length; i++) {
        openSet[i].dibujaOP();
    }

    //dibuja closeSet
    for (let i = 0; i < closeSet.length; i++) {
        closeSet[i].dibujaCS();
    }

    for (i = 0; i < camino.length; i++) {
        camino[i].dibujacamino();
    }


}


function clearcanvas() {
    canvas.width = canvas.width;
    canvas.height = canvas.height;
}


function main() {
    clearcanvas();
    algoritmo();
    dibujaEscenario();


}