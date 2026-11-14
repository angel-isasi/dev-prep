## Idea clave

Un `for` con un `try/catch` dentro: cada vuelta es un intento. Si `await tarea()` sale bien, haces `return` y se acaba todo; si falla, guardas el error y, **solo si quedan intentos**, esperas con una promesa de `setTimeout` y duplicas la espera. Si el bucle termina, lanzas el último error.

## Paso a paso

1. **Opciones con valores por defecto.** La firma `reintentar(tarea, { intentos = 3, esperaInicial = 100 } = {})` desestructura el objeto de opciones y pone valores por defecto a cada propiedad. El `= {}` final cubre el caso de que no pasen opciones: sin él, desestructurar `undefined` lanzaría un error.
2. **Una pausa que se puede esperar.** `setTimeout` usa callbacks, no promesas. Lo envuelves:

   ```js
   const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));
   ```

   `await esperar(100)` pausa **tu función** 100 ms, pero Node sigue atendiendo otras cosas.
3. **El bucle de intentos**: `for (let intento = 1; intento <= intentos; intento++)`.
4. **Intentar**: `return await tarea()`. Si se cumple, el `return` sale de la función (y del bucle) con el valor. Si rechaza, el `await` lanza el error dentro del `try` y salta al `catch`.
5. **Fallar con calma**: en el `catch` guardas `ultimoError`. Si `intento < intentos`, esperas `espera` ms y la duplicas para la próxima vez. En el último intento no esperas: no tendría sentido esperar si ya no vas a reintentar.
6. **Rendirse**: si el bucle termina, ningún intento hizo `return`, así que `throw ultimoError`.

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function reintentar(tarea, { intentos = 3, esperaInicial = 100 } = {}) {
  let ultimoError;
  let espera = esperaInicial;

  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await tarea();
    } catch (error) {
      ultimoError = error;
      if (intento < intentos) {
        await esperar(espera);
        espera *= 2;
      }
    }
  }

  throw ultimoError;
}
```

## Por qué funciona

Recorrido con `{ intentos: 4, esperaInicial: 10 }` y una tarea que siempre falla (el test "rechaza con el error del ÚLTIMO intento"):

| Reloj | `intento` | Resultado | ¿Quedan intentos? | Espera | `espera` después |
|---|---|---|---|---|---|
| 0 ms | 1 | `fallo 1` | sí | 10 ms | 20 |
| 10 ms | 2 | `fallo 2` | sí | 20 ms | 40 |
| 30 ms | 3 | `fallo 3` | sí | 40 ms | 80 |
| 70 ms | 4 | `fallo 4` | **no** | ninguna | |

El bucle termina y se lanza `ultimoError`, que es `fallo 4`. Total: 10 + 20 + 40 = 70 ms, justo lo que el test avanza el reloj.

**¿Cómo prueban esto sin esperar de verdad?** `vi.useFakeTimers()` reemplaza `setTimeout` por una versión falsa: los temporizadores no se disparan solos, sino cuando el test llama a `vi.advanceTimersByTimeAsync(ms)`, que mueve el reloj y deja correr las promesas que dependían de él. Así el test "la espera se duplica" puede comprobar que a los 99 ms la tarea se llamó 1 vez y a los 100 ms, 2 veces. Si esperaras con otra cosa (un bucle con `Date.now()`, por ejemplo), el reloj falso no la controlaría y el test colgaría.

## Errores comunes

- **`return tarea()` sin `await`.** La promesa sale de la función sin pasar por el `catch`: el primer fallo rechaza todo y nunca reintentas. Es el error más típico con `try/catch` y promesas.
- **Esperar también después del último intento.** El resultado es correcto, pero tardas de más: el test "no espera después del último intento" lo detecta.
- **Duplicar antes de esperar** (`espera *= 2; await esperar(espera)`): la primera espera sería 200 en vez de 100.
- **Lanzar el primer error en vez del último.** Al depurar, el último error suele ser el más útil (puede ser distinto del primero).
- **Contar mal los intentos** (`intento < intentos` en el `for`, o empezar en 0 y comparar con `<=`): haces uno de más o uno de menos. `intentos` es el total, incluido el primero.
- **Olvidar el `= {}`** en las opciones: `reintentar(tarea)` lanza "Cannot destructure property 'intentos' of 'undefined'".
- **Esperar con un bucle ocupado** (`while (Date.now() < fin) {}`): bloquea todo Node y los temporizadores falsos no lo controlan.

## Otra forma de resolverlo

**Recursiva**: cada fallo vuelve a llamar a la función con un intento menos y el doble de espera.

```js
export async function reintentar(tarea, { intentos = 3, esperaInicial = 100 } = {}) {
  try {
    return await tarea();
  } catch (error) {
    if (intentos <= 1) throw error;
    await esperar(esperaInicial);
    return reintentar(tarea, { intentos: intentos - 1, esperaInicial: esperaInicial * 2 });
  }
}
```

Es más corta y elegante, pero cuesta más seguirla mentalmente. Con pocos intentos ambas sirven; el bucle es más fácil de explicar en voz alta.

**En el trabajo** se suele agregar:
- un **tope** a la espera (`Math.min(espera, 5000)`), para no esperar minutos;
- **jitter**: un poco de azar en la espera (`espera * (0.5 + Math.random())`), para que mil clientes no reintenten todos en el mismo milisegundo;
- reintentar **solo errores temporales** (un 503 o un timeout), no un 400 de datos inválidos, que fallará siempre.

## Cómo explicarlo en la entrevista

> "Uso un for con el máximo de intentos y un try/catch adentro. En el try hago return await de la tarea: el await es clave para que un rechazo caiga en mi catch. En el catch guardo el error y, si quedan intentos, espero con una promesa de setTimeout y duplico la espera, que es backoff exponencial, para no saturar un servicio que está fallando. Después del último intento no espero y lanzo el último error. Para probarlo uso temporizadores falsos de Vitest, así controlo el reloj y el test no tarda. En producción le agregaría un tope y jitter, y solo reintentaría errores temporales."

## Conceptos

- **Reintento con backoff exponencial**: esperar cada vez más (x2) entre intentos para darle tiempo al servicio de recuperarse.
- **Promesa de `setTimeout`**: `new Promise((r) => setTimeout(r, ms))` convierte una espera en algo que se puede `await`.
- **`return await` dentro de `try`**: necesario para atrapar el rechazo en ese `catch`.
- **Parámetros con desestructuración y valores por defecto**: `{ a = 1, b = 2 } = {}`.
- **Temporizadores falsos** (`vi.useFakeTimers`, `vi.advanceTimersByTimeAsync`): el test controla el reloj.
- **`vi.fn`**: función espía que cuenta sus llamadas (`toHaveBeenCalledTimes`).
- **Jitter**: azar en la espera para que muchos clientes no reintenten a la vez.
