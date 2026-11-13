## Idea clave

Primero cuentas las frecuencias con un `Map`. Después, en vez de ordenar, usas **cubetas**: un arreglo donde la posición `f` guarda los números que aparecen `f` veces. Como ninguna frecuencia supera `n`, basta recorrer las cubetas desde la más alta y tomar números hasta tener `k`.

## Paso a paso

1. **Cuenta las frecuencias** con un `Map`: `conteo.set(n, (conteo.get(n) || 0) + 1)`. Usamos `Map` y no objeto porque el `Map` conserva las claves como números.
2. **La solución directa para elegir** (dila en voz alta): ordenar las entradas del `Map` por frecuencia, de mayor a menor, y tomar las primeras `k`. Es clara, pero ordenar cuesta O(n log n).

   ```js
   return [...conteo.entries()]
     .sort((a, b) => b[1] - a[1])
     .slice(0, k)
     .map(([numero]) => numero);
   ```

3. **Observa el límite de las frecuencias.** Un número puede aparecer como mínimo 1 vez y como máximo `n` veces (si todo el arreglo es ese número). Así que las frecuencias posibles son pocas y conocidas: de 1 a `n`.
4. **Crea `n + 1` cubetas**, una por cada frecuencia posible (la 0 queda vacía). `Array.from({ length: n + 1 }, () => [])` crea un arreglo **distinto** en cada posición.
5. **Reparte**: cada número va a `cubetas[frecuencia]`.
6. **Recolecta desde el final**: recorre `f` desde `n` hacia abajo, agrega los números de cada cubeta y detente cuando tengas `k`. El `slice(0, k)` final asegura no devolver de más si la última cubeta tenía varios.

```js
export function topK(nums, k) {
  const conteo = new Map();
  for (const n of nums) conteo.set(n, (conteo.get(n) || 0) + 1);

  const cubetas = Array.from({ length: nums.length + 1 }, () => []);
  for (const [numero, frecuencia] of conteo) cubetas[frecuencia].push(numero);

  const resultado = [];
  for (let f = cubetas.length - 1; f >= 0 && resultado.length < k; f--) {
    resultado.push(...cubetas[f]);
  }
  return resultado.slice(0, k);
}
```

## Por qué funciona

Recorrido con `topK([1, 1, 1, 2, 2, 3], 2)`:

**Conteo**: `{ 1 → 3, 2 → 2, 3 → 1 }`.

**Cubetas** (n = 6, así que 7 posiciones):

| Frecuencia `f` | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| `cubetas[f]` | `[]` | `[3]` | `[2]` | `[1]` | `[]` | `[]` | `[]` |

**Recolección** desde `f = 6`:

| `f` | `cubetas[f]` | `resultado` después | ¿Ya hay k = 2? |
|---|---|---|---|
| 6 | `[]` | `[]` | no |
| 5 | `[]` | `[]` | no |
| 4 | `[]` | `[]` | no |
| 3 | `[1]` | `[1]` | no |
| 2 | `[2]` | `[1, 2]` | **sí**, termina |

Devuelve `[1, 2]`. Nunca se ordenó nada: el índice del arreglo ya hace de "orden por frecuencia".

## Errores comunes

- **Contar con un objeto y devolver `Object.keys`.** Las claves de un objeto son texto: devuelves `["1", "2"]`. Lo reconoces porque `toEqual([1, 2])` falla mostrando comillas. Usa `Map` o convierte con `Number`.
- **Crear las cubetas con `new Array(n + 1).fill([])`.** `fill` pone **el mismo arreglo** en todas las posiciones: al hacer `push` en una, aparece en todas. Usa `Array.from({ length }, () => [])`.
- **Crear solo `n` cubetas.** Si un número aparece `n` veces (por ejemplo `topK([1], 1)`), `cubetas[n]` es `undefined` y `push` lanza error.
- **Olvidar el `slice(0, k)`.** Si la última cubeta que tomaste tenía varios números, devuelves más de `k`.
- **Ordenar con `sort()` sin comparador** en la versión directa: compara como texto y la frecuencia 10 queda antes que la 9.

## Otra forma de resolverlo

**Contar y ordenar** (paso 2): O(n log n) de tiempo y O(n) de memoria. Es la más fácil de escribir bien en una entrevista, y con datos pequeños la diferencia de velocidad no se nota.

**Con un heap (montículo) de tamaño k**: O(n log k). Es la respuesta clásica en otros lenguajes, pero JavaScript no trae un heap incorporado y escribirlo a mano lleva tiempo. Basta con mencionarlo.

**¿Cuál conviene?** Escribe primero la de ordenar si te sientes inseguro; luego explica que, como las frecuencias están acotadas por n, se puede bajar a O(n) con cubetas. Mostrar ese razonamiento es lo que suma.

## Cómo explicarlo en la entrevista

> "Primero cuento frecuencias con un Map en O(n). Podría ordenar las entradas por frecuencia y tomar las k primeras, pero eso es O(n log n). Como una frecuencia nunca supera n, uso cubetas: un arreglo donde la posición i guarda los números que aparecen i veces. Luego recorro desde la frecuencia más alta y tomo números hasta tener k. Queda O(n) de tiempo y O(n) de memoria."

## Conceptos

- **Conteo con `Map`**: `map.set(x, (map.get(x) || 0) + 1)`.
- **Bucket sort (ordenamiento por cubetas)**: usar el valor como índice de un arreglo para "ordenar" sin comparar.
- **`Array.from({ length }, fn)`**: crea un arreglo llamando a `fn` en cada posición, ideal para arreglos de arreglos.
- **`fill` con objetos**: comparte la misma referencia en todas las posiciones.
- **Iterar un `Map`**: `for (const [clave, valor] of mapa)`.
