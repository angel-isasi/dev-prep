## Idea clave

Guardas en un closure **el momento de la última ejecución**. Cada vez que te llaman, miras el reloj: si ya pasó el intervalo, ejecutas y actualizas la marca; si no, ignoras la llamada.

## Paso a paso

1. **Declara `ultimaVez = 0`** fuera de la función devuelta. Empezar en 0 hace que la primera llamada siempre se ejecute, porque `Date.now()` es un número enorme (milisegundos desde 1970).
2. **Devuelve una `function (...args)`** para recibir los argumentos y conservar el `this`.
3. **Toma la hora actual** con `Date.now()`.
4. **Compara**: si `ahora - ultimaVez >= ms`, ya pasó el intervalo.
5. **Si pasó**, primero actualiza `ultimaVez = ahora` y luego ejecuta `fn.apply(this, args)`.
6. **Si no pasó**, no haces nada: la llamada se descarta.

```js
export function throttle(fn, ms) {
  let ultimaVez = 0;

  return function (...args) {
    const ahora = Date.now();
    if (ahora - ultimaVez >= ms) {
      ultimaVez = ahora;
      fn.apply(this, args);
    }
  };
}
```

## Por qué funciona

Supón que el reloj marca 1000 al empezar y `ms = 50`:

| Llamada | `ahora` | `ahora - ultimaVez` | ¿Ejecuta? | `ultimaVez` después |
|---|---|---|---|---|
| `t(1)` | 1000 | 1000 - 0 = 1000 | sí | 1000 |
| `t(2)` | 1000 | 0 | no | 1000 |
| `t(3)` | 1000 | 0 | no | 1000 |
| `t(4)` | 1060 | 60 | sí | 1060 |

En el borde: a 1049, la diferencia es 49 y se ignora; a 1050 es 50, y como la condición es `>=`, se ejecuta.

## Errores comunes

- **Confundirlo con debounce y usar `setTimeout`.** Con debounce la primera llamada no se ejecuta al instante, se espera. Lo reconoces porque el test "la primera llamada se ejecuta al instante" recibe 0 llamadas.
- **Declarar `ultimaVez` dentro de la función devuelta.** Se reinicia en cada llamada y todas se ejecutan. Lo reconoces porque recibes `[[1], [2], [3]]`.
- **Usar `>` en vez de `>=`.** Justo al cumplirse el intervalo la llamada se ignora. Lo reconoces porque falla solo el test del borde de 50 ms.
- **Actualizar `ultimaVez` en cada llamada, aunque no se ejecute.** Si llaman sin parar, el intervalo nunca se cumple y `fn` no vuelve a ejecutarse jamás.
- **Devolver una flecha.** Pierdes el `this` del objeto; el test del `this` falla con "Cannot read properties of undefined".

## Otra forma de resolverlo

Con una bandera y `setTimeout`, sin mirar el reloj:

```js
export function throttle(fn, ms) {
  let enPausa = false;

  return function (...args) {
    if (enPausa) return;
    enPausa = true;
    fn.apply(this, args);
    setTimeout(() => {
      enPausa = false;
    }, ms);
  };
}
```

La primera llamada ejecuta y "cierra la puerta" durante `ms`; un `setTimeout` la vuelve a abrir. Es útil cuando no quieres depender de `Date.now()`. La versión con el reloj es más corta y no deja temporizadores pendientes. Una mejora que a veces piden es ejecutar también la **última** llamada ignorada al final del intervalo (en Lodash se llama `trailing`), para no perder el estado final del scroll.

## Cómo explicarlo en la entrevista

> "Guardo en un closure cuándo ejecuté por última vez. En cada llamada comparo `Date.now()` con esa marca: si ya pasó el intervalo, ejecuto con `apply` para respetar el `this` y los argumentos, y actualizo la marca; si no, ignoro la llamada. La diferencia con debounce es que throttle garantiza ejecuciones regulares mientras el usuario sigue, por ejemplo durante el scroll, mientras que debounce espera a que el usuario pare, como en un buscador."

## Conceptos

- **Throttle**: limitar una función a como máximo una ejecución por intervalo.
- **`Date.now()`**: milisegundos transcurridos desde el 1 de enero de 1970; sirve para medir intervalos.
- **Closure**: la variable `ultimaVez` sobrevive entre llamadas porque la función devuelta la recuerda.
- **`fn.apply(this, args)`**: ejecuta `fn` con un `this` concreto y un arreglo de argumentos.
- **Eventos de alta frecuencia**: `scroll`, `resize`, `mousemove` e `input` se disparan muchas veces por segundo.
