## Idea clave

Guardas cuatro límites que encierran la parte de la matriz que falta recorrer: `arriba`, `abajo`, `izquierda` y `derecha`. Cada vuelta recorre el borde de esa zona en cuatro tramos (derecha, abajo, izquierda, arriba) y, después de cada tramo, cierras el límite correspondiente. Antes de los tramos de vuelta revisas que todavía quede una fila o una columna, para no repetir elementos.

## Paso a paso

1. **La solución directa** (dila en voz alta): simular a alguien que camina por la matriz. Guardas una dirección (derecha, abajo, izquierda, arriba) y una matriz de "visitados". Avanzas mientras puedas; si te sales o llegas a una celda visitada, giras a la derecha. Funciona en O(filas · columnas), pero necesita memoria extra para los visitados y es fácil equivocarse con los giros.
2. **Cambia "visitados" por límites.** La zona pendiente siempre es un rectángulo. Basta con cuatro números: la primera y la última fila pendientes (`arriba`, `abajo`), y la primera y la última columna pendientes (`izquierda`, `derecha`).
3. **Una vuelta son cuatro tramos:**
   - Fila `arriba`, de `izquierda` a `derecha`. Esa fila ya está: `arriba++`.
   - Columna `derecha`, de `arriba` a `abajo`. Ya está: `derecha--`.
   - Fila `abajo`, de `derecha` a `izquierda`. Ya está: `abajo--`.
   - Columna `izquierda`, de `abajo` a `arriba`. Ya está: `izquierda++`.
4. **Los dos `if` que evitan repetir.** Después de los dos primeros tramos, puede que ya no quede ninguna fila (si la zona era una sola fila) o ninguna columna. Si recorres la "fila de abajo" sin revisar, en `[[1, 2, 3]]` volverías por la misma fila y agregarías `2, 1` de nuevo. Por eso: `if (arriba <= abajo)` antes del tercer tramo e `if (izquierda <= derecha)` antes del cuarto.
5. **El bucle sigue mientras la zona no esté vacía**: `arriba <= abajo && izquierda <= derecha`. La matriz vacía se atiende antes, porque `matriz[0]` no existe.

```js
export function espiral(matriz) {
  const resultado = [];
  if (matriz.length === 0) return resultado;

  let arriba = 0;
  let abajo = matriz.length - 1;
  let izquierda = 0;
  let derecha = matriz[0].length - 1;

  while (arriba <= abajo && izquierda <= derecha) {
    for (let c = izquierda; c <= derecha; c++) resultado.push(matriz[arriba][c]);
    arriba++;
    for (let f = arriba; f <= abajo; f++) resultado.push(matriz[f][derecha]);
    derecha--;
    if (arriba <= abajo) {
      for (let c = derecha; c >= izquierda; c--) resultado.push(matriz[abajo][c]);
      abajo--;
    }
    if (izquierda <= derecha) {
      for (let f = abajo; f >= arriba; f--) resultado.push(matriz[f][izquierda]);
      izquierda++;
    }
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con la matriz de 3 x 4:

```
[ 1,  2,  3,  4]
[ 5,  6,  7,  8]
[ 9, 10, 11, 12]
```

Al inicio: `arriba = 0`, `abajo = 2`, `izquierda = 0`, `derecha = 3`.

| Tramo | Recorre | Agrega | Límites después |
|---|---|---|---|
| Fila de arriba | fila 0, columnas 0 a 3 | 1, 2, 3, 4 | `arriba = 1` |
| Columna derecha | columna 3, filas 1 a 2 | 8, 12 | `derecha = 2` |
| Fila de abajo (1 <= 2: sí) | fila 2, columnas 2 a 0 | 11, 10, 9 | `abajo = 1` |
| Columna izquierda (0 <= 2: sí) | columna 0, filas 1 a 1 | 5 | `izquierda = 1` |
| **Segunda vuelta** | | | |
| Fila de arriba | fila 1, columnas 1 a 2 | 6, 7 | `arriba = 2` |
| Columna derecha | columna 2, de la fila 2 a la 1: rango vacío | (nada) | `derecha = 1` |
| Fila de abajo (2 <= 1: **no**) | se salta | | |
| Columna izquierda (1 <= 1: sí) | columna 1, subiendo de la fila 1 a la 2: rango vacío | (nada) | `izquierda = 2` |

Ahora `izquierda > derecha` y el bucle termina. Resultado: `[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]`. En la segunda vuelta solo quedaba una fila (`[6, 7]`), y el `if` del tercer tramo evitó volver por ella hacia la izquierda y agregar `7, 6` de nuevo.

## Errores comunes

- **No revisar los límites antes de los tramos de vuelta.** Es el error típico. Con una sola fila o columna repites elementos: `[[1, 2, 3]]` daría `[1, 2, 3, 2, 1]`. Lo reconoces en los tests "una sola fila" y "una sola columna", y en el 3 x 4.
- **Leer `matriz[0].length` con la matriz vacía.** `matriz[0]` es `undefined` y salta "Cannot read properties of undefined". Revisa `matriz.length === 0` primero.
- **Recorrer las esquinas dos veces.** Si el tramo de la columna derecha empieza en la fila `arriba` **antes** de hacer `arriba++`, la esquina de arriba a la derecha sale dos veces. Por eso cada límite se cierra apenas termina su tramo.
- **Confundir filas y columnas.** `matriz[f][c]`: primero la fila, después la columna. En la columna derecha la fila cambia y la columna queda fija (`matriz[f][derecha]`).
- **Probar solo con matrices cuadradas.** Muchos errores aparecen recién con 3 x 4 o 4 x 2.

## Otra forma de resolverlo

**Simulación con dirección y visitados** (paso 1): guardas `dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]` y una matriz de booleanos. Avanzas; si la siguiente celda está fuera o visitada, cambias de dirección con `(d + 1) % 4`. O(filas · columnas) de tiempo y O(filas · columnas) de memoria extra por los visitados. Es más general (sirve para otros recorridos), pero más larga.

**Quitar la fila de arriba y rotar**: tomas la primera fila con `shift`, giras el resto de la matriz 90 grados a la izquierda y repites. Es corta y curiosa, pero rotar en cada vuelta cuesta mucho y además destruye la matriz original.

**¿Cuál conviene?** La de los cuatro límites: O(filas · columnas) de tiempo, porque cada elemento se agrega una sola vez, y O(1) de memoria extra (sin contar el resultado). Es la que esperan en una entrevista.

## Cómo explicarlo en la entrevista

> "Uso cuatro límites, arriba, abajo, izquierda y derecha, que encierran la parte que falta recorrer. En cada vuelta recorro la fila de arriba y bajo ese límite, la columna derecha y la muevo a la izquierda, la fila de abajo al revés y la subo, y la columna izquierda hacia arriba y la muevo a la derecha. Antes de los dos tramos de vuelta reviso que todavía quede una fila y una columna, para no repetir elementos cuando la matriz no es cuadrada. Cada elemento se visita una vez: O(filas por columnas) de tiempo y O(1) de memoria extra."

## Conceptos

- **Matriz como arreglo de arreglos**: `matriz[fila][columna]`.
- **Límites inclusivos que se cierran**: una forma de representar una zona pendiente sin marcar visitados.
- **Bucles hacia atrás**: `for (let c = derecha; c >= izquierda; c--)`.
- **Casos borde de matrices**: vacía, una fila, una columna, no cuadrada.
- **Simulación**: seguir paso a paso las reglas del recorrido, con cuidado en los bordes.
