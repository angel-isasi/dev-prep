Crea el componente `Ingredientes`: una lista de campos de texto donde el usuario puede **agregar** y **quitar** ingredientes para armar su pizza. Es el típico formulario dinámico (varios teléfonos, varias direcciones, varios items de una factura).

## Reglas

- Empieza con **un** campo vacío.
- Cada fila tiene:
  - Un `<input>` con `aria-label` **"Ingrediente N"**, donde N es su posición empezando en 1.
  - Un botón con el texto `×` y `aria-label` **"Quitar ingrediente N"**, que quita **esa** fila.
- Debajo, un botón **"Agregar ingrediente"** que suma un campo vacío al final.
- Al quitar una fila, las demás **conservan su valor** y se renumeran (la que era "Ingrediente 2" pasa a ser "Ingrediente 1").
- Cada fila debe tener un **id estable** que se use como `key` (no el índice): al quitar una fila, las demás conservan **su mismo elemento del DOM** (por ejemplo, si estabas escribiendo en una, no pierde el foco).

## Ejemplo

```jsx
<Ingredientes />
```

| Acción | Campos |
|---|---|
| (inicio) | `[""]` |
| Escribe "queso" en el 1 | `["queso"]` |
| Clic en "Agregar ingrediente" | `["queso", ""]` |
| Escribe "jamón" en el 2 | `["queso", "jamón"]` |
| Clic en "Quitar ingrediente 1" | `["jamón"]` (ahora es el Ingrediente 1) |

## Por qué importa

Es la pregunta perfecta para saber si entiendes **para qué sirve la `key`** en las listas de React. "¿Por qué no usar el índice como key?" es de las preguntas más repetidas en entrevistas junior, y aquí lo vas a comprobar con tus propios ojos.
