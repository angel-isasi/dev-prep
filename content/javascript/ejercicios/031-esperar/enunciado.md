Escribe la función `esperar(ms)` que devuelva una **promesa** que se cumple después de `ms` milisegundos. Así puedes "pausar" una función `async` con `await esperar(500)`.

## Reglas

- Debe devolver una promesa (no un número, no `undefined`).
- La promesa se cumple cuando pasan `ms` milisegundos, ni antes ni mucho después.
- No importa con qué valor se cumple: basta con que se cumpla (lo normal es `undefined`).
- No bloquees el programa con un bucle que mire la hora: mientras se espera, JavaScript debe poder hacer otras cosas.

## Ejemplos

```js
console.log("antes");
await esperar(1000);       // aquí la función se detiene 1 segundo
console.log("después");    // se imprime 1 segundo más tarde

esperar(50) instanceof Promise;   // true

// También con .then
esperar(200).then(() => console.log("pasaron 200 ms"));
```

## Por qué importa

`setTimeout` trabaja con callbacks y `await` trabaja con promesas. Este puente de una línea aparece en casi todo código asíncrono: reintentos, animaciones, simular una API lenta en tus pruebas. Además, es la forma más simple de demostrar en una entrevista que sabes crear una promesa con `new Promise`.
