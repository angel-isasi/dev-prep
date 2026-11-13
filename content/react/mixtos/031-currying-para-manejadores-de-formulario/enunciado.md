Crea el componente `Registro`: un formulario con dos inputs controlados (nombre y distrito) que comparten **un solo objeto de estado** y **una sola función** para crear sus manejadores de cambio.

La función debe usar **currying**: `cambiar("nombre")` no cambia nada todavía, sino que **devuelve** el manejador `onChange` configurado para el campo `nombre`.

## Reglas

- Estado: un objeto `{ nombre: "", distrito: "" }` en un solo `useState`.
- Un input con `aria-label="Nombre"` y otro con `aria-label="Distrito"`, ambos controlados (`value` + `onChange`).
- Los dos `onChange` se crean con la misma función: `onChange={cambiar("nombre")}` y `onChange={cambiar("distrito")}`.
- Cambiar un campo **no debe borrar** el otro.
- Debajo, un elemento `<output>` que muestre **"nombre / distrito"**, por ejemplo `Ana / Ica`.

## Ejemplo

| El usuario escribe | El `<output>` muestra |
|---|---|
| (nada) | ` / ` |
| `Ana` en Nombre | `Ana / ` |
| `Ica` en Distrito | `Ana / Ica` |

## Por qué importa

En formularios con muchos campos, escribir un manejador por campo (`cambiarNombre`, `cambiarDistrito`, `cambiarCorreo`...) es repetir el mismo código. Con una función que fabrica manejadores tienes uno solo. Y es la forma más natural de explicar **currying** y **closures** con un ejemplo de React, algo que preguntan bastante.
