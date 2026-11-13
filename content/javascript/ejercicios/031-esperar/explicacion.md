## Idea clave

Envuelve `setTimeout` en una promesa: creas la promesa con `new Promise` y le pasas su función `resolver` al temporizador. Cuando el tiempo se cumple, el temporizador llama a `resolver` y la promesa queda cumplida.

## Paso a paso

1. **Crea y devuelve una promesa** con `return new Promise(...)`. Sin el `return`, la función devuelve `undefined` y `await` no espera nada.
2. **Recibe `resolver`** en la función que le pasas a `new Promise`. Esa función (se llama *executor*) corre **al instante**, en el momento en que creas la promesa.
3. **Programa el temporizador**: `setTimeout(resolver, ms)`. Le pasas `resolver` tal cual, sin paréntesis, porque quieres que el temporizador lo llame después, no llamarlo tú ahora.
4. Listo: cuando pasen `ms` milisegundos, `resolver()` se ejecuta y todo lo que esperaba la promesa (un `await` o un `.then`) continúa.

```js
export function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}
```

## Por qué funciona

Una promesa es un objeto que empieza **pendiente** y, una sola vez, pasa a **cumplida** (con `resolver`) o **rechazada** (con `rechazar`). Quien hace `await promesa` se queda en pausa hasta ese cambio.

Línea de tiempo de este código:

```js
async function demo() {
  console.log("A");
  await esperar(100);
  console.log("B");
}
demo();
console.log("C");
```

| Momento | Qué pasa |
|---|---|
| t = 0 ms | Se imprime `A`. `esperar(100)` crea la promesa (pendiente) y programa el temporizador. |
| t = 0 ms | `await` ve una promesa pendiente: **pausa `demo`** y devuelve el control a quien la llamó. |
| t = 0 ms | Se imprime `C`. El programa no se queda congelado: sigue con lo demás. |
| t = 100 ms | El temporizador dispara y llama a `resolver()`. La promesa pasa a cumplida. |
| t = 100 ms | Lo que estaba después del `await` entra a la cola de **microtareas** y se ejecuta: se imprime `B`. |

Resultado: `A`, `C`, `B`. Esto es el **event loop**: JavaScript corre en un solo hilo, ejecuta todo el código síncrono, y cuando termina revisa las colas. El temporizador vive fuera de tu código (lo maneja el navegador o Node), y cuando vence, pone su callback en la cola para que JavaScript lo ejecute.

## Errores comunes

- **Olvidar el `return`.** Escribes `new Promise(...)` pero no la devuelves. La función devuelve `undefined`, `await undefined` no espera nada y el código sigue de inmediato. Lo reconoces porque el test "devuelve una promesa" falla con "expected undefined to be an instance of Promise".
- **Llamar a `resolver` en vez de pasarlo: `setTimeout(resolver(), ms)`.** Los paréntesis lo ejecutan en ese instante y la promesa se cumple de inmediato, sin esperar. Lo reconoces porque el test de "no se cumple antes de tiempo" falla: recibes `true` cuando esperaba `false`.
- **Esperar con un bucle: `while (Date.now() - inicio < ms) {}`.** Funciona en apariencia, pero congela todo el programa (en el navegador, la página deja de responder). Además no devuelve una promesa.
- **Devolver el `setTimeout`: `return setTimeout(...)`.** `setTimeout` devuelve un identificador del temporizador (un número en el navegador, un objeto en Node), no una promesa. `await` sobre eso no espera.

## Otra forma de resolverlo

Con llaves y nombres explícitos, que se lee mejor si recién empiezas con promesas:

```js
export function esperar(ms) {
  return new Promise((resolver) => {
    setTimeout(() => {
      resolver();
    }, ms);
  });
}
```

Hace exactamente lo mismo: la flecha `() => resolver()` es una función que llama a `resolver`, y pasar `resolver` directo es pasar esa misma función sin envoltorio.

Si quieres que la promesa se cumpla **con un valor**, `setTimeout` acepta argumentos extra que le pasa al callback:

```js
const esperarValor = (ms, valor) => new Promise((resolver) => setTimeout(resolver, ms, valor));
await esperarValor(100, "listo"); // "listo"
```

**Dato útil:** en Node ya existe hecho, `import { setTimeout as esperar } from "node:timers/promises"`. En el navegador no, por eso se escribe a mano.

**¿Cuál conviene?** La versión de una línea es la que verás en código real. La de llaves es mejor para explicarla paso a paso en una pizarra.

## Cómo explicarlo en la entrevista

> "`setTimeout` usa callbacks, así que para poder usar `await` lo envuelvo en una promesa. Creo una promesa con `new Promise`, que me da la función `resolver`, y se la paso al `setTimeout` como callback. Cuando pasan los milisegundos, el temporizador llama a `resolver` y la promesa se cumple. Mientras tanto no se bloquea nada: el event loop sigue atendiendo otras tareas, y lo que estaba después del `await` continúa cuando la promesa se cumple."

## Conceptos

- **Promesa**: objeto que representa un valor futuro; está pendiente, cumplida o rechazada, y solo cambia de estado una vez.
- **`new Promise((resolver, rechazar) => {...})`**: crea una promesa; la función interna (executor) corre al instante y decide cuándo cumplirla o rechazarla.
- **`setTimeout(fn, ms)`**: programa `fn` para que se ejecute después de al menos `ms` milisegundos; devuelve un identificador, no una promesa.
- **`await`**: pausa la función `async` hasta que la promesa se cumpla, sin congelar el resto del programa.
- **Event loop**: el mecanismo que, cuando termina el código síncrono, saca tareas de las colas (temporizadores, promesas) y las ejecuta una por una.
- **Callback**: función que le pasas a otra para que la llame más tarde.
