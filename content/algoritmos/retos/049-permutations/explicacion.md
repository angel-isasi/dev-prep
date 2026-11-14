## Idea clave

Armas la permutación **lugar por lugar** con **backtracking**. En cada lugar pruebas, uno por uno, todos los números que **todavía no usaste**: lo eliges (lo marcas y lo agregas), exploras el resto de lugares y luego deshaces la elección (lo quitas y lo desmarcas) para probar el siguiente. Cuando ya pusiste todos los números, tienes una permutación completa.

## Paso a paso

1. **Primero, entiende cuántas hay.** Con `[1, 2, 3]`: para el primer lugar hay 3 opciones, para el segundo quedan 2, para el tercero queda 1. Total 3 × 2 × 1 = 6 = 3!. Con 6 números ya son 720. Como la respuesta las pide todas, no puedes bajar de ese costo; el reto es generarlas sin olvidar ni repetir ninguna.
2. **¿Qué necesitas recordar?** La permutación que vas armando (`camino`) y qué números ya están en ella (`usado`, un arreglo de `true`/`false` con una posición por cada índice de `nums`).
3. **En cada llamada, un lugar nuevo.** Recorre todos los índices con un `for`. Si `usado[i]` es `true`, sáltalo con `continue`: ese número ya está en el camino.
4. **Si no está usado, el patrón del backtracking:**
   - **elegir**: `usado[i] = true` y `camino.push(nums[i])`;
   - **explorar**: `explorar()` llena los lugares que faltan;
   - **deshacer**: `camino.pop()` y `usado[i] = false`. Así, al volver, todo queda como antes de elegir y el `for` puede probar el siguiente número en este mismo lugar.
5. **Caso base**: si `camino.length === nums.length`, ya usaste todos. Guarda una **copia** con `[...camino]`, porque `camino` lo vas a seguir modificando.
6. **Diferencia con Subsets**: allí cada elemento decidía "entra o no entra" y siempre en el mismo orden, así que `[1, 2]` y `[2, 1]` no podían salir los dos. Aquí el `for` empieza **siempre desde 0**, justamente para que cualquier número pueda ir en cualquier lugar.

```js
export function permutaciones(nums) {
  const resultado = [];
  const camino = [];
  const usado = new Array(nums.length).fill(false);

  function explorar() {
    if (camino.length === nums.length) {
      resultado.push([...camino]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (usado[i]) continue;
      usado[i] = true;
      camino.push(nums[i]);
      explorar();
      camino.pop();
      usado[i] = false;
    }
  }

  explorar();
  return resultado;
}
```

## Por qué funciona

Árbol de decisiones con `[1, 2, 3]`. Cada nivel es un lugar, y cada rama es un número que todavía no se usó:

```
                        []                         1er lugar: 1, 2 o 3
          ┌─────────────┼─────────────┐
         [1]           [2]           [3]           2do lugar: los que quedan
       ┌──┴──┐       ┌──┴──┐       ┌──┴──┐
    [1,2]  [1,3]  [2,1]  [2,3]  [3,1]  [3,2]       3er lugar: el único que queda
      │      │      │      │      │      │
 [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1]
```

Así cambian `camino` y `usado` al recorrer la rama del 1:

| Paso | Acción | `camino` | `usado` (de 1, 2, 3) |
|---|---|---|---|
| 1 | elegir 1 | `[1]` | `[sí, no, no]` |
| 2 | elegir 2 (el 1 se salta) | `[1, 2]` | `[sí, sí, no]` |
| 3 | elegir 3, completo: guardo `[1, 2, 3]` | `[1, 2, 3]` | `[sí, sí, sí]` |
| 4 | deshacer 3 | `[1, 2]` | `[sí, sí, no]` |
| 5 | deshacer 2; el `for` sigue y elige 3 | `[1, 3]` | `[sí, no, sí]` |
| 6 | elegir 2, completo: guardo `[1, 3, 2]` | `[1, 3, 2]` | `[sí, sí, sí]` |
| 7 | deshacer 2, deshacer 3, deshacer 1 | `[]` | `[no, no, no]` |

En el paso 7 todo vuelve a cero, y el `for` del primer nivel pasa a elegir el 2. Sin el "deshacer" del paso 5, el 2 seguiría marcado y nunca saldría `[1, 3, 2]`.

## Errores comunes

- **No revisar si el número ya se usó.** Salen cosas como `[1, 1, 1]`: 27 resultados en vez de 6. Lo reconoces en el test de `[1, 2, 3, 4]`: el largo no es 24.
- **Olvidar desmarcar (`usado[i] = false`) al deshacer.** Los números quedan "usados" para siempre y solo sale la primera permutación, `[1, 2, 3]`.
- **Guardar `camino` sin copiar.** Todas las entradas son el mismo arreglo, que al final queda vacío: devuelves 6 veces `[]`.
- **Empezar el `for` en un índice `desde`**, como en Subsets. Solo salen los números en su orden original (`[1, 2, 3]`) y se pierden las demás permutaciones.
- **Quitar números de `nums` con `splice`** para marcar los usados y no devolverlos a su sitio. Cambias el arreglo de quien llamó y se pierden opciones. Lo reconoces en el test "no modifica el arreglo original".

## Otra forma de resolverlo

**Recursión con "el resto"**: elige cada número para el primer lugar y combínalo con todas las permutaciones de los demás, que obtienes con `filter`:

```js
export function permutaciones(nums) {
  if (nums.length === 0) return [[]];
  const resultado = [];
  for (let i = 0; i < nums.length; i++) {
    const resto = nums.filter((_, j) => j !== i);
    for (const p of permutaciones(resto)) {
      resultado.push([nums[i], ...p]);
    }
  }
  return resultado;
}
```

**Con `camino.includes(nums[i])` en vez de `usado`**: como los números son distintos, también funciona, pero cada `includes` recorre el camino (O(n)) mientras que `usado[i]` responde al instante.

**¿Cuál conviene?** Todas generan n! permutaciones de largo n, así que son O(n × n!) de tiempo y memoria para el resultado. La de "el resto" es corta y se lee casi como la definición, pero crea muchos arreglos intermedios. La de `usado` con elegir, explorar y deshacer es la plantilla de backtracking que el entrevistador espera ver, y su memoria extra es solo O(n) (el camino, `usado` y la pila de la recursión).

## Cómo explicarlo en la entrevista

> "Con n números distintos hay n factorial permutaciones, y hay que generarlas todas. Uso backtracking: armo la permutación lugar por lugar con un arreglo camino y un arreglo usado. En cada llamada recorro todos los números; si uno no está usado, lo marco y lo agrego, exploro recursivamente los lugares que faltan, y luego lo quito y lo desmarco para probar el siguiente. Cuando el camino tiene todos los números, guardo una copia. Es O(n por n factorial) de tiempo por el tamaño de la salida, y O(n) de memoria extra aparte del resultado."

## Conceptos

- **Backtracking**: construir paso a paso y retroceder para probar otras opciones.
- **Elegir, explorar, deshacer**: marcar y agregar, llamada recursiva, quitar y desmarcar.
- **Arreglo de marcas (`usado`)**: saber en O(1) si un elemento ya se tomó.
- **Factorial**: n! = n × (n - 1) × ... × 1, la cantidad de formas de ordenar n elementos distintos.
- **Permutación vs subconjunto**: en una permutación importa el orden y se usan todos; en un subconjunto no importa el orden y se eligen algunos.
