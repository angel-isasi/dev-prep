## Idea clave

Un `Set` es una colección que **no guarda repetidos** y que responde "¿está este valor?" de forma **inmediata** con `has`. Lo usas dos veces: para quitar los duplicados de `a` y para buscar rápido en `b`. Luego filtras.

## Paso a paso

1. **Convierte `b` en un Set**: `const enB = new Set(b)`. Así, preguntar `enB.has(x)` no recorre nada.
2. **Quita los repetidos de `a`** manteniendo su orden: `new Set(a)` elimina duplicados y `[...]` lo vuelve a convertir en arreglo. Un Set conserva el orden en que se insertaron los valores.
3. **Filtra**: quédate con los `x` de ese arreglo para los que `enB.has(x)` es `true`.
4. **Devuelve** el resultado. `filter` crea un arreglo nuevo, y `new Set(...)` no toca los originales.

```js
export function interseccion(a, b) {
  const enB = new Set(b);
  const aSinRepetir = [...new Set(a)];
  return aSinRepetir.filter((x) => enB.has(x));
}
```

## Por qué funciona

Recorrido con `interseccion([1, 2, 2, 3], [2, 3, 4])`:

- `enB` es el Set `{2, 3, 4}`.
- `new Set([1, 2, 2, 3])` es `{1, 2, 3}`, y `[...]` lo convierte en `[1, 2, 3]`.

| `x` | `enB.has(x)` | ¿Se queda? |
|---|---|---|
| `1` | `false` | no |
| `2` | `true` | sí |
| `3` | `true` | sí |

Resultado: `[2, 3]`. El `2` repetido ya no aparece dos veces, porque lo quitaste en el paso 2.

**¿Por qué Set y no `includes`?** `b.includes(x)` recorre `b` desde el inicio cada vez. Si `a` y `b` tienen 10 000 elementos, eso son hasta 100 millones de comparaciones (O(n · m)). Con un Set, `has` es prácticamente inmediato, y el total queda en O(n + m).

## Errores comunes

- **No quitar los repetidos de `a`**: `a.filter((x) => b.includes(x))`. Lo reconoces porque el primer test recibe `[2, 2, 3]` en vez de `[2, 3]`.
- **Recorrer `b` en vez de `a`**: el resultado sale en el orden de `b`. Lo reconoces en el test "respeta el orden del primer arreglo" si recibes `[1, 2, 3]` en vez de `[3, 1, 2]`.
- **Devolver el Set sin convertirlo**: `new Set(...)` no es un arreglo. El test muestra que recibió un `Set {...}` y esperaba `[...]`. Usa `[...set]` o `Array.from(set)`.
- **Usar `enB.includes(x)`**: los Set no tienen `includes`, tienen `has`. Lanza **TypeError: enB.includes is not a function**.
- **Usar `indexOf(x) > 0`** para saber si está: el índice `0` también es válido, así que el primer elemento de `b` nunca cuenta. Debe ser `!== -1` (o mejor, `includes`).

## Otra forma de resolverlo

Sin Set para la búsqueda, usando `includes` y evitando duplicados a mano:

```js
export function interseccion(a, b) {
  const resultado = [];
  for (const x of a) {
    if (b.includes(x) && !resultado.includes(x)) {
      resultado.push(x);
    }
  }
  return resultado;
}
```

Por cada `x` de `a`, se agrega si está en `b` y si todavía no está en el resultado.

**¿Cuál conviene?** El bucle con `includes` es fácil de leer y está bien para listas pequeñas, pero es O(n · m). La versión con Set es O(n + m) y es la que un entrevistador quiere ver cuando pregunta "¿y si las listas fueran muy grandes?". Empieza por la que te salga y luego menciona la optimización.

## Cómo explicarlo en la entrevista

> "Convierto el segundo arreglo en un Set para poder preguntar si contiene un valor en tiempo constante. Al primero también lo paso por un Set para quitarle los repetidos, y lo vuelvo a arreglo con el spread, que conserva el orden. Después filtro: me quedo con los que están en el Set del segundo. Queda en O(n + m). Con `includes` sería O(n por m), porque cada búsqueda recorre el arreglo completo."

## Conceptos

- **`Set`**: colección de valores únicos; si agregas un repetido, lo ignora.
- **`has`**: pregunta si un valor está en el Set; es mucho más rápido que buscar en un arreglo.
- **`[...new Set(arr)]`**: el truco estándar para quitar duplicados de un arreglo conservando el orden.
- **`filter`**: se queda con los elementos que cumplen la condición.
- **`includes`**: busca un valor en un arreglo recorriéndolo de principio a fin.
- **Complejidad O(n · m) vs O(n + m)**: multiplicar los tamaños crece muchísimo más rápido que sumarlos.
