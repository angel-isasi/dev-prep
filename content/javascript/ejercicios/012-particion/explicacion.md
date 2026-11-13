## Idea clave

Recibes la condición como **función** (`cumple`) y la llamas con cada elemento. Según lo que responda, el elemento va a una de dos listas. Como la condición viene de afuera, tu función sirve para cualquier criterio: eso es lo que la vuelve reutilizable.

## Paso a paso

1. **Crea dos arreglos vacíos**: `si` para los que cumplen y `no` para los que no.
2. **Recorre la lista una vez** con `for...of`.
3. **Llama a la condición**: `cumple(item)`. No sabes qué hace por dentro, solo que devuelve verdadero o falso.
4. **Reparte**: si es verdadero, `si.push(item)`; si no, `no.push(item)`.
5. **Devuelve los dos grupos** dentro de un arreglo: `[si, no]`.

```js
export function particion(lista, cumple) {
  const si = [];
  const no = [];

  for (const item of lista) {
    if (cumple(item)) {
      si.push(item);
    } else {
      no.push(item);
    }
  }

  return [si, no];
}
```

## Por qué funciona

Recorrido con `particion([11, 18, 20, 9], (nota) => nota >= 11)`:

| `item` | `cumple(item)` | `si` | `no` |
|---|---|---|---|
| `11` | `true` | `[11]` | `[]` |
| `18` | `true` | `[11, 18]` | `[]` |
| `20` | `true` | `[11, 18, 20]` | `[]` |
| `9` | `false` | `[11, 18, 20]` | `[9]` |

Se devuelve `[[11, 18, 20], [9]]`.

Como `push` agrega al final y recorres en orden, cada grupo conserva el orden original. Con una lista vacía, el bucle no da vueltas y devuelves `[[], []]`, los dos arreglos que creaste al inicio.

Fíjate en que `particion` no sabe nada de notas: la misma función, con `(palabra) => palabra.length > 3`, separa palabras largas de cortas.

## Errores comunes

- **Usar `filter` dos veces**: `[lista.filter(cumple), lista.filter((x) => !cumple(x))]`. Da el resultado correcto, pero recorre la lista dos veces y llama a `cumple` el doble. Lo reconoces porque falla "llama a la condición una vez por elemento": recibe `6` llamadas en vez de `3`.
- **Escribir `cumple` sin paréntesis**: `if (cumple)` pregunta si la función existe (siempre es verdad), no la ejecuta. Todo cae en el primer grupo: recibes `[[11, 18, 20, 9], []]`.
- **Devolver los grupos sueltos**: `return si, no` no devuelve dos cosas; el operador coma devuelve solo `no`. Recibes `[9]`. Para devolver varios valores, ponlos en un arreglo.
- **Devolver solo un grupo**, olvidando el otro. Lo reconoces porque el test muestra un solo nivel de corchetes.
- **Crear `si` y `no` fuera de la función**, arriba del archivo. La primera llamada sale bien, pero las siguientes siguen agregando a los mismos arreglos. Lo reconoces porque el primer test pasa y los demás reciben elementos de tests anteriores, como `[[11, 18, 20, "luna"], [9, "sol", "mar"]]`.

## Otra forma de resolverlo

Con `reduce`, acumulando los dos grupos a la vez:

```js
export function particion(lista, cumple) {
  return lista.reduce(
    ([si, no], item) => (cumple(item) ? [[...si, item], no] : [si, [...no, item]]),
    [[], []],
  );
}
```

El acumulador es el par `[si, no]`, que empieza en `[[], []]`. En cada vuelta se devuelve un par nuevo con el elemento agregado al grupo que corresponde.

**¿Cuál conviene?** El `for...of` es más claro, más fácil de explicar y más eficiente: con `reduce` y spread creas arreglos nuevos en cada vuelta. Esta versión sirve para mostrar que dominas `reduce` y la desestructuración, pero en una entrevista prefiere el bucle.

## Cómo explicarlo en la entrevista

> "Recibo la condición como un callback, así la función sirve para cualquier criterio. Creo dos arreglos vacíos, recorro la lista una sola vez, llamo al callback con cada elemento y lo meto en uno u otro según lo que devuelva. Al final devuelvo los dos en un arreglo. Es O(n) y llamo a la condición exactamente una vez por elemento. Con dos `filter` también saldría, pero recorrería la lista dos veces."

## Conceptos

- **Callback**: una función que pasas como argumento para que otra función la llame.
- **Funciones como valores**: en JavaScript una función se puede guardar, pasar y devolver como cualquier dato.
- **Función de orden superior**: una función que recibe o devuelve otras funciones, como `particion`, `map` o `filter`.
- **Devolver varios valores**: se agrupan en un arreglo (`[si, no]`) o en un objeto.
- **Desestructuración**: `const [aprobados, desaprobados] = particion(...)` saca cada grupo en su propia variable.
- **Truthy**: cualquier valor que cuenta como verdadero en un `if`, no solo `true`.
