## Idea clave

Recorre del 1 al `n` con un `for` y, para cada número, revisa las condiciones **de la más específica a la más general**: primero "múltiplo de 3 y de 5" (es decir, de 15), después de 3, después de 5. El operador `%` (resto) te dice si un número es múltiplo de otro.

## Paso a paso

1. **Crea un array vacío** con `const resultado = []`. Es `const` porque la variable siempre apunta al mismo array, aunque le agregues elementos.
2. **Recorre con `for`** desde `i = 1` mientras `i <= n`. El `<=` incluye a `n`.
3. **Pregunta por 15 primero**: `i % 15 === 0`.
4. **Luego por 3 y por 5**, con `else if` para que solo se ejecute una rama.
5. **Si no es múltiplo de nada**, agrega el número `i` tal cual.
6. **Devuelve** el array.

```js
export function fizzBuzz(n) {
  const resultado = [];

  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) resultado.push("FizzBuzz");
    else if (i % 3 === 0) resultado.push("Fizz");
    else if (i % 5 === 0) resultado.push("Buzz");
    else resultado.push(i);
  }

  return resultado;
}
```

## Por qué funciona

`a % b` es el resto de dividir `a` entre `b`. Si el resto es 0, `a` es múltiplo de `b`.

| `i` | `i % 15` | `i % 3` | `i % 5` | Se agrega |
|---|---|---|---|---|
| 3 | 3 | **0** | 3 | `"Fizz"` |
| 5 | 5 | 2 | **0** | `"Buzz"` |
| 7 | 7 | 1 | 2 | `7` |
| 15 | **0** | (no llega) | | `"FizzBuzz"` |

¿Por qué 15? Porque un número es múltiplo de 3 y de 5 a la vez exactamente cuando es múltiplo de 15 (3 y 5 no comparten divisores). Con `n = 0`, la condición `1 <= 0` es falsa desde el inicio, el bucle no da ninguna vuelta y devuelves `[]`.

## Errores comunes

- **Revisar el 3 antes que el 15.** El 15 cumple `15 % 3 === 0`, entra en `"Fizz"` y nunca llega a `"FizzBuzz"`. Lo reconoces porque en el test del 15 recibes `"Fizz"` en la última posición.
- **Usar `if` sueltos en vez de `else if`.** Para el 15 agregas tres cosas: `"FizzBuzz"`, `"Fizz"` y `"Buzz"`. El array sale más largo de lo esperado.
- **Usar `i < n`.** Te falta el último número. Falla el test de `fizzBuzz(5)` porque no aparece `"Buzz"`.
- **Empezar en `i = 0`.** `0 % 15` es 0, así que el primer elemento sale `"FizzBuzz"`.
- **Agregar el número como texto.** `resultado.push(String(i))` o `` `${i}` `` da `"1"` y no `1`. `toEqual` distingue `1` de `"1"`.

## Otra forma de resolverlo

Armando el texto por partes, sin preguntar por el 15:

```js
export function fizzBuzz(n) {
  const resultado = [];
  for (let i = 1; i <= n; i++) {
    let texto = "";
    if (i % 3 === 0) texto += "Fizz";
    if (i % 5 === 0) texto += "Buzz";
    resultado.push(texto || i);
  }
  return resultado;
}
```

Aquí sí van `if` sueltos a propósito: para el 15 se suman las dos partes y queda `"FizzBuzz"`. Al final, `texto || i` devuelve `texto` si no está vacío y `i` si lo está (el string vacío es falsy).

**¿Cuál conviene?** La primera es la más clara. La segunda es elegante y escala mejor si te piden agregar "múltiplos de 7 son Bazz": mencionarla suma puntos.

## Cómo explicarlo en la entrevista

> "Recorro del 1 al n inclusive y, para cada número, uso el operador módulo para ver si es múltiplo. El detalle es el orden: pregunto primero por 15, porque si pregunto primero por 3, el 15 entraría ahí. Uso `else if` para que solo se agregue una cosa por número. Es O(n) en tiempo y en espacio."

## Conceptos

- **Bucle `for`**: inicialización, condición y actualización (`let i = 1; i <= n; i++`).
- **Operador `%` (módulo)**: resto de la división. `a % b === 0` significa que `a` es múltiplo de `b`.
- **`if / else if / else`**: solo se ejecuta la primera rama cuya condición se cumple.
- **Orden de las condiciones**: el caso más específico va primero.
- **`push()`**: agrega un elemento al final de un array.
- **`||` como valor por defecto**: `texto || i` usa `i` si `texto` es falsy.
