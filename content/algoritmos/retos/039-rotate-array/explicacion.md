## Idea clave

Rotar `k` a la derecha es intercambiar dos bloques: los últimos `k` elementos pasan adelante. Si volteas **todo** el arreglo, los bloques quedan en su lugar pero cada uno al revés; volteando luego cada bloque por separado, quedan bien. Son tres inversiones con dos punteros, sin arreglo extra. Antes, reduces `k` con `k % n`.

## Paso a paso

1. **Primero, reduce `k`.** Rotar `n` veces un arreglo de largo `n` lo deja igual, así que rotar 10 un arreglo de 7 es rotar 3. `k = k % n`.
2. **La solución directa** (dila en voz alta): copiar el arreglo y poner cada elemento en su nueva posición. El elemento de la posición `i` termina en `(i + k) % n`. Es O(n) de tiempo, pero O(n) de memoria por la copia.

   ```js
   const copia = [...nums];
   for (let i = 0; i < n; i++) {
     nums[(i + k) % n] = copia[i];
   }
   ```

   Ojo: escribes en `nums` (el original), no devuelves la copia.

3. **¿Se puede sin copia?** Mira el resultado de rotar 3: `[1, 2, 3, 4 | 5, 6, 7]` pasa a `[5, 6, 7 | 1, 2, 3, 4]`. Son los mismos dos bloques en orden cambiado.
4. **Voltear todo cambia el orden de los bloques**, pero también voltea cada uno: `[7, 6, 5 | 4, 3, 2, 1]`. El bloque `[7, 6, 5]` ya está adelante, solo que al revés.
5. **Voltea cada bloque**: los primeros `k` (`[7, 6, 5]` pasa a `[5, 6, 7]`) y los demás (`[4, 3, 2, 1]` pasa a `[1, 2, 3, 4]`). Listo.
6. **Voltear un tramo en el lugar** es el clásico de dos punteros: uno en cada extremo, intercambias y los acercas hasta que se crucen.

```js
function invertir(nums, i, j) {
  while (i < j) {
    [nums[i], nums[j]] = [nums[j], nums[i]];
    i++;
    j--;
  }
}

export function rotar(nums, k) {
  const n = nums.length;
  k = k % n;
  invertir(nums, 0, n - 1);
  invertir(nums, 0, k - 1);
  invertir(nums, k, n - 1);
}
```

## Por qué funciona

Recorrido con `rotar([1, 2, 3, 4, 5, 6, 7], 3)`:

| Paso | Tramo que se voltea | Arreglo después |
|---|---|---|
| Inicio | | `[1, 2, 3, 4, 5, 6, 7]` |
| 1. Voltear todo | posiciones 0 a 6 | `[7, 6, 5, 4, 3, 2, 1]` |
| 2. Voltear los primeros `k` | posiciones 0 a 2 | `[5, 6, 7, 4, 3, 2, 1]` |
| 3. Voltear el resto | posiciones 3 a 6 | `[5, 6, 7, 1, 2, 3, 4]` |

Con `rotar([1, 2, 3], 4)`: `k = 4 % 3 = 1`. Voltear todo da `[3, 2, 1]`, voltear el primero (posiciones 0 a 0) no cambia nada, voltear el resto (posiciones 1 a 2) da `[3, 1, 2]`. Correcto.

Con `k = 0` (o `k` igual al largo): `k % n` es 0. Voltear todo y luego voltear todo otra vez (posiciones 0 a `n - 1`) deja el arreglo como estaba. El tramo de 0 a -1 no hace nada porque `0 < -1` es falso.

## Errores comunes

- **Olvidar `k % n`.** Con `k = 4` y largo 3, `invertir(nums, 0, 3)` lee y escribe la posición 3, que no existe, y el arreglo queda con un `undefined`. Lo reconoces en el test "k mayor que el largo".
- **Reasignar en vez de modificar.** `nums = [...nums.slice(-k), ...nums.slice(0, -k)]` dentro de la función cambia la variable local, no el arreglo que te pasaron. Los tests ven el arreglo sin cambios.
- **Devolver un arreglo nuevo** con el resultado. El enunciado pide modificar el original; quien llama a `rotar` no usa lo que devuelves.
- **Rotar hacia la izquierda.** Si volteas primero los bloques y al final todo, o usas `(i - k)`, rotas al revés. Con el ejemplo `[1, 2, 3, 4, 5, 6, 7]` y 3 obtendrías `[4, 5, 6, 7, 1, 2, 3]`.
- **Rotar de a uno, `k` veces** (`nums.unshift(nums.pop())` en un bucle). Funciona, pero cada `unshift` corre todo el arreglo: O(n · k).

## Otra forma de resolverlo

**Arreglo auxiliar** (paso 2): O(n) de tiempo y O(n) de memoria. Es la más fácil de entender y una buena primera respuesta.

**Con `splice` y `unshift`**: saca los últimos `k` y ponlos adelante, todo sobre el mismo arreglo.

```js
k = k % nums.length;
nums.unshift(...nums.splice(nums.length - k, k));
```

Es corta y modifica el original, pero por dentro crea un arreglo temporal con los `k` elementos y corre todos los demás: O(n) de tiempo y O(k) de memoria. Útil en código real, pero en la entrevista te van a pedir la versión sin memoria extra.

**¿Cuál conviene?** En la entrevista, menciona el arreglo auxiliar y luego muestra las tres inversiones: O(n) de tiempo (cada elemento se intercambia como mucho dos veces) y **O(1)** de memoria.

## Cómo explicarlo en la entrevista

> "Primero reduzco k con k módulo n, porque rotar n veces deja el arreglo igual. La forma directa es usar un arreglo auxiliar y poner cada elemento i en la posición i más k módulo n: O(n) de memoria. Para hacerlo en el lugar me fijo que rotar es intercambiar dos bloques: si volteo todo el arreglo, los bloques quedan en su lugar pero invertidos, y luego volteo los primeros k y el resto. Voltear un tramo es dos punteros intercambiando extremos. Queda O(n) de tiempo y O(1) de memoria."

## Conceptos

- **In-place**: modificar el arreglo recibido, sin crear otro.
- **Referencias**: reasignar el parámetro no cambia el arreglo de afuera; modificar sus posiciones sí.
- **Módulo para dar vueltas**: `k % n` y `(i + k) % n`.
- **Invertir con dos punteros**: intercambiar extremos y acercarse.
- **Intercambio con desestructuración**: `[a[i], a[j]] = [a[j], a[i]]`.
