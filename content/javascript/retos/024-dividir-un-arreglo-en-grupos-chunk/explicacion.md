## Idea clave

Recorres el arreglo **saltando de `tam` en `tam`** y, en cada salto, cortas un tramo con `slice`. `slice` nunca se pasa del final, así que el último grupo incompleto sale solo, sin código extra.

## Paso a paso

1. **Crea `grupos = []`**.
2. **Recorre con `i += tam`**: `i` toma los valores 0, `tam`, `2 * tam`... mientras sea menor que el largo.
3. **Corta el tramo** con `arr.slice(i, i + tam)`: desde `i` incluido hasta `i + tam` sin incluir.
4. **Agrégalo** a `grupos` con `push`.
5. **Devuelve** `grupos`.

```js
export function partir(arr, tam) {
  const grupos = [];
  for (let i = 0; i < arr.length; i += tam) {
    grupos.push(arr.slice(i, i + tam));
  }
  return grupos;
}
```

## Por qué funciona

Recorrido con `partir([1, 2, 3, 4, 5], 2)`:

| Vuelta | `i` | `arr.slice(i, i + 2)` | `grupos` |
|---|---|---|---|
| 1 | 0 | `slice(0, 2)` = `[1, 2]` | `[[1, 2]]` |
| 2 | 2 | `slice(2, 4)` = `[3, 4]` | `[[1, 2], [3, 4]]` |
| 3 | 4 | `slice(4, 6)` = `[5]` (solo hay hasta el índice 4) | `[[1, 2], [3, 4], [5]]` |
| fin | 6 | `6 < 5` es falso | |

Con el arreglo vacío, `0 < 0` es falso desde el principio: el bucle no da ninguna vuelta y se devuelve `[]`.

`slice` no modifica el original: devuelve una copia del tramo. Por eso el arreglo de entrada queda intacto.

## Errores comunes

- **Usar `splice` en vez de `slice`.** `splice` **recorta** el arreglo original. Lo reconoces porque el test "no modifica el arreglo original" ve elementos de menos.
- **Avanzar con `i++` en vez de `i += tam`.** Creas un grupo por cada elemento, que se solapan: `[[1, 2], [2, 3], [3, 4], ...]`.
- **Confundir el segundo argumento de `slice` con una cantidad.** Es el índice **final**, no cuántos elementos. `slice(i, tam)` funciona solo en la primera vuelta. Lo reconoces porque los grupos siguientes salen vacíos.
- **Agregar el último grupo "a mano" después del bucle.** Si el largo es múltiplo de `tam`, agregas un grupo vacío de más. `slice` ya resuelve el último grupo.

## Otra forma de resolverlo

Calculando cuántos grupos habrá y armándolos con `Array.from`:

```js
export function partir(arr, tam) {
  const cantidad = Math.ceil(arr.length / tam);
  return Array.from({ length: cantidad }, (_, n) => arr.slice(n * tam, n * tam + tam));
}
```

`Math.ceil(5 / 2)` es 3: redondea hacia arriba para contar el grupo incompleto. `Array.from({ length: 3 }, fn)` crea un arreglo de 3 elementos llamando a `fn` con cada índice `n`. Conviene si te gusta el estilo sin bucles; el `for` es más directo de explicar.

## Cómo explicarlo en la entrevista

> "Avanzo de `tam` en `tam` y en cada paso corto con `slice` desde `i` hasta `i + tam`. Si me paso del final, `slice` corta donde termina, así que el último grupo puede quedar más chico sin código extra. `slice` no modifica el original. Es O(n) porque cada elemento se copia una vez. Lo uso, por ejemplo, para paginar resultados o mandar datos en lotes a una API."

## Conceptos

- **`slice(inicio, fin)`**: copia desde `inicio` hasta antes de `fin`, sin modificar el original; no falla si `fin` se pasa.
- **`splice`**: a diferencia de `slice`, **modifica** el arreglo original.
- **`for` con paso personalizado**: `i += tam` avanza de a varios.
- **`Math.ceil`**: redondea hacia arriba.
- **`Array.from({ length: n }, fn)`**: crea un arreglo de `n` elementos calculando cada uno con `fn`.
