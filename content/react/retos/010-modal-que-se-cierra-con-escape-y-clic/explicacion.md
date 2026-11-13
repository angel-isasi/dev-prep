## Idea clave

Dos técnicas: un **listener global** en `document` creado en un `useEffect` (con su limpieza) para la tecla Escape, y la **propagación de eventos** para el clic: el fondo cierra, y la caja detiene el clic con `stopPropagation()` para que no llegue al fondo.

## Paso a paso

1. **Sin estado propio.** El modal es **controlado**: el padre guarda si está abierto y le pasa `abierto` y `onCerrar`. El modal nunca se cierra solo, solo avisa.
2. **Escuchar Escape.** La tecla puede presionarse con el foco en cualquier parte, por eso se escucha en `document`, no en un elemento. Eso es un efecto secundario: va en un `useEffect`.
3. **Solo mientras está abierto.** `if (!abierto) return;` al inicio del efecto: si está cerrado, no se registra nada.
4. **Limpiar.** `return () => document.removeEventListener("keydown", alPresionarTecla)`. Corre cuando `abierto` u `onCerrar` cambian y cuando el componente se desmonta. Debe recibir **la misma función** que se registró; por eso se define dentro del efecto.
5. **Clic en el fondo.** El fondo tiene `onClick={onCerrar}`.
6. **Clic dentro de la caja.** Los eventos de clic "suben" (burbujean) del elemento clicado a sus padres. Sin hacer nada, un clic en el texto subiría hasta el fondo y cerraría el modal. `evento.stopPropagation()` en la caja corta ese viaje.
7. **Accesibilidad.** `role="dialog"` y `aria-modal="true"` le dicen al lector de pantalla que es una ventana modal; `aria-label={titulo}` le da nombre.

```jsx
import { useEffect } from "react";

export function Modal({ abierto, titulo, onCerrar, children }) {
  useEffect(() => {
    if (!abierto) return; // cerrado: no escuchamos nada

    function alPresionarTecla(evento) {
      if (evento.key === "Escape") onCerrar();
    }

    document.addEventListener("keydown", alPresionarTecla);
    // Limpieza: quita el listener al cerrar el modal o al desmontarlo.
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      data-testid="fondo"
      onClick={onCerrar}
      style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
        style={{ background: "white", margin: "15vh auto", padding: 16, maxWidth: 400 }}
      >
        <h2>{titulo}</h2>
        {children}
        <button onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}
```

Ojo: el `useEffect` va **antes** del `if (!abierto) return null`. Los hooks deben llamarse siempre, en el mismo orden, en cada render; no pueden quedar después de un `return` condicional.

## Por qué funciona

Recorrido de un clic, desde el elemento clicado hacia arriba:

| Clic en | Recorrido del evento | ¿Llega al fondo? | `onCerrar` |
|---|---|---|---|
| el texto `¿Confirmas tu voto?` | `<p>` → caja (`stopPropagation`) | no | no se llama |
| el botón `Cerrar` | botón (`onCerrar`) → caja (`stopPropagation`) | no | 1 vez |
| el fondo oscuro | fondo (`onCerrar`) | es el fondo | 1 vez |

Y el ciclo del listener de teclado:

| Momento | `abierto` | Listener en `document` |
|---|---|---|
| el padre abre el modal | `true` | se registra |
| el usuario presiona Escape | `true` | llama a `onCerrar`; el padre pone `abierto = false` |
| render con `abierto = false` | `false` | la limpieza lo quita; el nuevo efecto sale en el `if` |

## Errores comunes

- **No limpiar el listener.** Cada vez que abres el modal se suma un listener nuevo; después de abrir 3 veces, un Escape llama 3 veces a `onCerrar`. Lo reconoces porque los efectos se "multiplican" con el uso.
- **Poner el `useEffect` después del `return null`.** Viola las reglas de los hooks: React se queja de que cambió el número de hooks entre renders.
- **Olvidar `stopPropagation()` en la caja.** Cualquier clic dentro del modal (incluso en un input) lo cierra. Es el bug más típico de este ejercicio.
- **Poner `stopPropagation()` en el fondo en vez de en la caja,** o usar `preventDefault()`, que no detiene la propagación (solo cancela la acción por defecto, como enviar un formulario).
- **Usar `keypress`.** Está obsoleto y no se dispara con Escape en todos los navegadores. Usa `keydown`.

## Otra forma de resolverlo

Comparar el **destino** del clic en vez de detener la propagación: solo cierras si el clic fue exactamente sobre el fondo.

```jsx
<div
  data-testid="fondo"
  onClick={(evento) => {
    // currentTarget es el fondo; target es lo que realmente se clicó.
    if (evento.target === evento.currentTarget) onCerrar();
  }}
>
  <div role="dialog" aria-modal="true" aria-label={titulo}>
    ...
  </div>
</div>
```

**¿Cuándo conviene?** Cuando no quieres cortar la propagación (por ejemplo, porque otro componente de más arriba también necesita enterarse de los clics, como un sistema de analítica). En producción además: se monta con `createPortal` en `document.body` para que ningún `overflow: hidden` lo recorte, se mueve el **foco** al modal al abrir y se devuelve al cerrar. Otra opción moderna es el elemento nativo `<dialog>` con `showModal()`, que ya cierra con Escape.

## Cómo explicarlo en la entrevista

> "El modal es controlado: el padre decide si está abierto y yo solo aviso con `onCerrar`. Escucho la tecla Escape en el documento con un `useEffect`, solo mientras está abierto, y la limpieza quita el listener para no dejar fugas ni llamadas duplicadas. Para cerrar al hacer clic afuera, pongo el `onClick` en el fondo y detengo la propagación en la caja, así un clic dentro no sube hasta el fondo. Uso `role='dialog'` y `aria-modal`. En producción lo montaría con un portal y manejaría el foco."

## Conceptos

- **Componente controlado**: el padre maneja el estado, el hijo avisa con callbacks.
- **`useEffect` con limpieza** para listeners globales (`addEventListener` / `removeEventListener`).
- **Propagación (burbujeo) de eventos** y `stopPropagation()`.
- **`event.target` vs. `event.currentTarget`**.
- **Reglas de los hooks**: nunca después de un `return` condicional.
- **`role="dialog"`, `aria-modal`, `aria-label`**.
- **`createPortal`** y manejo del foco (para producción).
- **`<dialog>` nativo** como alternativa.
