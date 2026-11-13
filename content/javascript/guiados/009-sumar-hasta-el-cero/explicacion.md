## Idea clave

Dentro de un bucle, **`break` sale del bucle** por completo y **`continue` salta a la siguiente vuelta** sin ejecutar lo que queda del cuerpo. Con eso, el 0 corta el recorrido y los negativos se ignoran.

## Paso a paso

1. **Crea el acumulador** con `let suma = 0`.
2. **Recorre** con `for...of`, que te da cada número.
3. **Si es 0, `break`**: sales del bucle y no se mira nada más.
4. **Si es negativo, `continue`**: saltas a la siguiente vuelta sin sumar.
5. **Si llegaste hasta aquí**, el número es positivo: súmalo con `suma += numero`.
6. **Devuelve** la suma (después del bucle).

```js
export function sumarHastaCero(numeros) {
  let suma = 0;

  for (const numero of numeros) {
    if (numero === 0) break;
    if (numero < 0) continue;
    suma += numero;
  }

  return suma;
}
```

## Por qué funciona

Con `sumarHastaCero([-1, 2, 0, 5])`:

| Vuelta | `numero` | ¿Qué pasa? | `suma` |
|---|---|---|---|
| 1 | `-1` | negativo: `continue` | 0 |
| 2 | `2` | positivo: se suma | 2 |
| 3 | `0` | `break`: sale del bucle | 2 |
| | `5` | nunca se visita | 2 |

Después del `break`, la ejecución sigue en la primera línea después del bucle: el `return suma`. Con el array vacío, el bucle no da ninguna vuelta y se devuelve `0`.

## Errores comunes

- **Confundir `break` con `continue`.** Si usas `continue` con el 0, lo saltas y sigues sumando: `[4, 0, 10]` da 14 en vez de 4.
- **Usar `return` dentro de un `forEach` para "cortar".** En `forEach`, `return` solo termina la vuelta actual (como un `continue`), no corta el recorrido. Y `break` dentro de `forEach` es un error de sintaxis. Por eso aquí se usa `for...of`.
- **Preguntar `if (!numero) break`.** Funciona aquí, pero también cortaría con `NaN`, `null` o `undefined`. Pregunta exactamente lo que quieres: `numero === 0`.
- **Poner el `return` dentro del bucle.** Devuelves en la primera vuelta y nunca sumas el resto.
- **Declarar `suma` con `const`.** `suma += numero` lanza `TypeError: Assignment to constant variable`.

## Otra forma de resolverlo

Sin `break` ni `continue`, con un `while` y condiciones:

```js
export function sumarHastaCero(numeros) {
  let suma = 0;
  let i = 0;
  while (i < numeros.length && numeros[i] !== 0) {
    if (numeros[i] > 0) suma += numeros[i];
    i++;
  }
  return suma;
}
```

La condición del `while` hace el trabajo del `break`, y el `if` hace el del `continue`. Ojo con el `i++`: si lo olvidas, el bucle es infinito.

**¿Cuál conviene?** La primera, porque cada regla del enunciado se ve como una línea (`break` para el 0, `continue` para los negativos). La segunda es útil para entender `while`.

## Cómo explicarlo en la entrevista

> "Recorro con `for...of` y uso `break` y `continue` para las reglas: si encuentro un 0 hago `break`, que sale del bucle por completo; si el número es negativo hago `continue`, que salta a la siguiente vuelta sin sumar. Lo que llega al final del cuerpo es positivo y lo acumulo. Uso `for...of` y no `forEach` porque `forEach` no se puede cortar con `break`."

## Conceptos

- **`break`**: termina el bucle (o el `switch`) en el que está.
- **`continue`**: termina la vuelta actual y pasa a la siguiente.
- **`for...of`**: recorre los valores de un iterable (array, string). Admite `break` y `continue`.
- **`forEach`**: no se puede cortar con `break`; `return` dentro solo sale de esa vuelta.
- **`while`**: repite mientras la condición sea verdadera. Tú controlas el contador.
- **Acumulador**: variable con `let` que va sumando en cada vuelta.
