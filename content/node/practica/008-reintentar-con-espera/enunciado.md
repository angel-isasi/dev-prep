Tu servidor consulta un servicio externo (por ejemplo, el de pagos) que **a veces falla** por un momento y al rato funciona. En vez de rendirte al primer error, vas a **reintentar**, esperando cada vez un poco más para no saturar al servicio. Esta técnica se llama *backoff exponencial*.

Escribe la función **asíncrona** `reintentar(tarea, opciones)`:

- `tarea` es una función que devuelve una promesa (cada llamada es un intento).
- `opciones` es un objeto opcional con:
  - `intentos`: cuántos intentos en total, como máximo. Por defecto `3`.
  - `esperaInicial`: milisegundos a esperar después del primer fallo. Por defecto `100`.

## Reglas

- Si un intento sale bien, devuelve su valor y no hace más intentos.
- Después de cada fallo, espera y vuelve a intentar. La espera **se duplica** cada vez: `esperaInicial`, luego el doble, luego el doble otra vez...
- Si fallan **todos** los intentos, rechaza con el error del **último** intento.
- Después del último intento **no** se espera: se rechaza de inmediato.

Con `{ intentos: 4, esperaInicial: 100 }`, si todo falla:

```
intento 1 → falla → espera 100 ms
intento 2 → falla → espera 200 ms
intento 3 → falla → espera 400 ms
intento 4 → falla → rechaza con el error del intento 4
```

## Lo que necesitas

Para esperar dentro de una función `async` conviertes `setTimeout` en una promesa (ya viene en el archivo de inicio):

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));
await esperar(100); // sigue 100 ms después, sin bloquear el programa
```

Para no tardar de verdad, los tests usan **temporizadores falsos** (`vi.useFakeTimers()`): Vitest controla el reloj y avanza el tiempo a voluntad. Por eso es importante que esperes **solo** con `setTimeout`.

## Ejemplos

```js
// pagar() falla 2 veces y a la tercera devuelve { estado: "aprobado" }
await reintentar(() => pagar(pedido), { intentos: 3, esperaInicial: 100 });
// { estado: "aprobado" }  (después de esperar 100 + 200 ms)

await reintentar(() => servicioCaido());
// Error del tercer intento (después de 100 + 200 ms)
```
