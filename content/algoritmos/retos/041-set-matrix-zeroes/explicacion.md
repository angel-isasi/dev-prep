## Idea clave

**Separa mirar de modificar.** Primero recorres la matriz solo para anotar qué filas y qué columnas tienen algún cero (en dos `Set`). Después la recorres otra vez y pones en `0` cada celda cuya fila o columna quedó anotada. Así los ceros que tú pones nunca se confunden con los originales.

## Paso a paso

1. **La solución directa** (dila en voz alta): haz una **copia** de la matriz, busca los ceros en la copia y ve poniendo ceros en la original. Como la copia nunca cambia, los ceros nuevos no contagian. Funciona, pero gasta O(filas × columnas) de memoria extra.

   ```js
   const copia = matriz.map((fila) => [...fila]);
   for (let f = 0; f < copia.length; f++) {
     for (let c = 0; c < copia[f].length; c++) {
       if (copia[f][c] === 0) {
         for (let k = 0; k < matriz[f].length; k++) matriz[f][k] = 0; // su fila
         for (let k = 0; k < matriz.length; k++) matriz[k][c] = 0;    // su columna
       }
     }
   }
   return matriz;
   ```

2. **¿Qué necesitas recordar de verdad?** No toda la matriz: solo **qué filas** y **qué columnas** tienen un cero. Eso es como mucho `filas + columnas` datos.
3. **Primera pasada, solo anotar**: recorre todas las celdas y, si una vale `0`, agrega su fila `f` a `filasConCero` y su columna `c` a `columnasConCero`. Usamos `Set` porque si una fila tiene tres ceros basta anotarla una vez, y `has` responde al instante.
4. **Segunda pasada, modificar**: recorre otra vez y pon `matriz[f][c] = 0` si `filasConCero.has(f) || columnasConCero.has(c)`. Es un **o**: basta que una de las dos esté marcada.
5. **Devuelve la misma matriz**: `return matriz`. No creas una nueva, la que recibiste ya quedó modificada.

```js
export function ponerCeros(matriz) {
  const filasConCero = new Set();
  const columnasConCero = new Set();

  for (let f = 0; f < matriz.length; f++) {
    for (let c = 0; c < matriz[f].length; c++) {
      if (matriz[f][c] === 0) {
        filasConCero.add(f);
        columnasConCero.add(c);
      }
    }
  }

  for (let f = 0; f < matriz.length; f++) {
    for (let c = 0; c < matriz[f].length; c++) {
      if (filasConCero.has(f) || columnasConCero.has(c)) {
        matriz[f][c] = 0;
      }
    }
  }

  return matriz;
}
```

## Por qué funciona

Recorrido con el segundo ejemplo:

```
[0, 1, 2, 0]
[3, 4, 5, 2]
[1, 3, 1, 5]
```

**Primera pasada** (solo anota): hay ceros en `(0, 0)` y en `(0, 3)`. Queda `filasConCero = {0}` y `columnasConCero = {0, 3}`. La matriz sigue igual.

**Segunda pasada** (modifica):

| Fila `f` | ¿`f` en filas? | Celdas y decisión | Fila resultante |
|---|---|---|---|
| 0 | sí | toda la fila a 0 | `[0, 0, 0, 0]` |
| 1 | no | columna 0 sí, 1 no, 2 no, 3 sí | `[0, 4, 5, 0]` |
| 2 | no | columna 0 sí, 1 no, 2 no, 3 sí | `[0, 3, 1, 0]` |

Ahora mira por qué **no** se puede modificar en la misma pasada. Con `[[0, 1], [1, 1]]`: al ver el cero en `(0, 0)` pones a cero la fila 0 y la columna 0, y queda `[[0, 0], [0, 1]]`. Si sigues recorriendo, en `(0, 1)` encuentras un cero **que tú pusiste**, borras la columna 1 y terminas con `[[0, 0], [0, 0]]`. La respuesta correcta es `[[0, 0], [0, 1]]`. Separar las pasadas evita justo eso.

## Errores comunes

