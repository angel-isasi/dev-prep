Crea el hook propio `useClicFuera(ref, alHacerClicFuera)`, que avisa cuando el usuario hace clic **fuera** de un elemento. Es lo que hace que un menú desplegable o un popover se cierre al tocar cualquier otra parte de la página. Luego úsalo en un componente `Desplegable`.

## Reglas

- `useClicFuera(ref, alHacerClicFuera)`:
  - `ref` es un ref de React (de `useRef`) conectado a un elemento del DOM.
  - Escucha el evento **`mousedown`** en todo el `document`.
  - Si el clic ocurrió **fuera** del elemento, llama a `alHacerClicFuera()`. Si ocurrió dentro (incluso en un hijo muy anidado), no hace nada.
  - Al desmontar el componente, **quita** el listener.
- `Desplegable()`:
  - Empieza **abierto** y muestra un `<p>` con **"Opciones"**.
  - Un clic dentro del desplegable no lo cierra.
  - Un clic fuera lo cierra y muestra **"Cerrado"**.

## Ejemplo

```jsx
<>
  <Desplegable />
  <button>Afuera</button>
</>
```

| Acción | Se ve |
|---|---|
| (inicio) | Opciones |
| `mousedown` en "Opciones" | Opciones (sigue abierto) |
| `mousedown` en el botón "Afuera" | Cerrado |

## Por qué importa

Cerrar al hacer clic fuera aparece en casi toda interfaz (menús, selectores de fecha, modales). En la entrevista evalúa si sabes **escuchar eventos del `document` desde React**, limpiar listeners para no tener fugas de memoria y usar `useRef` para acceder a un elemento del DOM.
