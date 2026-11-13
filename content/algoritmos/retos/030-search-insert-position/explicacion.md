## Idea clave

"Dónde está" y "dónde lo insertaría" son la misma pregunta: **el primer índice cuyo valor es mayor o igual al objetivo**. Lo encuentras con una búsqueda binaria que no se detiene al ver el valor, sino que achica el rango hasta que los dos punteros se juntan en esa posición.

## Paso a paso

1. **La solución directa** (dila en voz alta): recorrer el arreglo y devolver el primer `i` con `nums[i] >= objetivo`; si no hay ninguno, `nums.length`. Es O(n).

   ```js
   for (let i = 0; i < nums.length; i++) {
     if (nums[i] >= objetivo) return i;
   }
   return nums.length;
   ```

2. **Aprovecha el orden con búsqueda binaria**: O(log n).
3. **Usa un rango semiabierto** `[izq, der)`: `izq` incluido, `der` excluido. Empiezas con `izq = 0` y `der = nums.length`. Así `der` puede valer "una posición después del último", que es justo la respuesta cuando el objetivo es mayor que todos.
4. **Decide con el medio**:
   - Si `nums[medio] < objetivo`, ese medio y todo lo que está a su izquierda son demasiado chicos. La respuesta está a la derecha: `izq = medio + 1`.
   - Si `nums[medio] >= objetivo`, el medio **podría** ser la respuesta (es mayor o igual), pero quizás haya uno anterior que también lo sea. Lo conservas: `der = medio` (no `medio - 1`).
5. **Repite mientras `izq < der`.** Cuando se juntan, el rango tiene un solo candidato posible y ese es la respuesta. Devuelve `izq`.
6. **Por qué no hay bucle infinito**: `medio` siempre es menor que `der` (por el `Math.floor`), así que `der = medio` achica el rango, y `izq = medio + 1` también.

```js
export function posicionInsertar(nums, objetivo) {
  let izq = 0;
  let der = nums.length;

  while (izq < der) {
    const medio = Math.floor((izq + der) / 2);
    if (nums[medio] < objetivo) izq = medio + 1;
    else der = medio;
  }

  return izq;
}
```

## Por qué funciona

Recorrido con `posicionInsertar([1, 3, 5, 6], 2)`:

| `izq` | `der` | `medio` | `nums[medio]` | Decisión |
|---|---|---|---|---|
| 0 | 4 | 2 | 5 | 5 >= 2: `der = 2` |
| 0 | 2 | 1 | 3 | 3 >= 2: `der = 1` |
| 0 | 1 | 0 | 1 | 1 < 2: `izq = 1` |
| 1 | 1 | | | se juntan: devuelve **1** |

Y con un objetivo mayor que todos, `posicionInsertar([1, 3, 5, 6], 7)`:

| `izq` | `der` | `medio` | `nums[medio]` | Decisión |
|---|---|---|---|---|
| 0 | 4 | 2 | 5 | 5 < 7: `izq = 3` |
| 3 | 4 | 3 | 6 | 6 < 7: `izq = 4` |
| 4 | 4 | | | se juntan: devuelve **4** |

`der` empezó en 4 (`nums.length`), y por eso la respuesta "al final" es posible. Con el arreglo vacío, `izq = der = 0` desde el inicio y devuelve 0 sin entrar al bucle.

## Errores comunes

- **Empezar con `der = nums.length - 1`.** Nunca puedes devolver `nums.length`: con 7 devolverías 3 en vez de 4. Lo reconoces en el test "mayor que todos".
- **Usar `der = medio - 1`** en esta versión. Puedes descartar el medio aunque sea la respuesta: con `[1, 3, 5, 6]` y 4, te quedarías en el índice equivocado.
- **Usar `while (izq <= der)` con `der = medio`.** Cuando `izq === der`, `medio` vale lo mismo y `der = medio` no cambia nada: bucle infinito.
- **Copiar la búsqueda binaria clásica y devolver -1** cuando no lo encuentra. Aquí "no está" también tiene respuesta.
- **Devolver `medio`** en vez de `izq` al final. `medio` es una variable del bucle (y con `const` ni siquiera existe afuera).

## Otra forma de resolverlo

**Recorrido lineal** (paso 1): O(n) de tiempo, O(1) de memoria. Correcto y simple; con arreglos chicos es perfectamente válido.

**Búsqueda binaria clásica con rango cerrado** (la de Binary Search, con `izq <= der`): si encuentra el valor, lo devuelve; si no, al terminar `izq` queda justo en la posición de inserción. También es O(log n):

```js
let izq = 0;
let der = nums.length - 1;
while (izq <= der) {
  const medio = Math.floor((izq + der) / 2);
  if (nums[medio] === objetivo) return medio;
  if (nums[medio] < objetivo) izq = medio + 1;
  else der = medio - 1;
}
return izq;
```

**¿Cuál conviene?** Las dos versiones binarias son O(log n) y O(1) de memoria. La semiabierta es la plantilla de "primer elemento que cumple una condición", que te sirve para muchos otros problemas. La cerrada es útil si ya la tienes memorizada de Binary Search: solo cambias el `return -1` por `return izq`.

## Cómo explicarlo en la entrevista

> "Es una búsqueda binaria que busca el primer índice cuyo valor sea mayor o igual al objetivo, porque esa es la respuesta tanto si está como si no. Uso el rango semiabierto, con der igual al largo, para que también cubra el caso de insertar al final. Si el medio es menor que el objetivo, descarto la izquierda; si no, el medio puede ser la respuesta y lo conservo. Cuando los punteros se encuentran, esa es la posición. Es O(log n) de tiempo y O(1) de memoria."

## Conceptos

- **Búsqueda binaria de límite inferior (lower bound)**: encontrar el primer índice que cumple `nums[i] >= objetivo`.
- **Rango semiabierto `[izq, der)`**: `der` no está incluido; permite representar "después del último".
- **Conservar el candidato**: `der = medio` en vez de `medio - 1` cuando el medio podría ser la respuesta.
- **Condición de parada**: con rango semiabierto, `izq < der`; con rango cerrado, `izq <= der`.
- **O(log n)**: cada vuelta descarta la mitad del rango.
