## Idea clave

Como las dos listas están ordenadas, el siguiente nodo del resultado siempre es **la menor de las dos cabezas**. La enganchas, avanzas en esa lista y repites. Un **nodo ficticio** al inicio evita tratar aparte el primer elemento, y cuando una lista se acaba, enganchas el resto de la otra de una sola vez.

## Paso a paso

1. **La solución directa** (dila en voz alta): pasar los valores de las dos listas a un arreglo, ordenarlo y construir una lista nueva. Funciona, pero es O((n + m) log(n + m)) por el ordenamiento, usa memoria extra y no aprovecha que ya venían ordenadas.

   ```js
   const valores = [...aArreglo(a), ...aArreglo(b)].sort((x, y) => x - y);
   return valores.reduceRight((next, val) => ({ val, next }), null);
   ```

2. **Aprovecha el orden.** El menor de todos está en `a` o en `b` (las cabezas). Comparas `a.val` con `b.val` y te quedas con el menor.
3. **El nodo ficticio.** Creas `inicio = { val: 0, next: null }` y una `cola` que apunta al último nodo del resultado. Así, enganchar siempre es `cola.next = nodo`, incluso la primera vez. Al final devuelves `inicio.next`, saltándote el ficticio.
4. **Engancha y avanza**: si `a.val <= b.val`, `cola.next = a` y `a = a.next`; si no, lo mismo con `b`. Luego `cola = cola.next`.
5. **Cuando una se acaba**, el `while (a && b)` termina. Lo que queda de la otra ya está ordenado y es mayor que todo lo enganchado: `cola.next = a || b` lo engancha entero en un paso.
6. **Casos vacíos gratis**: si `a` es `null`, el `while` no entra y `cola.next = b`. Si las dos son `null`, `inicio.next` queda `null`.

```js
export function unir(a, b) {
  const inicio = { val: 0, next: null };
  let cola = inicio;

  while (a && b) {
    if (a.val <= b.val) {
      cola.next = a;
      a = a.next;
    } else {
      cola.next = b;
      b = b.next;
    }
    cola = cola.next;
  }

  cola.next = a || b;
  return inicio.next;
}
```

## Por qué funciona

Recorrido con `a = 1 -> 2 -> 4` y `b = 1 -> 3 -> 4`:

| Vuelta | `a.val` | `b.val` | Se engancha | Resultado (sin el ficticio) |
|---|---|---|---|---|
| 1 | 1 | 1 | `a` (1 <= 1) | `1` |
| 2 | 2 | 1 | `b` | `1 -> 1` |
| 3 | 2 | 3 | `a` | `1 -> 1 -> 2` |
| 4 | 4 | 3 | `b` | `1 -> 1 -> 2 -> 3` |
| 5 | 4 | 4 | `a` (4 <= 4) | `1 -> 1 -> 2 -> 3 -> 4` |
| fin | `null` | 4 | `cola.next = b` | `1 -> 1 -> 2 -> 3 -> 4 -> 4` |

En la vuelta 5, `a` se queda sin nodos y el bucle termina. El 4 de `b` se engancha con la última línea, sin compararlo con nada.

Con `<=`, en caso de empate se engancha primero el nodo de `a`. Eso hace la mezcla **estable** (respeta el orden original entre iguales) y es lo que comprueba el último test con `toBe(a)`.

## Errores comunes

- **No usar nodo ficticio y olvidar el caso del primer nodo.** Sin él, necesitas decidir aparte cuál es la cabeza del resultado; es fácil dejar `cabeza` en `null` o perder el primer nodo.
- **Devolver `inicio` en vez de `inicio.next`.** El resultado empieza con un 0 que no existía. Lo reconoces porque todas las listas empiezan con 0.
- **Olvidar enganchar el resto** (`cola.next = a || b`). Pierdes los últimos nodos de la lista más larga. Lo reconoces en el test de "largos distintos".
- **Olvidar avanzar `cola`.** Cada nodo nuevo reemplaza al anterior en `cola.next` y el resultado tiene un solo nodo.
- **Comparar los nodos en vez de sus valores** (`a <= b`). Comparar objetos así no tiene sentido y el resultado sale desordenado.

## Otra forma de resolverlo

**Pasar a arreglo y ordenar** (paso 1): O((n + m) log(n + m)) de tiempo y O(n + m) de memoria. Ignora que las listas ya estaban ordenadas.

**Recursión**: la cabeza del resultado es la menor de las dos, y su `next` es la unión del resto. Corta y elegante, pero usa O(n + m) de memoria por la pila de llamadas:

```js
function unir(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.val <= b.val) {
    a.next = unir(a.next, b);
    return a;
  }
  b.next = unir(a, b.next);
  return b;
}
```

**¿Cuál conviene?** La iterativa con nodo ficticio: O(n + m) de tiempo, O(1) de memoria extra y sin riesgo de desbordar la pila. Este mismo paso de "mezclar dos ordenados" es el corazón de **merge sort**.

## Cómo explicarlo en la entrevista

> "Como las dos listas están ordenadas, el siguiente nodo del resultado siempre es la menor de las dos cabezas. Uso un nodo ficticio al inicio para no tratar aparte el primer elemento, y una cola que apunta al último nodo enganchado. Comparo las cabezas, engancho la menor y avanzo en esa lista. Cuando una se acaba, engancho lo que queda de la otra, que ya está ordenado. Es O(n + m) de tiempo y O(1) de memoria extra, porque reutilizo los nodos."

## Conceptos

- **Nodo ficticio (dummy node)**: un nodo de apoyo al inicio que simplifica los casos borde; se devuelve `ficticio.next`.
- **Puntero de cola**: referencia al último nodo para enganchar en O(1).
- **Mezcla (merge)**: combinar dos secuencias ordenadas en una; es la base de merge sort.
- **Estabilidad**: con `<=`, los iguales mantienen su orden original.
- **`a || b`**: devuelve el primero que no sea `null`.
