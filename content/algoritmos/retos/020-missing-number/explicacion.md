## Idea clave

Sabes cuánto **deberían** sumar todos los números del 0 al `n`: `n * (n + 1) / 2` (fórmula de Gauss). Si le restas lo que **de verdad** suma el arreglo, lo que queda es exactamente el número que falta. O(n) de tiempo y O(1) de memoria.

## Paso a paso

1. **La solución directa** (dila en voz alta): ordenar una copia y buscar el primer índice `i` donde `ordenado[i] !== i`. Si no hay ninguno, falta `n`. Es O(n log n) por el ordenamiento.

   ```js
   const ordenado = [...nums].sort((a, b) => a - b);
   for (let i = 0; i < ordenado.length; i++) {
     if (ordenado[i] !== i) return i;
   }
   return ordenado.length;
   ```

2. **Una mejora con memoria**: meter todo en un `Set` y preguntar por cada número del 0 al `n` si está. Es O(n) de tiempo, pero O(n) de memoria.
3. **Calcula cuánto debería sumar el rango completo.** La suma `0 + 1 + ... + n` es `n * (n + 1) / 2`. Truco para recordarla: si emparejas el primero con el último (0 + n), el segundo con el penúltimo (1 + (n - 1)), todos los pares suman `n`, y hay `(n + 1) / 2` pares.
4. **Ojo con quién es `n`**: el rango es `0..n` y el arreglo tiene `n` elementos, así que `n = nums.length`.
5. **Suma lo que hay** con `reduce`: `nums.reduce((acumulado, x) => acumulado + x, 0)`. El `0` final es el valor inicial del acumulado.
6. **Resta**: `esperado - real`. Como todos los demás números están, se cancelan, y solo queda el que falta.

```js
export function faltante(nums) {
  const n = nums.length;
  const esperado = (n * (n + 1)) / 2;
  const real = nums.reduce((acumulado, x) => acumulado + x, 0);
  return esperado - real;
}
```

## Por qué funciona

Cada test con sus sumas:

| `nums` | `n` | Esperado `n(n+1)/2` | Real | Faltante |
|---|---|---|---|---|
| `[3, 0, 1]` | 3 | 3 * 4 / 2 = 6 | 4 | **2** |
| `[0, 1]` | 2 | 2 * 3 / 2 = 3 | 1 | **2** |
| `[1, 2, 3]` | 3 | 6 | 6 | **0** |
| `[1]` | 1 | 1 * 2 / 2 = 1 | 1 | **0** |
| `[9, 6, 4, 2, 3, 5, 7, 0, 1]` | 9 | 9 * 10 / 2 = 45 | 37 | **8** |

Fíjate en `[1, 2, 3]`: las dos sumas dan 6 y la diferencia es 0. Funciona porque sumar el 0 no cambia nada: si el que falta es el 0, la suma real es igual a la esperada.

## Errores comunes

- **Usar `n = nums.length + 1`** pensando que el rango tiene `n + 1` números. La fórmula ya usa `0..n`; con eso sumarías un número de más. Lo reconoces porque todos los resultados salen corridos.
- **Olvidar el valor inicial de `reduce`.** Sin el `0`, en arreglos de un elemento funciona, pero si alguna vez el arreglo viene vacío lanza un error. Es buena costumbre ponerlo siempre.
- **Buscar con `includes` dentro de un bucle** (`for i de 0 a n: if (!nums.includes(i)) return i`). Funciona, pero `includes` recorre el arreglo: O(n²).
- **Asumir que el arreglo está ordenado** y devolver el primer `i` con `nums[i] !== i` sin ordenar. Con `[3, 0, 1]` devolverías 0.
- **Ordenar sin comparador.** Con números de dos cifras, `[10, 9, 2].sort()` da `[10, 2, 9]` y la búsqueda del hueco falla.

## Otra forma de resolverlo

**Ordenar y buscar el hueco** (paso 1): O(n log n) de tiempo. Intuitiva.

**`Set`** (paso 2): O(n) de tiempo y O(n) de memoria.

**XOR**: `a ^ a = 0` y `a ^ 0 = a`. Si haces XOR de todos los índices del 0 al `n` y de todos los valores del arreglo, cada número presente aparece dos veces y se cancela; queda solo el faltante. Es O(n) y O(1), y en lenguajes con enteros de tamaño fijo evita desbordar la suma:

```js
let resultado = nums.length;
for (let i = 0; i < nums.length; i++) {
  resultado ^= i ^ nums[i];
}
return resultado;
```

**¿Cuál conviene?** La suma de Gauss: es la más fácil de explicar. Mencionar XOR como alternativa demuestra que conoces el problema del desbordamiento, aunque en JavaScript, con números de este tamaño, no ocurre.

## Cómo explicarlo en la entrevista

> "Podría ordenar y buscar el hueco, que es O(n log n), o usar un Set, que es O(n) pero con memoria extra. Mejor uso matemática: la suma de 0 a n la conozco por la fórmula de Gauss, n por n más uno entre dos. Si le resto la suma real del arreglo, lo que queda es justo el número que falta. Es O(n) de tiempo y O(1) de memoria. Si me preocupara el desbordamiento en otro lenguaje, usaría XOR."

## Conceptos

- **Fórmula de Gauss**: `0 + 1 + ... + n = n(n + 1) / 2`.
- **`reduce`**: recorre el arreglo acumulando un resultado; el segundo argumento es el valor inicial.
- **Cancelación**: restar el total esperado menos el real deja solo lo que falta.
- **XOR (`^`)**: un número XOR él mismo da 0; sirve para encontrar el único valor sin pareja.
- **Desbordamiento (overflow)**: en otros lenguajes, una suma muy grande puede exceder el tamaño del entero.
