Escribe dos funciones:

- `sleep(ms)`: devuelve una promesa que se cumple después de `ms` milisegundos.
- `conTimeout(promesa, ms)`: le pone un **tiempo límite** a una promesa. Devuelve una promesa nueva que se comporta como la original, salvo que esta tarde más de `ms` milisegundos: en ese caso se rechaza con `new Error("Tiempo agotado")`.

## Reglas

- Si la promesa original se cumple a tiempo, `conTimeout` se cumple con el mismo valor.
- Si la promesa original se rechaza a tiempo, `conTimeout` se rechaza con el mismo error.
- Si pasan `ms` milisegundos y la original no terminó, se rechaza con el mensaje exacto `"Tiempo agotado"`.
- Cuando `conTimeout` termina (de cualquier forma), no debe dejar ningún temporizador pendiente: **limpia** el suyo con `clearTimeout`.

## Ejemplos

```js
await sleep(100);   // se cumple a los 100 ms

await conTimeout(sleep(5).then(() => "a tiempo"), 50);   // "a tiempo"

await conTimeout(sleep(50), 5);
// se rechaza con Error("Tiempo agotado") a los 5 ms

await conTimeout(Promise.reject(new Error("caído")), 50);
// se rechaza con Error("caído")
```

## Por qué importa

`fetch` no tiene tiempo límite propio: una petición puede quedarse colgada y dejar la pantalla cargando para siempre. Ponerle un límite con `Promise.race` es un patrón real y muy preguntado. `sleep` aparece en reintentos, animaciones y tests.
