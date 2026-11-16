## El problema

Un jugador escribe al equipo: "Saqué **100 puntos** y en el ranking aparezco último. Arriba de todos hay alguien con **9**". El tester del equipo agrega: "Con puntajes de dos cifras el ranking sale bien. Se rompe cuando hay puntajes de una cifra o de tres".

## Qué debe hacer

`mejoresPuntajes(puntajes, n)` devuelve los `n` puntajes más altos, ordenados de mayor a menor, sin modificar el arreglo que recibe.

```js
mejoresPuntajes([80, 100, 9, 45], 3);   // [100, 80, 45]
mejoresPuntajes([5, 1000, 20, 300], 4); // [1000, 300, 20, 5]
mejoresPuntajes([30, 10, 20], 2);       // [30, 20]
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
