## Idea clave

Un `for` con `try/catch` dentro: el `return await fn()` del `try` corta todo en cuanto sale bien; el `catch` guarda el error y espera antes de la siguiente vuelta, con una espera que se **duplica** cada vez. Si el bucle termina sin éxito, lanzas el último error.

## Paso a paso

1. **Prepara un helper** `esperar(ms)`: una promesa que se cumple con `setTimeout`.
2. **Recorre con `for (let i = 0; i < intentos; i++)`**. `i` es el número de intento empezando en 0.
3. **En el `try`**, `return await fn()`. Si `fn` se cumple, sales de la función con su valor. El `await` es clave: hace que un rechazo se convierta en una excepción que el `catch` puede atrapar.
4. **En el `catch`**, guarda `ultimoError = error`.
5. **Si quedan intentos** (`i < intentos - 1`), espera `esperaMs * 2 ** i`: 1×, 2×, 4×... el tiempo base.
6. **Al salir del bucle**, ya no quedan intentos: `throw ultimoError`. Como la función es `async`, eso rechaza la promesa que devuelve.

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function reintentar(fn, intentos = 3, esperaMs = 10) {
  let ultimoError;

  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (error) {
      ultimoError = error;
      const quedanIntentos = i < intentos - 1;
      if (quedanIntentos) await esperar(esperaMs * 2 ** i);
    }
  }

  throw ultimoError;
}
```

## Por qué funciona

Línea de tiempo con `reintentar(fn, 3, 100)` y una `fn` que siempre falla:

| Tiempo | `i` | Qué pasa | Espera siguiente |
|---|---|---|---|
| 0 ms | 0 | intento 1 falla | `100 * 2 ** 0` = 100 ms |
| 100 ms | 1 | intento 2 falla | `100 * 2 ** 1` = 200 ms |
| 300 ms | 2 | intento 3 falla | ninguna: `i < 2` es falso |
| 300 ms | | el bucle termina | `throw ultimoError` |

Y con la `inestable` del ejemplo (falla 2 veces, luego "ok"): intento 1 falla, espera; intento 2 falla, espera; intento 3 devuelve `"ok"` y el `return` sale de la función sin llegar al `throw`.

¿Por qué duplicar la espera? Si un servidor está caído o saturado, reintentar muy seguido lo empeora. Esperar cada vez más le da tiempo de recuperarse.

## Errores comunes

- **`return fn()` sin `await` dentro del `try`.** La promesa rechazada sale de la función sin pasar por el `catch`, así que nunca reintenta. Lo reconoces porque `fn` se llama una sola vez y el test de reintentos falla con "caído".
- **Esperar también después del último intento.** Gastas tiempo sin motivo. Lo reconoces porque falla el test "no espera después del último intento".
- **Esperar siempre lo mismo (`esperaMs`).** Lo reconoces porque el tercer intento llega a los 200 ms en vez de a los 300 ms.
- **Lanzar un error nuevo (`throw new Error("Se acabaron los intentos")`).** Pierdes la información del error real. Lo reconoces porque el test espera "fallo 2".
- **Usar `forEach` o `setTimeout` con callbacks en vez de `await`.** El bucle no espera y todos los intentos salen a la vez.

## Otra forma de resolverlo

Con **recursión**: cada fallo llama otra vez a `reintentar` con un intento menos y la espera doblada:

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function reintentar(fn, intentos = 3, esperaMs = 10) {
  try {
    return await fn();
  } catch (error) {
    if (intentos <= 1) throw error;
    await esperar(esperaMs);
    return reintentar(fn, intentos - 1, esperaMs * 2);
  }
}
```

Es más corta y se lee como la definición: "intenta; si falla y quedan intentos, espera y vuelve a intentar con la espera al doble". El bucle es más fácil de seguir paso a paso y no crea llamadas anidadas. En producción también se suele agregar **jitter** (un poco de azar en la espera) para que miles de clientes no reintenten exactamente al mismo tiempo.

## Cómo explicarlo en la entrevista

> "Intento en un bucle con `try/catch`. Pongo `return await fn()` dentro del `try`: si sale bien, salgo con el valor; si falla, el `await` convierte el rechazo en una excepción que atrapo. En el `catch` guardo el error y, si todavía quedan intentos, espero antes de seguir. Cada espera es el doble de la anterior: eso se llama backoff exponencial, para no saturar un servidor que está fallando. No espero después del último intento, y si se acaban, lanzo el último error para no perder la causa real."

## Conceptos

- **`try/catch` con `await`**: el `await` convierte un rechazo en una excepción atrapable.
- **`return await` dentro de `try`**: necesario para que el `catch` vea el error.
- **Backoff exponencial**: esperas que se duplican (`base * 2 ** intento`).
- **Operador `**`**: potencia; `2 ** 3` es 8.
- **Promesa de espera**: `new Promise((r) => setTimeout(r, ms))` para pausar una función `async`.
- **`throw` en una función `async`**: rechaza la promesa que la función devuelve.