- **Poner ceros mientras recorres.** Los ceros nuevos contagian a otras filas y columnas y terminas con casi toda la matriz en cero. Lo reconoces en el test "los ceros que pones no contagian".
- **Usar `&&` en vez de `||` en la segunda pasada.** Solo pondrías cero en los cruces de fila y columna marcadas, no en toda la fila ni toda la columna.
- **Devolver una matriz nueva** (por ejemplo con `map`) y dejar la original igual. El enunciado pide modificar la misma. Lo reconoces en el test "modifica la misma matriz y la devuelve".
- **Copiar mal la matriz** en la versión directa: `const copia = [...matriz]` solo copia el arreglo de afuera, las filas siguen siendo las mismas. Para copiar filas usa `matriz.map((fila) => [...fila])`.
- **Confundir filas con columnas**: `matriz.length` es la cantidad de filas y `matriz[0].length` la de columnas. En una matriz 3 × 4 se nota enseguida.

## Otra forma de resolverlo

**Copia completa** (paso 1): O(filas × columnas × (filas + columnas)) de tiempo en el peor caso y O(filas × columnas) de memoria. Útil solo como primera idea.

**Usar la primera fila y la primera columna como libreta** (memoria O(1)): en vez de dos `Set`, marcas con un `0` en `matriz[f][0]` que la fila `f` debe borrarse, y en `matriz[0][c]` que la columna `c` debe borrarse. Como esas celdas también son datos, primero guardas aparte si la primera fila y la primera columna tenían ceros desde el inicio:

```js
const primeraFilaTieneCero = matriz[0].includes(0);
const primeraColumnaTieneCero = matriz.some((fila) => fila[0] === 0);

for (let f = 1; f < matriz.length; f++) {
  for (let c = 1; c < matriz[0].length; c++) {
    if (matriz[f][c] === 0) {
      matriz[f][0] = 0; // marca la fila
      matriz[0][c] = 0; // marca la columna
    }
  }
}
for (let f = 1; f < matriz.length; f++) {
  for (let c = 1; c < matriz[0].length; c++) {
    if (matriz[f][0] === 0 || matriz[0][c] === 0) matriz[f][c] = 0;
  }
}
if (primeraFilaTieneCero) matriz[0].fill(0);
if (primeraColumnaTieneCero) for (const fila of matriz) fila[0] = 0;
return matriz;
```

**¿Cuál conviene?** La de los dos `Set` es O(filas × columnas) de tiempo y O(filas + columnas) de memoria, y se explica en un minuto: es la que deberías escribir primero. La de la libreta tiene el mismo tiempo y memoria O(1), pero es fácil equivocarse con la primera fila y la primera columna. Menciónala como mejora si te preguntan "¿y sin memoria extra?".

## Cómo explicarlo en la entrevista

> "El problema es que si pongo ceros mientras recorro, después no distingo los ceros originales de los que puse yo. La solución directa es copiar la matriz, pero eso gasta memoria del tamaño de toda la matriz. En realidad solo necesito saber qué filas y qué columnas tienen un cero, así que hago una primera pasada que solo anota esas filas y columnas en dos Set, y una segunda pasada que pone en cero cada celda cuya fila o columna está anotada. Es O(filas por columnas) de tiempo y O(filas más columnas) de memoria. Si me piden memoria constante, puedo usar la primera fila y la primera columna de la matriz como marcas, guardando antes si ellas mismas tenían ceros."

## Conceptos

- **Separar lectura y escritura**: cuando modificar los datos cambia lo que lees después, primero anota y luego modifica.
- **`Set`**: guarda valores sin repetir; `add` para anotar y `has` para preguntar.
- **Recorrer una matriz**: dos `for` anidados, `f` para filas (`matriz.length`) y `c` para columnas (`matriz[f].length`).
- **Modificar en el lugar**: cambiar la estructura que recibes y devolver la misma referencia.
- **Copia superficial vs profunda**: `[...matriz]` comparte las filas; `matriz.map((fila) => [...fila])` las copia.
