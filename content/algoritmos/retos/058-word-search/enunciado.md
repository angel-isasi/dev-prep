Escribe la función `existePalabra(tablero, palabra)` que reciba un tablero de letras (un arreglo de filas) y una palabra, y devuelva `true` si la palabra se puede **formar en el tablero**, o `false` si no.

La palabra se arma con letras de celdas **vecinas en horizontal o en vertical** (arriba, abajo, izquierda, derecha), una detrás de otra, como en una sopa de letras que puede doblar. Las diagonales **no** valen y **cada celda se puede usar una sola vez** dentro de la misma palabra.

```
A B C E
S F C S
A D E E
```

En este tablero, `"ABCCED"` se forma así: A (0,0) → B (0,1) → C (0,2) → C (1,2) → E (2,2) → D (2,1).

## Reglas

- Las celdas son textos de una letra.
- El tablero tiene al menos una celda y la palabra al menos una letra.
- Distingue mayúsculas: `"a"` y `"A"` son distintas.
- **No modifiques el tablero que recibes.**

## Ejemplos

```js
const tablero = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"],
];
existePalabra(tablero, "ABCCED");   // true
existePalabra(tablero, "SEE");      // true
existePalabra(tablero, "ABCB");     // false: habría que usar la B dos veces
```

## Reto extra

Prueba desde cada celda y explora caminos con **backtracking**: marca la celda al usarla y **desmárcala** al volver, para que otros caminos puedan usarla.
