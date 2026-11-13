Escribe la función `esperarCancelable(ms, signal)`. Como `esperar(ms)`, devuelve una promesa que se cumple después de `ms` milisegundos, pero recibe además una **señal de cancelación** (`signal`) de un `AbortController`. Si alguien cancela antes de tiempo, la promesa se **rechaza** de inmediato con `new Error("Cancelado")`.

Un `AbortController` es el "botón de cancelar" estándar de JavaScript:

```js
const control = new AbortController();
control.signal;           // la señal: se la pasas a quien deba enterarse
control.signal.aborted;   // false
control.abort();          // aprietas el botón: la señal dispara el evento "abort"
control.signal.aborted;   // true
```

## Reglas

- Si nadie cancela, la promesa se cumple a los `ms` milisegundos.
- Si se cancela antes, se rechaza **en ese momento** (sin esperar los `ms`) con un `Error` cuyo mensaje es `"Cancelado"`.
- Al cancelar, **limpia el temporizador** con `clearTimeout`: no dejes un temporizador vivo que ya no sirve.
- Si la señal **ya estaba cancelada** al llamar a la función, rechaza de inmediato.
- Cancelar después de que la espera terminó no debe causar ningún error.

## Ejemplos

```js
const control = new AbortController();
await esperarCancelable(100, control.signal);   // se cumple a los 100 ms

const otro = new AbortController();
const promesa = esperarCancelable(5000, otro.signal);
otro.abort();                                    // cancelas al toque
await promesa;                                   // lanza Error("Cancelado"), sin esperar 5 s

const yaCancelado = new AbortController();
yaCancelado.abort();
await esperarCancelable(100, yaCancelado.signal); // lanza Error("Cancelado") de inmediato
```

## Por qué importa

En el frontend cancelas cosas todo el tiempo: el usuario escribe en un buscador y la petición anterior ya no sirve; cierra un modal antes de que cargue; cambia de página. `fetch(url, { signal })` usa exactamente esta misma señal. Si entiendes este ejercicio, entiendes cómo se cancela una petición real.
