## Idea clave

`curried` va **juntando argumentos** en un closure. Cada llamada compara cuántos lleva con `fn.length`: si ya alcanzan, ejecuta `fn`; si no, devuelve una función nueva que recordará los argumentos juntados hasta ahora y esperará el resto.

## Paso a paso

1. **Devuelve una función con nombre**, `curried`, que recibe `...args`. El nombre te permite llamarla desde dentro de sí misma.
2. **Compara** `args.length >= fn.length`. `fn.length` es cuántos parámetros declaró `fn` (3 en `(a, b, c) => ...`).
3. **Si alcanzan**, ejecuta `fn.apply(this, args)` y devuelve el resultado.
4. **Si faltan**, devuelve una flecha que recibe `...mas` y llama otra vez a `curried` con `[...args, ...mas]`. Esa flecha recuerda `args` gracias al closure.
5. Como `[...args, ...mas]` crea un arreglo **nuevo**, cada función parcial guarda sus propios argumentos y se puede reutilizar.

```js
export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...mas) => curried.apply(this, [...args, ...mas]);
  };
}
```

## Por qué funciona

Recorrido con `sumar3(1)(2, 3)`, donde `fn.length` es 3:

| Llamada | `args` | `args.length >= 3` | Devuelve |
|---|---|---|---|
| `sumar3(1)` | `[1]` | no | flecha A, que recuerda `[1]` |
| `A(2, 3)` | llama `curried(1, 2, 3)` | | |
| `curried(1, 2, 3)` | `[1, 2, 3]` | sí | `fn(1, 2, 3)` = 6 |

Y la reutilización: `const sumar10 = sumar3(4, 6)` devuelve una flecha que recuerda `[4, 6]`. Al llamar `sumar10(1)` se arma `[4, 6, 1]`, un arreglo nuevo, y `[4, 6]` queda intacto. Por eso `sumar10(5)` arma `[4, 6, 5]` sin rastro del `1` anterior.

## Errores comunes

- **Ir agregando a un arreglo compartido con `push`.** Si guardas todos los argumentos en un único arreglo fuera de `curried`, la segunda vez que usas `sumar10` arrastras los argumentos de la primera. Lo reconoces porque falla el test de reutilización.
- **Comparar con `===` en vez de `>=`.** Si alguien pasa argumentos de más, `fn` nunca se ejecuta y recibes una función en vez de un número.
- **Devolver `curried(...mas)` en lugar de juntar los argumentos.** Pierdes los anteriores: `sumar3(1)(2)` se comporta como `sumar3(2)`.
- **Ejecutar con `fn(args)` en vez de `fn(...args)`.** Le pasas un arreglo como primer argumento. Lo reconoces porque recibes algo como `"1,2,3undefinedundefined"`.
- **Funciones con parámetros por defecto o rest.** `fn.length` solo cuenta los parámetros antes del primero con valor por defecto: `((a, b = 1) => {}).length` es 1. No es un error tuyo, pero conviene saberlo si te lo preguntan.

## Otra forma de resolverlo

Recibiendo la cantidad de argumentos como parámetro opcional, para funciones donde `fn.length` no sirve (parámetros rest o por defecto):

```js
export function curry(fn, cantidad = fn.length) {
  return function curried(...args) {
    if (args.length >= cantidad) return fn(...args);
    return (...mas) => curried(...args, ...mas);
  };
}

const sumarTodos = curry((...nums) => nums.reduce((a, b) => a + b, 0), 3);
sumarTodos(1)(2)(3); // 6
```

Conviene cuando `fn` usa `...nums`, porque su `length` es 0 y se ejecutaría de inmediato. Aquí también se ve que, si no necesitas `this`, puedes usar spread en lugar de `apply`: el resultado es el mismo y se lee más simple.

## Cómo explicarlo en la entrevista

> "`fn.length` me dice cuántos parámetros espera la función. Devuelvo una función con nombre, `curried`, que junta argumentos. Si con lo que llevo ya alcanzan, ejecuto `fn`; si no, devuelvo otra función que, cuando la llamen, junta los argumentos viejos con los nuevos en un arreglo nuevo y vuelve a llamar a `curried`. Como cada paso crea un arreglo nuevo, las funciones parciales se pueden reutilizar sin mezclarse. Sirve para crear funciones especializadas, como un `multiplicar(1.18)` para el IGV."

## Conceptos

- **Currying**: transformar `f(a, b, c)` en algo que se puede llamar como `f(a)(b)(c)`.
- **Aplicación parcial**: fijar algunos argumentos ahora y recibir el resto después.
- **`fn.length`**: cantidad de parámetros declarados, sin contar rest ni los que vienen desde el primer valor por defecto.
- **Expresión de función con nombre**: `function curried() {}` puede llamarse a sí misma por su nombre.
- **Closure**: cada función parcial recuerda los `args` que juntó.
- **Spread `[...a, ...b]`**: crea un arreglo nuevo con los elementos de ambos.
