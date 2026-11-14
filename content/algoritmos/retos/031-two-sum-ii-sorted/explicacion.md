## Idea clave

Pones un puntero en cada extremo del arreglo ordenado. Si la suma se queda corta, avanzas el de la izquierda para agrandarla; si se pasa, retrocedes el de la derecha para achicarla. Como el arreglo está ordenado, cada movimiento descarta un número que **no puede** ser parte de la respuesta.

## Paso a paso

1. **La solución directa** (dila en voz alta): probar todas las parejas con dos bucles. Es O(n²) y no usa que el arreglo esté ordenado.

   ```js
   for (let i = 0; i < nums.length; i++) {
     for (let j = i + 1; j < nums.length; j++) {
       if (nums[i] + nums[j] === objetivo) return [i, j];
     }
   }
   ```

2. **¿Qué información estás desperdiciando?** El orden. Si sumas el más chico con el más grande y te pasas, sabes algo fuerte: el más grande, sumado con **cualquier** otro (todos son mayores o iguales que el más chico), también se pasa. Ese número ya no sirve.
3. **Dos punteros.** `izq = 0` (el más chico que queda) y `der = nums.length - 1` (el más grande que queda).
4. **Compara la suma con el objetivo:**
   - Igual: devuelve `[izq, der]`.
   - Menor: te falta, y el único modo de subir la suma es cambiar `nums[izq]` por uno más grande: `izq++`.
   - Mayor: te sobra, cambia `nums[der]` por uno más chico: `der--`.
5. **Repite mientras `izq < der`.** Cuando se cruzan ya no quedan parejas de dos elementos distintos.

```js
export function sumaOrdenada(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;

  while (izq < der) {
    const suma = nums[izq] + nums[der];
    if (suma === objetivo) return [izq, der];
    if (suma < objetivo) izq++;
    else der--;
  }

  return [];
}
```

## Por qué funciona

Recorrido con `sumaOrdenada([1, 2, 3, 4, 4, 9], 8)`:

| `izq` | `der` | `nums[izq]` | `nums[der]` | Suma | Decisión |
|---|---|---|---|---|---|
| 0 | 5 | 1 | 9 | 10 | se pasa: `der--` (el 9 no sirve con nadie) |
| 0 | 4 | 1 | 4 | 5 | falta: `izq++` (el 1 no llega con nadie) |
| 1 | 4 | 2 | 4 | 6 | falta: `izq++` |
| 2 | 4 | 3 | 4 | 7 | falta: `izq++` |
| 3 | 4 | 4 | 4 | **8** | devuelve `[3, 4]` |

¿Por qué es seguro descartar el 9 en la primera fila? Porque 1 + 9 ya se pasa, y el 1 es el número más chico que queda: con cualquier otro compañero, el 9 se pasaría todavía más. Lo mismo al revés con el 1 en la segunda fila: 1 + 4 se queda corto y el 4 es el más grande que queda, así que el 1 no llega con nadie. Cada paso elimina un número sin perder la respuesta, por eso basta una pasada: O(n).

## Errores comunes

- **Mover el puntero equivocado.** Si la suma se queda corta y haces `der--`, la suma baja todavía más. Regla para recordar: falta, sube `izq`; sobra, baja `der`.
- **Usar `while (izq <= der)`.** Cuando `izq === der` estarías sumando el mismo elemento consigo mismo, y el enunciado lo prohíbe.
- **Devolver los valores en vez de los índices.** Te piden `[3, 4]` (posiciones), no `[4, 4]` (números).
- **Contar desde 1 como en LeetCode.** Aquí los índices empiezan en 0: el primer test esperaría `[0, 1]` y darías `[1, 2]`.
- **Copiar la solución de Two Sum con `Map`.** Pasa los tests, pero en la entrevista te van a preguntar "¿y si no puedes usar memoria extra?". Este problema existe justamente para ver si aprovechas el orden.

## Otra forma de resolverlo

**Dos bucles** (paso 1): O(n²) de tiempo, O(1) de memoria. Sirve como primera respuesta.

**`Map` como en Two Sum**: guardas cada número con su índice y buscas `objetivo - nums[i]`. O(n) de tiempo, pero O(n) de memoria, y no usa el orden.

**Búsqueda binaria por cada elemento**: para cada `i`, buscas `objetivo - nums[i]` con búsqueda binaria en la parte derecha `[i + 1, n - 1]`. O(n log n) de tiempo y O(1) de memoria. Es una buena idea intermedia si no se te ocurren los dos punteros.

**¿Cuál conviene?** Los dos punteros: O(n) de tiempo y O(1) de memoria, lo mejor de los dos mundos. Si el arreglo **no** estuviera ordenado, el `Map` sería la mejor opción, porque ordenar costaría O(n log n) y perderías los índices originales.

## Cómo explicarlo en la entrevista

> "La forma directa es probar todas las parejas, O(n²). Como el arreglo está ordenado, uso dos punteros: uno en el más chico y otro en el más grande. Si la suma es menor que el objetivo, avanzo el izquierdo para agrandarla; si es mayor, retrocedo el derecho para achicarla. Cada movimiento descarta un número que no puede formar pareja con ninguno de los que quedan, así que encuentro la respuesta en una pasada: O(n) de tiempo y O(1) de memoria, sin necesidad de un Map."

## Conceptos

- **Dos punteros desde los extremos**: un patrón típico en arreglos ordenados (también en Valid Palindrome y Container With Most Water).
- **Descartar con el orden**: si el más chico más el más grande se pasa, el más grande no sirve con nadie.
- **Memoria O(1)**: solo usas dos variables, sin estructuras extra.
- **Índices vs valores**: lee bien qué te piden devolver.
- **Two Sum vs Two Sum II**: sin orden, `Map`; con orden, dos punteros.
