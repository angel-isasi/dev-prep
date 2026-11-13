## Idea clave

En vez de probar todas las parejas, para cada número calculas **cuánto le falta** para llegar al objetivo y preguntas si ese número ya apareció antes. Un `Map` recuerda los números vistos con su índice, y preguntarle es instantáneo.

## Paso a paso

1. **Empieza por la solución obvia** (y dila en voz alta): dos bucles, uno para cada número de la pareja. Funciona, pero compara todas las parejas: O(n²).

   ```js
   for (let i = 0; i < nums.length; i++) {
     for (let j = i + 1; j < nums.length; j++) {
       if (nums[i] + nums[j] === objetivo) return [i, j];
     }
   }
   ```

2. **Cambia la pregunta.** Si estás en `nums[i]`, la pareja que buscas vale exactamente `objetivo - nums[i]`. Ya no buscas "cualquier pareja", buscas un número concreto.
3. **Recuerda lo que ya viste** en un `Map` con la forma `valor -> índice`. Buscar en un `Map` con `has()` no recorre nada: es O(1).
4. **En cada vuelta**: calcula `falta`; si `falta` está en el `Map`, encontraste la pareja y devuelves `[índice guardado, i]`. Si no, guarda el número actual y sigue.
5. **El orden importa**: primero buscas, después guardas. Así nunca emparejas un número consigo mismo.

```js
export function twoSum(nums, objetivo) {
  const vistos = new Map(); // valor -> índice donde lo vi

  for (let i = 0; i < nums.length; i++) {
    const falta = objetivo - nums[i];
    if (vistos.has(falta)) {
      return [vistos.get(falta), i];
    }
    vistos.set(nums[i], i);
  }

  return [];
}
```

El `return []` del final nunca se ejecuta con las reglas del ejercicio (siempre hay solución), pero deja claro qué pasa si no la hubiera.

## Por qué funciona

Recorrido con `twoSum([3, 2, 4], 6)`:

| `i` | `nums[i]` | `falta` | ¿`falta` en `vistos`? | `vistos` al terminar la vuelta |
|---|---|---|---|---|
| 0 | 3 | 6 - 3 = **3** | no (está vacío) | `{ 3 → 0 }` |
| 1 | 2 | 6 - 2 = **4** | no | `{ 3 → 0, 2 → 1 }` |
| 2 | 4 | 6 - 4 = **2** | **sí, en el índice 1** | devuelve `[1, 2]` |

Fíjate en la vuelta 0: `falta` es 3 y el número actual también es 3. Como todavía no lo guardamos, no lo encuentra y no lo empareja consigo mismo. Ese es justo el caso del test "no usa el mismo elemento dos veces".

Siempre devuelve el índice menor primero, porque el índice guardado es de una vuelta anterior.

## Errores comunes

- **Guardar antes de buscar.** Con `[3, 4, 2]` y objetivo 6, en la primera vuelta guardas el 3, buscas `falta = 3`, lo encuentras y devuelves `[0, 0]`. Lo reconoces porque recibes dos índices iguales.
- **Devolver los valores en vez de los índices.** Con `[2, 7, 11, 15]` devuelves `[2, 7]` en vez de `[0, 1]`.
- **Usar `if (vistos.get(falta))` en vez de `has()`.** Si el índice guardado es `0`, `get` devuelve `0`, que es "falsy", y el `if` no entra. Falla justo cuando la pareja está en el índice 0. Lo reconoces en el test de los ceros o en `[3, 3]`.
- **Usar `indexOf` dentro del bucle** para buscar `falta`. Funciona, pero `indexOf` recorre el arreglo: vuelves a O(n²) sin darte cuenta.
- **En la versión de dos bucles, empezar `j` en 0** en vez de `i + 1`: emparejas un número consigo mismo.

## Otra forma de resolverlo

Los **dos bucles anidados** del paso 1. Ventajas: no usa memoria extra y es la más fácil de escribir sin errores. Desventaja: O(n²); con 10 000 números son unos 50 millones de comparaciones, contra 10 000 vueltas del `Map`.

**¿Cuál conviene?** En entrevista, menciona primero la de dos bucles ("la solución directa sería...") y luego propón la del `Map` como mejora. Eso muestra que sabes analizar el costo, que es lo que de verdad evalúan. Si te bloqueas con el `Map`, escribe la de dos bucles: una solución que funciona vale más que una óptima a medias.

También se puede usar un objeto `{}` en vez de `Map` (`vistos[nums[i]] = i` y `falta in vistos`), pero el `Map` es más claro para esto y no tiene propiedades heredadas.

## Cómo explicarlo en la entrevista

> "La solución directa es probar todas las parejas con dos bucles, pero eso es O(n²). Para mejorarlo, me doy cuenta de que, para cada número, ya sé exactamente qué número necesito: el objetivo menos el actual. Entonces recorro el arreglo una vez y voy guardando en un Map cada número con su índice. Antes de guardar, pregunto si el número que me falta ya está en el Map; si está, encontré la pareja. Queda en O(n) de tiempo, a cambio de O(n) de memoria extra. Busco antes de guardar para no emparejar un número consigo mismo."

## Conceptos

- **`Map`**: colección de pares clave-valor. `set(clave, valor)`, `get(clave)`, `has(clave)`.
- **`has` vs `get`**: `has` responde sí o no; `get` devuelve el valor, que puede ser `0` y engañar a un `if`.
- **Complejidad O(n) vs O(n²)**: cuántas operaciones hace tu código cuando la entrada crece.
- **Intercambio tiempo por memoria**: usar una estructura extra para no repetir trabajo. Es la idea detrás de muchos problemas tipo LeetCode.
- **Bucle `for` clásico**: lo usas cuando necesitas el índice `i`, no solo el valor.
