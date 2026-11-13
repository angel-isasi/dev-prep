Escribe la función asíncrona `reintentar(fn, intentos = 3, esperaMs = 10)` que llame a la función asíncrona `fn` y, si falla, **lo vuelva a intentar** hasta un máximo de `intentos` veces, esperando un poco entre un intento y otro.

## Reglas

- Si `fn` sale bien, `reintentar` se cumple **de inmediato** con ese valor y no vuelve a llamarla.
- Si falla y quedan intentos, espera y vuelve a intentar.
- Las esperas crecen al doble cada vez (**backoff exponencial**): antes del 2.º intento espera `esperaMs`, antes del 3.º espera `esperaMs * 2`, antes del 4.º `esperaMs * 4`, y así.
- **No** espera después del último intento.
- Si se acaban los intentos, se rechaza con el **último error** que lanzó `fn`.
- El primer intento es inmediato.

## Ejemplos

```js
let llamadas = 0;
const inestable = async () => {
  if (++llamadas < 3) throw new Error("caído");
  return "ok";
};

await reintentar(inestable, 3, 1);   // "ok"
llamadas;                            // 3

await reintentar(async () => { throw new Error("siempre"); }, 2, 1);
// se rechaza con el error "siempre"

// Con esperaMs = 100 y 3 intentos que fallan:
// intento 1 a los 0 ms, intento 2 a los 100 ms, intento 3 a los 300 ms, y se rechaza.
```

## Por qué importa

Las redes fallan: una petición puede caerse por un instante y salir bien un segundo después. Reintentar con esperas crecientes es lo que hacen las librerías de peticiones (como React Query) para no saturar un servidor que está en problemas. En entrevistas combina `async/await`, `try/catch`, bucles y temporizadores en un solo ejercicio.
