## Idea clave

Divides el arreglo en **cuatro zonas** con tres punteros: los 0 a la izquierda de `bajo`, los 1 entre `bajo` y `medio`, lo que falta revisar entre `medio` y `alto`, y los 2 a la derecha de `alto`. En cada paso miras `nums[medio]` y lo mandas a su zona con un intercambio. Cuando `medio` pasa a `alto`, ya no queda nada sin revisar.

## Paso a paso

1. **La solución directa** (dila en voz alta): `nums.sort((a, b) => a - b)`. Es O(n log n) y no aprovecha que solo hay tres valores. En la entrevista te dirán "sin `sort`".
2. **Mejor: contar.** Recorre una vez contando cuántos 0, 1 y 2 hay, y en una segunda pasada reescribe el arreglo: primero tantos 0, luego tantos 1, luego tantos 2. Es O(n), pero son dos pasadas. Es una buena respuesta intermedia (está en "Otra forma").
3. **Una sola pasada con tres punteros.** Empieza con `bajo = 0`, `medio = 0` y `alto = nums.length - 1`. Toda la parte `[medio, alto]` está "sin revisar".
4. **Si `nums[medio]` es 0**: intercámbialo con `nums[bajo]` y avanza **los dos**. Puedes avanzar `medio` sin miedo porque lo que llega desde `bajo` ya fue revisado: es un 1 (o es la misma posición, si todavía no hay ningún 1).
5. **Si es 1**: ya está en su zona. Solo avanza `medio`.
6. **Si es 2**: intercámbialo con `nums[alto]` y retrocede `alto`. **No avances `medio`**: el número que llegó desde el final todavía no lo has mirado, puede ser un 0, un 1 o un 2.
7. **¿Cuándo parar?** Mientras `medio <= alto`. Con `<` te saltarías la última celda sin revisar.

```js
export function ordenarColores(nums) {
  let bajo = 0;
  let medio = 0;
  let alto = nums.length - 1;

  while (medio <= alto) {
    if (nums[medio] === 0) {
      [nums[bajo], nums[medio]] = [nums[medio], nums[bajo]];
      bajo++;
      medio++;
    } else if (nums[medio] === 1) {
      medio++;
    } else {
      [nums[medio], nums[alto]] = [nums[alto], nums[medio]];
      alto--;
    }
  }

  return nums;
}
```

## Por qué funciona

Recorrido con `ordenarColores([2, 0, 2, 1, 1, 0])`:

| Paso | `bajo` | `medio` | `alto` | `nums[medio]` | Acción | Arreglo después |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 5 | 2 | cambia con `alto`, `alto--` | `[0, 0, 2, 1, 1, 2]` |
| 2 | 0 | 0 | 4 | 0 | cambia con `bajo`, avanzan ambos | `[0, 0, 2, 1, 1, 2]` |
| 3 | 1 | 1 | 4 | 0 | cambia con `bajo`, avanzan ambos | `[0, 0, 2, 1, 1, 2]` |
| 4 | 2 | 2 | 4 | 2 | cambia con `alto`, `alto--` | `[0, 0, 1, 1, 2, 2]` |
| 5 | 2 | 2 | 3 | 1 | `medio++` | `[0, 0, 1, 1, 2, 2]` |
| 6 | 2 | 3 | 3 | 1 | `medio++` | `[0, 0, 1, 1, 2, 2]` |

Ahora `medio = 4 > alto = 3`: no queda nada sin revisar y el arreglo está ordenado.

Fíjate en el paso 1: llegó un `0` desde el final y `medio` se quedó en su sitio. En el paso 2 lo revisamos y lo mandamos a la zona de los 0. Si `medio` hubiera avanzado, ese 0 se habría quedado atrapado entre los 1. Pasa en el test `[1, 2, 0]`: si avanzas `medio` al cambiar con `alto`, terminas con `[1, 0, 2]`.

## Errores comunes

- **Avanzar `medio` después de intercambiar con `alto`.** El número que llegó no se revisa nunca. Lo reconoces en el test `[1, 2, 0]`: devuelves `[1, 0, 2]`.
- **Usar `while (medio < alto)`.** La última celda sin revisar se queda sin mirar. Con `[2, 0, 1]` devuelves `[1, 0, 2]`.
- **Intercambiar mal**: `nums[bajo] = nums[medio]; nums[medio] = nums[bajo];` pierde un valor, porque la segunda línea lee el valor que acabas de pisar. Usa la desestructuración `[a[i], a[j]] = [a[j], a[i]]` o una variable temporal.
- **Crear un arreglo nuevo** (con `filter` o `concat`) y devolverlo. El enunciado pide modificar el mismo. Lo reconoces en el test "modifica el mismo arreglo y lo devuelve".
- **Usar `sort()` sin comparador** cuando te lo permiten: con 0, 1 y 2 funciona por casualidad (un solo dígito), pero es un mal hábito: `[10, 2].sort()` da `[10, 2]`.

## Otra forma de resolverlo

**Contar y reescribir** (dos pasadas): O(n) de tiempo y O(1) de memoria (solo tres contadores).

```js
const cuenta = [0, 0, 0];
for (const n of nums) cuenta[n]++;
let i = 0;
for (let color = 0; color < 3; color++) {
  for (let k = 0; k < cuenta[color]; k++) nums[i++] = color;
}
return nums;
```

**¿Cuál conviene?** Las dos son O(n) y O(1). Contar es más fácil de escribir sin errores y es perfectamente válida. Los tres punteros hacen una sola pasada y son lo que el entrevistador suele esperar cuando nombra la "bandera holandesa". Si no te sale, empieza con contar y luego propón los punteros.

## Cómo explicarlo en la entrevista

> "Con sort sería O(n log n), pero solo hay tres valores. Una opción es contar cuántos hay de cada uno y reescribir el arreglo, en dos pasadas. Para hacerlo en una sola uso tres punteros: bajo marca dónde va el próximo 0, alto dónde va el próximo 2, y medio recorre. Si encuentro un 0 lo intercambio con bajo y avanzo los dos; si es 1 solo avanzo medio; si es 2 lo intercambio con alto y retrocedo alto, pero no avanzo medio, porque el valor que me llegó desde el final todavía no lo revisé. Paro cuando medio pasa a alto. Es O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Tres punteros / bandera holandesa**: partir un arreglo en tres zonas en una sola pasada.
- **Invariante**: en todo momento, lo que está antes de `bajo` son 0, entre `bajo` y `medio` son 1, y después de `alto` son 2.
- **Intercambio con desestructuración**: `[a[i], a[j]] = [a[j], a[i]]`.
- **Modificar en el lugar**: cambiar el arreglo recibido y devolver la misma referencia.
- **Conteo**: cuando hay pocos valores posibles, contar suele ganarle a ordenar.
