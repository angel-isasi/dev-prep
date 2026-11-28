## Idea clave

La función que devuelves lleva un **contador privado** (`llamadas`) guardado en un closure. En cada llamada lo aumenta y compara: si todavía no llega a `veces`, devuelve `undefined`; si ya llegó, ejecuta `fn` con los mismos argumentos que recibió. Nadie de afuera puede tocar ese contador.

## Paso a paso

1. **Crea el contador** con `let llamadas = 0` dentro de `despuesDe`.
2. **Devuelve una función** que recibe todos sus argumentos con `(...args)`, sean cuantos sean.
3. **Suma 1** al contador al inicio de cada llamada: `llamadas++`.
4. **Compara**: si `llamadas >= veces`, ejecuta `fn(...args)` y devuelve su resultado.
5. **Si no**, devuelve `undefined`.

```js
export function despuesDe(veces, fn) {
  let llamadas = 0;

  return (...args) => {
    llamadas++;
    if (llamadas >= veces) {
      return fn(...args);
    }
    return undefined;
  };
}
```

## Por qué funciona

Recorrido con `const listo = despuesDe(3, () => "listo")`:

| Llamada | `llamadas` después de `++` | `llamadas >= 3` | Devuelve |
|---|---|---|---|
| `listo()` | `1` | `false` | `undefined` |
| `listo()` | `2` | `false` | `undefined` |
| `listo()` | `3` | `true` | `"listo"` |
| `listo()` | `4` | `true` | `"listo"` |

**¿Qué variable queda recordada?** `llamadas` (y también `veces` y `fn`, que son parámetros de `despuesDe`). **¿Por qué sobrevive?** Porque la función devuelta las usa y está guardada en `listo`. Mientras `listo` exista, JavaScript mantiene vivo **su** contador.

Se usa `>=` y no `===` porque la regla dice que, desde la llamada `veces` en adelante, siempre ejecuta. Con `===` solo ejecutaría una vez.

**Sobre `...args`:** en `(...args) =>` los tres puntos son "rest parameters": juntan todos los argumentos en un array. Con `sumar(2, 3)`, `args` es `[2, 3]`. En `fn(...args)` los tres puntos son "spread": esparcen ese array como argumentos sueltos, así que `fn(...args)` equivale a `fn(2, 3)`. Así reenvías los argumentos sin saber cuántos son.

## Errores comunes

- **Usar `===` en vez de `>=`.** Ejecuta solo en la llamada exacta y luego vuelve a devolver `undefined`. Lo reconoces en el test "después de la llamada N sigue ejecutando".
- **Comparar antes de sumar.** Si haces `if (llamadas >= veces)` antes del `llamadas++`, te desfasas en uno: con `veces = 3` recién ejecuta en la cuarta llamada. El test recibe `[undefined, undefined, undefined]`.
- **Declarar `llamadas` dentro de la función devuelta.** Se reinicia en cada llamada y nunca llega a `veces` (salvo que `veces` sea 1). Siempre recibes `undefined`.
- **No reenviar los argumentos: `return fn()`.** `fn` recibe `undefined` en `a` y `b`, y `undefined + undefined` es `NaN`. El test de argumentos recibe `NaN` en vez de `5`.
- **Llamar a `fn` siempre y solo decidir qué devolver.** El resultado parece correcto, pero `fn` se ejecuta antes de tiempo. El test "no llama a fn antes de tiempo" lo detecta con `vi.fn()`.

## Otra forma de resolverlo

Con el operador ternario, más compacto:

```js
export function despuesDe(veces, fn) {
  let llamadas = 0;
  return (...args) => (++llamadas >= veces ? fn(...args) : undefined);
}
```

Aquí `++llamadas` (con los `++` **antes**) suma 1 y devuelve el valor ya aumentado, así que la comparación usa el nuevo valor. Si escribieras `llamadas++` (con los `++` después), la comparación usaría el valor viejo y te desfasarías en uno.

**¿Cuál conviene?** La versión con `if` es más fácil de leer y de depurar. La de una línea es compacta pero exige entender la diferencia entre `++x` y `x++`. En una entrevista, escribe la del `if` y menciona que se puede acortar.

## Cómo explicarlo en la entrevista

> "Devuelvo una función que guarda un contador en un closure. Cada vez que la llaman, aumento el contador; si ya llegó a `veces`, llamo a `fn` reenviándole todos los argumentos con `...args` y devuelvo su resultado; si no, devuelvo `undefined`. Uso `>=` para que, una vez alcanzado el número, siga ejecutándose. El contador es privado, así que nadie lo puede alterar desde afuera, y cada función creada tiene el suyo."

## Conceptos

- **Closure**: la función devuelta recuerda `llamadas`, `veces` y `fn`.
- **Estado privado**: el contador solo cambia cuando llamas a la función.
- **Rest parameters (`...args`)**: en la lista de parámetros, juntan todos los argumentos en un array.
- **Spread (`fn(...args)`)**: al llamar, esparce un array como argumentos separados.
- **`++x` vs `x++`**: los dos suman 1; `++x` devuelve el valor nuevo y `x++` el valor viejo.
- **Función envoltorio (wrapper)**: una función que envuelve a otra para cambiar cuándo o cómo se ejecuta.
