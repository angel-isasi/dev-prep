## Idea clave

`map` **transforma** cada elemento de un arreglo y devuelve un arreglo **nuevo** con los resultados, sin tocar el original. Es la herramienta exacta para "haz esto con cada elemento".

## Paso a paso

1. **Llama a `map` sobre `nums`**. `map` recibe una función y la ejecuta una vez por cada elemento.
2. **En esa función, devuelve `n * 2`**. Lo que devuelves en cada vuelta es lo que se guarda en esa posición del arreglo nuevo.
3. **Devuelve lo que te da `map`**. Ese ya es el arreglo nuevo, del mismo tamaño y en el mismo orden.

```js
export function duplicar(nums) {
  return nums.map((n) => n * 2);
}
```

## Por qué funciona

Recorrido con `duplicar([1, 2, 3])`:

| Vuelta | `n` | Lo que devuelve la flecha | Arreglo nuevo hasta ahora |
|---|---|---|---|
| 1 | `1` | `2` | `[2]` |
| 2 | `2` | `4` | `[2, 4]` |
| 3 | `3` | `6` | `[2, 4, 6]` |

El arreglo original `[1, 2, 3]` nunca se modificó: `map` crea uno aparte y lo va llenando.

Con `[]`, `map` no da ninguna vuelta y devuelve `[]`. No necesitas un `if` para ese caso.

La flecha `(n) => n * 2` sin llaves tiene **retorno implícito**: devuelve directamente `n * 2`. Si le pones llaves, `(n) => { n * 2 }`, ya no devuelve nada.

## Errores comunes

- **Poner llaves en la flecha sin `return`**: `nums.map((n) => { n * 2 })`. Cada vuelta devuelve `undefined`. Lo reconoces porque el test recibe `[undefined, undefined, undefined]`.
- **Usar `forEach` en vez de `map`**. `forEach` recorre pero siempre devuelve `undefined`. Lo reconoces porque todos los tests reciben `undefined`.
- **Modificar el original**: un `for` que hace `nums[i] = nums[i] * 2` y luego `return nums`. Los primeros tests pasan, pero falla "no modifica el arreglo original": `notas` termina valiendo `[20, 24]`.
- **Olvidar el `return` de la función**: escribes `nums.map(...)` pero no lo devuelves. La función devuelve `undefined` y fallan todos los tests.

## Otra forma de resolverlo

Con un bucle `for...of` y un arreglo nuevo que vas llenando con `push`:

```js
export function duplicar(nums) {
  const resultado = [];
  for (const n of nums) {
    resultado.push(n * 2);
  }
  return resultado;
}
```

Hace exactamente lo mismo que `map`, solo que a mano: creas el arreglo vacío, recorres, agregas y devuelves.

**¿Cuál conviene?** `map` es lo que se espera en código moderno y en React: es más corto y deja claro que estás transformando. El bucle es útil para entender qué hace `map` por dentro, y es una buena respuesta si te piden "hazlo sin métodos de array".

## Cómo explicarlo en la entrevista

> "Como necesito transformar cada elemento y obtener una lista del mismo tamaño, uso `map`. Por cada número devuelvo el número por dos, y `map` me arma un arreglo nuevo, así que el original no se modifica. Recorro la lista una sola vez, así que es O(n). Si no pudiera usar `map`, haría un `for` con un arreglo vacío y `push`."

## Conceptos

- **`map`**: recorre un arreglo y devuelve uno nuevo con lo que devuelve la función en cada elemento.
- **Función flecha**: `(n) => n * 2` es una función corta; sin llaves devuelve el valor automáticamente.
- **Inmutabilidad**: no cambiar los datos que recibes, sino devolver datos nuevos. Evita errores difíciles de rastrear y es la base de cómo React detecta cambios.
- **Referencia**: dos variables pueden apuntar al mismo arreglo; `toBe` compara si son el mismo arreglo, `toEqual` si tienen el mismo contenido.
- **`push`**: agrega un elemento al final de un arreglo.
