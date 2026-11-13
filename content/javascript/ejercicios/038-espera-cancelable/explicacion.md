## Idea clave

La promesa tiene **dos caminos que compiten**: el temporizador que la cumple a los `ms` y el evento `"abort"` de la señal que la rechaza. Lo que ocurra primero decide el resultado, porque una promesa solo cambia de estado una vez. Si gana la cancelación, además limpias el temporizador para no dejarlo vivo.

## Paso a paso

1. **Crea y devuelve la promesa** con `new Promise((resolver, rechazar) => ...)`.
2. **Revisa si ya estaba cancelada**: si `signal.aborted` es `true`, rechaza y sal con `return`. El evento `"abort"` solo se dispara una vez; si ya pasó, tu listener nunca se enteraría y la promesa esperaría los `ms` completos.
3. **Programa el temporizador** y guarda su identificador: `const id = setTimeout(resolver, ms)`.
4. **Escucha la cancelación** con `signal.addEventListener("abort", ...)`. Cuando alguien llame a `control.abort()`, tu función: limpia el temporizador con `clearTimeout(id)` y rechaza con `new Error("Cancelado")`.
5. **`{ once: true }`** hace que el listener se borre solo después de ejecutarse una vez. Es buena costumbre para no acumular listeners.

```js
export function esperarCancelable(ms, signal) {
  return new Promise((resolver, rechazar) => {
    if (signal.aborted) {
      rechazar(new Error("Cancelado"));
      return;
    }

    const id = setTimeout(resolver, ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        rechazar(new Error("Cancelado"));
      },
      { once: true },
    );
  });
}
```

## Por qué funciona

**Caso 1: nadie cancela** (`esperarCancelable(100, signal)`):

| Momento | Qué pasa | Estado |
|---|---|---|
| t = 0 ms | `signal.aborted` es `false`. Se programa el temporizador y se registra el listener. | pendiente |
| t = 100 ms | El temporizador llama a `resolver()`. | **cumplida** |

**Caso 2: se cancela a los 0 ms** (`esperarCancelable(1000, signal)` y luego `control.abort()`):

| Momento | Qué pasa | Estado |
|---|---|---|
| t = 0 ms | Se programa el temporizador (1000 ms) y se registra el listener. | pendiente |
| t = 0 ms | `control.abort()` dispara el evento **de forma síncrona**: el listener corre ya. `clearTimeout(id)` borra el temporizador y `rechazar(...)` rechaza la promesa. | **rechazada** |
| t = 1000 ms | No pasa nada: el temporizador ya no existe. | rechazada |

**Caso 3: se cancela después de cumplirse.** A los 100 ms la promesa se cumplió. Si luego llamas `abort()`, el listener corre: `clearTimeout` de un temporizador que ya disparó no hace nada, y `rechazar` sobre una promesa ya cumplida **se ignora**. Una promesa resuelta no vuelve a cambiar. Por eso no hay error.

¿Por qué limpiar el temporizador si de todas formas `resolver` sería ignorado? Porque un temporizador vivo ocupa memoria y, en Node, mantiene el programa abierto hasta que dispare. Con esperas largas (o muchas) eso se nota.

## Errores comunes

- **No revisar `signal.aborted` al inicio.** Si la señal ya estaba cancelada, el evento no se repite y la promesa espera los `ms` completos y se **cumple**. Lo reconoces porque el test "si la señal ya estaba cancelada" falla esperando un rechazo.
- **Olvidar `clearTimeout`.** La promesa se rechaza bien, pero el temporizador sigue vivo. Lo reconoces porque el test "limpia el temporizador" dice "expected 1 to be 0".
- **Usar `throw new Error("Cancelado")` dentro del listener.** El listener corre fuera del executor, así que el `throw` no rechaza la promesa: se convierte en un error suelto. Lo reconoces porque la promesa nunca se rechaza y el test se queda esperando 1 segundo hasta cumplirse.
- **Rechazar con un texto: `rechazar("Cancelado")`.** Funciona a medias: `e.message` es `undefined` porque un texto no es un `Error`. Lo reconoces porque falla el test "el rechazo es un Error de verdad". Rechaza siempre con objetos `Error`, que traen mensaje y stack.
- **Revisar `signal.aborted` dentro del `setTimeout`.** Así solo te enteras de la cancelación cuando pasaron los `ms`, que es justo lo que querías evitar.

## Otra forma de resolverlo

Versión más completa: quita el listener cuando la espera termina normal, para no dejar nada colgado en la señal:

```js
export function esperarCancelable(ms, signal) {
  return new Promise((resolver, rechazar) => {
    if (signal.aborted) return rechazar(new Error("Cancelado"));

    const alCancelar = () => {
      clearTimeout(id);
      rechazar(new Error("Cancelado"));
    };

    const id = setTimeout(() => {
      signal.removeEventListener("abort", alCancelar);
      resolver();
    }, ms);

    signal.addEventListener("abort", alCancelar, { once: true });
  });
}
```

Aquí, si la espera termina sin cancelación, el listener se quita con `removeEventListener`. Para poder quitarlo, el listener tiene que ser una función con nombre (`alCancelar`), no una flecha anónima: `removeEventListener` necesita la **misma** función que agregaste.

Dato útil: en el código real, `fetch(url, { signal })` hace este mismo trabajo por dentro y rechaza con un error de nombre `"AbortError"`. Por eso, al atrapar errores de `fetch`, es común revisar `if (error.name === "AbortError")` para ignorar las cancelaciones.

**¿Cuál conviene?** La solución principal es suficiente y es la que se espera en una entrevista. La segunda es mejor cuando usas la misma señal para muchas operaciones, porque no acumula listeners de esperas que ya terminaron.

## Cómo explicarlo en la entrevista

> "Devuelvo una promesa con dos caminos que compiten. Primero reviso si la señal ya estaba abortada, porque en ese caso el evento no se vuelve a disparar, y rechazo de una vez. Si no, programo el `setTimeout` que la cumple y escucho el evento `abort` de la señal: si llega primero, limpio el temporizador con `clearTimeout` y rechazo con un `Error`. Como una promesa solo cambia de estado una vez, lo que llegue después se ignora. Es el mismo mecanismo que usa `fetch` para cancelar peticiones."

## Conceptos

- **`AbortController`**: objeto con un método `abort()` y una propiedad `signal`; es la forma estándar de cancelar operaciones.
- **`AbortSignal`**: la señal que pasas a quien debe enterarse; tiene `aborted` (booleano) y dispara el evento `"abort"`.
- **`addEventListener(evento, fn, { once: true })`**: registra un listener que se borra solo después de ejecutarse una vez.
- **`clearTimeout(id)`**: cancela un temporizador usando el identificador que devolvió `setTimeout`.
- **Una promesa cambia de estado una sola vez**: llamar a `resolver` o `rechazar` después de que ya terminó no hace nada.
- **Rechazar con `Error`**: los rechazos deben ser objetos `Error` para tener `message` y stack.
- **`fetch` con `signal`**: las peticiones reales se cancelan con esta misma señal.
