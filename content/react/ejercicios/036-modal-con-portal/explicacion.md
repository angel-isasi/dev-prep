## Idea clave

Un **portal** dibuja un componente en **otro lugar del DOM** (aquí, `document.body`), pero en React **sigue siendo hijo** del componente que lo renderiza: recibe sus props, su contexto y sus eventos. Es la herramienta estándar para modales, tooltips y menús que no deben quedar cortados por su contenedor.

## Paso a paso

1. **Importa `createPortal` de `react-dom`** (no de `react`): tiene que ver con el DOM.
2. **En `Modal`, devuelve `createPortal(jsx, document.body)`**. El primer argumento es lo que quieres dibujar; el segundo, el nodo del DOM donde se va a insertar.
3. **Accesibilidad**: `role="dialog"` le dice al lector de pantalla que es un diálogo y `aria-modal="true"` que el resto de la página no está disponible mientras esté abierto.
4. **El botón "Cerrar"** llama a `onCerrar`. El modal no decide si está abierto: lo decide el padre (es un componente controlado).
5. **En `Pagina`**, un estado `abierto` y renderizado condicional: `{abierto && <Modal ...>}`. Cuando `abierto` pasa a `false`, React desmonta el modal y **quita su HTML del `<body>`**.

```jsx
import { useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ children, onCerrar }) {
  // createPortal(qué dibujar, dónde dibujarlo)
  return createPortal(
    <div role="dialog" aria-modal="true">
      {children}
      <button onClick={onCerrar}>Cerrar</button>
    </div>,
    document.body,
  );
}

export function Pagina() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div id="pagina">
      <button onClick={() => setAbierto(true)}>Ver pedido</button>
      {abierto && (
        <Modal onCerrar={() => setAbierto(false)}>
          <p>Tu pedido</p>
        </Modal>
      )}
    </div>
  );
}
```

## Por qué funciona

| Acción | Estado `abierto` | Árbol de React | Dónde está el HTML del modal |
|---|---|---|---|
| Primer render | `false` | `Pagina` > botón | no existe |
| Clic en "Ver pedido" | `true` | `Pagina` > botón + `Modal` | hijo directo de `<body>` |
| Clic en "Cerrar" | `false` | `Pagina` > botón | se quitó del `<body>` |

En React, `Modal` está **dentro** de `Pagina`: por eso puede recibir `onCerrar` y `children` como cualquier hijo. En el DOM, su `<div>` está **fuera** de `#pagina`. Por eso `dialogo.closest("#pagina")` es `null` (subiendo por sus padres en el DOM no se encuentra `#pagina`) y `dialogo.parentElement` es `document.body`.

Un dato que sorprende en entrevistas: los **eventos** de un portal suben (burbujean) por el árbol de **React**, no por el del DOM. Si `Pagina` tuviera un `onClick` en su `<div>`, un clic dentro del modal lo dispararía, aunque en el DOM el modal no esté adentro.

## Errores comunes

- **Importar `createPortal` de `"react"`.** Es `undefined` y explota con "createPortal is not a function". Viene de `"react-dom"`.
- **Invertir los argumentos** (`createPortal(document.body, jsx)`). El primero es el contenido, el segundo el destino.
- **Ocultar el modal con CSS** (`display: none`) en vez de desmontarlo. El HTML sigue en el documento y los lectores de pantalla lo pueden leer. Lo reconoces porque `queryByRole("dialog")` no es `null` después de cerrar.
- **Darle estado propio al modal** para abrirse y cerrarse. El padre pierde el control y no puede, por ejemplo, cerrarlo al guardar.
- **Olvidar `role="dialog"`.** Visualmente igual, pero no es accesible y `getByRole("dialog")` no lo encuentra.

## Otra forma de resolverlo

Con el elemento nativo **`<dialog>`** de HTML y su método `showModal()`, que ya se dibuja por encima de todo (en la "top layer" del navegador), atrapa el foco y se cierra con Escape:

```jsx
import { useEffect, useRef } from "react";

export function ModalNativo({ abierto, onCerrar, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (abierto) ref.current.showModal();
    else ref.current.close();
  }, [abierto]);

  return (
    <dialog ref={ref} onClose={onCerrar}>
      {children}
      <button onClick={onCerrar}>Cerrar</button>
    </dialog>
  );
}
```

**¿Cuándo conviene?** En navegadores modernos es una gran opción y te ahorra trabajo de accesibilidad. El portal sigue siendo la respuesta clásica de React, funciona para cualquier cosa que deba "escaparse" de su contenedor (tooltips, menús, notificaciones) y es lo que preguntan en entrevistas.

## Cómo explicarlo en la entrevista

> "Uso `createPortal` de `react-dom` para dibujar el modal directamente en `document.body`. Así no queda cortado por un `overflow: hidden` ni tapado por un `z-index` del contenedor. En React sigue siendo hijo de la página: recibe props y contexto, y sus eventos burbujean por el árbol de React. El padre controla si está abierto con un estado y lo desmonta al cerrar, así su HTML desaparece del documento. Le pongo `role='dialog'` y `aria-modal='true'` para accesibilidad."

## Conceptos

- **`createPortal(contenido, nodo)`**: dibuja en otro nodo del DOM.
- **Árbol de React vs árbol del DOM**: pueden no coincidir gracias a los portales.
- **Burbujeo de eventos en portales**: sigue el árbol de React.
- **Renderizado condicional** para montar y desmontar.
- **Componente controlado**: el padre decide si el modal está abierto.
- **`role="dialog"` y `aria-modal`**: accesibilidad de modales.
- **`closest(selector)`**: busca el ancestro más cercano que coincida en el DOM.
- **`<dialog>` nativo**: alternativa moderna con `showModal()`.
