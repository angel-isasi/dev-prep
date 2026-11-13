## Idea clave

Un estado `enviando` bloquea el botón (`disabled`) mientras la promesa está pendiente, y **`finally`** lo libera tanto si el pago sale bien como si falla. El `catch` convierte el fallo en un mensaje visible en lugar de un error sin manejar.

## Paso a paso

1. **Estado del envío.** `const [enviando, setEnviando] = useState(false)`.
2. **Manejador async.** Un manejador de eventos puede ser `async`; React no espera su promesa, pero dentro puedes usar `await`.
3. **Barrera.** `if (enviando) return;` corta llamadas repetidas. La barrera principal es `disabled`: un botón deshabilitado no dispara `onClick`.
4. **Marca el inicio.** `setEnviando(true)` y limpia el error anterior con `setError(false)`.
5. **`try / catch / finally`.** Esperas `pagar()`. Si lanza, el `catch` muestra el error. El `finally` se ejecuta **siempre** y devuelve el botón a la normalidad.
6. **Interfaz derivada del estado.** Texto con ternario, `disabled={enviando}` y el alerta con `&&`.

```jsx
import { useState } from "react";

export function BotonPagar({ pagar }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  async function manejarClic() {
    if (enviando) return;
    setEnviando(true);
    setError(false);
    try {
      await pagar();
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <button onClick={manejarClic} disabled={enviando}>
        {enviando ? "Pagando…" : "Pagar"}
      </button>
      {error && <p role="alert">No se pudo procesar el pago</p>}
    </div>
  );
}
```

## Por qué funciona

Recorrido con dos clics rápidos:

| Paso | `enviando` | Botón | `pagar` llamado |
|---|---|---|---|
| 1. Primer clic | `false` → se llama `setEnviando(true)` | | 1 vez, la promesa queda pendiente |
| 2. React re-renderiza | `true` | `Pagando…`, `disabled` | |
| 3. Segundo clic | | el botón está deshabilitado: el navegador no dispara `onClick` | sigue 1 |
| 4. La promesa se resuelve | `finally` → `setEnviando(false)` | | |
| 5. React re-renderiza | `false` | `Pagar`, habilitado | |

Si la promesa se **rechaza** en el paso 4, primero corre el `catch` (`setError(true)`) y luego el `finally`. Ambos cambios se agrupan en un solo render: botón habilitado y alerta visible.

¿Y el `if (enviando) return`? Ayuda menos de lo que parece: `manejarClic` es un closure que lee el `enviando` **del render en que se creó**. Si dos clics llegaran antes de que React vuelva a pintar, ambos verían `false`. En la práctica React procesa los clics como eventos "discretos" y actualiza la pantalla antes del siguiente clic, así que `disabled` basta. Si necesitas un candado infalible, usa un ref (ver "Otra forma de resolverlo").

## Errores comunes

- **Poner `setEnviando(false)` solo después del `await`, sin `finally`.** Si `pagar()` falla, esa línea nunca se ejecuta y el botón queda bloqueado para siempre con "Pagando…".
- **`try / finally` sin `catch`.** El botón se libera, pero el error sigue subiendo y termina como "Unhandled promise rejection" en la consola (y en los tests, como un fallo).
- **Solo cambiar el texto, sin `disabled`.** El usuario ve "Pagando…" pero puede seguir haciendo clic y se cobra otra vez.
- **Hacer `onClick={pagar}` directamente.** No hay control de estado ni de errores.
- **Guardar `enviando` en una variable normal** (`let enviando = false`). Se reinicia en cada render y no actualiza la interfaz.

## Otra forma de resolverlo

Con un **ref** como candado síncrono, además del estado para la interfaz:

```jsx
import { useRef, useState } from "react";

export function BotonPagar({ pagar }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  const enCurso = useRef(false);

  async function manejarClic() {
    if (enCurso.current) return;
    enCurso.current = true;
    setEnviando(true);
    setError(false);
    try {
      await pagar();
    } catch {
      setError(true);
    } finally {
      enCurso.current = false;
      setEnviando(false);
    }
  }
  // ... mismo JSX
}
```

**¿Cuándo conviene?** Cuando el envío se puede disparar de varias formas a la vez (un clic y la tecla Enter en un formulario, por ejemplo). Un ref cambia **al instante**, sin esperar un render, así que el candado es infalible. El estado sigue siendo necesario para que la interfaz cambie. En formularios con React 19 también existe `useActionState`, que te da el estado "pendiente" automáticamente.

## Cómo explicarlo en la entrevista

> "Guardo en el estado si hay un pago en curso. Al hacer clic lo pongo en true, lo que deshabilita el botón y cambia el texto a 'Pagando…', y espero la promesa dentro de un try. Si falla, el catch muestra un mensaje con `role='alert'`. En el finally vuelvo a habilitar el botón, así no queda bloqueado pase lo que pase. Si quisiera un candado a prueba de clics simultáneos, usaría además un `useRef`, que cambia al instante sin esperar un render."

## Conceptos

- **Manejadores `async`**: se puede usar `await` dentro de un manejador de eventos.
- **`try / catch / finally`**: `finally` se ejecuta siempre, haya error o no.
- **`disabled`**: un botón deshabilitado no dispara eventos de clic.
- **Unhandled rejection**: una promesa rechazada que nadie captura.
- **Estado para la interfaz**: lo que cambia lo que se ve va en `useState`.
- **`useRef` como candado**: valor mutable que cambia sin esperar un render.
- **`role="alert"`**: los lectores de pantalla anuncian el mensaje al aparecer.
- **Agrupación de actualizaciones (batching)**: varios `setState` seguidos producen un solo render.
