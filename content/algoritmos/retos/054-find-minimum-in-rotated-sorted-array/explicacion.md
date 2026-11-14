## Idea clave

Un arreglo ordenado y rotado sube, **cae una sola vez** y vuelve a subir. El mínimo es el número justo después de la caída. Comparando `nums[medio]` con `nums[der]` sabes en qué mitad está la caída, y descartas la otra mitad: búsqueda binaria, O(log n).

## Paso a paso

1. **La solución directa** (dila en voz alta): recorrer todo el arreglo y quedarte con el menor, o `Math.min(...nums)`. Es O(n) y correcta, pero ignora que el arreglo está casi ordenado. En la entrevista, esto es lo que se espera que mejores.
2. **Mira la forma del arreglo.** `[4, 5, 6, 7, 0, 1, 2]` son dos tramos ordenados: `4, 5, 6, 7` y `0, 1, 2`. Todo el primer tramo es **mayor** que todo el segundo. El mínimo es el primer elemento del segundo tramo.
3. **¿Cómo sé en qué tramo cae `medio`?** Compáralo con el **último** elemento, `nums[der]`:
   - Si `nums[medio] > nums[der]`, `medio` está en el tramo de arriba (el primero): entre `medio` y `der` hay una caída, y el mínimo está **a la derecha** de `medio`. Como `medio` es mayor que algo, no puede ser el mínimo: `izq = medio + 1`.
   - Si `nums[medio] < nums[der]`, de `medio` a `der` todo sube sin caídas: `medio` está en el tramo de abajo. El mínimo es `medio` **o algo a su izquierda**: `der = medio`. Ojo, no `medio - 1`, porque podrías descartar el mínimo.
4. **Repite mientras `izq < der`.** Cada vuelta descarta la mitad. Cuando `izq === der`, queda un solo candidato: ese es el mínimo.
5. **El caso sin rotar sale solo.** En `[11, 13, 15, 17]`, `nums[medio]` siempre es menor que `nums[der]`, así que `der` baja hasta 0 y devuelves 11.
6. **Costo**: O(log n) de tiempo y O(1) de memoria.

```js
export function minimoRotado(nums) {
  let izq = 0;
  let der = nums.length - 1;

  while (izq < der) {
    const medio = Math.floor((izq + der) / 2);
    if (nums[medio] > nums[der]) {
      izq = medio + 1;
    } else {
      der = medio;
    }
  }

  return nums[izq];
}
```

## Por qué funciona

Recorrido con `minimoRotado([4, 5, 6, 7, 0, 1, 2])` (posiciones 0 a 6):

| `izq` | `der` | `medio` | `nums[medio]` | `nums[der]` | ¿`nums[medio] > nums[der]`? | Qué haces |
|---|---|---|---|---|---|---|
| 0 | 6 | 3 | 7 | 2 | sí | la caída está a la derecha: `izq = 4` |
| 4 | 6 | 5 | 1 | 2 | no | todo sube de 5 a 6: `der = 5` |
| 4 | 5 | 4 | 0 | 1 | no | todo sube de 4 a 5: `der = 4` |
| 4 | 4 | | | | | `izq === der`: termina |

Devuelve `nums[4]`, que es **0**. En la primera vuelta, el 7 del medio es mayor que el 2 del final: imposible si no hubiera una caída en medio. Por eso descartas toda la mitad izquierda, incluido el 7.

**Invariante**: en cada vuelta el mínimo sigue entre `izq` y `der`. Cuando haces `izq = medio + 1`, solo descartas números que son mayores que `nums[der]` (no pueden ser el mínimo). Cuando haces `der = medio`, conservas `medio`, que podría serlo.

## Errores comunes

- **Comparar con `nums[izq]` en vez de `nums[der]`.** Si `nums[medio] > nums[izq]`, no sabes si el arreglo está rotado o no. En `[11, 13, 15, 17]` irías a la derecha y devolverías 15. Lo reconoces en el test "sin rotar".
- **`der = medio - 1`.** Si `medio` era el mínimo, lo descartas. Lo reconoces en el test `[4, 5, 1, 2, 3]`: el 1 cae justo en el medio, lo tiras y devuelves 4.
- **`while (izq <= der)` con `der = medio`.** Cuando `izq === der`, `medio` vale lo mismo y `der` no cambia: **bucle infinito**. Con `der = medio`, la condición tiene que ser `izq < der`.
- **Devolver `izq` en vez de `nums[izq]`.** Te piden el valor, no la posición.
- **`(izq + der) / 2` sin redondear.** Da decimales como 2.5 y `nums[2.5]` es `undefined`. Usa `Math.floor`.

## Otra forma de resolverlo

**Recorrido lineal buscando la caída**: avanza hasta encontrar el primer `i` con `nums[i] < nums[i - 1]`; ese es el mínimo. Si no hay caída, el mínimo es `nums[0]`. O(n) de tiempo y O(1) de memoria:

```js
for (let i = 1; i < nums.length; i++) {
  if (nums[i] < nums[i - 1]) return nums[i];
}
return nums[0];
```

**`Math.min(...nums)`**: una línea y O(n). Con arreglos de cientos de miles de elementos, el spread puede lanzar `RangeError` por pasar demasiados argumentos.

**¿Cuál conviene?** La búsqueda binaria: es lo que el problema pide y lo que el entrevistador quiere ver. Menciona la lineal como punto de partida y di por qué la mejoras.

## Cómo explicarlo en la entrevista

> "Recorrer todo el arreglo sería O(n). Como el arreglo está ordenado y rotado, tiene dos tramos ordenados y una sola caída, y el mínimo está justo después de esa caída. Hago búsqueda binaria comparando el medio con el último elemento: si el medio es mayor, la caída está a la derecha y muevo izquierda a medio más uno; si no, de medio al final todo sube, así que el mínimo es el medio o algo a su izquierda, y muevo derecha a medio. Cuando izquierda y derecha se juntan, ahí está el mínimo. Es O(log n) de tiempo y O(1) de memoria."

## Conceptos

- **Búsqueda binaria**: descartar la mitad del espacio de búsqueda en cada paso; funciona porque hay un orden que te dice qué mitad tirar.
- **Arreglo rotado**: dos tramos ordenados, donde todo el primero es mayor que todo el segundo.
- **Invariante del bucle**: "el mínimo está entre `izq` y `der`"; cada movimiento debe respetarlo.
- **`izq < der` vs `izq <= der`**: depende de si asignas `der = medio` o `der = medio - 1`; elegir mal da un bucle infinito.
- **O(log n)**: con un millón de elementos son unas 20 vueltas.
