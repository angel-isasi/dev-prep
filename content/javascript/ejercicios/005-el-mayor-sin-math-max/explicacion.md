## Idea clave

Recorres el arreglo guardando **el mayor visto hasta ahora** y lo reemplazas cada vez que aparece uno más grande. El truco está en el valor inicial: **empieza con el primer elemento**, no con `0`, para no fallar con números negativos.

## Paso a paso

1. **Toma `nums[0]` como mayor inicial**. Es un valor real de la lista, así que siempre es un candidato válido. Si el arreglo está vacío, `nums[0]` es `undefined`, que es justo lo que pide el enunciado.
2. **Recorre con `reduce`**: la función recibe `(max, n)`, el mayor hasta ahora y el número actual.
3. **Compara**: si `n > max`, el nuevo mayor es `n`; si no, sigue siendo `max`. Eso se escribe con un ternario: `n > max ? n : max`.
4. **`reduce` devuelve el último `max`**: el mayor de todos.

```js
export function mayor(nums) {
  return nums.reduce((max, n) => (n > max ? n : max), nums[0]);
}
```

## Por qué funciona

Recorrido con `mayor([3, 9, 2])`. El valor inicial es `nums[0]`, o sea `3`:

| Vuelta | `max` al entrar | `n` | `n > max` | Devuelve |
|---|---|---|---|---|
| 1 | `3` | `3` | `false` | `3` |
| 2 | `3` | `9` | `true` | `9` |
| 3 | `9` | `2` | `false` | `9` |

Resultado: `9`.

Ahora con `[-5, -2, -9]`, empezando en `-5`: `-2 > -5` es verdad, así que `max` pasa a `-2`; `-9 > -2` es falso. Resultado: `-2`. Si hubieras empezado en `0`, ningún negativo sería mayor que `0` y devolverías `0`, un número que ni siquiera está en la lista.

Con `[]`, `reduce` no da vueltas y devuelve el valor inicial: `nums[0]`, que es `undefined`. Fíjate que aquí sí le pasamos valor inicial, así que no hay error.

## Errores comunes

- **Empezar con `max = 0`.** Funciona con positivos pero falla con negativos. Lo reconoces porque el test "funciona cuando todos son negativos" recibe `0` en vez de `-2`.
- **Usar `Math.max(...nums)`.** Funciona, pero el enunciado lo prohíbe. Lo reconoces porque falla el test "no usa Math.max": ese test espía `Math.max` y revisa que nadie lo haya llamado.
- **Ordenar con `sort` y tomar el último.** Además de ser más lento (O(n log n)), `sort` sin función de comparación ordena como texto: `[10, 1, 2].sort()` da `[1, 10, 2]`, y te quedas con `2`. También modifica el original.
- **Comparar con `<` por error** (`n < max ? n : max`). Obtienes el menor: `mayor([3, 9, 2])` da `2`.
- **Olvidar el valor inicial en `reduce`**: `nums.reduce((max, n) => ...)` funciona con arreglos llenos, pero con `[]` lanza **TypeError: Reduce of empty array with no initial value**.

## Otra forma de resolverlo

Con un bucle `for` clásico, empezando desde el segundo elemento (el primero ya es el mayor inicial):

```js
export function mayor(nums) {
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i];
    }
  }
  return max;
}
```

**¿Cuál conviene?** El bucle es muy fácil de explicar en voz alta y es lo que muchos entrevistadores esperan cuando dicen "sin `Math.max`". `reduce` es más compacto. Ambos recorren una sola vez: O(n) de tiempo y O(1) de memoria extra.

## Cómo explicarlo en la entrevista

> "Recorro el arreglo guardando el mayor que he visto hasta el momento. Empiezo con el primer elemento y no con cero, porque si todos fueran negativos el cero nunca se reemplazaría y devolvería un valor que no está en la lista. En cada vuelta comparo y, si el actual es más grande, lo guardo. Es O(n) en tiempo y no uso memoria extra. Si el arreglo está vacío devuelvo `undefined`, aunque podría lanzar un error si el negocio lo pide."

## Conceptos

- **"El mejor hasta ahora"**: patrón de recorrer guardando un candidato y reemplazarlo cuando aparece uno mejor.
- **Valor inicial correcto**: debe ser un candidato válido; un valor inventado como `0` rompe casos borde.
- **`reduce` con valor inicial**: si el arreglo está vacío, devuelve ese valor sin error.
- **Operador ternario**: `n > max ? n : max` elige entre dos valores según una condición.
- **Acceso por índice**: `nums[0]` es el primer elemento; en un arreglo vacío es `undefined`.
- **Complejidad O(n)**: el tiempo crece en proporción al tamaño del arreglo, porque lo recorres una vez.
