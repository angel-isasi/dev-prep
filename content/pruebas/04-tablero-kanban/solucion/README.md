# Kallpa Studio: tablero kanban

Tablero con columnas Por hacer, En curso y Hecho: crear, mover con botones, editar, borrar con un diálogo de confirmación propio, filtro por texto y contador por columna. Se puede usar entero con el teclado y con lector de pantalla.

## Cómo correrlo

Usa las dependencias de dev-prep, así que no hace falta `npm install`. Desde esta carpeta:

```bash
npx vitest        # tests de aceptación en modo watch
npx vite          # la app en http://localhost:5173
```

## Estructura

```
src/
  data.js                      tareas de ejemplo
  lib/board.js                 COLUMNS, boardReducer, getMoves, validateTitle, matchesQuery, countLabel
  hooks/useBoard.js            useReducer + validación
  components/                  NewTaskForm, SearchBox, Column, TaskCard, ConfirmDialog
  App.jsx                      une todo: filtro, diálogo, foco y anuncios
```

## Mis decisiones

- **Un solo arreglo de tareas con su `status`**, en vez de tres arreglos (uno por columna). Mover es cambiar un campo, y las columnas se calculan con `filter`. Con tres arreglos tendría que sacar de uno y meter en otro sin olvidarme de ninguno.
- **El orden del arreglo es el orden de la columna.** Al mover, saco la tarea y la pongo al final del arreglo: así queda última en su columna nueva sin guardar una posición aparte.
- **`useReducer`** porque hay cuatro acciones sobre el mismo estado. El reducer nunca muta (`map`, `filter`, spread) y una acción desconocida lanza un error para detectar errores de tipeo.
- **Nada derivado en el estado:** columnas, contadores y lista filtrada se calculan en cada render. El único estado es la lista de tareas, la búsqueda, la tarea a borrar y el texto del anuncio.
- **La validación vive en funciones puras** (`validateTitle`) y la usan crear y editar. Los repetidos se comparan con `normalize`, así "Menú" y "menu" cuentan como el mismo título.
- **Diálogo propio en vez de `window.confirm`:** `window.confirm` no se puede estilar, bloquea la página y no permite explicar qué se va a borrar. `ConfirmDialog` no sabe nada de tareas: recibe título, mensaje y dos funciones, así sirve para cualquier confirmación.
- **Accesibilidad del diálogo:** `role="dialog"`, `aria-modal="true"`, nombre con `aria-labelledby` y descripción con `aria-describedby`. El foco empieza en Cancelar (lo seguro), Tab da la vuelta dentro, Escape cierra y lo de atrás queda `inert`.
- **El foco nunca se pierde:** al cancelar vuelve al botón Borrar que abrió el diálogo; al borrar va al título de la columna (el botón ya no existe); al mover va a la tarjeta en su columna nueva; al editar va al campo y luego vuelve a Editar. Lo muevo en un `useEffect`, cuando el elemento ya está en la página y el diálogo ya se cerró.
- **Anuncios con `role="status"`:** un párrafo oculto, siempre en la página, que dice "se movió a En curso" o "borrada". Si el párrafo apareciera recién con el mensaje, muchos lectores de pantalla no lo leerían.
- **Botones con nombre completo:** "Hecho →" no dice qué tarea se mueve; el `aria-label` es "Mover Corregir el menú en móviles a Hecho".

## Qué mejoraría con más tiempo

- Guardar el tablero en `localStorage` (o en una API) para no perderlo al recargar.
- Arrastrar y soltar, manteniendo los botones para quien usa teclado.
- Reordenar dentro de una columna (subir y bajar).
- Tests unitarios del reducer y de `validateTitle`.
- Usar el elemento nativo `<dialog>` con `showModal()`, que ya trae el foco atrapado y `Escape`.
