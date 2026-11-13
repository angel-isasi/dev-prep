## Idea clave

Cambias el estado **antes** de que responda el servidor (optimista) y guardas el valor **anterior** en una constante. Esa constante vive en el **closure** de esa llamada a `alternar`, así que si el servidor falla, puedes volver a ella.

## Paso a paso

1. **Dos estados**: `activo` (el "me gusta") y `error` (para el aviso).
2. **Anota el valor anterior**: `const anterior = activo`. Es el valor de este render.
3. **Calcula el nuevo**: `const nuevo = !anterior`.
4. **Actualiza ya**: `setActivo(nuevo)` y limpia el error viejo con `setError(false)`. React re-renderiza y el usuario ve el cambio sin esperar.
5. **Avisa al servidor**: `await guardar(nuevo)`. Pasas `nuevo`, no `activo`: `activo` en este closure sigue siendo el valor viejo.
6. **Si falla**: `setActivo(anterior)` y `setError(true)`.
7. **Accesibilidad**: `aria-pressed={activo}` hace que el botón se anuncie como "botón de alternancia, presionado / no presionado".

```jsx
import { useState } from "react";

export function MeGusta({ guardar }) {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState(false);

  async function alternar() {
    const anterior = activo;
    const nuevo = !anterior;

    setActivo(nuevo);
    setError(false);
    try {
      await guardar(nuevo);
    } catch {
      setActivo(anterior);
      setError(true);
    }
  }

  return (
    <div>
      <button aria-pressed={activo} onClick={alternar}>
        Me gusta
      </button>
      {error && <p role="alert">No se guardó. Inténtalo otra vez.</p>}
    </div>
  );
}
```

## Por qué funciona

Recorrido con un `guardar` que falla:

| Momento | `activo` (estado) | `anterior` (closure) | `aria-pressed` | Alerta |
|---|---|---|---|---|
| render 1 | `false` | | `"false"` | no |
| clic: `alternar()` empieza | `false` | `false` | | |
| `setActivo(true)`, render 2 | `true` | `false` | `"true"` | no |
| `await guardar(true)` falla | | `false` | | |
| `catch`: `setActivo(false)`, `setError(true)`, render 3 | `false` | | `"false"` | sí |

El dato importante: cuando llega el error, **ya hubo un render nuevo** y el estado vale `true`. Pero la función `alternar` que está esperando es la del render 1, y en su closure `anterior` sigue siendo `false`. Por eso puede volver al valor correcto.

En JSX, `aria-pressed={true}` se pinta en el HTML como `aria-pressed="true"`: React convierte el booleano en texto para los atributos `aria-*`.

## Errores comunes

- **Esperar al servidor antes de cambiar el estado.** Ya no es optimista: el usuario ve un retraso en cada clic.
- **`await guardar(activo)`** después de `setActivo`. `setActivo` no cambia la variable `activo` de este closure; mandarías el valor viejo al servidor.
- **En el `catch`, hacer `setActivo(!activo)`.** Funciona por casualidad en este caso, pero es frágil: lee el valor del closure, no expresa "volver atrás". `anterior` deja clara la intención.
- **No limpiar el error al reintentar.** El aviso se queda visible aunque el nuevo intento salga bien.
- **Usar `className="activo"` sin `aria-pressed`.** Visualmente funciona, pero un lector de pantalla no sabe que el botón está activado.

## Otra forma de resolverlo

React 19 trae **`useOptimistic`**, pensado para esto. Se usa junto con una transición:

```jsx
import { useOptimistic, useState, useTransition } from "react";

export function MeGusta({ guardar }) {
  const [activo, setActivo] = useState(false);
  const [activoOptimista, setActivoOptimista] = useOptimistic(activo);
  const [error, setError] = useState(false);
  const [, startTransition] = useTransition();

  function alternar() {
    const nuevo = !activo;
    setError(false);
    startTransition(async () => {
      setActivoOptimista(nuevo);
      try {
        await guardar(nuevo);
        // Después de un await hay que volver a marcar la actualización como transición.
        startTransition(() => setActivo(nuevo));
      } catch {
        setError(true);
      }
    });
  }

  return (
    <div>
      <button aria-pressed={activoOptimista} onClick={alternar}>Me gusta</button>
      {error && <p role="alert">No se guardó. Inténtalo otra vez.</p>}
    </div>
  );
}
```

**¿Cuándo conviene?** Con formularios y acciones de React 19: el valor optimista se descarta solo cuando termina la transición, así que la marcha atrás es automática. Es más moderno pero tiene más piezas; para entender la idea y en la mayoría de entrevistas junior, la versión con `anterior` es la esperada.

## Cómo explicarlo en la entrevista

> "Es una actualización optimista: cambio el estado al instante para que la interfaz se sienta rápida y después aviso al servidor. Antes de cambiarlo, guardo el valor anterior en una constante. Esa constante queda en el closure de esa llamada, así que aunque ya hubo un render nuevo, si `guardar` falla puedo volver exactamente a ese valor y mostrar un aviso con `role='alert'`. Al servidor le mando el valor nuevo calculado, no el estado, porque `setState` no cambia la variable del render actual. Uso `aria-pressed` para que el botón sea accesible."

## Conceptos

- **Actualización optimista**: mostrar el resultado esperado antes de la confirmación del servidor.
- **Rollback (marcha atrás)**: volver al valor anterior si la operación falla.
- **Closure**: `anterior` se conserva en la llamada aunque el estado cambie.
- **`setState` no cambia la variable actual**: el nuevo valor se ve en el próximo render.
- **`aria-pressed`**: indica si un botón de alternancia está activado.
- **`useOptimistic`** (React 19): hook para estados optimistas temporales.
- **`role="alert"`**: aviso que se anuncia al aparecer.
