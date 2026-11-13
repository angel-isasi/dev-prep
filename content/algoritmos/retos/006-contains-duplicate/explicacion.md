## Idea clave

Un `Set` no guarda valores repetidos. Si conviertes el arreglo en un `Set` y queda **más chico** que el arreglo, es porque algún valor se repetía y el `Set` lo descartó.

## Paso a paso

1. **La solución directa** (dila en voz alta): comparar cada número con todos los que vienen después. Funciona sin memoria extra, pero es O(n²).

   ```js
   for (let i = 0; i < nums.length; i++) {
     for (let j = i + 1; j < nums.length; j++) {
       if (nums[i] === nums[j]) return true;
     }
   }
   return false;
   ```

2. **Una mejora intermedia**: ordenar una copia. Los repetidos quedan juntos, así que basta comparar cada número con su vecino. Cuesta O(n log n) por el ordenamiento.
3. **La mejor: un `Set`.** `new Set(nums)` recorre el arreglo una vez y guarda solo los valores distintos. Su propiedad `size` dice cuántos quedaron.
4. **Compara tamaños.** Si `size` es distinto de `nums.length`, hubo repetidos. Es O(n) de tiempo y O(n) de memoria.
5. **Si te piden cortar antes**: recorre con un bucle y un `Set` vacío; si el número ya está (`has`), devuelve `true` sin mirar el resto. En el peor caso sigue siendo O(n), pero si el duplicado aparece temprano termina mucho antes.

   ```js
   const vistos = new Set();
   for (const n of nums) {
     if (vistos.has(n)) return true;
     vistos.add(n);
   }
   return false;
   ```

La solución oficial es la de una línea:

```js
export function tieneDuplicados(nums) {
  return new Set(nums).size !== nums.length;
}
```

## Por qué funciona

Cómo queda el `Set` en cada test:

| `nums` | `new Set(nums)` | `size` | `length` | Resultado |
|---|---|---|---|---|
| `[1, 2, 3, 1]` | `{1, 2, 3}` | 3 | 4 | `true` |
| `[1, 2, 3, 4]` | `{1, 2, 3, 4}` | 4 | 4 | `false` |
| `[]` | `{}` | 0 | 0 | `false` |
| `[-1, 5, -1]` | `{-1, 5}` | 2 | 3 | `true` |
| `[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]` | `{1, 3, 4, 2}` | 4 | 10 | `true` |

Y con la versión del bucle sobre `[1, 2, 3, 1]`: guarda 1, 2 y 3; al llegar al segundo 1, `vistos.has(1)` es `true` y termina.

Ninguna de las dos versiones toca `nums`: el `Set` es una estructura nueva. Por eso pasa el test de "no modifica el arreglo".

## Errores comunes

- **Ordenar el arreglo original con `nums.sort()`.** `sort` modifica el arreglo en el lugar, así que cambias los datos de quien te llamó. Lo reconoces en el test "no modifica el arreglo original". Ordena una copia: `[...nums].sort((a, b) => a - b)`.
- **Ordenar sin comparador.** `[10, 9, 1].sort()` da `[1, 10, 9]`, porque compara como texto. Para detectar vecinos iguales no rompe, pero es un mal hábito que en otros problemas sí falla.
- **Empezar `j` en 0 en los dos bucles.** Comparas cada número consigo mismo y siempre devuelves `true`.
- **Usar `nums.indexOf(n) !== i`** dentro de un bucle. Funciona, pero `indexOf` recorre el arreglo cada vez: es O(n²) disfrazado de una línea.
- **Comparar `size` con `nums.length - 1`** o al revés. La condición correcta es "distintos" (`!==`), o "menor" (`<`).

## Otra forma de resolverlo

- **Dos bucles** (paso 1): O(n²) de tiempo, O(1) de memoria. Útil si de verdad no puedes usar memoria extra y el arreglo es chico.
- **Ordenar una copia y comparar vecinos**: O(n log n) de tiempo. Si te dejan ordenar el original, la memoria extra baja a O(1).
- **Bucle con `Set` y salida temprana** (paso 5): misma complejidad que la de una línea, pero corta en cuanto encuentra el primero. En un arreglo de un millón con el duplicado en la posición 3, hace 4 vueltas en lugar de construir todo el `Set`.

**¿Cuál conviene?** La de una línea es la más clara para mostrar que conoces `Set`. Si el entrevistador pregunta por eficiencia en la práctica, menciona la versión con salida temprana.

## Cómo explicarlo en la entrevista

> "La solución directa es comparar cada par con dos bucles, que es O(n²), u ordenar y comparar vecinos en O(n log n). Prefiero usar un Set, porque no guarda repetidos: si convierto el arreglo en Set y su tamaño es menor que el del arreglo, había duplicados. Es O(n) de tiempo y O(n) de memoria. Si quisiera cortar apenas encuentre uno, recorro agregando al Set y devuelvo true en cuanto el valor ya exista."

## Conceptos

- **`Set`**: colección de valores únicos. `add`, `has`, `delete` y la propiedad `size`.
- **`new Set(arreglo)`**: crea el `Set` a partir de un arreglo y descarta los repetidos.
- **`sort` modifica el original**: si no quieres cambiar los datos, ordena una copia con `[...arr]`.
- **Salida temprana**: devolver en cuanto conoces la respuesta.
- **Tiempo vs memoria**: el `Set` gasta O(n) de memoria para bajar el tiempo de O(n²) a O(n).
