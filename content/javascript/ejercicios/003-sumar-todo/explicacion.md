## Idea clave

Usa un **acumulador**: un total que empieza en 0 y al que le sumas cada número. `reduce` hace exactamente eso, y su segundo argumento es el valor inicial del acumulador. Sin ese valor inicial, un arreglo vacío lanza un error.

## Paso a paso

1. **Llama a `reduce` sobre `nums`** con dos argumentos: una función y el valor inicial `0`.
2. **La función recibe `(total, n)`**: `total` es lo que llevas acumulado y `n` es el número actual.
3. **Devuelve `total + n`**. Lo que devuelves pasa a ser el `total` de la siguiente vuelta.
4. **Al terminar**, `reduce` devuelve el último `total`: la suma completa.

```js
export function sumar(nums) {
  return nums.reduce((total, n) => total + n, 0);
}
```

## Por qué funciona

Recorrido con `sumar([5, 10, 15])`:

| Vuelta | `total` al entrar | `n` | Devuelve `total + n` |
|---|---|---|---|
| 1 | `0` (valor inicial) | `5` | `5` |
| 2 | `5` | `10` | `15` |
| 3 | `15` | `15` | `30` |

`reduce` devuelve `30`.

Con `[]` no hay ninguna vuelta, así que `reduce` devuelve directamente el valor inicial: `0`. Por eso ese `0` es obligatorio. Sin él, `[].reduce((t, n) => t + n)` lanza **TypeError: Reduce of empty array with no initial value**.

## Errores comunes

- **Olvidar el valor inicial** del `reduce`. Con números funciona porque toma el primer elemento como inicio, pero con `[]` lanza un TypeError. Lo reconoces porque falla solo el test "un arreglo vacío suma 0" con ese mensaje.
- **Declarar el total con `const`** en la versión con bucle: `const total = 0` y luego `total += n` lanza **TypeError: Assignment to constant variable**. Usa `let` para lo que cambia.
- **Declarar el total dentro del bucle**. Se reinicia en cada vuelta y terminas devolviendo solo el último número: `sumar([5, 10, 15])` da `15`.
- **Olvidar el `return` dentro del `reduce`** cuando usas llaves: `(total, n) => { total + n }`. La segunda vuelta recibe `undefined` como total y el resultado es `NaN`.

## Otra forma de resolverlo

Con un bucle `for...of`:

```js
export function sumar(nums) {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}
```

Es la misma idea, escrita a mano: el `let total = 0` es el valor inicial y `total += n` es lo que hace la función del `reduce`.

**¿Cuál conviene?** Las dos son O(n) y correctas. El bucle es más fácil de leer para alguien que empieza. `reduce` es más compacto y muy valorado en entrevistas; si lo usas, menciona por qué pones el `0`.

## Cómo explicarlo en la entrevista

> "Uso un acumulador que empieza en cero y le voy sumando cada número. Con `reduce` eso se escribe en una línea: la función recibe el total y el número actual y devuelve el nuevo total. Le paso `0` como valor inicial a propósito: sin él, con un arreglo vacío `reduce` lanza un error. Recorro una sola vez, así que es O(n)."

## Conceptos

- **Acumulador**: variable que guarda un resultado parcial y se actualiza en cada vuelta.
- **`reduce`**: convierte un arreglo en un solo valor; recibe `(acumulador, elemento)` y un valor inicial.
- **Valor inicial de `reduce`**: lo que vale el acumulador antes de la primera vuelta; es lo que se devuelve si el arreglo está vacío.
- **`let` vs `const`**: `const` no se puede reasignar; para un contador o un total usa `let`.
- **`+=`**: atajo de `total = total + n`.
