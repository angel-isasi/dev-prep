## Idea clave

Recorres las posiciones que existen en **los dos** arreglos (hasta el largo del más corto) y, en cada posición `i`, armas el par `[a[i], b[i]]`. El truco con `map`: su función recibe el elemento **y su índice**, y con ese índice lees el otro arreglo.

## Paso a paso

1. **Calcula el largo del resultado**: `Math.min(a.length, b.length)`. Así nunca lees una posición que no existe.
2. **Recorta `a`** a ese largo con `slice(0, largo)`. `slice` devuelve una copia; no modifica `a`.
3. **Usa `map` con dos parámetros**: `(x, i)`. `x` es el elemento de `a` e `i` es su posición.
4. **Devuelve el par** `[x, b[i]]` en cada vuelta.

```js
export function zip(a, b) {
  const largo = Math.min(a.length, b.length);
  return a.slice(0, largo).map((x, i) => [x, b[i]]);
}
```

## Por qué funciona

Recorrido con `zip([1, 2, 3], ["a"])`:

- `largo` es `Math.min(3, 1)`, o sea `1`.
- `a.slice(0, 1)` es `[1]`.

| Vuelta | `x` | `i` | `b[i]` | Par |
|---|---|---|---|---|
| 1 | `1` | `0` | `"a"` | `[1, "a"]` |

Resultado: `[[1, "a"]]`. El `2` y el `3` nunca se procesan, porque no tienen pareja.

Con `zip(["Ana", "Luis"], [18, 15])`: `largo` es `2`, y los pares son `["Ana", 18]` (índice 0) y `["Luis", 15]` (índice 1).

Si no recortaras, en `zip([1, 2, 3], ["a"])` `map` recorrería los 3 elementos y `b[1]`, `b[2]` serían `undefined`: tendrías `[[1, "a"], [2, undefined], [3, undefined]]`.

## Errores comunes

- **No cortar en el más corto**: `a.map((x, i) => [x, b[i]])`. Lo reconoces porque el test "si el primero es más largo" recibe pares con `undefined`: `[[1, "a"], [2, undefined], [3, undefined]]`.
- **Usar solo `a.length` como límite** en el `for`. Mismo problema que el anterior.
- **Usar `Math.max` en vez de `Math.min`**: recorres el más largo y aparecen `undefined`.
- **Armar el par como objeto o texto**: `{ x, y: b[i] }` o `` `${x}${b[i]}` ``. El test espera un arreglo de dos elementos, `[x, b[i]]`.
- **Hacer `push` de dos elementos sueltos**: `pares.push(a[i], b[i])` agrega dos elementos planos en vez de un par. Recibes `["Ana", 18, "Luis", 15]` en vez de `[["Ana", 18], ["Luis", 15]]`.

## Otra forma de resolverlo

Con un `for` clásico, que deja el índice a la vista:

```js
export function zip(a, b) {
  const largo = Math.min(a.length, b.length);
  const pares = [];
  for (let i = 0; i < largo; i++) {
    pares.push([a[i], b[i]]);
  }
  return pares;
}
```

O con `Array.from`, que crea un arreglo de un largo dado y lo llena con una función:

```js
export function zip(a, b) {
  return Array.from({ length: Math.min(a.length, b.length) }, (_, i) => [a[i], b[i]]);
}
```

**¿Cuál conviene?** El `for` es el más fácil de leer y de explicar. `slice` + `map` es más compacto y muestra que sabes que `map` da el índice. `Array.from` es elegante pero menos conocido. Las tres son O(n), donde n es el largo del más corto.

## Cómo explicarlo en la entrevista

> "Primero calculo el largo del más corto con `Math.min`, porque las posiciones que sobran no tienen pareja. Después recorro hasta ese largo y en cada posición armo el par con el elemento de cada arreglo. Con `map` aprovecho que el segundo parámetro es el índice para leer el otro arreglo. No modifico los originales porque `slice` y `map` devuelven arreglos nuevos. Es O(n) sobre el más corto."

## Conceptos

- **Índice en `map`**: la función de `map` recibe `(elemento, indice, arreglo)`; casi siempre se usa solo el primero, pero el segundo es muy útil.
- **`Math.min`**: devuelve el menor de los números que le pases.
- **`slice(inicio, fin)`**: devuelve una copia de una parte del arreglo, desde `inicio` hasta antes de `fin`.
- **Arreglos anidados**: un arreglo puede contener otros arreglos, como `[["Ana", 18], ["Luis", 15]]`.
- **Acceso fuera de rango**: leer `b[5]` en un arreglo más corto no lanza error, devuelve `undefined`.
- **`Array.from({ length: n }, fn)`**: crea un arreglo de `n` elementos calculados por `fn`.
