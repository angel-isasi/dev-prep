## Idea clave

`reduce` es un bucle con una variable que acumula. Empieza con el valor `inicial` y, en cada vuelta, el callback recibe lo acumulado hasta ahora y el elemento actual, y devuelve el **nuevo** acumulado. Lo que devuelve en una vuelta es lo que recibe en la siguiente.

## Paso a paso

1. **Crea la variable que acumula** con `let acumulado = inicial`. Usa `let` porque la vas a reasignar.
2. **Recorre la lista** con un `for` clásico para tener el índice.
3. **Actualiza el acumulado** con lo que devuelve el callback: `acumulado = fn(acumulado, lista[i], i)`.
4. **Devuelve** `acumulado` cuando termina el bucle.

```js
export function reducir(lista, fn, inicial) {
  let acumulado = inicial;

  for (let i = 0; i < lista.length; i++) {
    acumulado = fn(acumulado, lista[i], i);
  }

  return acumulado;
}
```

## Por qué funciona

Recorrido con `reducir([1, 2, 3, 4], (a, b) => a * b, 1)`:

| Vuelta | `acumulado` que entra | `lista[i]` | `fn(acumulado, lista[i])` = nuevo `acumulado` |
|---|---|---|---|
| antes del bucle | | | `1` (el inicial) |
| 1 | `1` | `1` | `1 * 1 = 1` |
| 2 | `1` | `2` | `1 * 2 = 2` |
| 3 | `2` | `3` | `2 * 3 = 6` |
| 4 | `6` | `4` | `6 * 4 = 24` |

Fíjate por qué el inicial del producto es `1` y no `0`: si empezaras en `0`, todo multiplicado por `0` daría `0`. El inicial debe ser el valor "neutro" de la operación: `0` para sumar, `1` para multiplicar, `""` para unir textos, `{}` o `[]` para construir objetos o arrays.

Con un objeto como inicial (el test de contar letras), el acumulado es el **mismo objeto** en todas las vueltas: el callback le agrega claves y lo devuelve. Por eso el callback siempre debe terminar con `return conteo`.

Con `[]` el bucle no da vueltas y se devuelve `inicial` tal cual.

## Errores comunes

- **No reasignar: escribir `fn(acumulado, lista[i])` sin `acumulado = ...`.** El resultado se pierde y siempre devuelves el inicial. Lo reconoces porque recibes `1` en vez de `24`, o `0` en vez de `10`.
- **Declarar `const acumulado`.** Al reasignarlo, JavaScript lanza "TypeError: Assignment to constant variable." y todos los tests fallan con ese error.
- **Pasar los argumentos en otro orden: `fn(lista[i], acumulado)`.** Con la suma no se nota, pero en el test de contar letras el callback recibe la letra como si fuera el objeto y se rompe. El orden es siempre acumulado primero, elemento después.
- **Olvidar el índice.** El test "llama al callback con (acumulado, elemento, indice)" falla porque el tercer argumento llega como `undefined`.
- **Empezar el bucle en `i = 1`.** Te saltas el primer elemento: con la suma recibes `9` en vez de `10`.

## Otra forma de resolverlo

Con `for...of`, si no te piden pasar el índice:

```js
export function reducir(lista, fn, inicial) {
  let acumulado = inicial;
  for (const elemento of lista) {
    acumulado = fn(acumulado, elemento);
  }
  return acumulado;
}
```

Es la versión de la fuente original: más corta y muy legible, pero no le pasa el índice al callback.

**¿Cuál conviene?** En una entrevista, empieza por el `for...of` porque se entiende al instante, y menciona que el `reduce` nativo también pasa el índice y la lista. Si te lo piden, cámbialo al `for` clásico.

**Detalle avanzado:** el `reduce` nativo permite **omitir** el valor inicial. En ese caso usa el primer elemento como acumulado y empieza desde el segundo, y si el array está vacío lanza un `TypeError`. Mencionarlo muestra que conoces el método a fondo.

## Cómo explicarlo en la entrevista

> "`reduce` es un bucle con un acumulador. Arranco el acumulador con el valor inicial y, en cada elemento, llamo al callback con el acumulador, el elemento y el índice, y guardo lo que devuelve como nuevo acumulador. Al final lo devuelvo. Si el array está vacío, devuelvo el inicial. Lo importante es elegir bien el inicial: 0 para sumar, 1 para multiplicar, un objeto vacío para contar."

## Conceptos

- **Acumulador**: variable que guarda el resultado parcial mientras recorres.
- **`let` vs `const`**: `let` permite reasignar, `const` no.
- **Valor neutro**: el inicial que no altera el resultado (`0` en la suma, `1` en el producto).
- **Función de orden superior**: `reducir` recibe la regla de acumulación como función.
- **Objetos por referencia**: si el acumulado es un objeto, todas las vueltas trabajan sobre el mismo objeto.
