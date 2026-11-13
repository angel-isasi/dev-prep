## Idea clave

El **parámetro rest** (`...numeros`) junta todos los argumentos que recibe la función en un array. Con eso, sumar "cualquier cantidad de números" se vuelve sumar un array normal.

## Paso a paso

1. **Declara el parámetro con tres puntos**: `function sumarTodos(...numeros)`. Si llamas `sumarTodos(1, 2, 3)`, dentro de la función `numeros` es `[1, 2, 3]`.
2. **Crea el acumulador** con `let suma = 0`.
3. **Recorre** el array con `for...of` y suma cada número.
4. **Devuelve** la suma. Si no llegó ningún argumento, `numeros` es `[]`, el bucle no da vueltas y se devuelve `0`.

```js
export function sumarTodos(...numeros) {
  let suma = 0;

  for (const numero of numeros) {
    suma += numero;
  }

  return suma;
}
```

## Por qué funciona

| Llamada | `numeros` dentro de la función | Devuelve |
|---|---|---|
| `sumarTodos(1, 2, 3)` | `[1, 2, 3]` | `6` |
| `sumarTodos(10)` | `[10]` | `10` |
| `sumarTodos()` | `[]` | `0` |
| `sumarTodos(...[12, 15, 18])` | `[12, 15, 18]` | `45` |

En la última fila pasan **dos cosas opuestas**: al llamar, el **spread** (`...notas`) desarma el array en argumentos sueltos, como si escribieras `sumarTodos(12, 15, 18)`. Al recibir, el **rest** (`...numeros`) los vuelve a juntar en un array. Los tres puntos son iguales, pero el lugar decide: en los parámetros es rest; en una llamada o dentro de `[]`/`{}` es spread.

## Errores comunes

- **Declarar `sumarTodos(numeros)` sin los tres puntos.** `numeros` recibe solo el primer argumento (`1`), y `for...of` sobre un número lanza `TypeError: numeros is not iterable`.
- **Llamar con el array sin spread.** `sumarTodos([1, 2, 3])` hace que `numeros` sea `[[1, 2, 3]]`: un array con un array dentro. La suma da `"01,2,3"`, porque `0 + [1, 2, 3]` convierte el array en texto y concatena.
- **Poner el rest en medio.** `function f(...a, b)` es un error de sintaxis: el rest siempre va **al final** y solo puede haber uno.
- **Usar `arguments`.** Funciona en funciones normales, pero no es un array de verdad (no tiene `map` ni `reduce`) y no existe en funciones flecha. El rest lo reemplaza.

## Otra forma de resolverlo

Con `reduce`, en una línea y como función flecha:

```js
export const sumarTodos = (...numeros) => numeros.reduce((suma, n) => suma + n, 0);
```

El `0` del final es el valor inicial: sin él, `reduce` sobre un array vacío lanza `TypeError: Reduce of empty array with no initial value`.

**¿Cuál conviene?** Las dos son correctas. El `for...of` es más fácil de explicar; el `reduce` es más idiomático. Lo importante aquí es el `...numeros`.

## Cómo explicarlo en la entrevista

> "Uso un parámetro rest, `...numeros`, que junta todos los argumentos en un array real, vacío si no llega ninguno. Después solo sumo el array. Rest y spread usan los mismos tres puntos pero hacen lo contrario: rest junta argumentos en un array al definir la función, spread desarma un array en argumentos al llamarla."

## Conceptos

- **Parámetro rest (`...nombre`)**: junta los argumentos restantes en un array. Va al final y solo uno.
- **Spread (`...array`)**: desarma un array (o iterable) en elementos sueltos, al llamar una función o dentro de `[]`.
- **`arguments`**: objeto antiguo con los argumentos; no es array y no existe en funciones flecha.
- **Acumulador con `for...of`**: patrón básico para sumar.
- **`reduce` con valor inicial**: convierte un array en un solo valor; el valor inicial evita el error con arrays vacíos.
